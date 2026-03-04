# Hướng Dẫn Tạo Swiper Thumb Slider Cho Flatsome Theme

## Tổng Quan

**Swiper Thumb Slider** là shortcode custom cho Flatsome theme, kết hợp giữa main slider (hình ảnh lớn) và thumbnail navigation (text/icon có thể click). Khi click vào thumbnail, main slider sẽ chuyển sang slide tương ứng. Component hỗ trợ đầy đủ UX Builder integration, multiple instances, và responsive design.

**Đặc điểm nổi bật:**
- Main slider với ảnh full-size
- Thumbnail navigation với text/icon tùy chỉnh
- Sync giữa main slider và thumbnails
- Hỗ trợ overlay content trên slides
- Auto-play, loop, effect transitions
- Tích hợp hoàn toàn với UX Builder

## Yêu Cầu Hệ Thống

\begin{itemize}
\item WordPress 5.0+
\item Flatsome theme 3.0+
\item PHP 7.0+
\item jQuery (có sẵn trong WordPress)
\item Swiper.js 12.x (CDN)
\end{itemize}

---

## Bước 1: Chuẩn Bị Cấu Trúc Thư Mục

### 1.1 Cấu Trúc Child Theme

Tạo cấu trúc thư mục trong child theme:

flatsome-child/
├── style.css
├── functions.php
├── inc/
│   └── shortcodes/
│       └── swiper-thumb-slider.php
├── assets/
│   ├── css/
│   │   └── swiper-thumb-slider.css
│   └── js/
│       └── swiper-thumb-slider.js
└── ux-builder/
    └── elements/
        ├── swiper-thumb-slider/
        │   ├── options.php
        │   └── template.html
        └── swiper-thumb-item/
            ├── options.php
            └── template.html

### 1.2 File style.css (Child Theme)

/*
Theme Name: Flatsome Child
Template: flatsome
Version: 1.0.0
*/

### 1.3 File functions.php (Child Theme)

<?php
/**
 * Flatsome Child Theme Functions
 */

// Load parent theme styles
add_action('wp_enqueue_scripts', 'flatsome_child_enqueue_styles', 20);
function flatsome_child_enqueue_styles() {
    wp_enqueue_style('flatsome-child-style', 
        get_stylesheet_uri(),
        array('flatsome-style'),
        wp_get_theme()->get('Version')
    );
}

// Load swiper thumb slider
require_once get_stylesheet_directory() . '/inc/shortcodes/swiper-thumb-slider.php';

---

## Bước 2: Tạo Shortcode PHP Backend

### 2.1 File swiper-thumb-slider.php

Tạo file `inc/shortcodes/swiper-thumb-slider.php`:

<?php
/**
 * Swiper Thumb Text Slider Shortcode (Simple, UX Builder friendly)
 */

if (!defined('ABSPATH')) exit;

// Global storage đơn giản
global $swiper_current_instance, $swiper_items;
$swiper_items = is_array($swiper_items ?? null) ? $swiper_items : array();

/**
 * Container shortcode
 */
