<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://themehigh.com
 * @since      1.3.0
 *
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 */
if(!defined('WPINC')){	die; }

if(!class_exists('THJMF_Public_Jobs')):
 
class THJMF_Public_Jobs extends THJMF_Public{
	private $version;
	private $db = THJMF_SETTINGS;
	private $load_style;
	private $expired = false;
	private $filled = false;
	private $special_theme = null;
	private $args = array();
	private $filters = array();
	public function __construct( $version ) {

		$this->version = $version;
		$this->define_variables();
		add_action('wp', array($this, 'post_related_query_args'));
		add_action('wp', array($this, 'prepare_reset_actions'));
		add_filter('thjmf_job_listing_body_class', array( $this, 'thjmf_theme_specific_class'), 10, 2);
	}

	public function shortcode_thjmf_job_listing($atts){
		if( !in_the_loop() ){
			return false;
		}

		if( isset( $_POST['thjmf_find_job'] ) || isset( $_POST['thjmf_filtering'] ) ){
			$this->focus_to_job_list();
			return $this->filter_jobs(true);
		}

		global $wp_query,$post;
		$atts = shortcode_atts( array(
		    'type' => '',
		    'category' => '',
		    'location' => '',
		    'featured' => '',
		    'count'	=> '',
		), $atts );

		$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
		if( isset( $_POST["thjmf_job_paged"] ) ){
			$paged =  absint( $_POST["thjmf_job_paged"] ) + 1;
		}

		ob_start();
		?>
		<div class="<?php thjmf_get_job_listing_class(); ?>">
			<form id="thjmf_job_filter_form" name="thjmf_job_filter_form" method="POST">
				<?php 
				if ( function_exists('wp_nonce_field') ){
					wp_nonce_field( 'thjmf_filter_jobs', 'thjmf_filter_jobs_nonce' ); 
				}
				thjmf_get_template('job-filters.php', $this->get_filter_args()); 
				?>
			</form>
			<?php
			echo '<form name="thjmf_load_more_post" method="POST">';
			echo '<input type="hidden" name="thjmf_job_paged" value="'.esc_attr($paged).'">';
			if ( function_exists('wp_nonce_field') ){
				wp_nonce_field( 'thjmf_load_more_jobs', 'thjmf_load_more_jobs_nonce' ); 
			}
			thjmf_get_template( 'thjm-job-listings-start.php' );
			$jobs = thjmf_get_jobs( $this->get_listing_args(false, $paged) );
			if(!$jobs->have_posts()){
				thjmf_get_template( 'thjm-no-jobs.php' );
			}
			while ( $jobs->have_posts() ) {
				$jobs->the_post();
				thjmf_get_template_part( 'content', 'thjm-listing' );
			}
			
			thjmf_get_template( 'thjm-job-listings-end.php' );
			thjmf_get_template( 'thjm-more-jobs.php', $this->load_more_args( $jobs, $paged ) );
			echo '</form>';
			?>
		</div>
		<?php
		wp_reset_postdata();
		return ob_get_clean();
	}

	public function enqueue_styles_and_scripts() {
		global $post;
		if( THJMF_Utils::should_enqueue($post) ){
			$in_footer = apply_filters( 'thjmf_enqueue_script_in_footer', true );
			$deps = array('jquery');
			wp_enqueue_style( 'thjmf-public-style', THJMF_ASSETS_URL . 'css/thjmf-public.css', THJMF_VERSION );
			if( !wp_style_is('dashicons')){
				wp_enqueue_style('dashicons');
			}
			wp_register_script('thjmf-public-script', THJMF_ASSETS_URL.'js/thjmf-public.js', $deps, THJMF_VERSION, $in_footer);
			wp_enqueue_script('thjmf-public-script');	
			$public_var = array(
				'ajax_url'						=> admin_url( 'admin-ajax.php' ),
				'ajax_nonce' 					=> wp_create_nonce('thjmf_ajax_filter_job'),
				'locations'						=> THJMF_Utils::get_all_post_terms('location'),
				'required_apply_form_fields'	=> THJMF_Utils::get_required_apply_form_fields(),
				'form_validations'				=> $this->get_form_field_validations(),
				'assets_url'					=> THJMF_ASSETS_URL
			);
			wp_localize_script('thjmf-public-script', 'thjmf_public_var', $public_var);
		}
	}

