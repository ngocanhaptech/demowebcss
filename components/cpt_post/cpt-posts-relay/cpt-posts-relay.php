<?php
/**
 * Plugin Name: CPT Posts Relay
 * Description: Shortcode [cpt_posts] – hỗ trợ CPT, filter author, order, tích hợp Flatsome UX Builder
 * Version:     1.0.0
 * Author:      Ngoc Anh
 * Text Domain: cpt-posts-relay
 */

defined( 'ABSPATH' ) || exit;

define( 'CPT_RELAY_VERSION', '1.0.0' );
define( 'CPT_RELAY_PATH',    plugin_dir_path( __FILE__ ) );
define( 'CPT_RELAY_URL',     plugin_dir_url( __FILE__ ) );

// Core files
require CPT_RELAY_PATH . 'inc/class-cpt-relay.php';
require CPT_RELAY_PATH . 'inc/filter-bar.php';
require CPT_RELAY_PATH . 'inc/shortcode.php';

// UX Builder element – chỉ load khi builder active
add_action( 'ux_builder_setup', function () {
    require CPT_RELAY_PATH . 'builder/element.php';
} );

// Enqueue assets
add_action( 'wp_enqueue_scripts', function () {
    wp_register_script(
        'cpt-relay-js',
        CPT_RELAY_URL . 'assets/js/cpt-relay.js',
        array( 'jquery' ),
        CPT_RELAY_VERSION,
        true
    );

    wp_localize_script( 'cpt-relay-js', 'cptRelayVars', array(
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'cpt_relay_nonce' ),
    ) );

    wp_register_style(
        'cpt-relay-css',
        CPT_RELAY_URL . 'assets/css/cpt-relay.css',
        array(),
        CPT_RELAY_VERSION
    );
} );