function ux_swiper_thumb_slider($atts, $content = null) {
    static $instance_counter = 0;
    $instance_id = 'swiper-thumb-' . (++$instance_counter);

    global $swiper_current_instance, $swiper_items;

    $atts = shortcode_atts(array(
        'height'                => '450px',
        'height_tablet'         => '350px',
        'height_mobile'         => '250px',
        'auto_play'             => '5000',
        'speed'                 => '600',
        'loop'                  => 'true',
        'effect'                => 'slide',
        'space_between'         => '10',
        'pause_hover'           => 'true',
        'thumbs_columns'        => '4',
        'thumbs_columns_tablet' => '3',
        'thumbs_columns_mobile' => '2',
        'thumbs_space'          => '10',
        'thumb_position'        => 'bottom',
        'active_color'          => '#B31E1A',
        'inactive_color'        => '#5A738C',
        'border_radius'         => '10',
        'arrows'                => 'true',
        'arrows_mobile'         => 'false',
        'pagination'            => 'true',
        'pagination_mobile'     => 'true',
        'hide_desktop'          => 'false',
        'hide_tablet'           => 'false',
        'hide_mobile'           => 'false',
        'class'                 => '',
    ), $atts);

    // Chuẩn bị storage cho instance này
    $swiper_current_instance    = $instance_id;
    $swiper_items[$instance_id] = array();

    // QUAN TRỌNG: xử lý child shortcodes để thu item
    if (!empty($content)) {
        do_shortcode($content);
    }

    // Lấy items đã thu được
    $items = $swiper_items[$instance_id] ?? array();

    // Không có item → placeholder trong UX Builder, rỗng ngoài frontend
    if (empty($items)) {
        unset($swiper_items[$instance_id]);
        if ($swiper_current_instance === $instance_id) {
            $swiper_current_instance = null;
        }

        if (function_exists('ux_builder_is_active') && ux_builder_is_active()) {
            return '<div class="swiper-thumb-slider-placeholder" style="background:#f5f5f5;padding:60px 20px;text-align:center;border:2px dashed #ddd;border-radius:10px;margin:20px 0;">
                <p style="color:#999;font-size:18px;margin:0 0 5px;"><strong>No slider items.</strong></p>
                <p style="color:#ccc;font-size:14px;margin:0;">Click nút <strong>+</strong> để thêm Swiper Slide (swiper_thumb_item).</p>
            </div>';
        }

        return '';
    }

    // Build classes
    $classes = array('swiper-thumb-slider-wrapper');
    if ($atts['class']) $classes[] = esc_attr($atts['class']);

    // Main slides
    $main_slides = '';
    foreach ($items as $item) {
        $main_slides .= '<div class="swiper-slide">';
        if (!empty($item['link'])) {
            $main_slides .= '<a href="' . esc_url($item['link']) . '">';
        }
        $main_slides .= '<img src="' . esc_url($item['image']) . '" alt="' . esc_attr($item['thumb_text']) . '">';
        if (!empty($item['link'])) {
            $main_slides .= '</a>';
        }
        if (!empty($item['overlay_content'])) {
            $main_slides .= '<div class="slide-overlay-content">' . $item['overlay_content'] . '</div>';
        }
        $main_slides .= '</div>';
    }

    // Thumb slides
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

    // Visibility classes
    $visibility_classes = array();
    if ($atts['hide_desktop'] === 'true') $visibility_classes[] = 'hide-for-large';
    if ($atts['hide_tablet'] === 'true') $visibility_classes[] = 'hide-for-medium';
    if ($atts['hide_mobile'] === 'true') $visibility_classes[] = 'hide-for-small';

    // Inline styles
    $inline_css = "
    <style>
    #{$instance_id} .main-slider {
        height: {$atts['height']};
        border-radius: {$atts['border_radius']}px;
    }
    @media (max-width: 849px) {
        #{$instance_id} .main-slider {
            height: {$atts['height_tablet']};
        }
    }
    @media (max-width: 549px) {
        #{$instance_id} .main-slider {
            height: {$atts['height_mobile']};
        }
        #{$instance_id}.hide-arrows-mobile .swiper-button-next,
        #{$instance_id}.hide-arrows-mobile .swiper-button-prev {
            display: none;
        }
        #{$instance_id}.hide-pagination-mobile .swiper-pagination {
            display: none;
        }
    }
    #{$instance_id} .thumb-slider .swiper-slide {
        color: {$atts['inactive_color']};
    }
    #{$instance_id} .thumb-slider .swiper-slide-thumb-active {
        color: {$atts['active_color']};
        border-bottom-color: {$atts['active_color']};
    }
    #{$instance_id}.thumb-position-left,
    #{$instance_id}.thumb-position-right {
        display: flex;
        gap: 20px;
    }
    #{$instance_id}.thumb-position-left .thumb-slider,
    #{$instance_id}.thumb-position-right .thumb-slider {
        flex: 0 0 200px;
        height: auto;
    }
    #{$instance_id}.thumb-position-left .main-slider,
    #{$instance_id}.thumb-position-right .main-slider {
        flex: 1;
    }
    #{$instance_id}.thumb-position-left .thumb-slider .swiper-slide,
    #{$instance_id}.thumb-position-right .thumb-slider .swiper-slide {
        border-left: 3px solid transparent;
        border-bottom: none;
        padding: 15px 10px;
    }
    #{$instance_id}.thumb-position-left .thumb-slider .swiper-slide-thumb-active,
    #{$instance_id}.thumb-position-right .thumb-slider .swiper-slide-thumb-active {
        border-left-color: {$atts['active_color']};
    }
    #{$instance_id}.thumb-position-left {
        flex-direction: row-reverse;
    }
    @media (max-width: 849px) {
        #{$instance_id}.thumb-position-left,
        #{$instance_id}.thumb-position-right {
            flex-direction: column;
        }
        #{$instance_id}.thumb-position-left .thumb-slider,
        #{$instance_id}.thumb-position-right .thumb-slider {
            flex: auto;
        }
        #{$instance_id}.thumb-position-left .thumb-slider .swiper-slide,
        #{$instance_id}.thumb-position-right .thumb-slider .swiper-slide {
            border-left: none;
            border-bottom: 3px solid transparent;
            padding: 12px 20px;
        }
        #{$instance_id}.thumb-position-left .thumb-slider .swiper-slide-thumb-active,
        #{$instance_id}.thumb-position-right .thumb-slider .swiper-slide-thumb-active {
            border-left-color: transparent;
            border-bottom-color: {$atts['active_color']};
        }
    }
    </style>
    ";

    if (!empty($visibility_classes)) {
        $classes = array_merge($classes, $visibility_classes);
    }

    $classes[] = 'thumb-position-' . $atts['thumb_position'];
    if ($atts['arrows_mobile'] === 'false') {
        $classes[] = 'hide-arrows-mobile';
    }
    if ($atts['pagination_mobile'] === 'false') {
        $classes[] = 'hide-pagination-mobile';
    }

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
         data-pause-hover="<?php echo esc_attr($atts['pause_hover']); ?>"
         data-thumbs-columns="<?php echo esc_attr($atts['thumbs_columns']); ?>"
         data-thumbs-columns-tablet="<?php echo esc_attr($atts['thumbs_columns_tablet']); ?>"
         data-thumbs-columns-mobile="<?php echo esc_attr($atts['thumbs_columns_mobile']); ?>"
         data-thumbs-space="<?php echo esc_attr($atts['thumbs_space']); ?>"
         data-thumb-position="<?php echo esc_attr($atts['thumb_position']); ?>"
         data-arrows="<?php echo esc_attr($atts['arrows']); ?>"
         data-pagination="<?php echo esc_attr($atts['pagination']); ?>"
         data-items-count="<?php echo count($items); ?>">
        
        <div class="swiper main-slider">
            <div class="swiper-wrapper">
                <?php echo $main_slides; ?>
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>

        <div class="swiper thumb-slider">
            <div class="swiper-wrapper">
                <?php echo $thumb_slides; ?>
            </div>
        </div>
    </div>
    <?php

    // cleanup
    unset($swiper_items[$instance_id]);
    if ($swiper_current_instance === $instance_id) {
        $swiper_current_instance = null;
    }

    return ob_get_clean();
}
add_shortcode('swiper_thumb_slider', 'ux_swiper_thumb_slider');

