<?php
/**
 * The file that defines the core plugin class.
 *
 * @link       https://themehigh.com
 *
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 */

defined( 'ABSPATH' ) || exit;

if(!class_exists('THJMF')):

	class THJMF {
		const TEXT_DOMAIN = 'job-manager-career';

		/**
		 * The current version of the plugin.
		 *
		 * @access   protected
		 * @var      string    $version    The current version of the plugin.
		 */
		protected $version;

		public function __construct() {
			$this->init();
			$this->load_dependencies();
			!defined('THJMF_ACTIVE_THEME') && define('THJMF_ACTIVE_THEME', thjmf_get_theme_slug() );
			!defined('THJMF_SETTINGS') && define('THJMF_SETTINGS', THJMF_Utils::get_default_settings());
			$this->set_locale();
			$this->define_admin_hooks();
			add_action('after_setup_theme', array($this, 'load_current_ui_files'));
			add_action('admin_footer-plugins.php', array($this, 'thjmf_deactivation_form'));
			add_action('wp_ajax_thjmf_deactivation_reason', array($this, 'thjmf_deactivation_reason'));
			add_action( 'admin_print_styles', array('THJMF_Install', 'thjmf_add_sample_data') );
		}

		/**
		 * Retrieve the version number of the plugin.
		 *
		 * @return    string    The version number of the plugin.
		 */
		public function get_version() {
			return $this->version;
		}


		private function load_dependencies() {
			if(!function_exists('is_plugin_active')){
				include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
			}
			require_once THJMF_PATH . 'classes/thjmf-core-functions.php';
			require_once THJMF_PATH . 'classes/class-thjmf-utils.php';
			require_once THJMF_PATH . 'classes/class-thjmf-settings.php';
			require_once THJMF_PATH . 'classes/class-thjmf-install.php';
			require_once THJMF_PATH . 'classes/class-thjmf-settings-general.php';
			require_once THJMF_PATH . 'classes/class-thjmf-post-fields.php';
			require_once THJMF_PATH . 'classes/class-thjmf-posts.php';
			require_once THJMF_PATH . 'classes/class-thjmf-template.php';
			require_once THJMF_PATH . 'classes/class-thjmf-public.php';
		}

		public function load_current_ui_files(){
			if( !apply_filters('thjmf_load_old_ui', false ) ){
				require_once THJMF_PATH . 'classes/class-thjmf-hooks.php';
				require_once THJMF_PATH . 'classes/class-thjmf-theme-support.php';
				require_once THJMF_PATH . 'classes/class-thjmf-public-jobs.php';
			}else{
				require_once THJMF_PATH . 'classes/class-thjmf-public-shortcodes.php';
			}
			$this->define_public_hooks();
		}

		private function set_locale() {
			add_action('init', array($this, 'load_plugin_textdomain'));
		}

		public function load_plugin_textdomain(){
			$locale = apply_filters('plugin_locale', get_locale(), self::TEXT_DOMAIN);

			load_textdomain(self::TEXT_DOMAIN, WP_LANG_DIR.'/'.self::TEXT_DOMAIN.'/'.self::TEXT_DOMAIN.'-'.$locale.'.mo');
			load_plugin_textdomain(self::TEXT_DOMAIN, false, dirname(THJMF_BASE_NAME) . '/languages/');
		}

		public function init(){
			add_action('init', array($this, 'initialize_events') );
		}

		public function initialize_events(){
			self::register_thjmf_post_types();
			$this->define_custom_post_types();
			$this->create_upload_directory();
		}

		private function define_custom_post_types(){
			$plugin_post_types = new THJMF_Posts();
		}

		public static function register_thjmf_post_types(){
			$labels_job = array(
				'name'               => __( 'Jobs', 'job-manager-career'),
				'singular_name'      => __( 'Jobs', 'job-manager-career'),
				'menu_name'          => __( 'Job Listings', 'job-manager-career'),
				'name_admin_bar'     => __( 'Job Listings', 'job-manager-career'),
				'add_new'            => __( 'Add New', 'job-manager-career'),
				'add_new_item'       => __( 'Add New Job', 'job-manager-career'),
				'new_item'           => __( 'New Job', 'job-manager-career'),
				'edit_item'          => __( 'Edit Job', 'job-manager-career'),
				'view_item'          => __( 'View Job', 'job-manager-career'),
				'all_items'          => __( 'All Jobs', 'job-manager-career'),
				'search_items'       => __( 'Search Jobs', 'job-manager-career'),
				'parent_item_colon'  => __( 'Parent Jobs:', 'job-manager-career'),
				'not_found'          => __( 'No jobs found.', 'job-manager-career'),
				'not_found_in_trash' => __( 'No jobs found in Trash.', 'job-manager-career'),
			);

			$rewrite = array(
				'slug'                  => 'jobs',
				'with_front'            => false,
				'pages'                 => true,
				'feeds'                 => true,
			);

			$args_job = array( 
				'labels'		=> $labels_job,
				'public'		=> true,
				'rewrite'		=> array( 'slug' => 'thjm_jobs' ),
				'has_archive'   => false,
				'menu_position' => 20,
				'rewrite'       => $rewrite,
				'show_in_rest'	=> apply_filters('thjmf_enable_gutenberg_editor', false),
				'menu_icon'     => 'dashicons-megaphone',
				'supports'      => array( 'title', 'editor'),
			);
			register_post_type( 'thjm_jobs', $args_job );
		

			$labels_applicants = array(
				'name'               => __( 'Applicants', 'job-manager-career'),
				'singular_name'      => __( 'Applicant', 'job-manager-career'),
				'menu_name'          => __( 'Applicant', 'job-manager-career'),
				'name_admin_bar'     => __( 'Applicant', 'job-manager-career'),
				'add_new'            => __( 'Add New', 'job-manager-career'),
				'add_new_item'       => __( 'Add New Applicant', 'job-manager-career'),
				'new_item'           => __( 'New Applicant', 'job-manager-career'),
				'edit_item'          => __( 'Edit Applicant', 'job-manager-career'),
				'view_item'          => __( 'View Applicant', 'job-manager-career'),
				'all_items'          => __( 'All Applicants', 'job-manager-career'),
				'search_items'       => __( 'Search Applicants', 'job-manager-career'),
				'parent_item_colon'  => __( 'Parent Applicant:', 'job-manager-career'),
				'not_found'          => __( 'No Applicants found.', 'job-manager-career'),
				'not_found_in_trash' => __( 'No Applicants found in Trash.', 'job-manager-career'),
			);

			$args_applicants = array( 
				'labels'		=> $labels_applicants,
				'public'		=> false,
				'show_ui' => true,
				'has_archive'   => false,
				'show_in_menu' => 'edit.php?post_type=thjm_jobs',
				'capabilities' => array(
				    'create_posts' => false,
				    'publish_posts' => 'do_not_allow',
				),
				'map_meta_cap' => true,
				'supports'      => false,
			);
			register_post_type( 'thjm_applicants', $args_applicants );
		}

		private function create_upload_directory(){
			wp_mkdir_p(THJMF_Utils::get_template_directory());

			// Added index.html,.htaccess file to protect resume files from hotlinking.
			if(wp_mkdir_p(THJMF_Utils::get_template_directory())){
				$dir = THJMF_Utils::get_template_directory();
				// Path to the index.html file
			    $index_html_path = $dir . 'index.html';

			    // Check if the index.html file exists, and if not, create it
			    if (!file_exists($index_html_path)) {
			        // Create the index.html file with no content
			        file_put_contents($index_html_path, '');
			    }
				$this->protect_files_hotlinking($dir);
			}
		}
		
		private function define_admin_hooks() {
			$plugin_admin = new THJMF_Settings();
			add_action('plugins_loaded', array( $this, 'thjmf_misc_actions' ) );
			add_action('admin_enqueue_scripts', array($plugin_admin, 'enqueue_styles_and_scripts'));
			add_action('admin_menu', array($plugin_admin, 'admin_menu'));
			add_filter('plugin_action_links_'.THJMF_BASE_NAME, array($plugin_admin, 'plugin_action_links'));
		}

		private function define_public_hooks() {
			global $pagenow;
			if( !is_admin() && !in_array( $pagenow, array('post-new.php') ) ){
				$plugin_public = new THJMF_Public();
				if( apply_filters('thjmf_load_old_ui', false ) ){
					$plugin_shortcode = new THJMF_Public_Shortcodes();
				}else{
					$plugin_shortcode = new THJMF_Public_Jobs($this->get_version());
				}
				add_action( 'wp_enqueue_scripts', array( $plugin_shortcode, 'enqueue_styles_and_scripts' ) );
				add_shortcode( THJMF_Utils::$shortcode, array( $plugin_shortcode, 'shortcode_thjmf_job_listing' ) );
			}
		}

		public static function initialize_settings(){
			self::check_for_default_settings();
			self::register_post_types();
		}

		public static function check_for_default_settings(){
			$free_settings = THJMF_Utils::plugin_db_settings();
			if($free_settings && is_array($free_settings) && !empty($free_settings)){
				return;
			}else{
				$new_settings = THJMF_Utils::default_settings();
				THJMF_Utils::save_default_settings( $new_settings, true );
			}
		}

		public function thjmf_misc_actions(){
			if ( apply_filters('thjmf_manage_db_update_notice', THJMF_Utils::is_user_capable() ) ){
				add_action( 'admin_print_styles', array( $this, 'add_notices' ) );
			}
		}

		public function add_notices(){
			$screen    = get_current_screen();
			$screen_id = $screen ? $screen->id : '';
			$scree_post = $screen ? $screen->post_type : '';
			$screens = array( 'dashboard', 'plugins' );
			if( !in_array( $screen->post_type, THJMF_Utils::get_posttypes()) ){
				if( !in_array( $screen_id,  $screens ) ){
					return;
				}
			}

			if( THJMF_Utils::get_database_version() != THJMF_VERSION ){
           		THJMF_Utils::set_database_version( THJMF_VERSION );
    		}

			if( apply_filters('thjmf_force_db_update_notice', false ) ){
				THJMF_Install::perform_updation();
			}
		}

		private static function register_post_types(){
			self::register_thjmf_post_types();
			flush_rewrite_rules();
		}

		public static function prepare_deactivation(){
			unregister_post_type('thjm_jobs');
			unregister_post_type('thjm_applicants');
			flush_rewrite_rules();
		}

		public function thjmf_deactivation_form(){
			$is_snooze_time = get_user_meta( get_current_user_id(), 'thjmf_deactivation_snooze', true );
			$now = time();

			if($is_snooze_time && ($now < $is_snooze_time)){
				return;
			}

			$deactivation_reasons = $this->get_deactivation_reasons();
			?>
			<div id="thjmf_deactivation_form" class="thpladmin-modal-mask">
				<div class="thpladmin-modal">
					<div class="modal-container">
						<!-- <span class="modal-close" onclick="thjmfCloseModal(this)">×</span> -->
						<div class="modal-content">
							<div class="modal-body">
								<div class="model-header">
									<img class="th-logo" src="<?php echo esc_url(THJMF_URL .'assets/css/images/themehigh.svg'); ?>" alt="themehigh-logo">
									<span><?php echo __('Quick Feedback', 'job-manager-career'); ?></span>
								</div>

								<!-- <div class="get-support-version-b">
									<p>We are sad to see you go. We would be happy to fix things for you. Please raise a ticket to get help</p>
									<a class="thjmf-link thjmf-right-link thjmf-active" target="_blank" href="https://help.themehigh.com/hc/en-us/requests/new?utm_source=thjmf_free&utm_medium=feedback_form&utm_campaign=get_support"><?php echo __('Get Support', 'job-manager-career'); ?></a>
								</div> -->

								<main class="form-container main-full">
									<p class="thjmf-title-text"><?php echo __('If you have a moment, please let us know why you want to deactivate this plugin', 'job-manager-career'); ?></p>
									<ul class="deactivation-reason" data-nonce="<?php echo wp_create_nonce('thjmf_deactivate_nonce'); ?>">
										<?php 
										if($deactivation_reasons){
											foreach($deactivation_reasons as $key => $reason){
												$reason_type = isset($reason['reason_type']) ? $reason['reason_type'] : '';
												$reason_placeholder = isset($reason['reason_placeholder']) ? $reason['reason_placeholder'] : '';
												?>
												<li data-type="<?php echo esc_attr($reason_type); ?>" data-placeholder="<?php echo esc_attr($reason_placeholder); ?> ">
													<label>
														<input type="radio" name="selected-reason" value="<?php echo esc_attr($key); ?>">
														<span><?php echo esc_html($reason['radio_label']); ?></span>
													</label>
												</li>
												<?php
											}
										}
										?>
									</ul>
									<p class="thjmf-privacy-cnt"><?php echo __('This form is only for getting your valuable feedback. We do not collect your personal data. To know more read our ', 'job-manager-career'); ?> <a class="thjmf-privacy-link" target="_blank" href="<?php echo esc_url('https://www.themehigh.com/privacy-policy/');?>"><?php echo __('Privacy Policy', 'job-manager-career'); ?></a></p>
								</main>
								<footer class="modal-footer">
									<div class="thjmf-left">
										<a class="thjmf-link thjmf-left-link thjmf-deactivate" href="#"><?php echo __('Skip & Deactivate', 'job-manager-career'); ?></a>
									</div>
									<div class="thjmf-right">
										<a class="thjmf-link thjmf-right-link thjmf-active" target="_blank" href="https://help.themehigh.com/hc/en-us/requests/new?utm_source=thjmf_free&utm_medium=feedback_form&utm_campaign=get_support"><?php echo __('Get Support', 'job-manager-career'); ?></a>
										<a class="thjmf-link thjmf-right-link thjmf-active thjmf-submit-deactivate" href="#"><?php echo __('Submit and Deactivate', 'job-manager-career'); ?></a>
										<a class="thjmf-link thjmf-right-link thjmf-close" href="#"><?php echo __('Cancel', 'job-manager-career'); ?></a>
									</div>
								</footer>
							</div>
						</div>
					</div>
				</div>
			</div>
			<style type="text/css">
				.th-logo{
				    margin-right: 10px;
				}
				.thpladmin-modal-mask{
				    position: fixed;
				    background-color: rgba(17,30,60,0.6);
				    top: 0;
				    left: 0;
				    width: 100%;
				    height: 100%;
				    z-index: 9999;
				    overflow: scroll;
				    transition: opacity 250ms ease-in-out;
				}
				.thpladmin-modal-mask{
				    display: none;
				}
				.thpladmin-modal .modal-container{
				    position: absolute;
				    background: #fff;
				    border-radius: 2px;
				    overflow: hidden;
				    left: 50%;
				    top: 50%;
				    transform: translate(-50%,-50%);
				    width: 50%;
				    max-width: 960px;
				    /*min-height: 560px;*/
				    /*height: 80vh;*/
				    /*max-height: 640px;*/
				    animation: appear-down 250ms ease-in-out;
				    border-radius: 15px;
				}
				.model-header {
				    padding: 21px;
				}
				.thpladmin-modal .model-header span {
				    font-size: 18px;
				    font-weight: bold;
				}
				.thpladmin-modal .model-header {
				    padding: 21px;
				    background: #ECECEC;
				}
				.thpladmin-modal .form-container {
				    margin-left: 23px;
				    clear: both;
				}
				.thpladmin-modal .deactivation-reason input {
				    margin-right: 13px;
				}
				.thpladmin-modal .thjmf-privacy-cnt {
				    color: #919191;
				    font-size: 12px;
				    margin-bottom: 31px;
				    margin-top: 18px;
				    max-width: 75%;
				}
				.thpladmin-modal .deactivation-reason li {
				    margin-bottom: 17px;
				}
				.thpladmin-modal .modal-footer {
				    padding: 20px;
				    border-top: 1px solid #E7E7E7;
				    float: left;
				    width: 100%;
				    box-sizing: border-box;
				}
				.thjmf-left {
				    float: left;
				}
				.thjmf-right {
				    float: right;
				}
				.thjmf-link {
				    line-height: 31px;
				    font-size: 12px;
				}
				.thjmf-left-link {
				    font-style: italic;
				}
				.thjmf-right-link {
				    padding: 0px 20px;
				    border: 1px solid;
				    display: inline-block;
				    text-decoration: none;
				    border-radius: 5px;
				}
				.thjmf-right-link.thjmf-active {
				    background: #0773AC;
				    color: #fff;
				}
				.thjmf-title-text {
				    color: #2F2F2F;
				    font-weight: 500;
				    font-size: 15px;
				}
				.reason-input {
				    margin-left: 31px;
				    margin-top: 11px;
				    width: 70%;
				}
				.reason-input input {
				    width: 100%;
				    height: 40px;
				}
				.reason-input textarea {
				    width: 100%;
				    min-height: 80px;
				}
				input.th-snooze-checkbox {
				    width: 15px;
				    height: 15px;
				}
				input.th-snooze-checkbox:checked:before {
				    width: 1.2rem;
				    height: 1.2rem;
				}
				.th-snooze-select {
				    margin-left: 20px;
				    width: 172px;
				}

				/* Version B */
				.get-support-version-b {
				    width: 100%;
				    padding-left: 23px;
				    clear: both;
				    float: left;
				    box-sizing: border-box;
				    background: #0673ab;
				    color: #fff;
				    margin-bottom: 20px;
				}
				.get-support-version-b p {
				    font-size: 12px;
				    line-height: 17px;
				    width: 70%;
				    display: inline-block;
				    margin: 0px;
				    padding: 15px 0px;
				}
				.get-support-version-b .thjmf-right-link {
				    background-image: url(<?php echo esc_url(THJMF_URL .'assets/css/images/get_support_icon.svg'); ?>);
				    background-repeat: no-repeat;
				    background-position: 11px 10px;
				    padding-left: 31px;
				    color: #0773AC;
				    background-color: #fff;
				    float: right;
				    margin-top: 17px;
				    margin-right: 20px;
				}
				.thjmf-privacy-link {
				    font-style: italic;
				}
				.thjmf-review-link {
				    margin-top: 7px;
				    margin-left: 31px;
				    font-size: 16px;
				}
				span.thjmf-rating-link {
				    color: #ffb900;
				}
				.thjmf-review-and-deactivate {
				    text-decoration: none;
				}
			</style>

			<script type="text/javascript">
				(function($){
					var popup = $("#thjmf_deactivation_form");
					var deactivation_link = '';

					$('.thjmf-deactivate-link').on('click', function(e){
						e.preventDefault();
						deactivation_link = $(this).attr('href');
						popup.css("display", "block");
						popup.find('a.thjmf-deactivate').attr('href', deactivation_link);
					});

					popup.on('click', 'input[type="radio"]', function () {
						var parent = $(this).parents('li:first');
		                popup.find('.reason-input').remove();

		                var type = parent.data('type');
		                var placeholder = parent.data('placeholder');

		                var reason_input = '';
		                if('text' == type){
		                	reason_input += '<div class="reason-input">';
		                	reason_input += '<input type="text" placeholder="'+ placeholder +'">';
		                	reason_input += '</div>';
		                }else if('textarea' == type){
		                	reason_input += '<div class="reason-input">';
		                	reason_input += '<textarea row="5" placeholder="'+ placeholder +'">';
		                	reason_input += '</textarea>';
		                	reason_input += '</div>';
		                }else if('checkbox' == type){
		                	reason_input += '<div class="reason-input ">';
		                	reason_input += '<input type="checkbox" id="th-snooze" name="th-snooze" class="th-snooze-checkbox">';
		                	reason_input += '<label for="th-snooze">Snooze this panel while troubleshooting</label>';
		                	reason_input += '<select name="th-snooze-time" class="th-snooze-select" disabled>';
		                	reason_input += '<option value="<?php echo HOUR_IN_SECONDS ?>">1 Hour</option>';
		                	reason_input += '<option value="<?php echo 12*HOUR_IN_SECONDS ?>">12 Hour</option>';
		                	reason_input += '<option value="<?php echo DAY_IN_SECONDS ?>">24 Hour</option>';
		                	reason_input += '<option value="<?php echo WEEK_IN_SECONDS ?>">1 Week</option>';
		                	reason_input += '<option value="<?php echo MONTH_IN_SECONDS ?>">1 Month</option>';
		                	reason_input += '</select>';
		                	reason_input += '</div>';
		                }else if('reviewlink' == type){
		                	reason_input += '<div class="reason-input thjmf-review-link">';
		                	/*
		                	reason_input += '<?php _e('Deactivate and ', 'job-manager-career');?>'
		                	reason_input += '<a href="#" target="_blank" class="thjmf-review-and-deactivate">';
		                	reason_input += '<?php _e('leave a review', 'job-manager-career'); ?>';
		                	reason_input += '<span class="thjmf-rating-link"> &#9733;&#9733;&#9733;&#9733;&#9733; </span>';
		                	reason_input += '</a>';
		                	*/
		                	reason_input += '<input type="hidden" value="<?php _e('Upgraded', 'job-manager-career');?>">';
		                	reason_input += '</div>';
		                }

		                if(reason_input !== ''){
		                	parent.append($(reason_input));
		                }
					});

					popup.on('click', '.thjmf-close', function () {
						popup.css("display", "none");
					});

					/*
					popup.on('click', '.thjmf-review-and-deactivate', function () {
						e.preventDefault();
		                window.open("https://wordpress.org/support/plugin/job-manager-career/reviews/?rate=5#new-post");
		                console.log(deactivation_link);
		                window.location.href = deactivation_link;
					});
					*/

					popup.on('click', '.thjmf-submit-deactivate', function (e) {
		                e.preventDefault();
		                var button = $(this);
		                if (button.hasClass('disabled')) {
		                    return;
		                }
		                var radio = $('.deactivation-reason input[type="radio"]:checked');
		                var parent_li = radio.parents('li:first');
		                var parent_ul = radio.parents('ul:first');
		                var input = parent_li.find('textarea, input[type="text"], input[type="hidden"]');
		                var thjmf_deacive_nonce = parent_ul.data('nonce');

		                $.ajax({
		                    url: ajaxurl,
		                    type: 'POST',
		                    data: {
		                        action: 'thjmf_deactivation_reason',
		                        reason: (0 === radio.length) ? 'none' : radio.val(),
		                        comments: (0 !== input.length) ? input.val().trim() : '',
		                        security: thjmf_deacive_nonce,
		                    },
		                    beforeSend: function () {
		                        button.addClass('disabled');
		                        button.text('Processing...');
		                    },
		                    complete: function () {
		                        window.location.href = deactivation_link;
		                    }
		                });
		            });

		            popup.on('click', '#th-snooze', function () {
		            	if($(this).is(':checked')){
		            		popup.find('.th-snooze-select').prop("disabled", false);
		            	}else{
		            		popup.find('.th-snooze-select').prop("disabled", true);
		            	}
					});

				}(jQuery))
			</script>

			<?php 
		}

		private function get_deactivation_reasons(){
			return array(
				'upgraded_to_pro' => array(
					'radio_val'          => 'upgraded_to_pro',
					'radio_label'        => __('Upgraded to premium.', 'job-manager-career'),
					'reason_type'        => 'reviewlink',
					'reason_placeholder' => '',
				),

				'feature_missing'=> array(
					'radio_val'          => 'feature_missing',
					'radio_label'        => __('A specific feature is missing', 'job-manager-career'),
					'reason_type'        => 'text',
					'reason_placeholder' => __('Propose the feature', 'job-manager-career'),
				),

				'error_or_not_working'=> array(
					'radio_val'          => 'error_or_not_working',
					'radio_label'        => __('Found an error in the plugin/ Plugin was not working', 'job-manager-career'),
					'reason_type'        => 'text',
					'reason_placeholder' => __('Specify the issue', 'job-manager-career'),
				),

				'hard_to_use' => array(
					'radio_val'          => 'hard_to_use',
					'radio_label'        => __('It was hard to use', 'job-manager-career'),
					'reason_type'        => 'text',
					'reason_placeholder' => __('How can we improve your experience?', 'job-manager-career'),
				),

				'found_better_plugin' => array(
					'radio_val'          => 'found_better_plugin',
					'radio_label'        => __('I found a better Plugin', 'job-manager-career'),
					'reason_type'        => 'text',
					'reason_placeholder' => __('Could you please mention the plugin?', 'job-manager-career'),
				),

				// 'not_working_as_expected'=> array(
				// 	'radio_val'          => 'not_working_as_expected',
				// 	'radio_label'        => __('The plugin didn’t work as expected', 'job-manager-career'),
				// 	'reason_type'        => 'text',
				// 	'reason_placeholder' => __('Specify the issue', 'job-manager-career'),
				// ),

				'temporary' => array(
					'radio_val'          => 'temporary',
					'radio_label'        => __('It’s a temporary deactivation - I’m troubleshooting an issue', 'job-manager-career'),
					'reason_type'        => 'checkbox',
					'reason_placeholder' => __('Could you please mention the plugin?', 'job-manager-career'),
				),

				'other' => array(
					'radio_val'          => 'other',
					'radio_label'        => __('Not mentioned here', 'job-manager-career'),
					'reason_type'        => 'textarea',
					'reason_placeholder' => __('Kindly tell us your reason, so that we can improve', 'job-manager-career'),
				),
			);
		}

		public function thjmf_deactivation_reason(){
			global $wpdb;

			check_ajax_referer('thjmf_deactivate_nonce', 'security');

			if(!isset($_POST['reason'])){
				return;
			}

			if($_POST['reason'] === 'temporary'){

				$snooze_period = isset($_POST['th-snooze-time']) && $_POST['th-snooze-time'] ? $_POST['th-snooze-time'] : MINUTE_IN_SECONDS ;
				$time_now = time();
				$snooze_time = $time_now + $snooze_period;

				update_user_meta(get_current_user_id(), 'thjmf_deactivation_snooze', $snooze_time);

				return;
			}
			
			$data = array(
				'plugin'        => 'thjmf',
				'reason' 	    => sanitize_text_field($_POST['reason']),
				'comments'	    => isset($_POST['comments']) ? sanitize_textarea_field(wp_unslash($_POST['comments'])) : '',
		        'date'          => gmdate("M d, Y h:i:s A"),
		        'software'      => $_SERVER['SERVER_SOFTWARE'],
		        'php_version'   => phpversion(),
		        'mysql_version' => $wpdb->db_version(),
		        'wp_version'    => get_bloginfo('version'),
		        'wc_version'    => (!defined('WC_VERSION')) ? '' : WC_VERSION,
		        'locale'        => get_locale(),
		        'multisite'     => is_multisite() ? 'Yes' : 'No',
		        'plugin_version'=> THJMF_VERSION
			);

			$response = wp_remote_post('https://feedback.themehigh.in/api/add_feedbacks', array(
		        'method'      => 'POST',
		        'timeout'     => 45,
		        'redirection' => 5,
		        'httpversion' => '1.0',
		        'blocking'    => false,
		        'headers'     => array( 'Content-Type' => 'application/json' ),
		        'body'        => json_encode($data),
		        'cookies'     => array()
		            )
		    );

		    wp_send_json_success();
		}

		/**
	     * Add htaccess file for protection files from hotlinking by
	     * only allowing access when the correct query string (random hash) is provided.
	     *
	     * @since   1.4.4
	     */
	    private function protect_files_hotlinking($dir) {

			if (!file_exists($dir . '.htaccess')) {

				$random_hash_key = bin2hex(random_bytes(20));
				update_option('thjmf_htaccess_hash_key', sanitize_text_field($random_hash_key), 'no');

				$file = array(
				    'basedir' => $dir,
				    'file' => '.htaccess',
				    'str1' => 'RewriteEngine On',
				    'str2' => 'RewriteCond %{QUERY_STRING} !^' . $random_hash_key . '$ [NC]',
				    'str3' => 'RewriteRule ^.*$ - [R=403,L]',
				);

	            if ($file_handle = @fopen(trailingslashit($file['basedir']) . $file['file'], 'w')) {
	                fwrite($file_handle, $file['str1'] . "\n");
	                fwrite($file_handle, $file['str2'] . "\n");
	                fwrite($file_handle, $file['str3'] . "\n");
	                fclose($file_handle);
	            }
	        }
		}
	}

endif;