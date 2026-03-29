<?php
/**
 * Themehigh Job Manager Template Hooks and callbacks
 *
 * Action/filter hooks used for Job manager functions/templates.
 *
 * @package Themehigh\classes
 * @version 1.3.0
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'body_class', 'thjmf_body_class' );

$hp_single_tmpt = apply_filters('thjmf_single_template_hook_priority', 10);
$hp_tmpt_include = apply_filters('thjmf_template_include_hook_priority', 999);

add_filter('single_template', 'thjmf_single_job_template', $hp_single_tmpt, 1);
add_filter('template_include', 'thjmf_template_include_builder_compatibility', $hp_tmpt_include, 1);
add_action('thjm_before_main_content', 'thjmf_single_job_before_content');
add_action('thjm_after_main_content', 'thjmf_single_job_after_content');
add_action('thjm_single_job_header', 'thjmf_single_job_title');
add_action('thjm_single_job_header', 'thjmf_single_job_tags');
add_action('thjm_single_job_header', 'thjmf_single_job_features');
add_action('thjm_single_job_content', 'thjmf_single_job_main_content');

add_action('thjm_after_single_job_content', 'thjmf_single_job_apply_now_button', 20);
add_action('thjm_after_single_job_content', 'thjmf_single_job_application_form', 30);
add_action('thjm_after_single_job_content', 'thjmf_single_job_form_notification', 40);
add_action('thjm_before_job_loop_item', 'thjmf_template_loop_job_list_open');
add_action('thjm_job_loop_item_title', 'thjmf_template_loop_job_title' );
add_action('thjm_after_job_loop_item_title', 'thjmf_template_loop_job_tags', 10 );
add_action('thjm_after_job_loop_item_title', 'thjmf_template_loop_job_excerpt', 20 );
add_action('thjm_after_job_loop_item_title', 'thjmf_template_loop_job_detail_button', 30 );
add_action('thjm_after_job_loop_item', 'thjmf_template_loop_job_list_close' );

if( thjmf_is_feature_after_content() ){
    remove_action('thjm_single_job_header', 'thjmf_single_job_features');
    add_action('thjm_after_single_job_content', 'thjmf_single_job_features', 10);
}

function thjmf_single_job_title(){
    thjmf_get_template('single-jobs/title.php', THJMF_Utils::get_job_title_args(get_the_ID()));
}

function thjmf_single_job_tags(){
    ?>
    <div class="thjmf-single-job-tags">
        <?php thjmf_get_template('single-jobs/tags.php', thjmf_get_tag_args()); ?>
    </div>
    <?php
}

function thjmf_single_job_features(){
    thjmf_get_template('single-jobs/features.php', thjmf_get_job_features());
}

function thjmf_single_job_main_content(){
    ?>
    <div class="<?php echo esc_attr( thjmf_get_single_job_content_class() ); ?>">
        <?php the_content(); ?>
    </div>
    <?php
}

function thjmf_body_class( $classes ){
    global $post;
    if( isset($post) && has_shortcode( $post->post_content, THJMF_Utils::get_shortcode() ) ){
        $classes[] = 'thjmf-job-list-page thjmf-job-body-js';
    }else if( is_singular( THJMF_Utils::get_job_cpt() ) ){
        $classes[] = 'thjmf-single-job-page thjmf-job-body-js';
    }
    $classes = apply_filters('thjmf_job_listing_body_class', $classes, THJMF_ACTIVE_THEME );
    return $classes;
}

function thjmf_single_job_before_content(){
    thjmf_get_template('global/wrapper-start.php');
}

function thjmf_single_job_after_content(){
    thjmf_get_template('global/wrapper-end.php');
}

function thjmf_single_job_apply_now_button(){
    if(!thjmf_is_appliable_job()){
        return;
    }
    ?>
    <button class="button thjmf-job-button" id="thjmf_show_form"><?php echo esc_html__('Apply Now', 'job-manager-career'); ?></button>
    <?php
}

function thjmf_single_job_application_form(){
    if( !thjmf_is_filled_job() && !thjmf_is_expired_job() && !thjmf_has_application_form() ){
        echo '<div class="thjmf-apply-now-msg">'.esc_html(thjmf_get_apply_now_message()).'</div>';
        return;
    }

    if(!thjmf_is_appliable_job()){
        return;
    }
    ?>
    <form name="thjmf_job_application" id="thjmf_job_application" method="post" enctype="multipart/form-data" class="<?php echo esc_attr( thjmf_get_apply_form_class() ); ?>">
        <input type="hidden" name="thjmf_job_id" value="<?php echo esc_attr( get_the_ID() ); ?>">
        <?php 
            if ( function_exists('wp_nonce_field') ){
                wp_nonce_field( 'thjmf_new_job_application', 'thjmf_application_meta_nonce' ); 
            }
            thjmf_get_template('single-jobs/job-application.php' ); 
        ?>
    </form>
    <?php
}

function thjmf_template_loop_job_list_open(){
    ?>
    <div class="thjmf-loop-job thjmf-list-job-listing">
    <?php
}

function thjmf_template_loop_job_title(){
    thjmf_get_template('loop/title.php', THJMF_Utils::get_job_title_args(get_the_ID()));
}

function thjmf_template_loop_job_list_close(){
    ?>
    </div>
    <?php
}

function thjmf_template_loop_job_excerpt(){
    ?>
    <div class="thjmf-loop-job-excerpt">
        <?php the_excerpt(); ?>
    </div>
    <?php
}

function thjmf_template_loop_job_detail_button(){
    thjmf_get_template('loop/details-button.php');
}

function thjmf_template_loop_job_tags(){
    thjmf_get_template('loop/tags.php', thjmf_get_tag_args());
}

function thjmf_single_job_template($single_template){
    global $post;
    if ('thjm_jobs' === $post->post_type) {
        $single_template = THJMF_TEMPLATES.'/single-thjm_jobs.php';
    }
    return $single_template;
}

//Any builder overriding our single cpt template.
function thjmf_template_include_builder_compatibility($template){
    if ( is_singular( 'thjm_jobs' ) ) {
        // Ensuring our callback is executed
        if ( has_filter( 'single_template', 'thjmf_single_job_template' ) ) {
            if (!preg_match('/\/single-thjm_jobs\.php$/', $template)) {
                $template = THJMF_TEMPLATES.'/single-thjm_jobs.php';
            }
        }
    }
    return $template;
}

function thjmf_single_job_form_notification(){
    $submission = isset($_GET['submit']) ? sanitize_text_field($_GET['submit']) : '';
    if(empty($submission)){
        return;
    }
    ?>
    <div class="thjmf-form-notification thjmf-notification-<?php echo esc_attr($submission); ?>">
        <?php if($submission == "success"): ?>
            <span class="dashicons dashicons-yes thjmf-notification-icon"></span>
            <p><?php echo esc_html__('Application Submitted Successfully', 'job-manager-career'); ?></p>
        <?php elseif($submission == "error"): ?>
            <span class="dashicons dashicons-no thjmf-notification-icon"></span>
            <p><?php echo esc_html__('An error occured while submitting the application. Try again', 'job-manager-career'); ?></p>
        <?php endif; ?>
        <span class="dashicons dashicons-no-alt thjmf-close-notification"></span>
    </div>
    <?php
}