	private function get_listing_args( $filter=false, $paged=false ){
		$args = [];
		$args['per_page'] = (int) $this->args['per_page']*$paged;;
		$args['hide_expired'] = $this->args['hide_expired'];
		$args['hide_filled'] =  $this->args['hide_filled'];
		$args['featured_position'] = $this->args['featured_position'];
		$args['filter'] = $filter;
		// $args['paged'] = $paged;
		if( $filter ){
			if( isset( $_POST['thjmf_category_filter'] ) ){
				$args['category'] = sanitize_text_field($_POST['thjmf_category_filter']);
			}
			if( isset( $_POST['thjmf_location_filter'] ) ){
				$loc = sanitize_text_field($_POST['thjmf_location_filter']);
				$locations = isset($this->args['locations']) ? $this->args['locations'] : false;
				if($locations){
					foreach ( $locations as $location ) {
						if( $location->name == $loc || $location->slug == $loc ){
							$loc = $location->slug;
						}
					}
				}
				$args['location'] = $loc;
			}
			if( isset( $_POST['thjmf_job_type_filter'] ) ){
				$args['type'] = sanitize_text_field($_POST['thjmf_job_type_filter']);
			}
		}
		return $args;
	}

	private function get_filter_args(){
		$theme_class = '';
		if( $this->args['filter_count'] > 0 ){
			$theme_class = $this->add_theme_compatibiltiy_class();
		}

		return array(
			'show_date' 		=> $this->args['show_date'],
			'locations' 		=> $this->args['locations'],
			'categories' 		=> $this->args['categories'],
			'types' 			=> $this->args['job_types'],
			'location_filter'	=> $this->args['search_location'],
			'category_filter' 	=> $this->args['search_category'],
			'job_type_filter' 	=> $this->args['search_type'],
			'job_category'		=> isset($_POST['thjmf_category_filter']) ? sanitize_text_field($_POST['thjmf_category_filter']) : '',
			'job_location'		=> isset($_POST['thjmf_location_filter']) ? sanitize_text_field($_POST['thjmf_location_filter']) : '',
			'job_type'			=> isset($_POST['thjmf_job_type_filter']) ? sanitize_text_field($_POST['thjmf_job_type_filter']) : '',
			'filter_count' 		=> $this->args['filter_count'],
			'theme_class' 		=> $theme_class,
			'date_format' 		=> apply_filters( 'thjmf_posted_date_format', $this->args['date_format']),
			'link'				=> apply_filters( 'thjmf_shortcode_post_title_link', true ),
			'details_button'	=> $this->get_thjmf_details_button(),
			'primary_filter_class' => ''
		);
	}

	private function load_more_args( $jobs, $paged ){
		$per_page = get_option( 'posts_per_page' );
		$last_page = ceil($jobs->found_posts/$per_page);
		return array(
			'load_style' => $this->load_style,
			'max_page' => $jobs->max_num_pages,
			'paged' => $paged,
			'last_page' => $last_page == $paged
		);
	}

	private function has_search_filter(){
		return $this->args['show_filters'] && $this->args['filter_count'] > 0;
	}

	private function add_theme_compatibiltiy_class(){
		$class = "";
		if( $this->special_theme ){
			$class = "thjmf-filter-columns";
		}
		return $class;
	}

	private function get_thjmf_details_button(){
		return apply_filters( 'thjmf_job_details_button', __('Details', 'job-manager-career') );
	}

	private function define_variables(){
		if( isset( $this->db['search_and_filt'] ) && !empty( $this->db['search_and_filt'] ) ){
			$this->filters = $this->db['search_and_filt'];
		}
		$this->args = $this->prepare_query_args();
		$this->special_theme = $this->is_a_compatible_theme();
	}

	private function is_a_compatible_theme(){
		$themes = array(
			"Twenty Twenty",
			"Twenty Twenty-One",
			"Twenty Nineteen",
			"Twenty Fifteen",
			"Twenty Sixteen",
			"Twenty Seventeen",
			"Hestia",
			"Go",
		);
		$themes = apply_filters( "thjmf_filter_theme_compatibility", $themes );
		$active_theme = get_option( 'current_theme' );
		return in_array( $active_theme, $themes );
	}

