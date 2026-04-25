<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * UX Builder element: Team Members (ux_team_members)
 *
 * Kết nối với shortcode:
 * - [ux_team_members]
 * - [ux_team_members_grid]
 *
 * Yêu cầu:
 * - Flatsome + UX Builder đang active.
 * - Hàm add_ux_builder_shortcode() tồn tại.
 */

if ( ! function_exists( 'add_ux_builder_shortcode' ) ) {
    return;
}

add_ux_builder_shortcode(
    'ux_team_members',
    array(
        'type'     => 'container',
        'name'     => __( 'Team Members', 'ux_team_member' ),
        'category' => __( 'Content', 'ux_team_member' ),
        'info'     => __( 'Grid / Slider of Team Members CPT', 'ux_team_member' ),
        'wrap'     => false,

        // Presets mẫu
        'presets'  => array(
            array(
                'name'    => __( 'Grid 4 Columns', 'ux_team_member' ),
                'content' => '[ux_team_members type="row" style="badge" columns="4" image_size="medium"]',
            ),
            array(
                'name'    => __( 'Slider 4 Columns', 'ux_team_member' ),
                'content' => '[ux_team_members type="slider" style="badge" columns="4" auto_slide="false" image_size="medium"]',
            ),
        ),

        'options'  => array(

            // CONTENT
            'content_tab' => array(
                'type'    => 'group',
                'heading' => __( 'Content', 'ux_team_member' ),
                'options' => array(

                    'posts' => array(
                        'type'        => 'scrubfield',
                        'heading'     => __( 'Number of members', 'ux_team_member' ),
                        'default'     => 8,
                        'min'         => -1,
                        'max'         => 100,
                        'step'        => 1,
                        'description' => __( '-1 = All team members', 'ux_team_member' ),
                    ),

                    'ids' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Include IDs', 'ux_team_member' ),
                        'description' => __( 'Comma-separated team_member IDs. If set, only these members are shown (and ordered accordingly).', 'ux_team_member' ),
                    ),

                    'orderby' => array(
                        'type'    => 'select',
                        'heading' => __( 'Order by', 'ux_team_member' ),
                        'default' => 'menu_order',
                        'options' => array(
                            'menu_order' => __( 'Menu order', 'ux_team_member' ),
                            'date'       => __( 'Date', 'ux_team_member' ),
                            'title'      => __( 'Title', 'ux_team_member' ),
                            'rand'       => __( 'Random', 'ux_team_member' ),
                        ),
                    ),

                    'order' => array(
                        'type'    => 'select',
                        'heading' => __( 'Sort order', 'ux_team_member' ),
                        'default' => 'ASC',
                        'options' => array(
                            'ASC'  => __( 'Ascending', 'ux_team_member' ),
                            'DESC' => __( 'Descending', 'ux_team_member' ),
                        ),
                    ),

                    'offset' => array(
                        'type'    => 'scrubfield',
                        'heading' => __( 'Offset', 'ux_team_member' ),
                        'default' => 0,
                        'min'     => 0,
                        'step'    => 1,
                    ),
                    
                    'team_cat' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Team categories (slugs)', 'ux_team_member' ),
                        'description' => __( 'Comma-separated team_category slugs to filter members.', 'ux_team_member' ),
                    ),
                ),
            ),

            // LAYOUT
            'layout_tab' => array(
                'type'    => 'group',
                'heading' => __( 'Layout', 'ux_team_member' ),
                'options' => array(

                    'type' => array(
                        'type'    => 'select',
                        'heading' => __( 'Type', 'ux_team_member' ),
                        'default' => 'slider',
                        'options' => array(
                            'slider'   => __( 'Slider', 'ux_team_member' ),
                            'row'      => __( 'Row', 'ux_team_member' ),
                            'grid'     => __( 'Grid', 'ux_team_member' ),
                            'masonery' => __( 'Masonry', 'ux_team_member' ),
                        ),
                    ),

                    'style' => array(
                        'type'    => 'select',
                        'heading' => __( 'Box style', 'ux_team_member' ),
                        'default' => 'badge',
                        'options' => array(
                            'badge'   => __( 'Badge', 'ux_team_member' ),
                            'overlay' => __( 'Overlay', 'ux_team_member' ),
                            'shade'   => __( 'Shade', 'ux_team_member' ),
                            'simple'  => __( 'Simple', 'ux_team_member' ),
                        ),
                    ),

                    'columns' => array(
                        'type'    => 'select',
                        'heading' => __( 'Columns', 'ux_team_member' ),
                        'default' => '4',
                        'options' => array(
                            '1' => '1',
                            '2' => '2',
                            '3' => '3',
                            '4' => '4',
                            '5' => '5',
                            '6' => '6',
                        ),
                    ),

                    'columns__md' => array(
                        'type'    => 'select',
                        'heading' => __( 'Columns (tablet)', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''  => __( 'Inherit', 'ux_team_member' ),
                            '1' => '1',
                            '2' => '2',
                            '3' => '3',
                            '4' => '4',
                        ),
                    ),

                    'columns__sm' => array(
                        'type'    => 'select',
                        'heading' => __( 'Columns (mobile)', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''  => __( 'Inherit', 'ux_team_member' ),
                            '1' => '1',
                            '2' => '2',
                            '3' => '3',
                        ),
                    ),

                    'col_spacing' => array(
                        'type'    => 'select',
                        'heading' => __( 'Column spacing', 'ux_team_member' ),
                        'default' => 'small',
                        'options' => array(
                            'xsmall' => __( 'Extra small', 'ux_team_member' ),
                            'small'  => __( 'Small', 'ux_team_member' ),
                            'medium' => __( 'Medium', 'ux_team_member' ),
                            'large'  => __( 'Large', 'ux_team_member' ),
                        ),
                    ),

                    'width' => array(
                        'type'    => 'select',
                        'heading' => __( 'Row width', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''           => __( 'Default', 'ux_team_member' ),
                            'full-width' => __( 'Full width', 'ux_team_member' ),
                            'large'      => __( 'Large', 'ux_team_member' ),
                        ),
                    ),

                    'grid' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Grid preset', 'ux_team_member' ),
                        'default'     => '1',
                        'conditions'  => 'type === "grid"',
                    ),

                    'grid_height' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Grid height (desktop)', 'ux_team_member' ),
                        'default'     => '600px',
                        'conditions'  => 'type === "grid"',
                    ),

                    'grid_height__md' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Grid height (tablet)', 'ux_team_member' ),
                        'default'     => '500px',
                        'conditions'  => 'type === "grid"',
                    ),

                    'grid_height__sm' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Grid height (mobile)', 'ux_team_member' ),
                        'default'     => '400px',
                        'conditions'  => 'type === "grid"',
                    ),
                ),
            ),
            
            // ── RELAY (AJAX PAGINATION) ───────────────────────────
            'relay_tab' => array(
                'type'    => 'group',
                'heading' => __( 'Relay (Ajax pagination)', 'ux_team_member' ),
                'options' => array(
    
                    'relay' => array(
                        'type'    => 'select',
                        'heading' => __( 'Relay mode', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''           => __( 'None',                    'ux_team_member' ),
                            'pagination' => __( 'Page numbers (Ajax)',     'ux_team_member' ),
                            'load-more'  => __( 'Load more button (Ajax)', 'ux_team_member' ),
                            'prev-next'  => __( 'Prev/Next (Ajax)',        'ux_team_member' ),
                        ),
                    ),
    
                    'relay_control_position' => array(
                        'type'    => 'select',
                        'heading' => __( 'Control position', 'ux_team_member' ),
                        'default' => 'bottom',
                        'options' => array(
                            'top'        => __( 'Top',          'ux_team_member' ),
                            'bottom'     => __( 'Bottom',       'ux_team_member' ),
                            'top-bottom' => __( 'Top & Bottom', 'ux_team_member' ),
                        ),
                    ),
    
                    'relay_control_align' => array(
                        'type'    => 'select',
                        'heading' => __( 'Control alignment', 'ux_team_member' ),
                        'default' => 'center',
                        'options' => array(
                            'left'   => __( 'Left',   'ux_team_member' ),
                            'center' => __( 'Center', 'ux_team_member' ),
                            'right'  => __( 'Right',  'ux_team_member' ),
                        ),
                    ),
    
                    'relay_control_result_count' => array(
                        'type'       => 'select',
                        'heading'    => __( 'Show result count', 'ux_team_member' ),
                        'default'    => 'false',
                        'conditions' => 'relay === "load-more"',
                        'options'    => array(
                            'false' => __( 'No',  'ux_team_member' ),
                            'true'  => __( 'Yes', 'ux_team_member' ),
                        ),
                    ),
                ),
            ),

            // SLIDER
            'slider_tab' => array(
                'type'       => 'group',
                'heading'    => __( 'Slider options', 'ux_team_member' ),
                'conditions' => 'type === "slider"',
                'options'    => array(

                    'slider_nav_style' => array(
                        'type'    => 'select',
                        'heading' => __( 'Nav style', 'ux_team_member' ),
                        'default' => 'reveal',
                        'options' => array(
                            'reveal' => __( 'Reveal', 'ux_team_member' ),
                            'simple' => __( 'Simple', 'ux_team_member' ),
                        ),
                    ),

                    'slider_nav_position' => array(
                        'type'    => 'select',
                        'heading' => __( 'Nav position', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''        => __( 'Default', 'ux_team_member' ),
                            'inside'  => __( 'Inside', 'ux_team_member' ),
                            'outside' => __( 'Outside', 'ux_team_member' ),
                        ),
                    ),

                    'slider_nav_color' => array(
                        'type'    => 'select',
                        'heading' => __( 'Nav color', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''      => __( 'Default', 'ux_team_member' ),
                            'dark'  => __( 'Dark', 'ux_team_member' ),
                            'light' => __( 'Light', 'ux_team_member' ),
                        ),
                    ),

                    'slider_bullets' => array(
                        'type'    => 'select',
                        'heading' => __( 'Bullets', 'ux_team_member' ),
                        'default' => 'false',
                        'options' => array(
                            'false' => __( 'Hide', 'ux_team_member' ),
                            'true'  => __( 'Show', 'ux_team_member' ),
                        ),
                    ),

                    'auto_slide' => array(
                        'type'    => 'select',
                        'heading' => __( 'Auto slide', 'ux_team_member' ),
                        'default' => 'false',
                        'options' => array(
                            'false' => __( 'No', 'ux_team_member' ),
                            'true'  => __( 'Yes', 'ux_team_member' ),
                        ),
                    ),

                    'infinitive' => array(
                        'type'    => 'select',
                        'heading' => __( 'Infinite loop', 'ux_team_member' ),
                        'default' => 'true',
                        'options' => array(
                            'true'  => __( 'Yes', 'ux_team_member' ),
                            'false' => __( 'No', 'ux_team_member' ),
                        ),
                    ),
                ),
            ),

            // DESIGN (box, image, text)
            'design_tab' => array(
                'type'    => 'group',
                'heading' => __( 'Design', 'ux_team_member' ),
                'options' => array(

                    'animate' => array(
                        'type'    => 'select',
                        'heading' => __( 'Animation', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''           => __( 'None', 'ux_team_member' ),
                            'fade-in'    => 'Fade in',
                            'slide-up'   => 'Slide up',
                            'bounce-in'  => 'Bounce in',
                        ),
                    ),

                    'text_pos' => array(
                        'type'    => 'select',
                        'heading' => __( 'Text position', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''         => __( 'Default', 'ux_team_member' ),
                            'center'   => __( 'Center', 'ux_team_member' ),
                            'bottom'   => __( 'Bottom', 'ux_team_member' ),
                        ),
                    ),

                    'text_align' => array(
                        'type'    => 'select',
                        'heading' => __( 'Text align', 'ux_team_member' ),
                        'default' => 'center',
                        'options' => array(
                            'left'   => __( 'Left', 'ux_team_member' ),
                            'center' => __( 'Center', 'ux_team_member' ),
                            'right'  => __( 'Right', 'ux_team_member' ),
                        ),
                    ),

                    'text_size' => array(
                        'type'    => 'select',
                        'heading' => __( 'Text size', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''        => __( 'Default', 'ux_team_member' ),
                            'small'   => __( 'Small', 'ux_team_member' ),
                            'medium'  => __( 'Medium', 'ux_team_member' ),
                            'large'   => __( 'Large', 'ux_team_member' ),
                        ),
                    ),

                    'text_bg' => array(
                        'type'    => 'colorpicker',
                        'heading' => __( 'Text background', 'ux_team_member' ),
                        'default' => '',
                    ),

                    'text_padding' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Text padding', 'ux_team_member' ),
                        'default' => '',
                    ),

                    'text_color' => array(
                        'type'    => 'select',
                        'heading' => __( 'Text color scheme', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''      => __( 'Default', 'ux_team_member' ),
                            'dark'  => __( 'Dark', 'ux_team_member' ),
                        ),
                    ),

                    'text_hover' => array(
                        'type'    => 'select',
                        'heading' => __( 'Text hover effect', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''          => __( 'None', 'ux_team_member' ),
                            'fade-in'   => 'Fade in',
                            'slide-up'  => 'Slide up',
                        ),
                    ),

                    'image_size' => array(
                        'type'    => 'select',
                        'heading' => __( 'Image size', 'ux_team_member' ),
                        'default' => 'medium',
                        'options' => array(
                            'thumbnail' => 'Thumbnail',
                            'medium'    => 'Medium',
                            'large'     => 'Large',
                            'full'      => 'Full',
                        ),
                    ),

                    'image_width' => array(
                        'type'    => 'scrubfield',
                        'heading' => __( 'Image width (%)', 'ux_team_member' ),
                        'default' => '',
                        'min'     => 10,
                        'max'     => 100,
                        'step'    => 1,
                    ),

                    'image_height' => array(
                        'type'    => 'textfield',
                        'heading' => __( 'Image height (ratio padding-top, e.g. 75%)', 'ux_team_member' ),
                        'default' => '',
                    ),

                    'image_radius' => array(
                        'type'    => 'scrubfield',
                        'heading' => __( 'Image border radius (%)', 'ux_team_member' ),
                        'default' => '',
                        'min'     => 0,
                        'max'     => 50,
                        'step'    => 1,
                    ),

                    'image_hover' => array(
                        'type'    => 'select',
                        'heading' => __( 'Image hover', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''          => __( 'None', 'ux_team_member' ),
                            'zoom'      => __( 'Zoom', 'ux_team_member' ),
                            'fade-in'   => 'Fade in',
                        ),
                    ),

                    'image_hover_alt' => array(
                        'type'    => 'select',
                        'heading' => __( 'Image hover (alt)', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''          => __( 'None', 'ux_team_member' ),
                            'zoom-long' => __( 'Zoom long', 'ux_team_member' ),
                        ),
                    ),

                    'image_overlay' => array(
                        'type'    => 'colorpicker',
                        'heading' => __( 'Image overlay color', 'ux_team_member' ),
                        'default' => '',
                    ),
                ),
            ),

            // ADVANCED
            'advanced_tab' => array(
                'type'    => 'group',
                'heading' => __( 'Advanced', 'ux_team_member' ),
                'options' => array(

                    'class' => array(
                        'type'        => 'textfield',
                        'heading'     => __( 'Custom class', 'ux_team_member' ),
                        'default'     => '',
                        'placeholder' => 'my-team-class',
                    ),

                    'visibility' => array(
                        'type'    => 'select',
                        'heading' => __( 'Visibility', 'ux_team_member' ),
                        'default' => '',
                        'options' => array(
                            ''   => __( 'Visible', 'ux_team_member' ),
                            'hidden'  => __( 'Hidden', 'ux_team_member' ),
                            'hide-for-medium'  => __( 'Only for Desktop', 'ux_team_member' ),
                            'show-for-small'   => __( 'Only for Mobile', 'ux_team_member' ),
                            'show-for-medium hide-for-small' => __( 'Only for Tablet', 'ux_team_member' ),
                            'show-for-medium'  => __( 'Hide for Desktop', 'ux_team_member' ),
                            'hide-for-small'   => __( 'Hide for Mobile', 'ux_team_member' ),
                        ),
                    ),
                ),
            ),
        ),
    )
);
