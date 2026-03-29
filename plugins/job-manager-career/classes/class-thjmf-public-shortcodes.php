<?php
/**
 * The file that defines the plugin public functionalities
 *
 * @link       https://themehigh.com
 * @since      1.0.0
 *
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 */
if(!defined('WPINC')){	die; }

if(!class_exists('THJMF_Public_Shortcodes')):

	class THJMF_Public_Shortcodes extends THJMF_Public{
		private $special_theme = false;
		private $post_id = null;
		private $post_set = false;
		private $post_type = null;
		private $ft_meta = null;
		private $ft_settings = null;
		private $db_gen_settings = null;
		public function __construct() {
			add_action('init', array( $this, 'setup_settings_data' ) );
			add_action( 'wp', array( $this, 'prepare_reset_actions') );
			add_action('wp', array( $this, 'prepare_post_datas' ) );
			$this->define_variables();
			$this->define_public_hooks();
		}

		private function define_variables(){
			$themes = array(
				"Twenty Twenty",
				"Twenty Twenty-One",
				"Twenty Nineteen",
				"Twenty Fifteen"
			);

			$themes = apply_filters( "thjmf_filter_theme_compatibility", $themes );
			$active_theme = get_option( 'current_theme' );

			if( in_array( $active_theme, $themes ) ){
				$this->special_theme = true;
			}
		}

		public function define_public_hooks(){
			add_filter( 'excerpt_more', array($this, 'new_excerpt_more'), 20 );
			add_filter('the_content', array($this, 'thjmf_single_post_content'));
		}

		protected function max_num_pages( $per_page, $count=false){
			$published_posts = $count ? $count : wp_count_posts('thjm_jobs')->publish;
			$max = ceil($published_posts / $per_page);
			return $max;
		}

		public function enqueue_styles_and_scripts() {
			global $post;
			// if( THJMF_Utils::should_enqueue($post) ){
				$in_footer = apply_filters( 'thjmf_enqueue_script_in_footer', true );
				$deps = array('jquery');
				wp_enqueue_style( 'thjmf-public-style', THJMF_ASSETS_URL . 'css/thjmf-public.css', THJMF_VERSION );
				if( !wp_style_is('dashicons')){
					wp_enqueue_style('dashicons');
				}
				wp_register_script('thjmf-public-script', THJMF_ASSETS_URL.'js/thjmf-public.js', $deps, THJMF_VERSION, $in_footer);
				wp_enqueue_script('thjmf-public-script');	
				$public_var = array(
					'ajax_url'				=> admin_url( 'admin-ajax.php' ),
					'ajax_nonce' 			=> wp_create_nonce('thjmf_ajax_filter_job'),
					'popup_style'			=> $this->popup_style(),
				);
				wp_localize_script('thjmf-public-script', 'thjmf_public_var', $public_var);
			// }
		}

		private function is_filter_enabled( $args ){
			if( $args['enable_location'] || $args['enable_category'] || $args['enable_type'] ){
				return true;
			}
			return false;
		}

		public function shortcode_thjmf_job_listing($atts){
			if( isset( $_POST['thjmf_job_filter'] ) || isset( $_POST['thjmf_filter_load_more'] ) ){
				return $this->thjmf_jobs_filter_event(true);
			}
			ob_start();
			$this->output_jobs( $atts );
			return ob_get_clean();
		}

		public function output_jobs( $atts ){
			global $wp_query,$post;
			$load_more_args = [];
			$settings = THJMF_Utils::get_default_settings();
			$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
			if( isset( $_POST["thjmf_job_paged"] ) ){
				$paged =  absint( $_POST["thjmf_job_paged"] ) + 1;
			}
			$query_args = $this->get_query_arguments( $settings, $paged );
			$filter_args = $this->get_filter_arguments( $settings );
			
			$per_page = get_option( 'posts_per_page' );
			$theme_class = $this->add_theme_compatibiltiy_class();
			get_thjmf_template( 'version1/job-listing-header.php' );
			if ( $this->is_filter_enabled( $filter_args) ) {
				?>
				<form id="thjmf_job_filter_form" name="thjmf_job_filter_form" method="POST" class="<?php echo $theme_class; ?>">
					<?php 
						if ( function_exists('wp_nonce_field') ){
							wp_nonce_field( 'thjmf_filter_jobs', 'thjmf_filter_jobs_nonce' ); 
						}
						get_thjmf_template( 'version1/job-filters.php', $filter_args ); 
					?>
				</form>
				<?php
			}
			echo '<form name="thjmf_load_more_post" method="POST">';
			echo '<input type="hidden" name="thjmf_job_paged" value="'.esc_attr($paged).'">';
			if ( function_exists('wp_nonce_field') ){
				wp_nonce_field( 'thjmf_load_more_jobs', 'thjmf_load_more_jobs_nonce' ); 
			}
			$jobs = get_thjmf_job_listings( $query_args );
			$load_more_args['thjmf_max_page'] = $this->max_num_pages($per_page, $jobs->found_posts);
			if( $jobs->found_posts ){
				while( $jobs->have_posts() ) {
					$jobs->the_post();
					$listing_args = $this->get_job_meta_tags( $settings );
					$listing_args['layout_class'] = '';
					if( $this->special_theme && apply_filters('thjmf_theme_layout_override', true) ){
						$listing_args['layout_class'] = "thjmf-plugin-layout";
					}
					get_thjmf_template( 'version1/content-job-listing.php', $listing_args );
				}
				wp_reset_postdata(); 
				$this->render_load_more_pagination( $load_more_args, $paged );
			}else{
				get_thjmf_template_part( 'content', 'no-jobs' );
			}
			echo '</form>';
			get_thjmf_template( 'version1/job-listing-footer.php' );
		}

		private function get_filter_arguments( $settings ){
			$args = [];
			if( isset( $settings['search_and_filt'] ) && $settings['search_and_filt'] ){
				$filters = $settings['search_and_filt'];
				$args['enable_location'] 	= isset( $filters['search_location'] ) ? $filters['search_location'] : false;
				$args['enable_type'] 		= isset( $filters['search_type'] ) ? $filters['search_type'] : false;
				$args['enable_category'] 	= isset( $filters['search_category'] ) ? $filters['search_category'] : false;
			}

			$args['job_category'] = isset( $_POST['thjmf_filter_category'] ) && !empty( $_POST['thjmf_filter_category'] ) ? sanitize_key($_POST['thjmf_filter_category']) : false;

			$args['job_location'] = isset( $_POST['thjmf_filter_location'] ) && !empty( $_POST['thjmf_filter_location'] ) ? sanitize_key($_POST['thjmf_filter_location']) : false;

			$args['job_type'] = isset( $_POST['thjmf_filter_type'] ) && !empty( $_POST['thjmf_filter_type'] ) ? sanitize_key($_POST['thjmf_filter_type']) : false;

			$args['categories'] = $this->get_taxonomy_terms('category');
			$args['locations'] 	= $this->get_taxonomy_terms('location');
			$args['types'] 		= $this->get_taxonomy_terms('job_type');
			$args['atts'] = $args;
			return $args;
		}

		private function add_theme_compatibiltiy_class(){
			$class = "";
			if( $this->special_theme ){
				$class = "thjmf-filter-columns";
			}
			return $class;
		}

		public function thjmf_jobs_filter_event( $filter_load_more = false){
			$per_page = get_option( 'posts_per_page' );
			$settings = THJMF_Utils::get_default_settings();
			$settings = THJMF_Utils::get_default_settings();
			$q_args = [];

			$q_args['hide_expired'] = isset( $settings['job_detail']['job_hide_expired'] ) ? $settings['job_detail']['job_hide_expired'] : false;
			$q_args['hide_filled'] = isset( $settings['job_detail']['job_hide_filled'] ) ? $settings['job_detail']['job_hide_filled'] : false;
			$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
			
			$category = isset( $_POST['thjmf_filter_category'] ) && !empty( $_POST['thjmf_filter_category'] ) ? sanitize_key($_POST['thjmf_filter_category']) : false;
			$location = isset( $_POST['thjmf_filter_location'] ) && !empty( $_POST['thjmf_filter_location'] ) ? sanitize_key($_POST['thjmf_filter_location']) : false;
			$type = isset( $_POST['thjmf_filter_type'] ) && !empty( $_POST['thjmf_filter_type'] ) ? sanitize_key($_POST['thjmf_filter_type']) : false;

			if($category){
				$q_args['category'] = $category;
			}
			if($location){
				$q_args['location'] = $location;
			}
			if($type){
				$q_args['type'] = $type;
			}

			if( isset( $_POST["thjmf_job_paged"] ) ){
				$paged =  absint( $_POST["thjmf_job_paged"] ) + 1;
			}

			$q_args['posts_per_page'] = (int) $per_page*$paged;
			$filter_query_args = $this->get_query_args( $q_args, true );
			$filter_query = new WP_Query( $filter_query_args );
			$q_args['thjmf_max_page'] = $this->max_num_pages($per_page, $filter_query->found_posts);
            return $this->render_page_listing_content($filter_query, $q_args, $paged, true, $filter_load_more);
		}

		private function render_fields_for_filtering( $filter ){
			if( !$filter ){
				return;
			}
			$filter_category = isset($_POST["thjmf_filter_category"]) ? sanitize_text_field($_POST["thjmf_filter_category"]) : "";
			$filter_location = isset($_POST["thjmf_filter_location"]) ? sanitize_text_field($_POST["thjmf_filter_location"]) : "";
			$filter_type = isset($_POST["thjmf_filter_type"]) ? sanitize_text_field($_POST["thjmf_filter_type"]) : "";
			?>
			<input type="hidden" name="thjmf_filter_category" value="<?php echo esc_attr($filter_category); ?>" />
			<input type="hidden" name="thjmf_filter_location" value="<?php echo esc_attr($filter_location); ?>" />
			<input type="hidden" name="thjmf_filter_type" value="<?php echo esc_attr($filter_type); ?>" />
			<?php
		}

		private function render_page_listing_content($loop, $content_args, $paged, $filter=false, $filter_load_more = false){
			$pagenum_link = isset( $content_args['pagenum_link'] ) ? $content_args['pagenum_link'] : "";
			$theme_class = $this->add_theme_compatibiltiy_class();
			if( $this->special_theme && apply_filters('thjmf_theme_layout_override', true) ){
				$args['layout_class'] = "thjmf-plugin-layout";
			}
			ob_start()
			?>
			<div id="thjmf-job-listings-box">
				<?php 
				$settings = THJMF_Utils::get_default_settings();
	            $filter_args = $this->get_filter_arguments( $settings );
	            ?>
	            <form id="thjmf_job_filter_form" name="thjmf_job_filter_form" method="POST" class="<?php echo $theme_class; ?>">
					<?php 
						if ( function_exists('wp_nonce_field') ){
							wp_nonce_field( 'thjmf_filter_jobs', 'thjmf_filter_jobs_nonce' ); 
						}
						get_thjmf_template( 'version1/job-filters.php', $filter_args );
					?>
				</form>
				<form name="thjmf_load_more_post" method="POST">
					<input type="hidden" name="thjmf_job_paged" value="<?php echo esc_attr($paged); ?>">
					<?php
					if( ! $loop->have_posts() ) {
						get_thjmf_template( 'version1/content-no-jobs.php' );
						return ob_get_clean();
					}
					
					$this->render_fields_for_filtering($filter);
					if ( function_exists('wp_nonce_field') ){
						wp_nonce_field( 'thjmf_load_more_jobs', 'thjmf_load_more_jobs_nonce' ); 
					}
					while( $loop->have_posts() ) {
					    $loop->the_post();
					    $listing_args = $this->get_job_meta_tags( $settings );
					    $listing_args['layout_class'] = '';
						if( $this->special_theme && apply_filters('thjmf_theme_layout_override', true) ){
							$listing_args['layout_class'] = "thjmf-plugin-layout";
						}
						get_thjmf_template( 'version1/content-job-listing.php', $listing_args );
					}
					$this->render_load_more_pagination($content_args, $paged, $filter_load_more);
					?>
				</form>
			</div>
			<?php
			return ob_get_clean();
		}

		private function render_load_more_pagination($args, $paged, $filter_l_m=false){
			echo '<div class="thjmf-load-more-section">';
			if( (int) $args['thjmf_max_page'] != $paged){
	       		?>
	       		<div class="thjmf-load-more-button-wrapper">
	       			<button type="submit" class="button" name="<?php echo $filter_l_m ? "thjmf_filter_load_more" : "thjmf_load_more" ?>" id="thjmf_load_more"> <?php echo esc_html__('Load more', 'job-manager-career'); ?></button>
	       		</div>
	       		<?php
	       	}
	       	'</div>';
		}

		public function get_taxonomy_terms( $tax ){
			$terms = THJMF_Utils::get_all_post_terms( $tax );
			return wp_list_pluck( $terms, "name", "slug");
		}

		public function get_query_arguments( $settings, $paged, $filter=false ){
			$args = [];
			$per_page = get_option( 'posts_per_page' );

			$args['hide_expired'] = isset( $settings['job_detail']['job_hide_expired'] ) ? $settings['job_detail']['job_hide_expired'] : false;
			
			$args['hide_filled'] = isset( $settings['job_detail']['job_hide_filled'] ) ? $settings['job_detail']['job_hide_filled'] : false;

			$args['posts_per_page'] = (int) $per_page*$paged;
			$modified_args = $this->get_query_args( $args, $filter );
			return $modified_args;
		}


		private function get_query_args( $q_args, $filter=false){
			$posts_per_page = isset( $q_args['posts_per_page'] ) ? $q_args['posts_per_page'] : false;
			$args = array (
				'posts_per_page'    => $posts_per_page,
				'post_date'			=> 'DESC',
				'post_type'         => THJMF_Utils::get_job_cpt(),
			);

			if( $filter ){
				$category = isset( $q_args['category'] ) ? $q_args['category'] : false;
				$location = isset( $q_args['location'] ) ? $q_args['location'] : false;
				$type = isset( $q_args['type'] ) ? $q_args['type'] : false;
				if( $category && $location || $category && $type || $location && $type){
					$args['tax_query'] = array( 'relation'=>'AND' );
				}
			
				if($category){
					$args['tax_query'][] = array(
						'taxonomy' => 'thjm_job_category',
						'field' => 'slug',
						'terms' => $category
					);
				}
				if($location){
					$args['tax_query'][] = array(
						'taxonomy' => 'thjm_job_locations',
						'field' => 'slug',
						'terms' => $location
					);
				}
				if($type){
					$args['tax_query'][] = array(
						'taxonomy' => 'thjm_job_type',
						'field' => 'slug',
						'terms' => $type
					);
				}
			}
			$hide_filled = isset( $q_args['hide_filled'] ) ? $q_args['hide_filled'] : false;
			$hide_expired = isset( $q_args['hide_expired'] ) ? $q_args['hide_expired'] : false;

			if($hide_filled && $hide_expired){
				$args['meta_query'] = array( 'relation'=>'AND' );
			}

			if( $hide_filled == '1'){
	    		$args['meta_query'][] = array(
					'key'       => THJMF_Utils::get_filled_meta_key(),
				    'value'   	=> '',
				    'compare' 	=> '=',
				);
			}

			if( $hide_expired == '1'){
	    		$args['meta_query'][] = array(
	    			'relation'	=> 'OR',
	    			array(
						'key'       => THJMF_Utils::get_expired_meta_key(),
					    'value'   	=> '',
					    'compare' 	=> '=',
					),
					array(
					    'key' => THJMF_Utils::get_expired_meta_key(), // Check the start date field
		                'value' => date('Y-m-d'), // Set today's date (note the similar format)
		                'compare' => '>=', // Return the ones greater than today's date
		                'type' => 'DATE' // Let WordPress know we're working with date
					),
	    		);
			}
			return $args;
		}

		public function prepare_reset_actions(){
            global $post;

            if( isset($_POST["thjmf_job_filter_reset"]) ){
            	if ( ! isset( $_POST['thjmf_filter_jobs_nonce'] )  || ! wp_verify_nonce( $_POST['thjmf_filter_jobs_nonce'], 'thjmf_filter_jobs' ) ){
	   				wp_die('Sorry, your nonce did not verify.');
	   				exit;
				}
				if( has_shortcode( $post->post_content, THJMF_Utils::$shortcode) ){

                	global $wp;
                	$pagename = ( get_query_var( 'pagename' ) ) ? get_query_var( 'pagename' ) : false;
					if( $pagename ){
						wp_safe_redirect( home_url( $pagename ) );
					}
            	}
            }
            
            if( isset($_POST["thjmf_load_more"])){
            	if ( ! isset( $_POST['thjmf_load_more_jobs_nonce'] )  || ! wp_verify_nonce( $_POST['thjmf_load_more_jobs_nonce'], 'thjmf_load_more_jobs' ) ){
	   				wp_die('Sorry, your nonce did not verify.');
	   				exit;
				}
            }
        }

        public function popup_style(){
			$width = array( 'width1' => '40%','width2' => '50%','width3' => '62%','width4' => '78%' );
			$styles = apply_filters( 'thjmf_apply_now_popup_width', $width);
			if( is_array( $styles ) ){
				return array_map( 'sanitize_text_field', $styles );
			}
			return $width;
		}

		public function render_apply_now_button($expired, $apply_form){
			$inactive = false;
			$filled = get_post_meta( get_the_ID(), THJMF_Utils::get_filled_meta_key(), true);
			$filled = filter_var( $filled, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );

			if( $filled || $expired){
				$inactive = true;
				$this->render_disabled_apply_now_msg( $expired, $filled);
			}

			if( isset( $apply_form['enable_apply_form'] ) && !$apply_form['enable_apply_form'] ){
				if( !in_array( true , array( $filled, $expired ) ) ){
					$msg = isset( $apply_form['apply_form_disabled_msg'] ) ? $apply_form['apply_form_disabled_msg'] : "";
					$msg = preg_replace_callback("/{(.*?)}/", array($this, "thjmf_format_email_url"),$msg);
					echo '<div class="thjmf-apply-now-msg">'.esc_html( $msg ).'</div>';
				}
				return;
			}

			?>
			<div id="thjmf_apply_button_wrapper">
				<button id="thjmf_apply_now" <?php echo ( !$inactive ) ? 'onclick="thjmEventApplyJob(this)"' : 'disabled'; ?> data-post="<?php echo esc_attr( $this->post_id ); ?>" class="thjmf-btn-apply-now button" name="thjmf_apply_now" value="Apply Now">
					<?php echo esc_html( apply_filters( 'thjmf_job_apply_now_button', __('Apply Now', 'job-manager-career') ) ); ?>
				</button>
			</div>
			<?php
		}

		private function render_disabled_apply_now_msg($expired, $filled){
			$msg = '';
			$msgs = array(
				'expired' => __( 'This job is Expired', 'job-manager-career'),
				'filled' => __( 'This Job is Filled', 'job-manager-career'),
			);
			if( $expired ){
				$msg = $msgs['expired'];
			}else if( $filled ){
				$msg = $msgs['filled'];
			}
			echo '<div class="thjmf-apply-now-disabled-msg">'.esc_html( $msg ).'</div>';	
		}

	   	public function render_additional_single_post_data(){
	   		ob_start();
	   		$expired = THJMF_Utils::get_post_meta_expiration( get_the_ID() );
	   		$apply_form = isset( $this->db_gen_settings['job_submission'] ) ? $this->db_gen_settings['job_submission'] : ""; 
	   		if( !$expired ) : ?>
		   		<div id="thjmf_apply_now_popup">
		   			<div class="thjmf-popup-wrapper">
		   				<div class="thjmf-popup-header">
		   					<p class="thjmf-popup-title"><?php echo esc_html__('Application Form', 'job-manager-career'); ?></p>
		   					<span class="thjmf-popup-close" onclick="thjmEventClosePopup(this)">
		   						<span class="dashicons dashicons-no-alt"></span>
		   					</span>
		   				</div>
		   				<form class="thjmf-apply-form" name="thjmf_apply_now_form" method="post" enctype="multipart/form-data">
		   					<?php 
				    		if ( function_exists('wp_nonce_field') ){
								wp_nonce_field( 'thjmf_new_job_application', 'thjmf_application_meta_nonce' ); 
    						}
		   					?>
		   					<input type="hidden" name="thjmf_post_id" value=<?php echo esc_attr($this->post_id ); ?>>
		   					<div class="thjmf-popup-outer-wrapper">
			   					<div class="thjmf-popup-content-wrapper">
			   						<div class="thjmf-validation-notice" tabindex="0"></div>
			   						<div class="thjmf-popup-content">
			   							<?php $this->render_apn_form(); ?>
			   						</div>
			   					</div>
			   				</div>
		   					<div class="thjmf-popup-footer-actions">
		   						<button type="submit" class="button" name="thjmf_save_popup" id="thjmf_popup_save" onclick="thjmEventSavePopupForm(event, this)"><?php echo esc_html__('Apply', 'job-manager-career'); ?></button>
		   					</div>
		   				</form>
		   			</div>
		   		</div>
		   		<?php echo $this->render_apply_now_button($expired, $apply_form);
	   		else :
	   			$this->render_apply_now_button($expired, $apply_form);
	   		endif;
	   		return ob_get_clean();
	   	}

	   	private function render_apn_form(){
	   		?>
	   		<p class="thjmf-form-field thjmf-form-row thjmf-form-row-wide thjmf-validation-required" id="thjmf_first_name_field" data-priority="">
	   			<label for="thjmf_first_name" class=""><?php echo esc_html__('Name', 'job-manager-career'); ?>&nbsp;<span><abbr class="thjmf-required" title="<?php echo esc_html__( 'required', 'job-manager-career' )?>">*</abbr></span></label>
	   			<span class="thjmf-field-input-wrapper ">
	   				<input type="text" class="input-text" name="thjmf_name" id="thjmf_name" placeholder="" value="">
	   			</span>
	   		</p>
	   		<p class="thjmf-form-field thjmf-form-row thjmf-form-row-first" id="thjmf_phone_field" data-priority="">
	   			<label for="thjmf_phone" class=""><?php echo esc_html__('Phone', 'job-manager-career'); ?>&nbsp;</label>
	   			<span class="thjmf-field-input-wrapper ">
	   				<input type="text" class="input-text" name="thjmf_phone" id="thjmf_phone" placeholder="" value="">
	   			</span>
	   		</p>
	   		<p class="thjmf-form-field thjmf-form-row thjmf-form-row-last thjmf-validation-required" id="thjmf_email_field" data-priority="">
	   			<label for="thjmf_email" class=""><?php echo esc_html__('Email', 'job-manager-career'); ?>&nbsp;<span><abbr class="thjmf-required" title="<?php echo esc_html__( 'required', 'job-manager-career' )?>">*</abbr></span></label>
	   			<span class="thjmf-field-input-wrapper ">
	   				<input type="text" class="input-text" name="thjmf_email" id="thjmf_email" placeholder="" value="">
	   			</span>
	   		</p>
	   		<p class="thjmf-form-field thjmf-form-row thjmf-form-row-wide thjmf-validation-required" id="thjmf_resume_field" data-priority="">
	   			<label for="thjmf_resume" class=""><?php echo esc_html__('Resume', 'job-manager-career'); ?>&nbsp;<span><abbr class="thjmf-required" title="<?php echo esc_html__( 'required', 'job-manager-career' )?>">*</abbr></span></label>
	   			<span class="thjmf-field-input-wrapper ">
	   				<input type="file" class="input-text" name="thjmf_resume" id="thjmf_resume" placeholder="" value="">
	   			</span>
	   		</p>
	   		<p class="thjmf-form-field thjmf-form-row thjmf-form-row-wide" id="thjmf_cover_letter_field" data-priority="">
	   			<label for="thjmf_cover_letter" class=""><?php echo esc_html__('Cover Letter', 'job-manager-career'); ?>&nbsp;</label>
	   			<span class="thjmf-field-input-wrapper ">
	   				<textarea class="input-text" name="thjmf_cover_letter" id="thjmf_cover_letter" placeholder="" value=""></textarea>
	   			</span>
	   		</p>
	   		<?php
	   	}

	   	public function render_post_tags(){
	   		$settings = THJMF_Utils::get_default_settings('job_detail');
	   		$p_date_visible = isset( $settings['job_display_post_date'] ) ? $settings['job_display_post_date'] : false;
			$args = $this->get_tag_details();

			$p_date = apply_filters('thjmf_toggle_posted_timestap', true) ? human_time_diff( get_the_time('U'), current_time( 'timestamp' ) ) . ' ago' : THJMF_Utils::get_posted_date();
			ob_start();
			?>
			<div class="thjmf-job-list-single-tags">
				<?php if($p_date_visible) : ?>
					<div class="thjmf-inline-tags">
						<span class="dashicons dashicons-clock thjmf-dashicons"></span>
						<?php 
						echo esc_html( $p_date );
						?>
					</div>
				<?php endif; ?>
				<?php if( isset( $args['location'] ) && !empty( $args['location'] )){ ?>
					<div class="thjmf-inline-tags">
						<span class="dashicons dashicons-location thjmf-dashicons"></span><?php echo esc_html( $args['location'] ); ?>
					</div>
				<?php } if( isset( $args['job_type'] ) && !empty( $args['job_type'] ) ){ ?>
					<div class="thjmf-inline-tags">
						<span class="dashicons dashicons-portfolio thjmf-dashicons"></span><?php echo esc_html($args['job_type']); ?>
					</div>
				<?php } ?>
			</div>
			<?php
			return ob_get_clean();
		}

		public function get_job_meta_tags( $settings ){
			$meta = THJMF_Utils::get_post_meta_requirements( get_the_ID() );
			$tax = $this->get_tag_details();

			if( !isset( $meta['show_date'] ) ){
				$meta['show_date'] = isset( $settings['job_detail']['job_display_post_date'] ) ? $settings['job_detail']['job_display_post_date'] : false;
				$meta['date'] = apply_filters('thjmf_toggle_posted_timestap', true) ? human_time_diff( get_the_time('U'), current_time( 'timestamp' ) ) . ' ago' : THJMF_Utils::get_posted_date();
			}

			return is_array( $tax ) ? array_merge( $meta, $tax ) : $meta;
		}

	   	private function get_tag_details(){
			$args = [];
			$args['category'] = THJMF_Utils::get_comma_seperated_taxonamy_terms( get_the_ID(), 'category' );
			$args['location'] = THJMF_Utils::get_comma_seperated_taxonamy_terms( get_the_ID(), 'location' );
			$args['job_type'] = THJMF_Utils::get_comma_seperated_taxonamy_terms( get_the_ID(), 'job_type' );
			return apply_filters('thjmf_manage_public_job_taxonomies', $args, is_single());
		}

		public function prepare_post_datas(){
			global $post;
			if( THJMF_Utils::should_enqueue( $post ) && is_single() ) {
				$this->post_id = $post->ID;
				$post_type = get_post_type($this->post_id);
				$this->post_set = $post_type == 'thjm_jobs' ? true : false;
				if($this->post_set){
					$this->post_type = $post_type;
					$meta_job_ft = THJMF_Utils::get_post_meta_datas($this->post_id);
					$this->ft_meta = isset( $meta_job_ft[0]['features'] ) ? $meta_job_ft[0]['features'] : "";
				}
			}
			
		}

		public function new_excerpt_more($more) {
		    global $post;
			if( isset($post->post_type) && get_post_type( $post ) == THJMF_Utils::get_job_cpt() ){
			    return '...';
			}
			return $more;
		}

	   	public function thjmf_single_post_content($content){
			$helper_contents = '';
	   		if(is_single() && $this->post_type == 'thjm_jobs'){
	   			if(	isset( $_GET['submit'] ) ){
		   			$submit = sanitize_key( $_GET['submit'] );
					ob_start();
					?>
					<div class="thjmf-form-submission-msg">
						<?php 
						$msg = isset( $this->submit_msg[$submit] ) ? $this->submit_msg[$submit] : "";
						echo '<p class="thjmf-'.esc_attr( $submit ).'">'.esc_html( $msg ).'</p>';
						?>
					</div>
				<?php 
				$helper_contents = ob_get_clean();
				}
				$ft_content = '';
				$attach_features = apply_filters( 'thjmf_attach_features_with_default_content', true );
				if( $attach_features ){
					if( apply_filters( 'thjmf_show_job_features', true ) ){
						$ft_content = $this->render_pre_content_data();
		   			}
		   			$apply_form = $this->render_additional_single_post_data();
		   			if( apply_filters('thjmf_features_before_description', true) ){
		   				$content = $ft_content.$content.$apply_form;
		   			}else{
		   				$content = $content.$ft_content.$apply_form;
		   			}
				}
	   		}
	   		$content = $helper_contents.$content;
	   		return $content;
	   	}

		private function render_pre_content_data(){
	   		$mod_content = '';
	   		$features = '';
	   		$details = '';
	   		
	   		$mod_content = $this->render_post_tags(); 
   			$features = isset( $this->db_gen_settings['job_detail']['job_feature']['job_def_feature'] ) ? $this->db_gen_settings['job_detail']['job_feature']['job_def_feature'] : '';

	   		if( !empty( $features ) ){
		   		$features = $this->thjmf_display_job_features($features);
	   		}

	   		if( !empty( $features ) ){
	   			$mod_content = $mod_content.$features;
	   		}
	   		return $mod_content;
	   	}

	   	/* Creating Job Feature - Details display on single job page */
	   	private function thjmf_display_job_features( $ft, $args = array() ) {
			$parts = array();
			$html    = '';
			$disp_class = apply_filters('thjmf_job_feature_plain_list_view', true) ? "thjmf-plain-list" : "thjmf-bullet-list";
			$args    = wp_parse_args(
				$args,
				array(
					'before'       => '<ul class="thjmf-job-features-list '.$disp_class.'"><li>',
					'after'        => '</li></ul>',
					'separator'    => '</li><li>',
					'autop'        => false,
					'label_before' => '<strong class="thjmf-job-feature-label">',
					'label_after'  => ': </strong> ',
				)
			);
			$args = apply_filters( 'thjmf_job_features_args', $args );
			foreach ( $ft as $ft_key => $feature ) {
				$value = THJMF_Utils::get_post_metas( $this->post_id, $ft_key, true );
				if( empty( $value ) ){
					continue;
				}
				$parts[] = $args['label_before'] . wp_kses_post( $feature ) . $args['label_after'].$value;
			}
			if ( $parts ) {
				$html = $args['before'] . implode( $args['separator'], $parts ) . $args['after'];
			}
			$html = apply_filters( 'thjmf_display_job_features', $html, $ft, $args );
			return wp_kses_post($html);
		}

		public function setup_settings_data(){
			$this->apply_field_sanitize = array('name' => 'text', 'phone' => 'number', 'email' => 'email', 'cover_letter' => 'textarea');
			$this->db_gen_settings = THJMF_Utils::get_default_settings();
			$this->submit_msg = array(
	   			'success' => __('Application Submitted Successfully', 'job-manager-career'),
	   			'error'	  => __('An error occured while submitting the application. Try again', 'job-manager-career'),
	   		);
		}

	}
	
endif;