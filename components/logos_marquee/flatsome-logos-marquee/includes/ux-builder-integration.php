<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'ux_builder_setup', 'flomar_ux_builder_elements' );

function flomar_ux_builder_elements() {
    add_ux_builder_shortcode( 'logos_marquee', array(
        'name'      => __( 'Logos Marquee', 'flatsome' ),
        'category'  => __( 'Custom Elements', 'flatsome' ),
        'icon'      => 'icon-image', // Icon hiển thị trong UX Builder
        'options'   => array(
            'title' => array(
                'type'    => 'textfield',
                'heading' => 'Tiêu đề (Title)',
                'default' => '',
                'placeholder' => 'Nhập tiêu đề section...',
            ),
            'description' => array(
                'type'    => 'textarea',
                'heading' => 'Mô tả (Description)',
                'default' => '',
                'placeholder' => 'Hỗ trợ nhập thẻ HTML cơ bản...',
            ),
            'images_url' => array(
                'type'        => 'gallery',
                'heading'     => 'Hình ảnh Logos',
                'description' => 'Chọn các logo bạn muốn hiển thị.',
            ),
            'link_images' => array(
                'type'        => 'textfield',
                'heading'     => 'Links của Logo',
                'description' => 'Nhập các URL cách nhau bằng dấu phẩy (,). Lưu ý: Thứ tự link phải tương ứng với thứ tự ảnh ở trên.',
                'default'     => '',
            ),
        ),
    ) );
}