/**
 * Item shortcode
 */
function ux_swiper_thumb_item($atts, $content = null) {
    global $swiper_current_instance, $swiper_items;

    $atts = shortcode_atts(array(
        'image'      => '',
        'thumb_text' => 'Slide Item',
        'thumb_icon' => '',
        'link'       => '',
        'class'      => '',
    ), $atts);

    // Không ở trong parent → bỏ
    if (empty($swiper_current_instance)) {
        return '';
    }

    $instance_id = $swiper_current_instance;

    // Lấy URL ảnh
    $image_url = '';
    if (is_numeric($atts['image'])) {
        $image_url = wp_get_attachment_image_url($atts['image'], 'large');
    } else {
        $image_url = $atts['image'];
    }

    if (empty($image_url)) {
        $image_url = 'https://via.placeholder.com/820x450?text=' . urlencode($atts['thumb_text']);
    }

    $overlay_content = $content ? do_shortcode($content) : '';

    $swiper_items[$instance_id][] = array(
        'image'           => $image_url,
        'thumb_text'      => $atts['thumb_text'],
        'thumb_icon'      => $atts['thumb_icon'],
        'link'            => $atts['link'],
        'overlay_content' => $overlay_content,
        'class'           => $atts['class'],
    );

    return '';
}
add_shortcode('swiper_thumb_item', 'ux_swiper_thumb_item');

/**
 * Enqueue Swiper.js and custom assets
 */
add_action('wp_enqueue_scripts', 'swiper_thumb_slider_enqueue_assets');
function swiper_thumb_slider_enqueue_assets() {
    $version = wp_get_theme()->get('Version');
    
    wp_enqueue_style(
        'swiper-bundle',
        'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
        array(),
        '12.0.0'
    );
    
    wp_enqueue_style(
        'swiper-thumb-slider-style',
        get_stylesheet_directory_uri() . '/assets/css/swiper-thumb-slider.css',
        array('swiper-bundle'),
        $version
    );
    
    wp_enqueue_script(
        'swiper-bundle',
        'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js',
        array(),
        '12.0.0',
        true
    );
    
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

---

## Bước 3: Tạo File CSS

### 3.1 File swiper-thumb-slider.css

Tạo file `assets/css/swiper-thumb-slider.css`:

/* Swiper Thumb Slider Styles */

.swiper-thumb-slider-wrapper {
    position: relative;
    width: 100%;
    margin: 0 auto;
}

/* Main Slider */
.swiper-thumb-slider-wrapper .main-slider {
    width: 100%;
    height: 450px;
    overflow: hidden;
    border-radius: 10px;
    margin-bottom: 20px;
}

.swiper-thumb-slider-wrapper .main-slider .swiper-slide {
    position: relative;
    background: #f5f5f5;
}

.swiper-thumb-slider-wrapper .main-slider img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

/* Overlay Content */
.slide-overlay-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    color: white;
    z-index: 2;
}

