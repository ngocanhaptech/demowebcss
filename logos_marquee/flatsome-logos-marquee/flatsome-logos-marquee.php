<?php
/**
 * Plugin Name: Flatsome Logos Marquee
 * Description: Thêm shortcode Logo Marquee trôi ngang tích hợp trực tiếp vào Flatsome UX Builder.
 * Version: 1.0.0
 * Author: Your Name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Bảo mật: Tránh truy cập trực tiếp
}

define( 'FLOMAR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'FLOMAR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// A. Đăng ký Scripts & Styles (Chưa load ra frontend vội)
add_action( 'wp_enqueue_scripts', 'flomar_register_assets' );
function flomar_register_assets() {
    wp_register_style( 'flomar-style', FLOMAR_PLUGIN_URL . 'assets/css/styles.css', array(), '1.0.0' );
    wp_register_script( 'flomar-script', FLOMAR_PLUGIN_URL . 'assets/js/script.js', array(), '1.0.0', true );
}

// B. Khởi tạo Shortcode [logos_marquee]
add_shortcode( 'logos_marquee', 'flomar_logos_marquee_shortcode' );
function flomar_logos_marquee_shortcode( $atts ) {
    // Chỉ enqueue khi shortcode được gọi để tối ưu tốc độ website
    wp_enqueue_style( 'flomar-style' );
    wp_enqueue_script( 'flomar-script' );

    $atts = shortcode_atts( array(
        'title'       => '',
        'images_url'  => '', // UX Builder Gallery sẽ trả về chuỗi ID hình ảnh cách nhau bằng dấu phẩy
        'link_images' => '', // Chuỗi link cách nhau bằng dấu phẩy
        'description' => '',
    ), $atts );

    $image_ids = explode( ',', $atts['images_url'] );
    $links     = explode( ',', $atts['link_images'] );

    ob_start();
    ?>
    <section class="logos-section flomar-wrapper">
        <?php if ( ! empty( $atts['title'] ) ) : ?>
            <h2 class="flomar-title" style="text-align:center; margin-bottom: 10px;">
                <?php echo wp_kses_post( $atts['title'] ); ?>
            </h2>
        <?php endif; ?>

        <?php if ( ! empty( $atts['description'] ) ) : ?>
            <div class="flomar-desc" style="text-align:center; margin-bottom: 30px;">
                <?php echo wp_kses_post( $atts['description'] ); ?>
            </div>
        <?php endif; ?>

        <div class="logos-container">
            <div class="logos-marquee">
                <?php
                if ( ! empty( $image_ids ) ) {
                    foreach ( $image_ids as $index => $id ) {
                        if ( empty( trim( $id ) ) ) continue;
                        
                        // Lấy URL ảnh từ ID của thư viện media
                        $img_url = wp_get_attachment_image_url( trim( $id ), 'full' );
                        
                        // Fallback: nếu nhập thẳng URL thay vì ID
                        if ( ! $img_url && filter_var( trim( $id ), FILTER_VALIDATE_URL ) ) {
                            $img_url = trim( $id );
                        }

                        if ( $img_url ) {
                            $link = isset( $links[$index] ) ? trim( $links[$index] ) : '';
                            
                            if ( ! empty( $link ) ) echo '<a href="' . esc_url( $link ) . '" target="_blank">';
                            echo '<img src="' . esc_url( $img_url ) . '" alt="Partner Logo">';
                            if ( ! empty( $link ) ) echo '</a>';
                        }
                    }
                }
                ?>
            </div>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

// C. Nhúng file tích hợp UX Builder
require_once FLOMAR_PLUGIN_DIR . 'includes/ux-builder-integration.php';