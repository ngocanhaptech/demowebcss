<?php
/**
 * UX Builder integration
 *
 * @package Flatsome_Blog_Posts_Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Đăng ký ngay khi có thể
if ( function_exists( 'add_ux_builder_shortcode' ) ) {
    fbpp_register_ux_builder_element();
} else {
    add_action( 'init', 'fbpp_register_ux_builder_element', 5 );
}

function fbpp_register_ux_builder_element() {
    if ( ! function_exists( 'add_ux_builder_shortcode' ) ) {
        return;
    }

    $thumbnail = function_exists( 'flatsome_ux_builder_thumbnail' )
        ? flatsome_ux_builder_thumbnail( 'blog_posts' )
        : FBPP_URL . 'assets/img/placeholder.svg';

    $template = function_exists( 'flatsome_ux_builder_template' )
        ? flatsome_ux_builder_template( 'blog_posts' )
        : '';

    add_ux_builder_shortcode( 'ux_blog_posts', array(
        'name'      => __( 'Blog Posts Pro', 'flatsome-blog-posts-pro' ),
        'category'  => __( 'Content', 'flatsome-blog-posts-pro' ),
        'thumbnail' => $thumbnail,
        'template'  => $template,
        'wrap'      => false,
        'options'   => array(
            // === Post Type & Layout ===
            'post_type' => array(
                'type'    => 'select',
                'heading' => __( 'Post Type', 'flatsome-blog-posts-pro' ),
                'default' => 'post',
                'options' => fbpp_get_post_type_options(),
            ),
            'type' => array(
                'type'    => 'select',
                'heading' => __( 'Layout Type', 'flatsome-blog-posts-pro' ),
                'default' => 'row',
                'options' => array(
                    'row'     => 'Row',
                    'slider'  => 'Slider',
                    'masonry' => 'Masonry',
                    'grid'    => 'Grid',
                ),
            ),
            'style' => array(
                'type'    => 'select',
                'heading' => __( 'Style', 'flatsome-blog-posts-pro' ),
                'default' => 'normal',
                'options' => array(
                    'normal'   => 'Normal',
                    'vertical' => 'Vertical',
                    'bounce'   => 'Bounce',
                    'push'     => 'Push',
                    'overlay'  => 'Overlay',
                    'shade'    => 'Shade',
                    'badge'    => 'Badge',
                ),
            ),
            // === Columns ===
            'columns' => array(
                'type'       => 'slider',
                'heading'    => __( 'Columns (Desktop)', 'flatsome-blog-posts-pro' ),
                'default'    => '3',
                'max'        => '12',
                'min'        => '1',
                'responsive' => true,
            ),
            'columns__md' => array(
                'type'    => 'slider',
                'heading' => __( 'Columns (Tablet)', 'flatsome-blog-posts-pro' ),
                'default' => '',
                'max'     => '12',
                'min'     => '1',
            ),
            'columns__sm' => array(
                'type'    => 'slider',
                'heading' => __( 'Columns (Mobile)', 'flatsome-blog-posts-pro' ),
                'default' => '1',
                'max'     => '12',
                'min'     => '1',
            ),

            // === Grid Options ===
            'grid_section' => array(
                'type'       => 'group',
                'heading'    => __( 'Grid Options', 'flatsome-blog-posts-pro' ),
                'conditions' => 'type === "grid"',
                'options'    => array(
                    'grid' => array(
                        'type'    => 'select',
                        'heading' => __( 'Grid Style', 'flatsome-blog-posts-pro' ),
                        'default' => '1',
                        'options' => array_combine( range( 1, 14 ), range( 1, 14 ) ),
                    ),
                    'grid_height' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Grid Height', 'flatsome-blog-posts-pro' ),
                        'default' => '600px',
                    ),
                ),
            ),

            // === Slider Options ===
            'slider_section' => array(
                'type'       => 'group',
                'heading'    => __( 'Slider Options', 'flatsome-blog-posts-pro' ),
                'conditions' => 'type === "slider"',
                'options'    => array(
                    'slider_nav_style' => array(
                        'type'    => 'select',
                        'heading' => __( 'Nav Style', 'flatsome-blog-posts-pro' ),
                        'default' => 'reveal',
                        'options' => array(
                            'simple' => 'Simple',
                            'reveal' => 'Reveal',
                            'circle' => 'Circle',
                        ),
                    ),
                    'slider_bullets' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Show Bullets', 'flatsome-blog-posts-pro' ),
                        'default' => false,
                    ),
                    'auto_slide' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Auto Slide', 'flatsome-blog-posts-pro' ),
                        'default' => false,
                    ),
                    'infinitive' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Infinitive Loop', 'flatsome-blog-posts-pro' ),
                        'default' => true,
                    ),
                ),
            ),

            // === Query ===
            'query_section' => array(
                'type'    => 'group',
                'heading' => __( 'Query', 'flatsome-blog-posts-pro' ),
                'options' => array(
                    'posts' => array(
                        'type'    => 'scrubfield',
                        'heading' => __( 'Posts per page', 'flatsome-blog-posts-pro' ),
                        'default' => '8',
                        'min'     => '1',
                        'max'     => '50',
                    ),
                    'orderby' => array(
                        'type'    => 'select',
                        'heading' => __( 'Order By', 'flatsome-blog-posts-pro' ),
                        'default' => 'date',
                        'options' => array(
                            'date'          => 'Date',
                            'title'         => 'Title',
                            'modified'      => 'Modified',
                            'comment_count' => 'Comment Count',
                            'rand'          => 'Random',
                        ),
                    ),
                    'order' => array(
                        'type'    => 'select',
                        'heading' => __( 'Order', 'flatsome-blog-posts-pro' ),
                        'default' => 'DESC',
                        'options' => array(
                            'DESC' => 'Descending',
                            'ASC'  => 'Ascending',
                        ),
                    ),
                    'author' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Author IDs (comma separated)', 'flatsome-blog-posts-pro' ),
                        'default' => '',
                    ),
                    'cat' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Category IDs/Slugs', 'flatsome-blog-posts-pro' ),
                        'default' => '',
                    ),
                ),
            ),

            // === Filter Bar ===
            'filter_section' => array(
                'type'    => 'group',
                'heading' => __( 'Frontend Filter Bar', 'flatsome-blog-posts-pro' ),
                'options' => array(
                    'show_filter_bar' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Show Filter Bar', 'flatsome-blog-posts-pro' ),
                        'default' => true,
                    ),
                    'filter_style' => array(
                        'type'       => 'select',
                        'heading'    => __( 'Filter Style', 'flatsome-blog-posts-pro' ),
                        'default'    => 'tabs',
                        'options'    => array(
                            'tabs'     => 'Tabs',
                            'dropdown' => 'Dropdown',
                            'inline'   => 'Inline',
                        ),
                        'conditions' => 'show_filter_bar === "true"',
                    ),
                    'filter_align' => array(
                        'type'       => 'radio-buttons',
                        'heading'    => __( 'Filter Alignment', 'flatsome-blog-posts-pro' ),
                        'default'    => 'center',
                        'options'    => array(
                            'left'   => 'Left',
                            'center' => 'Center',
                            'right'  => 'Right',
                        ),
                        'conditions' => 'show_filter_bar === "true"',
                    ),
                ),
            ),

            // === Post Options ===
            'post_options' => array(
                'type'    => 'group',
                'heading' => __( 'Post Options', 'flatsome-blog-posts-pro' ),
                'options' => array(
                    'show_category' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Show Category', 'flatsome-blog-posts-pro' ),
                        'default' => false,
                    ),
                    'show_date' => array(
                        'type'    => 'select',
                        'heading' => __( 'Show Date', 'flatsome-blog-posts-pro' ),
                        'default' => 'badge',
                        'options' => array(
                            'false' => 'Hide',
                            'badge' => 'Badge',
                            'text'  => 'Text',
                        ),
                    ),
                    'show_excerpt' => array(
                        'type'    => 'checkbox',
                        'heading' => __( 'Show Excerpt', 'flatsome-blog-posts-pro' ),
                        'default' => true,
                    ),
                    'excerpt_length' => array(
                        'type'       => 'scrubfield',
                        'heading'    => __( 'Excerpt Length', 'flatsome-blog-posts-pro' ),
                        'default'    => '15',
                        'min'        => '5',
                        'max'        => '100',
                        'conditions' => 'show_excerpt === "true"',
                    ),
                    'readmore' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Read more text', 'flatsome-blog-posts-pro' ),
                        'default' => '',
                    ),
                ),
            ),

            // === Advanced ===
            'advanced_section' => array(
                'type'    => 'group',
                'heading' => __( 'Advanced', 'flatsome-blog-posts-pro' ),
                'options' => array(
                    'class' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'CSS Class', 'flatsome-blog-posts-pro' ),
                        'default' => '',
                    ),
                    'visibility' => array(
                        'type'    => 'select',
                        'heading' => __( 'Visibility', 'flatsome-blog-posts-pro' ),
                        'default' => '',
                        'options' => array(
                            ''                      => 'Always visible',
                            'hide-for-small'        => 'Hide for mobile',
                            'show-for-small'        => 'Show for mobile',
                            'hide-for-medium'       => 'Hide for tablet',
                            'show-for-medium'       => 'Show for tablet',
                            'show-for-large'        => 'Show for desktop',
                            'hide-for-large'        => 'Hide for desktop',
                        ),
                    ),
                ),
            ),
        ),
    ));
}