	private function prepare_query_args(){
		$general = isset( $this->db['general'] ) ? $this->db['general'] : "";
		$job_detail = isset( $this->db['job_detail'] ) ? $this->db['job_detail'] : "";
		$args = array(
			'per_page' 			=> get_option( 'posts_per_page' ),
			'hide_expired' 		=> false,
			'hide_filled' 		=> false,
			'featured_position' => '',
			'show_date'			=> true,
			'date_format' 		=> get_option('date_format'),
			'search_location'   => false,
			'search_category'   => false,
			'search_job_type'   => false,
			'filter_count' 		=> 0
		);

		if( isset( $job_detail['job_hide_expired'] ) ){
			$args['hide_expired'] = $job_detail['job_hide_expired'];
		}

		if( isset( $job_detail['job_hide_filled'] ) ){
			$args['hide_filled'] = $job_detail['job_hide_filled'];
		}

		if( isset( $job_detail['job_featured_position'] ) && !empty( $job_detail['job_featured_position'] ) ){
			$args['featured_position'] = $job_detail['job_featured_position'];
		}

		if( isset( $job_detail['job_display_post_date'] ) ){
			$args['show_date'] = $job_detail['job_display_post_date'];
		}

		if( isset( $job_detail['job_date_format'] ) && !empty( $job_detail['job_date_format'] ) ){
			$args['date_format'] = $job_detail['job_date_format'];
		}
		$args = $this->get_search_filter_count( $args );
		return $args;
	}

	private function get_search_filter_count( $args ){
		$filter = [];
		if( !empty( $this->filters ) ){
			$filter['filter_count'] = count(array_filter($this->filters));
			return is_array( $this->filters ) ? array_merge( $args, $this->filters, $filter ) : $args;
		}
		return $args;	
	}

