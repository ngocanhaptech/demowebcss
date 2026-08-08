<?php
/**
 * Plugin Name: Brand Manager
 * Description: Quản lý Nhãn hiệu (CPT) với các trường meta tương ứng tra cứu nhãn hiệu.
 * Version:     1.0.0
 * Author:      Le Ngoc Anh
 * Text Domain: bm
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'BM_PLUGIN_FILE', __FILE__ );
define( 'BM_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'BM_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

register_activation_hook( BM_PLUGIN_FILE, 'bm_activate_plugin' );

function bm_activate_plugin() {
    global $wpdb;

    $table_name      = $wpdb->prefix . 'bm_brands';
    $charset_collate = $wpdb->get_charset_collate();

    // Bảng lưu mỗi nhãn hiệu một dòng, gắn với post_id của CPT 'brand'
    $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id BIGINT(20) UNSIGNED NOT NULL,
        brand_title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NULL,
        application_number VARCHAR(100) NULL,
        registration_number VARCHAR(100) NULL,
        classes VARCHAR(255) NULL,
        status_text VARCHAR(100) NULL,
        filing_date DATE NULL,
        publication_date DATE NULL,
        grant_date DATE NULL,
        expiry_date DATE NULL,
        owner_name VARCHAR(255) NULL,
        owner_address VARCHAR(500) NULL,
        representative VARCHAR(255) NULL,
        application_type TINYINT(1) NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY post_id (post_id),
        KEY application_number (application_number),
        KEY registration_number (registration_number)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}

// Base CPT + Brand CPT
require_once BM_PLUGIN_PATH . 'includes/class-bm-cpt-base.php';
require_once BM_PLUGIN_PATH . 'includes/class-bm-cpt-brand.php';
require_once BM_PLUGIN_PATH . 'includes/class-bm-db.php';
require_once BM_PLUGIN_PATH . 'includes/class-shortcode-base.php';
require_once BM_PLUGIN_PATH . 'includes/class-ux-element-base.php';
require_once BM_PLUGIN_PATH . 'includes/class-bm-shortcode-brand-list.php';
require_once BM_PLUGIN_PATH . 'includes/class-bm-ux-element-brand-list.php';

/**
 * Khởi tạo CPT Brand.
 */
function bm_init() {
    ( new BM_CPT_Brand() )->register();

    // Shortcode brand list Shortcode: [ux_brand_list posts="20" brand_cat="..." status="Cấp bằng" app_type="0"] 
    ( new BM_Shortcode_Brand_List() )->register();
}
add_action( 'after_setup_theme', 'bm_init' );
add_action( 'init', function() {
    if ( class_exists( 'BM_UX_Element_Brand_List' ) && function_exists( 'add_ux_builder_shortcode' ) ) {
        ( new BM_UX_Element_Brand_List() )->register();
    }
}, 20);


// AJAX handler cho brand list
add_action( 'wp_ajax_bm_brand_list', 'bm_ajax_brand_list' );
add_action( 'wp_ajax_nopriv_bm_brand_list', 'bm_ajax_brand_list' );

function bm_ajax_brand_list() {
    if ( ! isset( $_POST['atts'] ) || ! is_array( $_POST['atts'] ) ) {
        wp_send_json_error( [ 'message' => 'Invalid data' ] );
    }

    $atts  = array_map( 'wp_unslash', $_POST['atts'] );
    $paged = isset( $_POST['paged'] ) ? (int) $_POST['paged'] : 1;

    $atts['paged'] = max( 1, $paged );
    // luôn bật ajax mode, filter bar không cần render lại 
    $atts['ajax']  = 'true';

    $shortcode = new BM_Shortcode_Brand_List();
    $html      = $shortcode->render( $atts );

    wp_send_json_success( [
        'html' => $html,
    ] );
}
add_action( 'wp_enqueue_scripts', function() {
    wp_register_script(
        'bm-brand-manager',
        BM_PLUGIN_URL . 'assets/js/brand-manager.js',
        [ 'jquery' ],
        '1.0.0',
        true
    );

    wp_localize_script(
        'bm-brand-manager',
        'bmBrandManager',
        [
            'ajax_url' => admin_url( 'admin-ajax.php' ),
        ]
    );

    wp_enqueue_script( 'bm-brand-manager' );
} );
