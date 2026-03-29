<?php
/**
 * Plugin Name: Flatsome Logos Marquee
 * Description: Logos marquee slider cho Flatsome + UX Builder (shortcode + custom element).
 * Version:     1.0.0
 * Author:      Ngoc Anh
 * Text Domain: flatsome-logos-marquee
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'FLOMAR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'FLOMAR_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Conditional enqueue: chỉ load khi shortcode xuất hiện.
 */
function flomar_maybe_enqueue_assets() {
    if ( ! is_singular() ) {
        return;
    }

    global $post;
    if ( ! $post instanceof WP_Post ) {
        return;
    }

    if ( has_shortcode( $post->post_content, 'logos_marquee' ) ) {
        flomar_enqueue_assets();
    }
}
add_action( 'wp', 'flomar_maybe_enqueue_assets' );

/**
 * Enqueue CSS/JS.
 */
function flomar_enqueue_assets() {
    $ver = '1.0.0';

    wp_enqueue_style(
        'flomar-logos-marquee',
        FLOMAR_PLUGIN_URL . 'assets/css/flomar-logos-marquee.css',
        array(),
        $ver
    );

    wp_enqueue_script(
        'flomar-logos-marquee',
        FLOMAR_PLUGIN_URL . 'assets/js/flomar-logos-marquee.js',
        array(),
        $ver,
        true
    );
}

/**
 * Shortcode: [logos_marquee logos="url1|url2|url3" links="link1|link2|link3"]
 *
 * - image_url: người dùng sẽ set qua UX Builder (dạng repeater trong element),
 *   nhưng để đơn giản trong shortcode core ta dùng 2 chuỗi pipe (|):
 *   + logos: danh sách URL ảnh, ngăn bằng |
 *   + links: danh sách URL link tương ứng, ngăn bằng | (có thể bỏ trống)
 *
 * - gap, duration, bg_color: custom style.
 */
function flomar_logos_marquee_shortcode( $atts ) {
    $atts = shortcode_atts(
        array(
            'logos'     => '', // "https://a.png|https://b.png"
            'links'     => '', // "https://site-a.com|https://site-b.com"
            'gap'       => '3rem',
            'duration'  => '30s',
            'bg_color'  => '#f5f5f5',
            'height'    => '35', // px
            'class'     => '',
        ),
        $atts,
        'logos_marquee'
    );

    // Chuẩn bị mảng logos và links
    $logos = array_filter( array_map( 'trim', explode( '|', $atts['logos'] ) ) );
    $links = array_map( 'trim', explode( '|', $atts['links'] ) );

    if ( empty( $logos ) ) {
        // Nếu trong UX Builder muốn hiện placeholder, có thể kiểm tra ux_builder_is_active()
        return '';
    }

    // Unique ID cho mỗi instance
    static $instance = 0;
    $instance++;
    $wrapper_id = 'flomar-logos-marquee-' . $instance;

    // Classes
    $classes = array( 'logos-section' );
    if ( ! empty( $atts['class'] ) ) {
        $classes[] = sanitize_html_class( $atts['class'] );
    }

    // Inline style cho section
    $style  = '--gap:' . esc_attr( $atts['gap'] ) . ';';
    $style .= '--duration:' . esc_attr( $atts['duration'] ) . ';';
    $style .= 'background-color:' . esc_attr( $atts['bg_color'] ) . ';';

    ob_start();
    ?>
    <section id="<?php echo esc_attr( $wrapper_id ); ?>" class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>" style="<?php echo esc_attr( $style ); ?>">
        <div class="logos-container">
            <div class="logos-marquee" id="marquee">
                <?php
                foreach ( $logos as $index => $logo_url ) {
                    $logo_url = esc_url( $logo_url );
                    $link_url = isset( $links[ $index ] ) ? esc_url( $links[ $index ] ) : '';

                    $img_html = sprintf(
                        '<img src="%1$s" alt="Logo %2$d" style="height:%3$dpx;">',
                        $logo_url,
                        $index + 1,
                        intval( $atts['height'] )
                    );

                    if ( $link_url ) {
                        echo '<a href="' . $link_url . '" target="_blank" rel="noopener noreferrer">' . $img_html . '</a>';
                    } else {
                        echo $img_html;
                    }
                }
                ?>
            </div>
        </div>
    </section>
    <?php

    return ob_get_clean();
}
add_shortcode( 'logos_marquee', 'flomar_logos_marquee_shortcode' );

/**
 * Load UX Builder integration (nếu Flatsome/UX Builder tồn tại).
 */
if ( function_exists( 'add_ux_builder_shortcode' ) ) {
    require_once FLOMAR_PLUGIN_PATH . 'inc/ux-builder.php';
}
