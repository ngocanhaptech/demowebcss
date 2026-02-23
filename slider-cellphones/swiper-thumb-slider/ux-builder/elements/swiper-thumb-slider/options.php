<?php
return array(
    'type'     => 'container',
    'name'     => __('Swiper Thumb Slider', 'flatsome'),
    'category' => __('Content', 'flatsome'),
    'icon'     => 'ti-layout-slider-alt',
    'info'     => 'Swiper slider with text thumbnails',
    'allow'    => array('swiper_thumb_item'),
    
    'presets' => array(
        array(
            'name'    => __('Default (3 slides)', 'flatsome'),
            'content' => '[swiper_thumb_slider]
[swiper_thumb_item thumb_text="Web Design" image=""]<h4>Thiết Kế Website</h4>[/swiper_thumb_item]
[swiper_thumb_item thumb_text="Mobile App" image=""]<h4>Mobile App Development</h4>[/swiper_thumb_item]
[swiper_thumb_item thumb_text="Marketing" image=""]<h4>Digital Marketing</h4>[/swiper_thumb_item]
[/swiper_thumb_slider]',
        ),
        array(
            'name'    => __('With Icons', 'flatsome'),
            'content' => '[swiper_thumb_slider]
[swiper_thumb_item thumb_text="Sale 50%" thumb_icon="icon-tag" image=""]<h2>Flash Sale</h2>[/swiper_thumb_item]
[swiper_thumb_item thumb_text="Freeship" thumb_icon="icon-truck" image=""]<h2>Miễn Phí Ship</h2>[/swiper_thumb_item]
[swiper_thumb_item thumb_text="Trả Góp 0%" thumb_icon="icon-credit-card" image=""]<h2>Trả Góp 0%</h2>[/swiper_thumb_item]
[/swiper_thumb_slider]',
        ),
    ),

    'options' => array(
        
        // Slider Settings
        'slider_settings' => array(
            'type'    => 'group',
            'heading' => __('Slider Settings', 'flatsome'),
            'options' => array(
                
                'height' => array(
                    'type'    => 'slider',
                    'heading' => __('Height (px)', 'flatsome'),
                    'default' => 450,
                    'min'     => 200,
                    'max'     => 800,
                    'step'    => 50,
                ),

                'auto_play' => array(
                    'type'    => 'slider',
                    'heading' => __('Auto Play (ms)', 'flatsome'),
                    'default' => 5000,
                    'min'     => 0,
                    'max'     => 10000,
                    'step'    => 1000,
                ),

                'speed' => array(
                    'type'    => 'slider',
                    'heading' => __('Transition Speed (ms)', 'flatsome'),
                    'default' => 600,
                    'min'     => 300,
                    'max'     => 2000,
                    'step'    => 100,
                ),

                'loop' => array(
                    'type'    => 'radio-buttons',
                    'heading' => __('Loop Slides', 'flatsome'),
                    'default' => 'true',
                    'options' => array(
                        'true'  => array('title' => __('Yes', 'flatsome')),
                        'false' => array('title' => __('No', 'flatsome')),
                    ),
                ),

                'effect' => array(
                    'type'    => 'select',
                    'heading' => __('Transition Effect', 'flatsome'),
                    'default' => 'slide',
                    'options' => array(
                        'slide'     => __('Slide', 'flatsome'),
                        'fade'      => __('Fade', 'flatsome'),
                        'cube'      => __('Cube', 'flatsome'),
                        'coverflow' => __('Coverflow', 'flatsome'),
                        'flip'      => __('Flip', 'flatsome'),
                    ),
                ),

                'space_between' => array(
                    'type'    => 'slider',
                    'heading' => __('Space Between Slides (px)', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 50,
                    'step'    => 5,
                ),
            ),
        ),

        // Thumbnail Settings
        'thumb_settings' => array(
            'type'    => 'group',
            'heading' => __('Thumbnail Settings', 'flatsome'),
            'options' => array(
                
                'thumbs_columns' => array(
                    'type'    => 'slider',
                    'heading' => __('Thumbnails Per View', 'flatsome'),
                    'default' => 3,
                    'min'     => 2,
                    'max'     => 6,
                ),

                'thumbs_space' => array(
                    'type'    => 'slider',
                    'heading' => __('Thumbnails Spacing (px)', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 30,
                    'step'    => 5,
                ),

                'active_color' => array(
                    'type'    => 'colorpicker',
                    'heading' => __('Active Thumbnail Color', 'flatsome'),
                    'default' => '#B31E1A',
                ),

                'inactive_color' => array(
                    'type'    => 'colorpicker',
                    'heading' => __('Inactive Thumbnail Color', 'flatsome'),
                    'default' => '#5A738C',
                ),
            ),
        ),

        // Style Settings
        'style_settings' => array(
            'type'    => 'group',
            'heading' => __('Style Settings', 'flatsome'),
            'options' => array(
                
                'border_radius' => array(
                    'type'    => 'slider',
                    'heading' => __('Border Radius (px)', 'flatsome'),
                    'default' => 10,
                    'min'     => 0,
                    'max'     => 30,
                ),

                'class' => array(
                    'type'        => 'textfield',
                    'heading'     => __('Custom Class', 'flatsome'),
                    'placeholder' => 'my-custom-class',
                    'default'     => '',
                ),
            ),
        ),
    ),
);