	public function post_related_query_args(){
		global $post;
		if( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'THJM_JOBS') ){
			$this->args['locations'] = THJMF_Utils::get_all_post_terms('location');
			$this->args['categories'] = THJMF_Utils::get_all_post_terms('category');
			$this->args['job_types'] = THJMF_Utils::get_all_post_terms('job_type');
		}
		$this->is_valid_job();
	}

	public function prepare_reset_actions(){
		global $post;
		if( isset($_POST["thjmf_job_filter_reset"]) ){
			if ( ! isset( $_POST['thjmf_filter_jobs_nonce'] )  || ! wp_verify_nonce( $_POST['thjmf_filter_jobs_nonce'], 'thjmf_filter_jobs' ) ){
					wp_die('Sorry, your nonce did not verify.');
					exit;
			}
			if( isset($post->post_content) && has_shortcode( $post->post_content, THJMF_Utils::$shortcode) ){

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

	public function is_valid_job(){
		$this->expired = THJMF_Utils::get_post_meta_expiration( get_the_ID() );
	    $filled = get_post_meta( get_the_ID(), THJMF_Utils::get_filled_meta_key(), true);
	    $this->filled = filter_var( $filled, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
	    if($this->expired || $this->filled){
			remove_action('thjm_after_single_job_content', 'thjmf_single_job_apply_now_button');
			remove_action('thjm_after_single_job_content', 'thjmf_single_job_application_form');
			add_action('thjm_after_single_job_content', array( $this, 'thjmf_single_job_unavailable' ));
		}
	}

	private function filter_jobs(){
		$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
		if( isset( $_POST["thjmf_job_paged"] ) ){
			$paged =  absint( $_POST["thjmf_job_paged"] ) + 1;
		}

		$this->args['per_page'] = (int) $this->args['per_page']*$paged;
		ob_start();
		?>
		<div class="<?php thjmf_get_job_listing_class(); ?>">
			<form id="thjmf_job_filter_form" name="thjmf_job_filter_form" method="POST">
				<?php 
				if ( function_exists('wp_nonce_field') ){
					wp_nonce_field( 'thjmf_filter_jobs', 'thjmf_filter_jobs_nonce' ); 
				}
				$this->render_filter_has_value_input();
				thjmf_get_template('job-filters.php', $this->get_filter_args()); 
				?>
			</form>
			<?php
			echo '<form name="thjmf_load_more_post" method="POST">';
			echo '<input type="hidden" name="thjmf_job_paged" value="'.esc_attr($paged).'">';
			echo '<input type="hidden" name="thjmf_filtering">';
			if ( function_exists('wp_nonce_field') ){
				wp_nonce_field( 'thjmf_load_more_jobs', 'thjmf_load_more_jobs_nonce' ); 
			}
			$this->render_fields_for_filtering();
			thjmf_get_template( 'thjm-job-listings-start.php' );
			$jobs = thjmf_get_jobs( $this->get_listing_args(true, $paged) );
			if(!$jobs->have_posts()){
				thjmf_get_template( 'thjm-no-jobs.php' );
			}
			while ( $jobs->have_posts() ) {
				$jobs->the_post();
				thjmf_get_template_part( 'content', 'thjm-listing' );
			}
			
			thjmf_get_template( 'thjm-job-listings-end.php' );
			thjmf_get_template( 'thjm-more-jobs.php', $this->load_more_args( $jobs, $paged ) );
			echo '</form>';
			?>
		</div>
		<?php
		wp_reset_postdata();
		return ob_get_clean();
	}

	private function render_fields_for_filtering(){
		$filter_category = isset($_POST["thjmf_category_filter"]) ? sanitize_text_field($_POST["thjmf_category_filter"]) : "";
		$filter_location = isset($_POST["thjmf_location_filter"]) ? sanitize_text_field($_POST["thjmf_location_filter"]) : "";
		$filter_type = isset($_POST["thjmf_job_type_filter"]) ? sanitize_text_field($_POST["thjmf_job_type_filter"]) : "";
		?>
		<input type="hidden" name="thjmf_category_filter" value="<?php echo esc_attr($filter_category); ?>" />
		<input type="hidden" name="thjmf_location_filter" value="<?php echo esc_attr($filter_location); ?>" />
		<input type="hidden" name="thjmf_job_type_filter" value="<?php echo esc_attr($filter_type); ?>" />
		<?php
	}

	public function thjmf_single_job_unavailable(){
		if($this->expired){
	        echo '<div class="thjmf-apply-now-disabled-msg">'.esc_html__( 'This job is Expired', 'job-manager-career').'</div>';  
	    }else if($this->filled){
	        echo '<div class="thjmf-apply-now-disabled-msg">'.esc_html__( 'This job is Filled', 'job-manager-career').'</div>';  
	    }
	}

	private function get_form_field_validations(){
		return apply_filters('thjm_apply_form_fields_validation', array(
			'first_name' => array(
				'regex' => '^[^0-9]+$',
				'message'	=> esc_html__('The field should contain only alphabets', 'job-manager-career'),
			),
			'last_name' => array(
				'regex' => '^[^0-9]+$',
				'message'	=> esc_html__('The field should contain only alphabets','job-manager-career'),
			),
			'phone' => array(
				'regex' => '^\d+$',
				'message'	=> esc_html__('Invalid phone number','job-manager-career'),
			),
			'email' => array(
				'regex' => '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$',
				'message'	=> esc_html__('Invalid email','job-manager-career'),
			),
			'resume' => array(
				'regex' => false,
				'message' => '',
			)
		) );
	}

	public function thjmf_theme_specific_class( $classes, $theme ){
		$classes[] = 'thjmf-theme-'.$theme; 
		if( in_array( $theme, ['twentyfourteen', 'twentythirteen'] ) ){
			$classes[] = 'thjmf-alignwide-job-listing';
		}else if( in_array( $theme, ['twentyeleven'] ) ){
			$classes[] = 'thjmf-fullwidth-job-listing';
		}
		return $classes;
	}

	private function render_filter_has_value_input(){
		$location = isset($_POST['thjmf_location_filter']) ? $_POST['thjmf_location_filter'] : false;
		$type = isset($_POST['thjmf_job_type_filter']) ? $_POST['thjmf_job_type_filter'] : false;
		$category = isset($_POST['thjmf_category_filter']) ? $_POST['thjmf_category_filter'] : false;
		if( !$location && !$type && !$category ){
			return;
		}
		if( empty($location) && empty($type) && empty($category) ){
			return;
		}
		echo '<input type="hidden" name="thjmf_job_filtered" id="thjmf_job_filtered" value="true" />';
	}

	private function focus_to_job_list(){
		?>
			<script type="text/javascript">
			    jQuery(document).ready(function () {
					jQuery('html, body').animate({
						scrollTop: jQuery('.thjmf-jobs').offset().top
					}, 'slow');
				});
			</script>
		<?php
	}
}

endif;