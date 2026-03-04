<?php
return array(
    'type'    => 'container',
    'name'    => __('Swiper Slide', 'flatsome'),
    'info'    => '{{ thumb_text }}',
    'require' => array('swiper_thumb_slider'),
    'wrap'    => false,
    'hidden'  => true,

    'options' => array(
        
        'image' => array(
            'type'    => 'image',
            'heading' => __('Slide Image', 'flatsome'),
            'default' => '',
        ),

        'thumb_text' => array(
            'type'       => 'textfield',
            'heading'    => __('Thumbnail Text', 'flatsome'),
            'default'    => __('Slide Item', 'flatsome'),
            'auto_focus' => true,
        ),

        'thumb_icon' => array(
            'type'    => 'textfield',
            'heading' => __('Thumbnail Icon Class', 'flatsome'),
            'default' => '',
            'description' => __('E.g: icon-tag, icon-star, icon-heart', 'flatsome'),
        ),

        'link' => array(
            'type'    => 'textfield',
            'heading' => __('Link URL', 'flatsome'),
            'default' => '',
        ),

        'class' => array(
            'type'    => 'textfield',
            'heading' => __('Custom Class', 'flatsome'),
            'default' => '',
        ),
    ),
);
