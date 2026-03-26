<?php
/**
 * Template Functions
 *
 * Template functions created for job related pages
 *
 * @author      Themehigh
 * @category    Core
 * @package     job-manager-career
 * @version     1.3.0
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gets and includes template files.
 *
 * @since 1.3.0
 * @param mixed  $template_name
 * @param array  $args (default: array()).
 * @param string $template_path (default: '').
 * @param string $default_path (default: '').
 */
function thjmf_get_template( $template_name, $args = [], $template_path = 'job-manager-career', $default_path = '', $version=false ) {
	if ( $args && is_array( $args ) ) {
		// phpcs:ignore WordPress.PHP.DontExtract.extract_extract -- Please, forgive us.
		extract( $args );
	}
	include thjmf_locate_template( $template_name, $template_path, $default_path );
}

/**
 * Get the template path.
 *
 * @since 1.3.0
 * @param string the template path
 */
function thjmf_get_template_path() {
	return untrailingslashit( THJMF_TEMPLATES );
}

/**
 * Locate a template and return the path for inclusion.
 *
 * @since 1.3.0
 * @param string $template_name Template name.
 * @param string $template_path Template path. (default: '').
 * @param string $default_path  Default path. (default: '').
 * @return string
 */
function thjmf_locate_template( $template_name, $template_path = '', $default_path = '' ) {
	
	if ( ! $template_path ) {
		$template_path = 'job-manager-career/';
	}

	if ( ! $default_path ) {
		$default_path = thjmf_get_template_path().'/';
	}

	$template = locate_template(
		array(
			trailingslashit( $template_path ) . $template_name,
			$template_name,
		)
	);

	// Get default template/.
	if ( ! $template || apply_filters('thjmf_return_default_template', false) ) {
		$template = $default_path . $template_name;
	}

	// Return what we found.
	return apply_filters( 'thjmf_fetch_template', $template, $template_name, $template_path );
}

/**
 * Main function for returning jobs based on arguments passed
 *
 * @since 1.3.0
 * @param array $posted arguments for WP_Query
 * @return object
 */

