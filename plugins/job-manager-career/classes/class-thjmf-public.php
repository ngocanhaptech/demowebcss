<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://themehigh.com
 * @since      1.0.0
 *
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 */
if(!defined('WPINC')){	die; }

if(!class_exists('THJMF_Public')):
 
	class THJMF_Public {
		
		private $placeholders = array();
		private $email_placeholders = array();
		private $submit_msg = array();
		private $is_admin = null;
		private $apply_field_sanitize = array();

		public function __construct() {
			$this->define_helpers();
			add_action( 'wp', array($this, 'prepare_form_submission') );
			add_filter( 'excerpt_more', array($this, 'new_excerpt_more'), 20 );
		}

		public function define_helpers(){
			$this->apply_field_sanitize = array('name' => 'text', 'phone' => 'number', 'email' => 'email', 'cover_letter' => 'textarea');
		}

		public function prepare_form_submission(){
			global $post;
			$is_thjm_application = apply_filters('thjmf_load_old_ui', false) ? isset( $_POST['thjmf_save_popup'] ) : isset( $_POST['thjmf_apply_job'] );
			if(is_single() && get_post_type( $post ) == THJMF_Utils::get_job_cpt()  && $is_thjm_application ){
				
				if ( empty( $_POST['thjmf_application_meta_nonce'] ) || ! wp_verify_nonce( wp_unslash( $_POST['thjmf_application_meta_nonce'] ), 'thjmf_new_job_application' ) ) {
					wp_die("You don't have enough permission");
					return;
				}
				$submit = $this->process_apply_now_form_submit();
				$submit = filter_var( $submit, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
				$submit = $submit ? 'success' : 'error';
				$permalink = esc_url( add_query_arg( 'submit', $submit , get_permalink( $post ) ) );
				set_transient( 'thjmf_apply_now_submit', $submit, 5 * MINUTE_IN_SECONDS );
				wp_safe_redirect( $permalink );
				exit;
				
			}else if( is_single() && get_post_type( $post ) == THJMF_Utils::get_job_cpt() && isset( $_GET['submit'] ) ){
				if( get_transient('thjmf_apply_now_submit') ){
					delete_transient('thjmf_apply_now_submit');
					
				}else{
					wp_safe_redirect( get_permalink( $post ) );
					exit;
				}
			}
		}

		public function process_apply_now_form_submit(){
			$applicant_meta = [];
			$pm1 = $pm2 = $mail = false;
			$field_list = [];
			$error = [];
			$job_id_key = 'thjmf_job_id';
			$resume = 'resume';
			if( apply_filters('thjmf_load_old_ui', false) ){
				$job_id_key = 'thjmf_post_id';
				$resume = 'thjmf_resume';
			}
			$job_id = isset($_POST[$job_id_key]) && is_int( absint( $_POST[$job_id_key] ) ) ? THJMF_Utils::sanitize_post_fields( $_POST[$job_id_key], 'number' ) : false;
			if($job_id && get_post_type($job_id) == 'thjm_jobs'){
				if( isset( $_FILES[$resume] ) && is_array( $_FILES[$resume] ) ){
					$validate = $this->validate_file( $_FILES[$resume] );
					if( !isset($validate['error']) ){
						add_filter('upload_dir', array( $this, 'reset_thjmf_upload_dir'));
						$uploadedfile = $this->sanitize_upload_data( $_FILES[$resume] );
						// Get the original filename from the uploaded file.
						$original_filename = isset($uploadedfile['name']) ? $uploadedfile['name'] : '';

						// Generate a unique filename by appending a timestamp and a random string.
						if ($original_filename) {
							$unique_filename = uniqid() . '-' . $original_filename;
							// Update the uploaded file's name with the unique filename.
							$uploadedfile['name'] = $unique_filename;
						}
						$upload_overrides = array( 'test_form' => false );
						require_once(ABSPATH. 'wp-admin/includes/file.php');
						require_once(ABSPATH. 'wp-admin/includes/media.php');
						$movefile = wp_handle_upload( $uploadedfile, $upload_overrides );
						if ( $movefile && ! isset( $movefile['error'] ) ) {
							$applicant_meta['resume'] = isset( $movefile['url'] ) ? esc_url( $movefile['url'] ) : ''; 
							$application_fields = THJMF_Utils::get_apply_fields();
							if( is_array($application_fields) ){
								foreach ($application_fields as $fkey => $fname) {
									$applicant_meta[$fkey] = $this->get_applicant_meta($fkey);
								}
							}
							if( !isset( $applicant_meta['phone_code'] ) ){
								$applicant_meta['phone_code'] = array(
									'dial_code' => isset( $_POST['phone_dial_code'] ) ? THJMF_Utils::sanitize_post_fields( $_POST['phone_dial_code'] ) : '',
									'country_code' => isset( $_POST['phone_country_code'] ) ? THJMF_Utils::sanitize_post_fields( $_POST['phone_country_code'] ) : ''
								);
							}
							$applicant_meta = $this->add_apply_form_post_meta( $job_id, $applicant_meta );
							
							$post_info = array(
									'post_title'	=> $applicant_meta['name'],
									'post_content'  => '',
									'post_status'   => 'publish',          
									'post_type'     => THJMF_Utils::get_applicant_cpt(), 
							);
							
							$ins_post_id = wp_insert_post( $post_info, true );
							foreach ($applicant_meta as $mkey => $mvalue) {
								add_post_meta($ins_post_id, $mkey, $mvalue, true);
							}
							
							$this->email_placeholders = array(
								'name' => $applicant_meta['name'], 
								'job'  => get_the_title( $job_id ),
								'email'=> $applicant_meta['email'],
							);

							$pm1 = add_post_meta($ins_post_id, THJMF_Utils::get_cpt_map_job_key(), $job_id, true);
							$pm2 = add_post_meta($ins_post_id, THJMF_Utils::get_application_status_key(), 'pending', true);
							$mail = $this->confirm_application();
						} else {
						   $error = $movefile['error'];
						}
					}else{
						$error = $validate['error'];
					}
				}
			}
			return $pm1 && $pm2 && $mail;
		}

		private function add_apply_form_post_meta( $id, $meta ){
			$meta['job_title'] = get_the_title( $id );
			$meta['location'] = THJMF_Utils::get_comma_seperated_taxonamy_terms($id, 'location');
			$meta['category'] = THJMF_Utils::get_comma_seperated_taxonamy_terms($id, 'category');
			$meta['job_type'] = THJMF_Utils::get_comma_seperated_taxonamy_terms($id, 'job_type');
			return $meta;
		}

		public function sanitize_upload_data( $files ){
			$uploads = [];
			if( is_array( $files ) && $files){
				foreach ($files as $fkey => $fvalue) {
					$uploads[ sanitize_key( $fkey) ] = THJMF_Utils::sanitize_uploads( $fkey, $fvalue);
				}
			}
			return $uploads;
		}

		private function confirm_application(){
			$this->placeholders = $this->prepare_placeholders();
			$admin_mail = $this->send_admin_notification();
			$applicant_mail = $this->send_applicant_notification();
			return $admin_mail && $applicant_mail;
		}

		private function prepare_placeholders(){
			$this->placeholders = array(
				'{site_title}' => get_bloginfo('name'),
				'{applicant_name}' => isset($this->email_placeholders["name"]) ? $this->email_placeholders["name"] : "",
				'{job_title}' => isset($this->email_placeholders["job"]) ? $this->email_placeholders["job"] : ""
			);
			return $this->placeholders;
		}

		private function send_admin_notification(){
			$this->is_admin = true;
			$to = get_option('admin_email');
			$subject = __('{site_title} New Job Application Received', 'job-manager-career');
			$subject = apply_filters('thjmf_email_subject', $subject, $this->is_admin);
			$subject = $this->prepare_subject($subject);
			$message = $this->get_template_content();
			return $this->send_notification( $to, $subject, $message );
		}

		private function prepare_subject($subject){
			foreach ($this->placeholders as $find => $replace) {
				$subject = str_replace( $find, $replace, $subject );
			}
			return $subject;
		}

		private function send_applicant_notification(){
			$this->is_admin = false;
			$email = isset( $this->email_placeholders['email'] ) ? $this->email_placeholders['email'] : THJMF_Utils::get_logged_user_email();
			$to = sanitize_email( $email );
			$subject = __('{site_title} New Job Application Received', 'job-manager-career');
			$subject = apply_filters('thjmf_email_subject', $subject, $this->is_admin);
			$subject = $this->prepare_subject($subject);
			$message = $this->get_template_content();
			return $this->send_notification( $to, $subject, $message );
		}

		private function send_notification( $to, $subject, $message ){
			add_filter( 'wp_mail_from', array( $this, 'get_mail_from_address' ) );
			add_filter( 'wp_mail_from_name', array( $this, 'get_mail_from_name' ) );

			$headers = "Content-Type: text/html\r\n";
			if( apply_filters('thjmf_enable_reply_to_email', false) ){
				$headers .= 'Reply-to: ' . $this->get_mail_from_name() . ' <' . $this->get_mail_from_address() . ">\r\n";
			}

			$send = wp_mail($to, $subject, $message, $headers);
			
			remove_filter( 'wp_mail_from', array( $this, 'get_mail_from_address' ) );
			remove_filter( 'wp_mail_from_name', array( $this, 'get_mail_from_name' ) );
			return $send;
		}

		public function validate_file($file){
			$ftypes = array('doc', 'docx', 'pdf');
			$errors = array();
			$errors['status'] = 'SUCCESS';
		
			if($file){
				$ftype = isset( $file['type'] ) ? $file['type'] : false;
				$fsize = isset( $file['size'] ) ? $file['size'] : false;			
				if($ftype && $fsize){
					$name  = isset($file['name']) ? $file['name'] : '';
					$title = isset($file['title']) ? $file['title'] : '';
					$file_type = strtolower($ftype);

					$maxsize = apply_filters('thjmf_file_upload_maxsize', 2);
					$maxsize_bytes = is_numeric($maxsize) ? $maxsize*1048576 : false;
					
					$accept = apply_filters('thjmf_file_upload_accepted_file_types', $ftypes);
					$allowed = $accept && !is_array($accept) ? array_map('trim', explode(",", $accept)) : $accept;
					$file_type = pathinfo($file['name'], PATHINFO_EXTENSION);
					if(is_array($allowed) && !empty($allowed) && !in_array($file_type, $allowed)){
						/* translators: Allowed file types $accept. */
						$err_msg = '<strong>'. $title .':</strong> '. __( 'Invalid file type.', 'job-manager-career' );
						/* translators: Allowed file types. */
						$err_msg = sprintf(__('Invalid file type, allowed types are %s.', 'job-manager-career'), implode($accept) );
						$errors['error'] = $err_msg;
						$errors['status'] = 'ERROR';							
						
					}else if($maxsize_bytes && is_numeric($maxsize_bytes) && $fsize >= $maxsize_bytes){
						/* translators: Allowed maximum size of file to upload. */
						$err_msg = sprintf(__('Uploaded file should not exceed %sMB.', 'job-manager-career'), $maxsize);
						$errors['error'] = $err_msg;
						$errors['status'] = 'ERROR';
					}
				}
			}
			return $errors;
		}

		public function reset_thjmf_upload_dir($upload){
			$upload['subdir'] = '/thjmf_uploads';
	        $upload['path'] = $upload['basedir'] . $upload['subdir'];
	        $upload['url']  = $upload['baseurl'] . $upload['subdir'];
	        return $upload;
		}

		public function thjmf_format_email_url( $occurances){
			$html = '';
			if ( $occurances[1] == '[' && $occurances[6] == ']' ) {
				return substr($occurances[0], 1, -1);
			}
			$email = isset( $occurances[1] ) && is_email( $occurances[1] ) ? $occurances[1] : "";
			$html = '<a href="mailto:'.esc_attr( $email ).'">'.esc_html( $email ).'</a>';
			return $html;

		}

		public function get_template_content(){
			ob_start();
			$this->render_email_content();
			$message = ob_get_clean();
			return $message;
		}

		private function render_email_content(){
			?>
			<!DOCTYPE html>
			<html <?php language_attributes(); ?>>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>" />
				<title><?php echo get_bloginfo( 'name', 'display' ); ?></title>
			</head>
			<?php $this->render_body();?>
			</html>
			<?php
		} 

		private function render_body(){
			?>
			<body <?php echo is_rtl() ? 'rightmargin' : 'leftmargin'; ?>="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
				<div id="wrapper" dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>" style="background-color: #f7f7f7;padding: 70px 0;margin: 0;width: 100%;">
					<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
						<tr>
							<td align="center" valign="top">
								<?php 
								$this->render_template_main_content();
								?>
							</td>
						</tr>
					</table>
				</div>
			</body>
			<?php
		}
		private function render_template_main_content(){
			?>
				<table cellpadding="0" cellspacing="0" width="600" border="0" style="border: 1px solid #dedede;border-radius: 4px;border-collapse: collapse;">
					<tr>
						<td style='background-color: #fff; color: #636363; font-family: "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;font-size: 14px;line-height: 150%;text-align: left;'>
							<?php 
							$this->get_default_header();
							if( $this->is_admin ){
								$this->get_addressing_block_admin();
							}else{
								$this->get_addressing_block_applicant();
							}
							$this->get_default_footer();
							?>
						</td>
					</tr>
				</table>
			<?php
		}

		private function get_default_header(){
			?>
			 <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;background-color: #51519d;color: #ffffff;border-bottom: 0;font-weight: bold;line-height: 100%;vertical-align: middle;border-radius: 3px 3px 0 0; border-collapse: collapse;">
				<tr>
					<td style='text-align: center; font-size: 12px;font-family: "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;padding:36px 48px;'>
						<h1 style="font-size: 30px;font-weight: 300;line-height: 150%;margin: 0;text-align: left;color: #ffffff;"><?php echo esc_html__('Job Application', 'job-manager-career'); ?></h1>
					</td>
				</tr>
			</table>
			<?php
		}

		public function get_default_footer(){
			?>
			<table cellspacing="0" cellpadding="0" border="0" style="width: 100%;border-collapse: collapse;">
				<tr>
					<td style='text-align: center; font-size: 12px;font-family: "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif;padding: 20px 40px 40px 40px;'>
						<p><?php echo get_bloginfo(); ?></p>
					</td>
				</tr>
			</table>
			<?php
		}

		public function get_addressing_block_applicant(){
			$name = isset( $this->email_placeholders['name'] ) ? esc_html( $this->email_placeholders['name'] ) : "";
			$job_title = isset( $this->email_placeholders['job'] ) ? '<b>'.esc_html( $this->email_placeholders['job'] ).'</b>' : "";
			?>
			<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse: collapse;">
				<tr>
					<td style="padding: 40px 40px 20px 40px;">
						<?php /* translators: Name of the applicant. */ ?>
						<p> <?php printf( __('Hi %s,', 'job-manager-career'), $name ); ?></p>
						<p><?php echo esc_html__('Thank you for your interest!', 'job-manager-career'); ?></p>
				
						<p>
							<?php printf( wp_kses( 
								/* translators: Job title for which the application was received. */
								__('We have received your application for %s.', 'job-manager-career'), 
								array( 'b' => array() ) 
								), $job_title );
							?>
						</p>
						<p><?php echo esc_html__('Our teams will organize next steps post reviewing your application.', 'job-manager-career'); ?></p>
						<div style="margin-top: 20px;">
							<p><?php echo esc_html__('Regards,', 'job-manager-career'); ?><br> <i>HR Team</i></p>
						</div>
					</td>
				</tr>
			</table>
			<?php
		}

		public function get_addressing_block_admin(){
			$name = isset( $this->email_placeholders['name'] ) ? '<b>'.esc_html( $this->email_placeholders['name'] ).'</b>' : "";
			$job_title = isset( $this->email_placeholders['job'] ) ? '<b>'.esc_html( $this->email_placeholders['job'] ).'</b>' : "";
			?>
			<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse: collapse;">
				<tr>
					<td style="padding: 40px 40px 20px 40px;">
						<p> <?php echo esc_html__('Hi,','job-manager-career'); ?></p>
						<?php /* translators: Job applicant name, Job title. */ ?>
						<p><?php echo sprintf( esc_html__('You have received an application from %1$s for the job %2$s.', 'job-manager-career'), $name, $job_title ); ?></p>
						<?php /* translators: Url of the applicant admin dashboard */ ?>
						<p><?php printf( esc_html__(' View %s for more detials.', 'job-manager-career'), THJMF_Utils::applicant_post_type_url() ); ?></p>
					</td>
				</tr>
			</table>
			<?php
		}

		public function get_mail_from_address(){
			$address = apply_filters( 'thjmf_email_from_address', get_bloginfo('admin_email') );
			return sanitize_email( $address );
		}

		public function get_mail_from_name(){
			$name = apply_filters( 'thjmf_email_from_name', get_bloginfo('name') );
			return wp_specialchars_decode( esc_html( $name ), ENT_QUOTES );
		}

		private function get_applicant_meta($key){
			$new_key = apply_filters('thjmf_load_old_ui', false) ? 'thjmf_'.$key : $key;
			return isset( $_POST[$new_key] ) ? THJMF_Utils::sanitize_post_fields( $_POST[$new_key], $this->apply_field_sanitize[$key] ) : '--'; 
		}

		public function new_excerpt_more($more) {
			global $post;
			if( isset($post->post_type) && get_post_type( $post ) == THJMF_Utils::get_job_cpt() ){
			    return '...';
			}
			return $more;
		}
	}

endif;