.slide-overlay-content h1,
.slide-overlay-content h2,
.slide-overlay-content h3,
.slide-overlay-content h4 {
    color: white;
    margin-bottom: 0.5rem;
}

/* Navigation Arrows */
.swiper-thumb-slider-wrapper .swiper-button-next,
.swiper-thumb-slider-wrapper .swiper-button-prev {
    color: white;
    background: rgba(0, 0, 0, 0.5);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    transition: background 0.3s ease;
}

.swiper-thumb-slider-wrapper .swiper-button-next:hover,
.swiper-thumb-slider-wrapper .swiper-button-prev:hover {
    background: rgba(0, 0, 0, 0.7);
}

.swiper-thumb-slider-wrapper .swiper-button-next::after,
.swiper-thumb-slider-wrapper .swiper-button-prev::after {
    font-size: 20px;
}

/* Pagination */
.swiper-thumb-slider-wrapper .swiper-pagination-bullet {
    background: white;
    opacity: 0.5;
    width: 10px;
    height: 10px;
}

.swiper-thumb-slider-wrapper .swiper-pagination-bullet-active {
    opacity: 1;
    background: #B31E1A;
}

/* Thumbnail Slider */
.swiper-thumb-slider-wrapper .thumb-slider {
    width: 100%;
    height: auto;
    padding: 10px 0;
}

.swiper-thumb-slider-wrapper .thumb-slider .swiper-slide {
    cursor: pointer;
    text-align: center;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #5A738C;
    background: transparent;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    user-select: none;
}

.swiper-thumb-slider-wrapper .thumb-slider .swiper-slide:hover {
    color: #B31E1A;
}

.swiper-thumb-slider-wrapper .thumb-slider .swiper-slide-thumb-active {
    color: #B31E1A;
    border-bottom-color: #B31E1A;
}

.swiper-thumb-slider-wrapper .thumb-slider .swiper-slide i {
    margin-right: 6px;
    font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
    .swiper-thumb-slider-wrapper .main-slider {
        height: 300px;
    }

    .swiper-thumb-slider-wrapper .thumb-slider .swiper-slide {
        font-size: 12px;
        padding: 10px 12px;
    }

    .slide-overlay-content {
        padding: 1rem;
    }

    .slide-overlay-content h1,
    .slide-overlay-content h2,
    .slide-overlay-content h3,
    .slide-overlay-content h4 {
        font-size: 1.2rem;
    }
}

