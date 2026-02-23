<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * UX Builder: Flatsome Logos Marquee element
 *
 * Ở đây để đơn giản, ta cho user nhập list logo + link theo dạng repeater text,
 * hoặc dùng 2 textfield dạng pipe (|). Nếu anh muốn repeater chuẩn hơn
 * (multi-select image), cần JS custom trong UX Builder, có thể làm thêm sau.
 */

add_ux_builder_shortcode(
    'logos_marquee',
    array(
        'type'     => 'container',
        'name'     => __( 'Logos Marquee', 'flatsome-logos-marquee' ),
        'category' => __( 'Custom Elements', 'flatsome-logos-marquee' ),
        'info'     => __( 'Scrolling logos marquee', 'flatsome-logos-marquee' ),
        'wrap'     => false,
        'options'  => array(
            'logos' => array(
                'type'        => 'textarea',
                'heading'     => __( 'Logos URLs', 'flatsome-logos-marquee' ),
                'description' => __( 'Nhập danh sách URL ảnh, phân tách bằng dấu | (pipe).', 'flatsome-logos-marquee' ),
                'default'     => 'https://via.placeholder.com/150x50?text=Logo+1|https://via.placeholder.com/150x50?text=Logo+2|https://via.placeholder.com/150x50?text=Logo+3',
            ),

            'links' => array(
                'type'        => 'textarea',
                'heading'     => __( 'Links (optional)', 'flatsome-logos-marquee' ),
                'description' => __( 'Nhập danh sách URL link tương ứng, phân tách bằng dấu |. Để trống nếu logo không có link.', 'flatsome-logos-marquee' ),
                'default'     => '',
            ),

            'gap' => array(
                'type'    => 'textfield',
                'heading' => __( 'Gap between logos', 'flatsome-logos-marquee' ),
                'default' => '3rem',
            ),

            'duration' => array(
                'type'        => 'textfield',
                'heading'     => __( 'Animation duration', 'flatsome-logos-marquee' ),
                'description' => __( 'Ví dụ: 30s, 20s. Thời gian nhỏ = chạy nhanh.', 'flatsome-logos-marquee' ),
                'default'     => '30s',
            ),

            'bg_color' => array(
                'type'    => 'colorpicker',
                'heading' => __( 'Background Color', 'flatsome-logos-marquee' ),
                'default' => '#f5f5f5',
            ),

            'height' => array(
                'type'    => 'slider',
                'heading' => __( 'Logo Height (px)', 'flatsome-logos-marquee' ),
                'default' => 35,
                'min'     => 20,
                'max'     => 100,
            ),

            'class' => array(
                'type'        => 'textfield',
                'heading'     => __( 'Custom Class', 'flatsome-logos-marquee' ),
                'placeholder' => 'flomar-custom-class',
                'default'     => '',
            ),
        ),
    )
);

/**
 * Đảm bảo CSS/JS load trong UX Builder preview
 */
add_action(
    'ux_builder_enqueue',
    function () {
        flomar_enqueue_assets();
    }
);