function thjmf_get_jobs( $posted ){
	$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
	if( isset( $posted['paged'] ) && $posted['paged'] ){
		$paged = $posted['paged'];
	}
	$args = array(
		'posts_per_page'    => $posted['per_page'],
		'post_type'         => THJMF_Utils::get_job_cpt(),
	);


	if( $paged ){ // some function use this function to get post count. These args are unnecessary.
		$args['orderby'] 		= 'date'; // we will sort posts by date
		$args['order']	 		= 'DESC';
		$args['paged']   		= $paged;
	}else{
		$args['posts_per_page'] = -1;
	}

	if( isset( $posted['keyword'] ) && !empty( $posted['keyword'] ) ){
		$args['s'] = sanitize_text_field( $posted['keyword'] );
	}

	if( isset($posted['filter']) && $posted['filter'] ){
		$category = isset( $posted['category'] ) && !empty( $posted['category'] ) ? $posted['category'] : false;
		$location = isset( $posted['location'] ) && !empty( $posted['location'] ) ? $posted['location'] : false;
		$type = isset( $posted['type'] ) && !empty( $posted['type'] ) ? $posted['type'] : false;

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

	$featured_position_check = in_array( $posted['featured_position'], array('on_top', 'on_bottom') ) ? true : false;


	if( count( array_filter( [ $posted['hide_filled'], $posted['hide_expired'], $featured_position_check ] ) ) >= 2){
		$args['meta_query'] = array( 'relation'=>'AND' );
	}

	if( $posted['featured_position'] == 'on_top'){
		$args['meta_query'][] = array(
			'relation'	=> 'OR',
			array( //check to see if key has been filled out
            	'key' => THJMF_Utils::get_featured_meta_key(),
            	'value' => '1',
            	'compare' => '!=',
        	),
      		array( //if no key has been added show these posts too
            	'key' => THJMF_Utils::get_featured_meta_key(),
            	'value' => '1',
            	'compare' => '='
        	),
		);
		$args['orderby'] = array( THJMF_Utils::get_featured_meta_key() => 'DESC', 'date' => 'DESC');
	}
	else if( $posted['featured_position'] == 'on_bottom'){
		$args['meta_query'][] = array(
			'relation'	=> 'OR',
			array( //check to see if key has been filled out
            	'key' => THJMF_Utils::get_featured_meta_key(),
            	'value' => '1',
            	'compare' => '=',
        	),
      		array( //if no key has been added show these posts too
            	'key' => THJMF_Utils::get_featured_meta_key(),
            	'value' => '',
            	'compare' => '='
        	),
		);
		$args['orderby'] = array( THJMF_Utils::get_featured_meta_key() => 'ASC', 'date' => 'DESC' );
	}
	
	if( $posted['hide_filled'] == '1'){
		$args['meta_query'][] = array(
			'key'       => THJMF_Utils::get_filled_meta_key(),
		    'value'   	=> '',
		    'compare' 	=> '=',
		);
	}

	if( $posted['hide_expired'] == '1'){
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
		// Query based on Featured Job display position

	return new WP_Query( $args );
}

/**
 * Get template part (for templates like the shop-loop).
 *
 * @since 1.3.0
 * @param string $template_name Template name.
 * @param string $template_path Template path. (default: '').
 * @param string $default_path  Default path. (default: '').
 * 
 */
function thjmf_get_template_part( $slug, $name = '', $template_path = 'job-manager-career', $default_path = '' ) {

	$template = '';

	if ( $name ) {
		$template = thjmf_locate_template( "{$slug}-{$name}.php", $template_path, $default_path );
	}

	// If template file doesn't exist, look in yourtheme/slug.php and yourtheme/job_manager/slug.php.
	if ( ! $template ) {
		$template = thjmf_locate_template( "{$slug}.php", $template_path, $default_path );
	}

	if ( $template ) {
		load_template( $template, false );
	}
}

/**
 * Get the job title
 *
 * @since 1.3.0
 * @return string job title.
 * 
 */
function thjmf_get_job_title($featured=true){

	if( apply_filters('thjmf_shortcode_post_title_link', true) ){
        return '<a href="'.esc_url(get_the_permalink()).'">'.esc_html( get_the_title() ).thjmf_get_featured_icon($featured).'</a>';
    }
    return esc_html(get_the_title()).thjmf_get_featured_icon($featured);
}

/**
 * Get featured icon for job title
 *
 * @since 1.3.0
 * @param string $featured featured job or not.
 * @return string featured icon html string
 * 
 */
function thjmf_get_featured_icon($featured){
	if( $featured ):
		ob_start();
		?>
        <span class="thjmf-featured-icon">
            <img src="<?php thjmf_template_image('featured.svg'); ?>" alt="Featured job" />
            <label><?php echo esc_html__('Featured', 'job-manager-career'); ?></label>
        </span>
        <?php return ob_get_clean();
    endif;
}

/**
 * Get images inside template files
 *
 * @since 1.3.0
 * @param string $name Image name.
 * @return string image url
 * 
 */
function thjmf_template_image( $name ){
	echo esc_url(THJMF_ASSETS_URL.'images/'.$name);
}

/**
 * Get active theme slug
 * 
 * @since 1.3.0
 * @return string active theme
 * 
 */
function thjmf_get_theme_slug(){
	return get_option( 'template' );
}

/**
 * Display application form field
 *
 * @since 1.3.0
 * @param string $key field key
 * @param array $args application form field arguments
 * 
 */
function thjmf_application_field( $key, $args ){
	$defaults = array(
		'type'              => 'text',
		'label'             => '',
		'placeholder'       => '',
		'maxlength'         => false,
		'required'          => false,
		'autocomplete'      => false,
		'id'                => $key,
		'class'             => array(),
		'label_class'       => array(),
		'input_class'       => array(),
		'custom_attributes' => array(),
		'return'            => false,
		'options'           => array(),
		'validate'          => array(),
		'priority'          => '',
	);

	$args = wp_parse_args( $args, $defaults );
	$args = apply_filters( 'thjmf_form_field_args', $args, $key );
	$value = '';
	$required = '';

	if ( $args['required'] ) {
		$args['class'][] = 'thjmf-validate-required';
		$required        = '&nbsp;<abbr class="required" title="' . esc_attr__( 'required', 'job-manager-career' ) . '">*</abbr>';
	} else {
		if( apply_filters('thjmf_apply_form_optional_message', false ) ){
			$required = '&nbsp;<span class="optional">(' . esc_html__( 'optional', 'job-manager-career' ) . ')</span>';
		}
	}

	if ( is_string( $args['label_class'] ) ) {
		$args['label_class'] = array( $args['label_class'] );
	}

	if ( is_null( $value ) ) {
		$value = $args['default'];
	}

		// Custom attribute handling.
	$custom_attributes         = array();
	$args['custom_attributes'] = array_filter( (array) $args['custom_attributes'], 'strlen' );

	if ( $args['maxlength'] ) {
		$args['custom_attributes']['maxlength'] = absint( $args['maxlength'] );
	}

	if ( ! empty( $args['autocomplete'] ) ) {
		$args['custom_attributes']['autocomplete'] = $args['autocomplete'];
	}

	if ( ! empty( $args['custom_attributes'] ) && is_array( $args['custom_attributes'] ) ) {
		foreach ( $args['custom_attributes'] as $attribute => $attribute_value ) {
			$custom_attributes[] = esc_attr( $attribute ) . '="' . esc_attr( $attribute_value ) . '"';
		}
	}

	if ( ! empty( $args['validate'] ) ) {
		foreach ( $args['validate'] as $validate ) {
			$args['class'][] = 'validate-' . $validate;
		}
	}

	if( apply_filters('thjmf_advanced_phone_field', false, $key) ){
		$args['class'][] = $key === "phone" ? 'thjmf-dialling-code-field' : '';
	}


	$label_inside_field = in_array( $args['type'], ['text','textarea'] ) ? true : false;  
	$label_inside_field = apply_filters('thjmf_text_label_as_placeholder', $label_inside_field, $key );
	if( $label_inside_field ){
		$args['label_class'][] = 'thjmf-valign-label';
		$args['input_class'][] = 'thjmf-has-placeholder-label';
		$args['class'][] = 'thjmf-field-has-placeholder-label';
	}

	$field           = '';
	$label_id        = $args['id'];
	$sort            = $args['priority'] ? $args['priority'] : '';
	$field_container = '<p class="thjmf-form-row %1$s" id="%2$s" data-priority="' . esc_attr( $sort ) . '">%3$s</p>';

	switch ( $args['type'] ) {
		case 'textarea':
			// $field .= '<label for="'. esc_attr( $args['id'] ) . '">'. esc_html( $args['label'] ) .'</label>';
			$field .= '<textarea name="' . esc_attr( $key ) . '" class="input-textarea ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" id="' . esc_attr( $args['id'] ) . '" placeholder="' . esc_attr( $args['placeholder'] ) . '" ' . ( empty( $args['custom_attributes']['rows'] ) ? ' rows="2"' : '' ) . ( empty( $args['custom_attributes']['cols'] ) ? ' cols="5"' : '' ) . implode( ' ', $custom_attributes ) . '>' . esc_textarea( $value ) . '</textarea>';

			break;
		case 'checkbox':
			$field .= '<input type="' . esc_attr( $args['type'] ) . '" class="input-checkbox ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" name="' . esc_attr( $key ) . '" id="' . esc_attr( $args['id'] ) . '" value="1" ' . checked( $value, 1, false ) . ' />';
			$field .= '<label class="checkbox ' . implode( ' ', $args['label_class'] ) . '" ' . implode( ' ', $custom_attributes ) . '>' . esc_html( $args['label'] ) . $required . '</label>';

			break;
		case 'checkbox-group':
			if ( ! empty( $args['options'] ) ) {
				$multiple = count( $args['options'] ) > 1 ? '[]' : '';
				$count = apply_filters('thjmf_apply_form_cbgroup_per_row', 0);
				$counter = 0;
				foreach ( $args['options'] as $option_key => $option_text ) {
					$field .= '<input type="checkbox" class="input-checkbox ' . esc_attr( implode( ' ', $args['input_class'] ) ). '" value="' . esc_attr( $option_key ) . '" name="' . esc_attr( $args['name'] ) . '[]" ' . implode( ' ', $custom_attributes ) . ' id="' . esc_attr( $args['id'] ) . '_' . esc_attr( $option_key ) . '"' . checked( $value, $option_key, false ) . 'data-group="checkbox-group" />';
					$field .= '<label for="' . esc_attr( $args['id'] ) . '_' . esc_attr( $option_key ) . '" class="checkbox cb-group' . implode( ' ', $args['label_class'] ) . '">' . $option_text . '</label>';
					$counter++;
					if( $count != 0 && ( $counter == $count || $counter%$count == 0 ) ){
						$field .= '<br>';
					}
				}
			}
			break;
		case 'text':
		case 'number':
		case 'email':
		case 'tel':
			if( ( apply_filters('thjmf_advanced_phone_field', false, $key) ) ){
				$field .= '<input type="text" name="phone_dial_code" id="phone_dial_code" class="thjmf-input-dialling-code input-text" value="">';
				$field .= '<input type="hidden" name="phone_country_code" id="phone_country_code" class="thjmf-input-dialling-code input-text" value="">';
				$args['input_class'][] = 'thjmf-dial-phone-number';
				$field .= '<span class="thjmf-country-dial-codes">🇺🇸 <span class="thjmf-dialling-code">+1</span></span>';
				$options = '';
				$flag = '';
				$field .= '<span class="thjmf-country-codes-wrapper">';
				$field .= '<span class="thjmf-country-code-list">';
				$codes = THJMF_Utils::get_country_codes();
				foreach ($codes as $index => $country_meta) {
					$code = isset($country_meta['code']) ? $country_meta['code'] : '';
					$dial_code = isset($country_meta['dial_code']) ? $country_meta['dial_code'] : '';
					if( apply_filters('thjmf_applicant_phone_dial_code_flag', true) ){
						$flag = isset($country_meta['flag']) ? $country_meta['flag'] : '';
					}
					$field .= '<span class="thjmf-inline-flags" data-value="'.esc_attr( $code ).'">'. esc_html( $flag ) .'<span class="thjmf-dialling-code">'. esc_html( $dial_code ) . '</span></span>';
				}
				$field .= '</span></span>';
			}
			$field .= '<input type="' . esc_attr( $args['type'] ) . '" class="input-text ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" name="' . esc_attr( $key ) . '" id="' . esc_attr( $args['id'] ) . '" placeholder="' . esc_attr( $args['placeholder'] ) . '"  value="' . esc_attr( $value ) . '" ' . implode( ' ', $custom_attributes ) . ' />';

			break;
		case 'select':
			$field   = '';
			$options = '<option></option>';

			if ( ! empty( $args['options'] ) ) {
				foreach ( $args['options'] as $option_key => $option_text ) {
					if ( '' === $option_key ) {
						// If we have a blank option, select2 needs a placeholder.
						if ( empty( $args['placeholder'] ) ) {
							$args['placeholder'] = $option_text ? $option_text : __( 'Choose an option', 'job-manager-career' );
						}
						$custom_attributes[] = 'data-allow_clear="true"';
					}
					$options .= '<option value="' . esc_attr( $option_key ) . '" ' . selected( $value, $option_key, false ) . '>' . esc_html( $option_text ) . '</option>';
				}

				$field .= '<select name="' . esc_attr( $key ) . '" id="' . esc_attr( $args['id'] ) . '" class="select ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" ' . implode( ' ', $custom_attributes ) . ' data-placeholder="' . esc_attr( $args['placeholder'] ) . '">
						' . $options . '
					</select>';
			}

			break;
		case 'radio':
			$label_id .= '_' . current( array_keys( $args['options'] ) );
			if ( ! empty( $args['options'] ) ) {
				foreach ( $args['options'] as $option_key => $option_text ) {
					$field .= '<label for="'.esc_attr( $args['id'] ) . '_' . esc_attr( $option_key ).'" class="thjmf-radio ' . implode( ' ', $args['label_class'] ) . '" ' . implode( ' ', $custom_attributes ) . '>' . esc_html( $option_text ). '</label>';
					$field .= '<input type="radio" class="input-radio ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" value="' . esc_attr( $option_key ) . '" name="' . esc_attr( $key ) . '" ' . implode( ' ', $custom_attributes ) . ' id="' . esc_attr( $args['id'] ) . '_' . esc_attr( $option_key ) . '"' . checked( $value, $option_key, false ) . ' />';
				}
			}

			break;
		case 'file':
			$field .= '<input type="' . esc_attr( $args['type'] ) . '" class="input-file thjmf-file-upload ' . esc_attr( implode( ' ', $args['input_class'] ) ) . '" name="' . esc_attr( $args['name'] ) . '" id="' . esc_attr( $args['id'] ) . '" placeholder="' . esc_attr( $args['placeholder'] ) . '"' . implode( ' ', $custom_attributes ) . ' />';
			$field .= '<label class="thjmf-upload-title"><a href="javascript:void(0)" class="thjmf-file-upload-link">Upload File</a>&nbsp;<abbr class="required" title="required">*</abbr></label>';
			$upload = isset( THJMF_SETTINGS['advanced']['file_upload_formats'] ) ? THJMF_SETTINGS['advanced']['file_upload_formats'] : array();
			$upload_formats = !empty( $upload ) ? implode( ',', array_keys(array_filter($upload)) ) : '';
			if( !empty($upload_formats) ){
				$upload_formats = '<span class="thjmf-uppercase">'.esc_html( $upload_formats ).'</span>';
				/* translators: Allowed file types. */
				$field .= '<label class="thjmf-upload-subtitle">'.sprintf( wp_kses_post( __('Supports %s files', 'job-manager-career') ), $upload_formats ).'</label>';
			}
			break;
	}

	if ( ! empty( $field ) ) {
		$field = '<span class="thjmf-input-wrapper">'.$field.'</span>';
		if ( $args['label']  && ( $args['type'] !== 'checkbox' && $args['type'] !== 'file' ) ) {
			$field =  '<label for="' . esc_attr( $label_id ) . '" class="' . esc_attr( implode( ' ', $args['label_class'] ) ) . '">' . wp_kses_post( $args['label'] ) . $required . '</label>'.$field;
		}
		if( $args['type'] === 'file' ){
			$field =  '<label class="' . esc_attr( implode( ' ', $args['label_class'] ) ) . '">' . wp_kses_post( $args['label'] ) . $required . '</label>'.$field;
		}

		$container_class = esc_attr( implode( ' ', $args['class'] ) );
		$container_id    = esc_attr( $args['id'] ) . '_field';
		$field           = sprintf( $field_container, $container_class, $container_id, $field );
	}

	$field = apply_filters( 'thjmf_form_field_' . $args['type'], $field, $key, $args, $value );
	$field = apply_filters( 'thjmf_form_field', $field, $key, $args, $value );
	echo $field;
}

/**
 * Get the arguments to display job tags like location, posted date and job type
 *
 * @since 1.3.0
 * @return array arguments to display job
 * 
 */
function thjmf_get_tag_args(){
	$date_format = isset( THJMF_SETTINGS['job_detail']['job_date_format'] ) ? THJMF_SETTINGS['job_detail']['job_date_format'] : get_option('date_format');
	$filled  = THJMF_Utils::get_jpm_filled( get_the_ID() );
	$filled  = filter_var( $filled, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
	$expired = THJMF_Utils::get_jpm_expired( get_the_ID() );
	$expired = !empty( $expired ) ? THJMF_Utils::is_post_expired($expired) : false;
	$show_date = isset( THJMF_SETTINGS['job_detail']['job_display_post_date'] ) ? THJMF_SETTINGS['job_detail']['job_display_post_date'] : true;
	$args = array(
		'show_date' => apply_filters('thjmf_loop_show_job_date_tag', $show_date),
		'show_location' => apply_filters('thjmf_loop_show_location_tag', true),
		'show_job_type' => apply_filters('thjmf_loop_show_job_type_tag', true),
		'date' => apply_filters('thjmf_toggle_posted_timestap', false) ? human_time_diff( get_the_time('U'), current_time( 'timestamp' ) ) . ' ago' : get_the_time( $date_format ),
		'location' => THJMF_Utils::get_comma_seperated_taxonamy_terms( get_the_ID(), 'location' ),
		'type' => THJMF_Utils::get_comma_seperated_taxonamy_terms( get_the_ID(), 'job_type' ),
		'expired_job' => $expired,
		'filled_job' => $filled
	);
	return $args;
}

/**
 * Get the job feature and details to be displayed in the single job page
 *
 * @since 1.3.0
 * @return array features and contents of a job
 * 
 */
function thjmf_get_job_features(){
	$content = array(
		'features' => '', 
		'details' => ''
	);
	$details = [];
	
	$features =  isset( THJMF_SETTINGS['job_detail']['job_feature']['job_def_feature'] ) ? THJMF_SETTINGS['job_detail']['job_feature']['job_def_feature'] : array(); 
	if( is_array( $features ) ){
		foreach ($features as $feature_key => $feature_label) {
			$details[$feature_key] = THJMF_Utils::get_post_metas( get_the_ID(), $feature_key, true );
		}
	}

	if( !empty( $features ) && !empty( $details ) ){
		$content['features'] = $features;
		$content['details'] = $details;
	}
	return $content;
}

/**
 * Display job features as list
 *
 * @since 1.3.0
 * @param string $ft field key
 * @param string $dt field key
 * @param string $args field key
 * @param string $echo field key
 * @return string||null $html returns job feature as list html or echo the html based on $echo 
 * 
 */

function thjmf_display_job_features( $ft, $dt, $args = array(), $echo=true ) {
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
			'h_separator'  => ':',
			'label_after'  => '</strong> ',
		)
	);
	$args = apply_filters( 'thjmf_job_features_args', $args );

	if( !is_array($ft) ){
		return;
	}

	foreach ( $ft as $ft_key => $feature ) {
		$value = isset( $dt[$ft_key] ) ? $dt[$ft_key] : "";
		if( empty( $value ) ){
			continue;
		}
		$parts[] = $args['label_before'] . wp_kses_post( $feature ) . $args['h_separator']. $args['label_after'].$value;
	}

	if ( $parts ) {
		$html = $args['before'] . implode( $args['separator'], $parts ) . $args['after'];
	}


	$html = apply_filters( 'thjmf_display_job_features', $html, $ft, $dt, $args );
	if( $echo ){
		echo wp_kses_post( $html );
	}else{
		return wp_kses_post($html);
	}
}

/**
 * Get the url for social share icons
 *
 * @since 1.3.0
 * @param string $platform social media platform name
 * @return string social icon url
 */
function thjmf_social_share_url( $platform ){
	$url = '';
	
	if( $platform == "email" ){
		global $wp;
		$content = 'Hi, %0D%0A%0D%0Acheck out this job opening at '.get_bloginfo().' for '.get_the_title().'. Visit '.get_the_permalink();
		$subject = get_the_title().' at '.get_bloginfo(); 
		$url = 'mailto:?body='.$content.'&subject='.$subject;

	}else if( $platform == "facebook" ){
		$url = 'https://www.facebook.com/sharer/sharer.php?u='.urlencode(get_the_permalink());

	}else if( $platform == "twitter" ){
		$url = 'http://twitter.com/share?url='.urlencode(get_the_permalink());

	}else if( $platform == "whatsapp" ){
		$content = 'Check out this job opening at '.get_bloginfo().' for '.get_the_title().'. <a href="'.get_the_permalink().'">View Job</a>';
		$url = "https://wa.me/?text=".urlencode($content);

	}else if( $platform == "linkedin" ){
		$url = 'http://www.linkedin.com/shareArticle?mini=true&url='.urlencode(get_the_permalink());

	}
	echo esc_url(apply_filters('thjmf_job_social_share_url', $url, $platform));
}

/**
 * Location dropdown wrapper for job filter section
 *
 * @since 1.3.0
 */
function thjmf_location_filter_dropdown(){
	?>
	<ul class="thjmf-location-dropdown-wrapper" style="display: none;">
	</ul>
	<?php
}

/**
 * Job type dropdown for job filter section
 *
 * @since 1.3.0
 */
function thjmf_job_type_filter_dropdown($selected=""){
	$job_types = THJMF_Utils::get_all_post_terms('job_type');
	$job_types = !is_array($job_types) ? array() : $job_types;
	?>
	<select name="thjmf_job_type_filter" id="thjmf_job_type_filter" class="<?php echo esc_attr( thjmf_get_filter_class() ); ?>">
		<option value="">Job Type</option>
		<?php foreach ($job_types as $key => $value) :?>
			<option value="<?php echo esc_attr( $value->slug ); ?>" <?php echo $value->slug === $selected ? "selected" : ""; ?>><?php echo esc_html( $value->name ); ?></option>
		<?php endforeach; ?>
	</select>
	<?php
}

/**
 * Category dropdown for job filter section
 *
 * @since 1.3.0
 */
function thjmf_category_filter_dropdown($selected=""){
	$categories = THJMF_Utils::get_all_post_terms('category');
	$categories = !is_array($categories) ? array() : $categories;
	?>
	<select name="thjmf_category_filter" id="thjmf_category_filter" class="<?php echo esc_attr( thjmf_get_filter_class() ); ?>">
		<option value="">Category</option>
		<?php foreach ($categories as $key => $value) : ?>
			<option value="<?php echo esc_attr( $value->slug ); ?>" <?php echo $value->slug === $selected ? "selected" : ""; ?>><?php echo esc_html( $value->name ); ?></option>
		<?php endforeach; ?>
	</select>
	<?php
}

/**
 * Check whether accordion template or not
 *
 * @since 1.3.0
 * @return boolean is accordion template or not
 */
function thjmf_is_accordion_template( $style ){
	if( $style === "accordion" ){
		return true;
	}
	return false;
}

/**
 * Get job listing wrapper class
 *
 * @since 1.3.0
 * @return string job listing wrapper class
 */
function thjmf_get_job_listing_class(){
	$wordpress_themes = array(
		'twentyseventeen',
		'twentynineteen',
		'twentytwenty',
		'twentytwentyone',
		'twentytwentytwo',
		'go'
	);
	$class = 'thjmf-jobs';
	if( in_array( THJMF_ACTIVE_THEME, $wordpress_themes ) ){
		$class .= ' alignwide';
	}
	echo esc_attr($class);
}

/**
 * Get single job wrapper class
 *
 * @since 1.3.0
 * @return string single job wrapper class
 */
function thjmf_get_single_job_wrapper_class(){
	$classes = array("thjmf-single-job");
	if( THJMF_ACTIVE_THEME === 'generatepress' ){
		$classes[] = 'inside-article';

	}else if( THJMF_ACTIVE_THEME === 'go' ){
		$classes[] = 'alignwide'; 
		$classes[] = 'alignfull';
		$classes[] = 'max-m-wide';
	}

	$classes = apply_filters('thjmf_single_job_wrapper_class', $classes, THJMF_ACTIVE_THEME);
	return implode(" ", $classes );
}

/**
 * Get application form class
 *
 * @since 1.3.0
 * @return string application form class
 */
function thjmf_get_apply_form_class(){
	$class = array();
	$classes = array("thjmf-public-forms");
	if( in_array(THJMF_ACTIVE_THEME, ['twentytwentyone', 'twentytwenty']) ){
		$class[] = 'alignfull';
		$class[] = 'thjmf-input-no-margin';
	}
	$class = apply_filters('thjmf_apply_form_class', $class);
	$classes =  array_merge( $classes, $class );
	return implode(" ", $classes );
}

/**
 * Get single job content
 *
 * @since 1.3.0
 * @return string classes for the single job content
 */
function thjmf_get_single_job_content_class(){
	$class = array();
	$classes = array("thjmf-single-job-content");
	if( in_array(THJMF_ACTIVE_THEME, ['twentytwentyone', 'twentytwenty']) ){
		$class[] = 'alignfull';
	}
	$class = apply_filters('thjmf_single_job_content_class', $class);
	$classes =  array_merge( $classes, $class );
	return implode(" ", $classes );
}

/**
 * Get filter input field class
 *
 * @since 1.3.0
 * @return string classes for the job filter fields
 */
function thjmf_get_filter_class(){
	return apply_filters('thjmf_filter_class', 'thjmf-filter-job-on-change');
}

/**
 * Check whether job features should be shown before or after job content in single job page
 *
 * @since 1.3.0
 * @return boolean feature after job content or not
 */
function thjmf_is_feature_after_content(){
	$feature_position = isset( THJMF_SETTINGS['job_detail']['job_feature_position'] ) ? THJMF_SETTINGS['job_detail']['job_feature_position'] : 'before_content';
	return $feature_position === 'after_content' ? true : false;
}

/**
 * Check whether the job is appliable
 *
 * @since 1.3.0
 * @return boolean appliable job or not
 */
function thjmf_is_appliable_job(){
	return !thjmf_is_filled_job() && !thjmf_is_expired_job() && thjmf_has_application_form();
}

/**
 * Get the message to show instead of apply now button
 *
 * @since 1.3.0
 * @return apply now message
 */
function thjmf_get_apply_now_message(){
	$message = isset(THJMF_SETTINGS['job_submission']['apply_form_disabled_msg']) ? THJMF_SETTINGS['job_submission']['apply_form_disabled_msg'] : '';
	return $message;
}

/**
 * Check whether the job is filled
 *
 * @since 1.3.0
 * @return boolean whether job is filled or not
 * 
 */
function thjmf_is_filled_job(){
	$filled  = THJMF_Utils::get_jpm_filled( get_the_ID() );
	return filter_var( $filled, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
}

/**
 * Check whether the job is expired
 *
 * @since 1.3.0
 * @return array arguments to display job
 * 
 */
function thjmf_is_expired_job(){
	$expired = THJMF_Utils::get_jpm_expired( get_the_ID() );
	return !empty( $expired ) ? THJMF_Utils::is_post_expired($expired) : false;
}

/**
 * Check whether application form is enabled
 *
 * @since 1.3.0
 * @return array arguments to display job
 * 
 */
function thjmf_has_application_form(){
	return isset( THJMF_SETTINGS['job_submission']['enable_apply_form'] ) ? THJMF_SETTINGS['job_submission']['enable_apply_form'] : true;
}

/**
 * Render advanced phone field features
 *
 * @since 1.3.0
 * 
 */
function thjmf_advanced_phone_field_features(){
	$flag = '';
	$options = '';
	$default_country_code = '';
	$codes = THJMF_Utils::get_country_codes();
	$default_code = apply_filters('thjm_default_phone_country', 'US', 'phone' );
	$code_field = '<span class="thjmf-country-codes-wrapper">';
	$code_field .= '<span class="thjmf-country-code-list">';
	foreach ($codes as $index => $country_meta) {
		$code = isset($country_meta['code']) ? $country_meta['code'] : '';
		$dial_code = isset($country_meta['dial_code']) ? $country_meta['dial_code'] : '';
		if( apply_filters('thjm_applicant_phone_dial_code_flag', true) ){
			$flag = isset($country_meta['flag']) ? $country_meta['flag'] : '';
		}
		if( $default_code == $code ){
			$default_country_code .= '<input type="text" name="phone_dial_code" id="phone_dial_code" autocomplete="__away" class="thjmf-input-dialling-code input-text" value="'.esc_html( $dial_code ).'">';
			$default_country_code .= '<input type="hidden" name="phone_country_code" id="phone_country_code" class="thjmf-input-dialling-code input-text" value="'.esc_attr( $code ).'">';
			$default_country_code .= '<span class="thjmf-country-dial-codes">'.esc_html( $flag ).' <span class="thjmf-dialling-code">'.esc_html( $dial_code ).'</span></span>';
		}
		$code_field .= '<span class="thjmf-inline-flags" data-value="'.esc_attr( $code ).'">'. esc_html( $flag ) .'<span class="thjmf-dialling-code">'. esc_html( $dial_code ) . '</span></span>';
	}
	$code_field .= '</span></span>';
	echo $default_country_code.$code_field;
}