/* UX Builder Placeholder */
.swiper-thumb-slider-placeholder {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

---

## Bước 4: Tạo File JavaScript

### 4.1 File swiper-thumb-slider.js

Tạo file `assets/js/swiper-thumb-slider.js`:

/**
 * Swiper Thumb Slider Initialization
 */

(function($) {
    'use strict';

    window.SwiperThumbSlider = {
        instances: {},

        init: function() {
            $('.swiper-thumb-slider-wrapper').each(function() {
                SwiperThumbSlider.initInstance($(this));
            });
        },

        initInstance: function($wrapper) {
            var instanceId = $wrapper.attr('id');
            
            if (!instanceId || SwiperThumbSlider.instances[instanceId]) {
                return;
            }

            var autoplay = $wrapper.data('autoplay');
            var speed = parseInt($wrapper.data('speed')) || 600;
            var loop = $wrapper.data('loop') === 'true';
            var effect = $wrapper.data('effect') || 'slide';
            var spaceBetween = parseInt($wrapper.data('space')) || 10;
            var pauseHover = $wrapper.data('pause-hover') === 'true';
            var thumbsColumns = parseInt($wrapper.data('thumbs-columns')) || 4;
            var thumbsColumnsTablet = parseInt($wrapper.data('thumbs-columns-tablet')) || 3;
            var thumbsColumnsMobile = parseInt($wrapper.data('thumbs-columns-mobile')) || 2;
            var thumbsSpace = parseInt($wrapper.data('thumbs-space')) || 10;
            var thumbPosition = $wrapper.data('thumb-position') || 'bottom';
            var showArrows = $wrapper.data('arrows') !== 'false';
            var showPagination = $wrapper.data('pagination') !== 'false';

            var $thumbSlider = $wrapper.find('.thumb-slider')[0];
            var $mainSlider = $wrapper.find('.main-slider')[0];

            if (!$thumbSlider || !$mainSlider) {
                console.warn('Swiper elements not found for instance:', instanceId);
                return;
            }

            // Initialize thumb slider first
            var thumbConfig = {
                spaceBetween: thumbsSpace,
                slidesPerView: thumbsColumns,
                freeMode: true,
                watchSlidesProgress: true,
                breakpoints: {
                    0: {
                        slidesPerView: thumbsColumnsMobile,
                        spaceBetween: Math.min(thumbsSpace, 5)
                    },
                    550: {
                        slidesPerView: thumbsColumnsTablet,
                        spaceBetween: thumbsSpace
                    },
                    850: {
                        slidesPerView: thumbsColumns,
                        spaceBetween: thumbsSpace
                    }
                }
            };

            // Vertical mode for left/right positions on desktop
            if ((thumbPosition === 'left' || thumbPosition === 'right') && $(window).width() > 849) {
                thumbConfig.direction = 'vertical';
                thumbConfig.slidesPerView = 'auto';
            }

            var thumbSwiper = new Swiper($thumbSlider, thumbConfig);

            // Initialize main slider
            var mainConfig = {
                spaceBetween: spaceBetween,
                speed: speed,
                loop: loop,
                effect: effect,
                thumbs: {
                    swiper: thumbSwiper,
                }
            };

            if (showArrows) {
                mainConfig.navigation = {
                    nextEl: '#' + instanceId + ' .swiper-button-next',
                    prevEl: '#' + instanceId + ' .swiper-button-prev',
                };
            }

            if (showPagination) {
                mainConfig.pagination = {
                    el: '#' + instanceId + ' .swiper-pagination',
                    clickable: true,
                };
            }

            if (autoplay && autoplay !== 'false' && autoplay !== '0') {
                mainConfig.autoplay = {
                    delay: parseInt(autoplay) || 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: pauseHover,
                };
            }

            var mainSwiper = new Swiper($mainSlider, mainConfig);

            SwiperThumbSlider.instances[instanceId] = {
                main: mainSwiper,
                thumb: thumbSwiper,
                wrapper: $wrapper
            };

            console.log('Swiper Thumb Slider initialized:', instanceId);
        },

        destroy: function(instanceId) {
            if (SwiperThumbSlider.instances[instanceId]) {
                SwiperThumbSlider.instances[instanceId].main.destroy();
                SwiperThumbSlider.instances[instanceId].thumb.destroy();
                delete SwiperThumbSlider.instances[instanceId];
            }
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        SwiperThumbSlider.init();
    });

    // Reinitialize after UX Builder updates
    if (typeof window.ux !== 'undefined') {
        $(document).on('ux-builder-element-rendered', function() {
            setTimeout(function() {
                SwiperThumbSlider.init();
            }, 300);
        });
    }

})(jQuery);

---

## Bước 5: Tích Hợp UX Builder

### 5.1 Container Options

Tạo file `ux-builder/elements/swiper-thumb-slider/options.php`:

<?php
/**
 * UX Builder options for swiper_thumb_slider
 */

return array(
    'type'     => 'container',
    'name'     => __('Swiper Thumb Slider', 'flatsome'),
    'category' => __('Content', 'flatsome'),
    'info'     => 'Slider with Thumbnails',
    'allow'    => array('swiper_thumb_item'),
    'wrap'     => false,
    
    'presets' => array(
        array(
            'name'    => __('Default', 'flatsome'),
            'content' => '
[swiper_thumb_slider]
[swiper_thumb_item image="" thumb_text="Slide 1"]Content 1[/swiper_thumb_item]
[swiper_thumb_item image="" thumb_text="Slide 2"]Content 2[/swiper_thumb_item]
[swiper_thumb_item image="" thumb_text="Slide 3"]Content 3[/swiper_thumb_item]
[/swiper_thumb_slider]
            ',
        ),
    ),

    'options' => array(
        'layout_options' => array(
            'type'    => 'group',
            'heading' => __('Layout', 'flatsome'),
            'options' => array(
                'height' => array(
                    'type'       => 'scrubfield',
                    'responsive' => true,
                    'heading'    => __('Slider Height', 'flatsome'),
                    'default'    => '450px',
                    'min'        => 200,
                    'max'        => 1000,
                ),

                'height_tablet' => array(
                    'type'    => 'scrubfield',
                    'heading' => __('Height Tablet', 'flatsome'),
                    'default' => '350px',
                    'min'     => 150,
                    'max'     => 800,
                ),

                'height_mobile' => array(
                    'type'    => 'scrubfield',
                    'heading' => __('Height Mobile', 'flatsome'),
                    'default' => '250px',
                    'min'     => 150,
                    'max'     => 600,
                ),

                'border_radius' => array(
                    'type'    => 'slider',
                    'heading' => __('Border Radius', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 50,
                    'unit'    => 'px',
                ),

                'space_between' => array(
                    'type'    => 'slider',
                    'heading' => __('Space Between Slides', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 50,
                    'unit'    => 'px',
                ),
            ),
        ),

        'slider_options' => array(
            'type'    => 'group',
            'heading' => __('Slider Settings', 'flatsome'),
            'options' => array(
                'auto_play' => array(
                    'type'        => 'textfield',
                    'heading'     => __('Auto Play (ms)', 'flatsome'),
                    'default'     => '5000',
                    'placeholder' => '5000 (0 = off)',
                ),

                'speed' => array(
                    'type'    => 'textfield',
                    'heading' => __('Transition Speed (ms)', 'flatsome'),
                    'default' => '600',
                ),

                'loop' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Loop', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),

                'effect' => array(
                    'type'    => 'select',
                    'heading' => __('Effect', 'flatsome'),
                    'default' => 'slide',
                    'options' => array(
                        'slide' => 'Slide',
                        'fade'  => 'Fade',
                        'cube'  => 'Cube',
                        'flip'  => 'Flip',
                    ),
                ),

                'pause_hover' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Pause On Hover', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),
            ),
        ),

        'thumb_options' => array(
            'type'    => 'group',
            'heading' => __('Thumbnail Settings', 'flatsome'),
            'options' => array(
                'thumbs_columns' => array(
                    'type'    => 'slider',
                    'heading' => __('Columns (Desktop)', 'flatsome'),
                    'default' => 4,
                    'min'     => 2,
                    'max'     => 8,
                ),

                'thumbs_columns_tablet' => array(
                    'type'    => 'slider',
                    'heading' => __('Columns (Tablet)', 'flatsome'),
                    'default' => 3,
                    'min'     => 2,
                    'max'     => 6,
                ),

                'thumbs_columns_mobile' => array(
                    'type'    => 'slider',
                    'heading' => __('Columns (Mobile)', 'flatsome'),
                    'default' => 2,
                    'min'     => 1,
                    'max'     => 4,
                ),

                'thumbs_space' => array(
                    'type'    => 'slider',
                    'heading' => __('Thumbnail Spacing', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 30,
                    'unit'    => 'px',
                ),

                'thumb_position' => array(
                    'type'    => 'select',
                    'heading' => __('Thumbnail Position', 'flatsome'),
                    'default' => 'bottom',
                    'options' => array(
                        'bottom' => 'Bottom',
                        'top'    => 'Top',
                        'left'   => 'Left (Desktop only)',
                        'right'  => 'Right (Desktop only)',
                    ),
                ),

                'active_color' => array(
                    'type'    => 'colorpicker',
                    'heading' => __('Active Thumb Color', 'flatsome'),
                    'default' => '#B31E1A',
                    'format'  => 'hex',
                ),

                'inactive_color' => array(
                    'type'    => 'colorpicker',
                    'heading' => __('Inactive Thumb Color', 'flatsome'),
                    'default' => '#5A738C',
                    'format'  => 'hex',
                ),
            ),
        ),

        'nav_options' => array(
            'type'    => 'group',
            'heading' => __('Navigation', 'flatsome'),
            'options' => array(
                'arrows' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Arrows', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),

                'arrows_mobile' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Arrows on Mobile', 'flatsome'),
                    'default' => 'false',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),

                'pagination' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Pagination Dots', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),

                'pagination_mobile' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Pagination on Mobile', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'false' => array('title' => 'Off'),
                        'true'  => array('title' => 'On'),
                    ),
                ),
            ),
        ),

        'visibility_options' => array(
            'type'    => 'group',
            'heading' => __('Visibility', 'flatsome'),
            'options' => array(
                'hide_desktop' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Hide on Desktop', 'flatsome'),
                    'default' => 'false',
                    'options' => array(
                        'false' => array('title' => 'No'),
                        'true'  => array('title' => 'Yes'),
                    ),
                ),

                'hide_tablet' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Hide on Tablet', 'flatsome'),
                    'default' => 'false',
                    'options' => array(
                        'false' => array('title' => 'No'),
                        'true'  => array('title' => 'Yes'),
                    ),
                ),

                'hide_mobile' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Hide on Mobile', 'flatsome'),
                    'default' => 'false',
                    'options' => array(
                        'false' => array('title' => 'No'),
                        'true'  => array('title' => 'Yes'),
                    ),
                ),
            ),
        ),

        'class' => array(
            'type'        => 'textfield',
            'heading'     => __('Custom Class', 'flatsome'),
            'placeholder' => 'class-name',
            'default'     => '',
        ),
    ),
);

