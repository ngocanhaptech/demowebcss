<?php
/**
 * Plugin Name: Flatsome Blog Posts Pro
 * Plugin URI:  https://seovn.org
 * Description: Mở rộng shortcode blog_posts với bộ lọc tác giả, custom post type và filter bar frontend.
 * Version:     1.0.0
 * Author:      Anh le ngoc
 * Author URI:  https://seovn.org
 * Text Domain: flatsome-blog-posts-pro
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

// Ngăn truy cập trực tiếp
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Định nghĩa hằng số
define( 'FBPP_VERSION', '1.0.0' );
define( 'FBPP_PATH', plugin_dir_path( __FILE__ ) );
define( 'FBPP_URL', plugin_dir_url( __FILE__ ) );

/**
 * Class chính của plugin
 */
final class Flatsome_Blog_Posts_Pro {

    /**
     * Instance duy nhất
     * @var self|null
     */
    private static $instance = null;

    /**
     * Lấy instance
     * @return self
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Include các file cần thiết
     */
    private function includes() {
        require_once FBPP_PATH . 'inc/helpers.php';
        require_once FBPP_PATH . 'inc/shortcodes/ux-blog-posts.php';

        // Luôn include builder, việc đăng ký sẽ kiểm tra UX Builder bên trong
        require_once FBPP_PATH . 'inc/builder/ux-blog-posts-builder.php';
    }

    /**
     * Khởi tạo hooks
     */
    private function init_hooks() {
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
        add_action( 'init', array( $this, 'load_textdomain' ) );
    }

    /**
     * Enqueue CSS/JS cho frontend
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'fbpp-frontend',
            FBPP_URL . 'assets/css/ux-blog-posts.css',
            array(),
            FBPP_VERSION
        );
    }

    /**
     * Load text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'flatsome-blog-posts-pro',
            false,
            dirname( plugin_basename( __FILE__ ) ) . '/languages'
        );
    }
}

// Khởi chạy plugin
Flatsome_Blog_Posts_Pro::get_instance();