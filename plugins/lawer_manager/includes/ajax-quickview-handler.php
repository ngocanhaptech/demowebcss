<?php
add_action( 'wp_ajax_lm_lawyer_quickview', 'lm_lawyer_quickview_ajax' );
add_action( 'wp_ajax_nopriv_lm_lawyer_quickview', 'lm_lawyer_quickview_ajax' );

function lm_lawyer_quickview_ajax() {
    $shortcode = isset( $_POST['shortcode'] ) ? wp_unslash( $_POST['shortcode'] ) : '';
    if ( ! $shortcode ) {
        wp_send_json_error( [ 'message' => 'Thiếu shortcode' ] );
    }
    $content = do_shortcode( $shortcode );
    wp_send_json_success( [ 'html' => $content ] );
}