### 5.2 Container Template

Tạo file `ux-builder/elements/swiper-thumb-slider/template.html`:

<div class="swiper-thumb-slider-wrapper ux-builder-element" data-instance="preview">
    <div class="swiper main-slider">
        <div class="swiper-wrapper">
            {{{ ux.children }}}
        </div>
    </div>
    <div class="swiper thumb-slider">
        <div class="swiper-wrapper">
            <!-- Thumbnails will be generated from children -->
        </div>
    </div>
</div>

### 5.3 Item Options

Tạo file `ux-builder/elements/swiper-thumb-item/options.php`:

<?php
/**
 * UX Builder options for swiper_thumb_item
 */

return array(
    'type'     => 'container',
    'name'     => __('Swiper Slide', 'flatsome'),
    'info'     => '{{ thumb_text }}',
    'require'  => array('swiper_thumb_slider'),
    'wrap'     => false,
    'hidden'   => true,

    'options' => array(
        'image' => array(
            'type'    => 'image',
            'heading' => __('Image', 'flatsome'),
            'default' => '',
        ),

        'thumb_text' => array(
            'type'       => 'textfield',
            'heading'    => __('Thumbnail Text', 'flatsome'),
            'default'    => 'Slide Item',
            'auto_focus' => true,
        ),

        'thumb_icon' => array(
            'type'        => 'textfield',
            'heading'     => __('Thumbnail Icon Class', 'flatsome'),
            'default'     => '',
            'placeholder' => 'icon-star',
        ),

        'link' => array(
            'type'    => 'textfield',
            'heading' => __('Link URL', 'flatsome'),
            'default' => '',
        ),

        'class' => array(
            'type'        => 'textfield',
            'heading'     => __('Custom Class', 'flatsome'),
            'placeholder' => 'class-name',
            'default'     => '',
        ),
    ),
);

