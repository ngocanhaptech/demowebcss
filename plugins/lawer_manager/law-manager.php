<?php
/**
 * Plugin Name: Law Manager
 * Description: Quản lý Luật sư (CPT) với UX Builder, Relay AJAX, Quickview từ bio shortcode.
 * Version:     1.0.0
 * Author:      Your Name
 * Text Domain: lm
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'LM_PLUGIN_FILE', __FILE__ );
define( 'LM_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'LM_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

// 1. Các base class
require_once LM_PLUGIN_PATH . 'includes/class-cpt-base.php';
require_once LM_PLUGIN_PATH . 'includes/class-cpt-lawyer.php';
require_once LM_PLUGIN_PATH . 'includes/class-meta-box-helper.php';
require_once LM_PLUGIN_PATH . 'includes/class-shortcode-base.php';
require_once LM_PLUGIN_PATH . 'includes/class-shortcode-lawyer-list.php';
require_once LM_PLUGIN_PATH . 'includes/class-ux-element-base.php';
require_once LM_PLUGIN_PATH . 'includes/class-ux-element-lawyer-list.php';
require_once LM_PLUGIN_PATH . 'includes/class-assets-manager.php';

require_once LM_PLUGIN_PATH . 'includes/class-lm-cpt-document.php';
require_once LM_PLUGIN_PATH . 'includes/class-lm-shortcode-document-list.php';
require_once LM_PLUGIN_PATH . 'includes/class-lm-ux-element-document-list.php';
require_once LM_PLUGIN_PATH . 'includes/ajax-document-quickview.php';

// 2. Khởi tạo các thành phần
function lm_init() {
    // CPT và shortcode có thể đăng ký sớm
    $cpt = new LM_CPT_Lawyer();
    $cpt->register();

    $shortcode_lawyer = new LM_Shortcode_Lawyer_List();
    $shortcode_lawyer->register();

    ( new LM_CPT_Document() )->register();
    ( new LM_Shortcode_Document_List() )->register();

    $assets = new LM_Assets_Manager();
    $assets->register();
}
add_action( 'after_setup_theme', 'lm_init' );

// Đăng ký UX element cho document SAU KHI taxonomy đã sẵn sàng
add_action( 'init', function() {
    ( new LM_UX_Element_Document_List() )->register();
}, 20 );

// Lawyer UX element cũng có thể chuyển sang init nếu muốn, nhưng không bắt buộc
add_action( 'init', function() {
    ( new LM_UX_Element_Lawyer_List() )->register();
}, 20 );

// 3. AJAX handler cho quickview
require_once LM_PLUGIN_PATH . 'includes/ajax-quickview-handler.php';

// 4. Hỗ trợ UX Builder cho CPT 
add_action( 'init', function() {
    if ( function_exists( 'add_ux_builder_post_type' ) ) {
        add_ux_builder_post_type( 'lawyer' );
        add_ux_builder_post_type( 'document' );
    }
} );

/**
 * Override hàm AJAX của Flatsome để cho phép shortcode ux_lawyers
 */
add_action( 'init', function() {
    // Gỡ bỏ action gốc của Flatsome
    remove_action( 'wp_ajax_flatsome_ajax_apply_shortcode', 'flatsome_ajax_apply_shortcode' );
    remove_action( 'wp_ajax_nopriv_flatsome_ajax_apply_shortcode', 'flatsome_ajax_apply_shortcode' );
    
    // Đăng ký action mới với danh sách cho phép mở rộng
    add_action( 'wp_ajax_flatsome_ajax_apply_shortcode', 'lm_ajax_apply_shortcode' );
    add_action( 'wp_ajax_nopriv_flatsome_ajax_apply_shortcode', 'lm_ajax_apply_shortcode' );
}, 20 );

function lm_ajax_apply_shortcode() {
    $tag  = isset( $_GET['tag'] ) ? flatsome_clean( wp_unslash( $_GET['tag'] ) ) : '';
    $atts = isset( $_GET['atts'] ) ? flatsome_clean( wp_unslash( (array) $_GET['atts'] ) ) : '';

    $allowed_tags = array(
        // Flatsome 
        'blog_posts',
        'ux_bestseller_products',
        'ux_featured_products',
        'ux_sale_products',
        'ux_latest_products',
        'ux_custom_products',
        'product_lookbook',
        'products_pinterest_style',
        'ux_products',
        // Custom shortcode
        'ux_team_members',
        'ux_lawyers',
        'ux_document_list',
    );

    if (
        empty( $tag )
        || empty( $atts )
        || ! in_array( $tag, $allowed_tags, true )
    ) {
        wp_send_json_error( array(
            'message' => 'Invalid request',
        ) );
    }

    $markup = flatsome_apply_shortcode( $tag, $atts );

    wp_send_json_success( trim( $markup ) );
}
