<?php
/**
 * Swiper Thumb Text Slider Shortcode
 * 
 * @package Flatsome Child
 */

if (!defined('ABSPATH')) exit;

/**
 * Container shortcode
 */
function ux_swiper_thumb_slider($atts, $content = null) {
    static $instance_counter = 0;
    $instance_id = 'swiper-thumb-' . (++$instance_counter);

    $atts = shortcode_atts(array(
        'height'         => '450',
        'auto_play'      => '5000',
        'speed'          => '600',
        'loop'           => 'true',
        'effect'         => 'slide', // slide, fade, cube, coverflow, flip
        'space_between'  => '10',
        'thumbs_columns' => '3',
        'thumbs_space'   => '10',
        'active_color'   => '#B31E1A',
        'inactive_color' => '#5A738C',
        'border_radius'  => '10',
        'class'          => '',
    ), $atts);

    // Store for child items
    $GLOBALS['swiper_slider_' . $instance_id] = array(
        'items'       => array(),
        'instance_id' => $instance_id,
        'atts'        => $atts,
    );

    // Process content to collect items
    $processed_content = do_shortcode($content);
    $items = $GLOBALS['swiper_slider_' . $instance_id]['items'];

    if (empty($items)) {
        return '<p>Please add slider items</p>';
    }

    // Build classes
    $classes = array('swiper-thumb-slider-wrapper');
    if ($atts['class']) $classes[] = esc_attr($atts['class']);

    // Build main slider slides
    $main_slides = '';
    foreach ($items as $item) {
        $main_slides .= '<div class="swiper-slide">';
        $main_slides .= '<img src="' . esc_url($item['image']) . '" alt="' . esc_attr($item['thumb_text']) . '">';
        if (!empty($item['overlay_content'])) {
            $main_slides .= '<div class="slide-overlay-content">' . $item['overlay_content'] . '</div>';
        }
        $main_slides .= '</div>';
    }

    // Build thumb slides
    $thumb_slides = '';
    foreach ($items as $item) {
        $icon_html = '';
        if (!empty($item['thumb_icon'])) {
            $icon_html = '<i class="' . esc_attr($item['thumb_icon']) . '"></i> ';
        }
        $thumb_slides .= '<div class="swiper-slide">';
        $thumb_slides .= '<span>' . $icon_html . wp_kses_post($item['thumb_text']) . '</span>';
        $thumb_slides .= '</div>';
    }

    // Inline styles
    $inline_css = "
    <style>
    #{$instance_id} .main-slider {
        height: {$atts['height']}px;
        border-radius: {$atts['border_radius']}px;
    }
    #{$instance_id} .thumb-slider .swiper-slide {
        color: {$atts['inactive_color']};
    }
    #{$instance_id} .thumb-slider .swiper-slide-thumb-active {
        color: {$atts['active_color']};
        border-bottom-color: {$atts['active_color']};
    }
    </style>
    ";

    // Build output
    ob_start();
    echo $inline_css;
    ?>
    <div class="<?php echo esc_attr(implode(' ', $classes)); ?>" 
         id="<?php echo esc_attr($instance_id); ?>"
         data-instance="<?php echo esc_attr($instance_id); ?>"
         data-autoplay="<?php echo esc_attr($atts['auto_play']); ?>"
         data-speed="<?php echo esc_attr($atts['speed']); ?>"
         data-loop="<?php echo esc_attr($atts['loop']); ?>"
         data-effect="<?php echo esc_attr($atts['effect']); ?>"
         data-space="<?php echo esc_attr($atts['space_between']); ?>"
         data-thumbs-columns="<?php echo esc_attr($atts['thumbs_columns']); ?>"
         data-thumbs-space="<?php echo esc_attr($atts['thumbs_space']); ?>">
        
        <!-- Main Slider -->
        <div class="swiper main-slider">
            <div class="swiper-wrapper">
                <?php echo $main_slides; ?>
            </div>
            <!-- Navigation buttons -->
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <!-- Pagination -->
            <div class="swiper-pagination"></div>
        </div>

        <!-- Thumbnail Slider -->
        <div class="swiper thumb-slider">
            <div class="swiper-wrapper">
                <?php echo $thumb_slides; ?>
            </div>
        </div>
    </div>
    <?php

    // Cleanup
    unset($GLOBALS['swiper_slider_' . $instance_id]);

    return ob_get_clean();
}
add_shortcode('swiper_thumb_slider', 'ux_swiper_thumb_slider');

/**
 * Item shortcode
 */
function ux_swiper_thumb_item($atts, $content = null) {
    $atts = shortcode_atts(array(
        'image'      => '',
        'thumb_text' => 'Slide Item',
        'thumb_icon' => '',
        'link'       => '',
        'class'      => '',
    ), $atts);

    // Find parent instance
    $instance_id = null;
    foreach ($GLOBALS as $key => $value) {
        if (strpos($key, 'swiper_slider_') === 0 && is_array($value)) {
            $instance_id = $key;
            break;
        }
    }

    if (!$instance_id) {
        return '';
    }

    // Get image URL
    $image_url = '';
    if (is_numeric($atts['image'])) {
        $image_url = wp_get_attachment_image_url($atts['image'], 'large');
    } else {
        $image_url = $atts['image'];
    }

    // Default placeholder if no image
    if (empty($image_url)) {
        $image_url = 'https://via.placeholder.com/820x450?text=' . urlencode($atts['thumb_text']);
    }

    // Store item data
    $GLOBALS[$instance_id]['items'][] = array(
        'image'           => $image_url,
        'thumb_text'      => $atts['thumb_text'],
        'thumb_icon'      => $atts['thumb_icon'],
        'link'            => $atts['link'],
        'overlay_content' => do_shortcode($content),
    );

    return ''; // Items are rendered by parent
}
add_shortcode('swiper_thumb_item', 'ux_swiper_thumb_item');

/**
 * Enqueue Swiper.js and custom assets
 */
add_action('wp_enqueue_scripts', 'swiper_thumb_slider_enqueue_assets');
function swiper_thumb_slider_enqueue_assets() {
    $version = wp_get_theme()->get('Version');
    
    // Swiper CSS
    wp_enqueue_style(
        'swiper-bundle',
        'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
        array(),
        '12.0.0'
    );
    
    // Custom CSS
    wp_enqueue_style(
        'swiper-thumb-slider-style',
        get_stylesheet_directory_uri() . '/assets/css/swiper-thumb-slider.css',
        array('swiper-bundle'),
        $version
    );
    
    // Swiper JS
    wp_enqueue_script(
        'swiper-bundle',
        'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js',
        array(),
        '12.0.0',
        true
    );
    
    // Custom JS
    wp_enqueue_script(
        'swiper-thumb-slider-script',
        get_stylesheet_directory_uri() . '/assets/js/swiper-thumb-slider.js',
        array('jquery', 'swiper-bundle'),
        $version,
        true
    );
}

/**
 * Register UX Builder elements
 */
add_action('ux_builder_setup', function() {
    add_ux_builder_shortcode('swiper_thumb_slider', 
        require get_stylesheet_directory() . '/ux-builder/elements/swiper-thumb-slider/options.php'
    );

    add_ux_builder_shortcode('swiper_thumb_item',
        require get_stylesheet_directory() . '/ux-builder/elements/swiper-thumb-item/options.php'
    );
});