### 5.4 Item Template

Tạo file `ux-builder/elements/swiper-thumb-item/template.html`:

<div class="swiper-slide ux-builder-element">
    <img ng-if="data.image" ng-src="{{ data.image }}" alt="{{ data.thumb_text }}">
    <div ng-if="!data.image" style="background:#f5f5f5;height:300px;display:flex;align-items:center;justify-content:center;color:#999;">
        <span>{{ data.thumb_text }}</span>
    </div>
    <div ng-if="ux.children" class="slide-overlay-content" ng-bind-html="ux.children"></div>
</div>

---

## Bước 6: Sử Dụng Shortcode

### 6.1 Ví Dụ Cơ Bản

[swiper_thumb_slider]

[swiper_thumb_item image="1378" thumb_text="Web Design"]
<h4>Thiết Kế Website</h4>
<p>Chuyên nghiệp, hiện đại</p>
[/swiper_thumb_item]

[swiper_thumb_item image="1502" thumb_text="Mobile App"]
<h4>Ứng Dụng Di Động</h4>
<p>iOS & Android</p>
[/swiper_thumb_item]

[swiper_thumb_item image="1388" thumb_text="Marketing"]
<h4>Digital Marketing</h4>
<p>SEO, Social Media</p>
[/swiper_thumb_item]

[/swiper_thumb_slider]

### 6.2 Ví Dụ Với Icon

[swiper_thumb_slider thumbs_columns="4" active_color="#2196F3"]

[swiper_thumb_item image="100" thumb_text="Design" thumb_icon="icon-pencil"]
<h3>UI/UX Design</h3>
[/swiper_thumb_item]

[swiper_thumb_item image="101" thumb_text="Code" thumb_icon="icon-code"]
<h3>Development</h3>
[/swiper_thumb_item]

[swiper_thumb_item image="102" thumb_text="Marketing" thumb_icon="icon-megaphone"]
<h3>Digital Marketing</h3>
[/swiper_thumb_item]

[swiper_thumb_item image="103" thumb_text="Support" thumb_icon="icon-support"]
<h3>24/7 Support</h3>
[/swiper_thumb_item]

[/swiper_thumb_slider]

### 6.3 Ví Dụ Nâng Cao - Desktop/Mobile Responsive

[swiper_thumb_slider 
    height="600px"
    height_tablet="400px"
    height_mobile="300px"
    auto_play="8000" 
    effect="fade" 
    thumbs_columns="4"
    thumbs_columns_tablet="3"
    thumbs_columns_mobile="2"
    active_color="#FF6B6B"
    border_radius="20"
    arrows_mobile="false"
    pagination_mobile="true"]

[swiper_thumb_item image="200" thumb_text="Portfolio 1" link="/project-1"]
<h2>E-commerce Platform</h2>
<p>Built with React & Node.js</p>
<a href="/project-1" class="button white">View Details</a>
[/swiper_thumb_item]

[swiper_thumb_item image="201" thumb_text="Portfolio 2" link="/project-2"]
<h2>Mobile Banking App</h2>
<p>Flutter & Firebase</p>
<a href="/project-2" class="button white">View Details</a>
[/swiper_thumb_item]

[swiper_thumb_item image="202" thumb_text="Portfolio 3" link="/project-3"]
<h2>Corporate Website</h2>
<p>WordPress Custom Theme</p>
<a href="/project-3" class="button white">View Details</a>
[/swiper_thumb_item]

[/swiper_thumb_slider]

### 6.4 Ví Dụ Với Thumbnail Bên Trái (Desktop)

[swiper_thumb_slider 
    height="500px"
    thumb_position="left"
    thumbs_columns="4"
    active_color="#2196F3"
    pause_hover="true"]

[swiper_thumb_item image="300" thumb_text="Feature 1" thumb_icon="icon-star"]
<h3>Premium Quality</h3>
<p>Top-tier materials and craftsmanship</p>
[/swiper_thumb_item]

[swiper_thumb_item image="301" thumb_text="Feature 2" thumb_icon="icon-shield"]
<h3>Secure & Safe</h3>
<p>Advanced security protocols</p>
[/swiper_thumb_item]

[swiper_thumb_item image="302" thumb_text="Feature 3" thumb_icon="icon-rocket"]
<h3>Fast Delivery</h3>
<p>Express shipping worldwide</p>
[/swiper_thumb_item]

[swiper_thumb_item image="303" thumb_text="Feature 4" thumb_icon="icon-support"]
<h3>24/7 Support</h3>
<p>Always here to help you</p>
[/swiper_thumb_item]

[/swiper_thumb_slider]

### 6.5 Ví Dụ Ẩn Trên Mobile

[swiper_thumb_slider 
    height="600px"
    hide_mobile="true"
    thumbs_columns="5"
    effect="cube"]

[swiper_thumb_item image="400" thumb_text="Desktop Only 1"]
<h2>Desktop Experience</h2>
[/swiper_thumb_item]

[swiper_thumb_item image="401" thumb_text="Desktop Only 2"]
<h2>HD Quality</h2>
[/swiper_thumb_item]

[/swiper_thumb_slider]

---

## Bước 7: Testing & Troubleshooting

### 7.1 Checklist Testing

\begin{itemize}
\item Test trên trang thường (Classic Editor)
\item Test trong UX Builder
\item Test multiple instances trên cùng 1 page
\item Test responsive trên mobile/tablet
\item Test auto-play functionality
\item Test thumbnail click switching
\item Kiểm tra console không có lỗi JS
\item Test với và không có overlay content
\item Test effect transitions (slide, fade, cube, flip)
\end{itemize}

### 7.2 Common Issues

\begin{table}
\begin{tabular}{|p{5cm}|p{8cm}|}
\hline
\textbf{Vấn Đề} & \textbf{Giải Pháp} \\
\hline
Swiper không hiển thị & Kiểm tra Swiper.js CDN đã load, clear cache \\
\hline
Thumbnail không sync & Verify thumbs swiper được init trước main swiper \\
\hline
Multiple instances conflict & Kiểm tra instance ID unique cho mỗi slider \\
\hline
UX Builder không hiện element & Check ux\_builder\_setup hook đã chạy \\
\hline
Image hiển thị ID thay vì URL & Code đã tự convert attachment ID sang URL \\
\hline
Auto-play không hoạt động & Kiểm tra data-autoplay attribute và giá trị \\
\hline
\end{tabular}
\caption{Troubleshooting guide}
\end{table}

### 7.3 Debug Mode

Thêm vào console để kiểm tra:

// Check instances
console.log('Swiper instances:', window.SwiperThumbSlider.instances);

// Check specific instance
var instance = window.SwiperThumbSlider.instances['swiper-thumb-1'];
console.log('Main slides:', instance.main.slides.length);
console.log('Thumb slides:', instance.thumb.slides.length);

---

## Kết Luận

**Swiper Thumb Slider** đã được tạo thành công với đầy đủ tính năng:

\begin{itemize}
\item Main slider với full-size images
\item Thumbnail navigation với text/icon
\item Auto-sync giữa main và thumb sliders
\item Multiple instances support
\item UX Builder integration hoàn chỉnh
\item Responsive design
\item Customizable colors, effects, spacing
\item Overlay content support
\end{itemize}

Component này mở rộng Flatsome theme một cách chuyên nghiệp, không ảnh hưởng code gốc, tuân thủ WordPress và Flatsome best practices.

## Tài Liệu Tham Khảo

\begin{itemize}
\item Swiper.js Documentation: https://swiperjs.com/
\item Flatsome UX Builder API: https://docs.uxthemes.com/article/385-ux-builder-api
\item WordPress Shortcode API: https://developer.wordpress.org/reference/functions/add\_shortcode/
\item Flatsome Child Themes: https://docs.uxthemes.com/article/26-child-theme
\end{itemize}