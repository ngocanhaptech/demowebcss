<?php

function ux_team_members( $atts, $content = null, $tag = '' ) {
    $defined_atts = $atts;

    extract( $atts = shortcode_atts( array(
        // Meta / Query
        'posts'       => 8,
        '_id'         => 'team-' . rand(),
        'ids'         => '',
        'orderby'     => 'menu_order',
        'order'       => 'ASC',
        'offset'      => '',
        'class'       => '',
        'visibility'  => '',
        'team_cat'    => '',
        'page_number' => 1,

        // Layout
        'style'           => 'badge',
        'columns'         => '4',
        'columns__sm'     => '',
        'columns__md'     => '',
        'col_spacing'     => 'small',
        'type'            => 'slider', // slider, row, masonery, grid
        'width'           => '',
        'grid'            => '1',
        'grid_height'     => '600px',
        'grid_height__md' => '500px',
        'grid_height__sm' => '400px',
        'slider_nav_style'    => 'reveal',
        'slider_nav_color'    => '',
        'slider_nav_position' => '',
        'slider_bullets'      => 'false',
        'slider_arrows'       => 'true',
        'auto_slide'          => 'false',
        'infinitive'          => 'true',
        'depth'               => '',
        'depth_hover'         => '',

        // Relay
        'relay'                      => '',
        'relay_control_result_count' => 'true',
        'relay_control_position'     => 'bottom',
        'relay_control_align'        => 'center',
        'relay_id'                   => '',
        'relay_class'                => '',

        // Box / text / image
        'animate'      => '',
        'text_pos'     => 'bottom',
        'text_padding' => '',
        'text_bg'      => '',
        'text_color'   => '',
        'text_hover'   => '',
        'text_align'   => 'center',
        'text_size'    => '',

        'image_size'      => 'medium',
        'image_width'     => '',
        'image_hover'     => '',
        'image_hover_alt' => '',
        'image_radius'    => '',
        'image_height'    => '56%',
        'image_overlay'   => '',

        // Title & excerpt
        'title_size'     => 'large',
        'title_style'    => '',
        'excerpt'        => 'visible',
        'excerpt_length' => 15,
    ), $atts ) );

    // Ẩn nếu visibility = hidden
    if ( $visibility === 'hidden' ) {
        return '';
    }

    // Nếu gọi bằng [ux_team_members_grid] thì ép dạng grid
    if ( $tag === 'ux_team_members_grid' ) {
        $type = 'grid';
    }

    ob_start();

    $classes_box   = array( 'box', 'box-team', 'has-hover' );
    $classes_image = array();
    $classes_text  = array();

    // Chuẩn style overlay giống blog_posts
    if ( $style === 'text-overlay' ) {
        $image_hover = 'zoom';
    }
    $style = str_replace( 'text-', '', $style );

    // Grid
    if ( $type === 'grid' ) {
        if ( ! $text_pos ) {
            $text_pos = 'center';
        }
        $columns      = 0;
        $current_grid = 0;
        $grid         = flatsome_get_grid( $grid );
        $grid_total   = count( $grid );
        flatsome_get_grid_height( $grid_height, $_id );
    }

    // Overlay mặc định
    if ( $style === 'overlay' && ! $image_overlay ) {
        $image_overlay = 'rgba(0,0,0,.25)';
    }

    // Box classes
    if ( $style )                    $classes_box[] = 'box-' . $style;
    if ( $style === 'overlay' || $style === 'shade' ) $classes_box[] = 'dark';
    if ( $style === 'badge' )        $classes_box[] = 'hover-dark';
    if ( $text_pos )                 $classes_box[] = 'box-text-' . $text_pos;

    // Image classes
    if ( $image_hover )      $classes_image[] = 'image-' . $image_hover;
    if ( $image_hover_alt )  $classes_image[] = 'image-' . $image_hover_alt;
    if ( $image_height )     $classes_image[] = 'image-cover';

    // Text classes
    if ( $text_hover )       $classes_text[] = 'show-on-hover hover-' . $text_hover;
    if ( $text_align )       $classes_text[] = 'text-' . $text_align;
    if ( $text_size )        $classes_text[] = 'is-' . $text_size;
    if ( $text_color === 'dark' ) $classes_text[] = 'dark';

    // Inline CSS
    $css_args_img = array(
        array( 'attribute' => 'border-radius', 'value' => $image_radius, 'unit' => '%' ),
        array( 'attribute' => 'width',         'value' => $image_width,  'unit' => '%' ),
    );

    $css_image_height = array(
        array( 'attribute' => 'padding-top', 'value' => $image_height ),
    );

    $css_args = array(
        array( 'attribute' => 'background-color', 'value' => $text_bg ),
        array( 'attribute' => 'padding',          'value' => $text_padding ),
    );

    // Animation attribute
    if ( $animate ) {
        $animate = 'data-animate="' . esc_attr( $animate ) . '"';
    }

    $classes_text  = implode( ' ', $classes_text );
    $classes_image = implode( ' ', $classes_image );
    $classes_box   = implode( ' ', $classes_box );

    // Repeater config
    $repeater                 = array();
    $repeater['id']           = $_id;
    $repeater['class']        = $class;
    $repeater['visibility']   = $visibility;
    $repeater['tag']          = $tag;
    $repeater['type']         = $type;
    $repeater['style']        = $style;
    $repeater['format']       = $image_height;
    $repeater['slider_style'] = $slider_nav_style;
    $repeater['slider_nav_color']    = $slider_nav_color;
    $repeater['slider_nav_position'] = $slider_nav_position;
    $repeater['slider_bullets']      = $slider_bullets;
    $repeater['auto_slide']  = $auto_slide;
    $repeater['infinitive']  = $infinitive;
    $repeater['row_spacing'] = $col_spacing;
    $repeater['row_width']   = $width;
    $repeater['columns']     = $columns;
    $repeater['columns__sm'] = $columns__sm;
    $repeater['columns__md'] = $columns__md;
    $repeater['depth']       = $depth;
    $repeater['depth_hover'] = $depth_hover;

    // Offset + paging
    if ( ! empty( $offset ) ) {
        $found_posts_filter_callback = function ( $found_posts, $query ) use ( $offset ) {
            return $found_posts - (int) $offset;
        };
        add_filter( 'found_posts', $found_posts_filter_callback, 1, 2 );
    }

    $offset = (int) $page_number > 1
        ? (int) $offset + ( (int) $page_number - 1 ) * (int) $posts
        : $offset;

    // Query CPT team_member
    $query_args = array(
        'post_type'           => 'team_member',
        'posts_per_page'      => (int) $posts,
        'orderby'             => $orderby,
        'order'               => $order,
        'offset'              => $offset ? (int) $offset : 0,
        'post_status'         => 'publish',
        'ignore_sticky_posts' => true,
        'paged'               => (int) $page_number,
    );

    // Lọc theo taxonomy team_category
    if ( ! empty( $team_cat ) ) {
        $query_args['tax_query'] = array(
            array(
                'taxonomy' => 'team_category',
                'field'    => 'slug',
                'terms'    => array_map( 'trim', explode( ',', $team_cat ) ),
            ),
        );
    }

    // Custom IDs
    if ( ! empty( $ids ) ) {
        $ids_array = array_map( 'absint', array_filter( array_map( 'trim', explode( ',', $ids ) ) ) );
        if ( $ids_array ) {
            $query_args = array(
                'post__in'           => $ids_array,
                'post_type'          => array( 'team_member' ),
                'numberposts'        => -1,
                'orderby'            => 'post__in',
                'posts_per_page'     => 9999,
                'ignore_sticky_posts'=> true,
            );
        }
    }

    $q = new WP_Query( $query_args );

    if ( isset( $found_posts_filter_callback ) ) {
        remove_filter( 'found_posts', $found_posts_filter_callback, 1 );
    }

    if ( ! $q->have_posts() ) {
        ob_end_clean();
        return '';
    }

    // Nếu có Flatsome_Relay, mở container
    if ( class_exists( 'Flatsome_Relay' ) ) {
        Flatsome_Relay::render_container_open( $q, $tag, $defined_atts, $atts );
    }

    if ( $type === 'grid' ) {
        flatsome_get_grid_height( $grid_height, $_id );
    }

    get_flatsome_repeater_start( $repeater );

    while ( $q->have_posts() ) {
        $q->the_post();

        $classes_col  = array( 'team-member', 'col' );
        $show_excerpt = $excerpt;

        // Grid mapping
        if ( $type === 'grid' ) {
            if ( $grid_total > $current_grid ) {
                $current_grid++;
            }
            $current       = $current_grid - 1;
            $classes_col[] = 'grid-col';

            if ( ! empty( $grid[ $current ]['height'] ) ) $classes_col[] = 'grid-col-' . $grid[ $current ]['height'];
            if ( ! empty( $grid[ $current ]['span'] ) )   $classes_col[] = 'large-' . $grid[ $current ]['span'];
            if ( ! empty( $grid[ $current ]['md'] ) )     $classes_col[] = 'medium-' . $grid[ $current ]['md'];

            if ( ! empty( $grid[ $current ]['size'] ) ) {
                $image_size = $grid[ $current ]['size'];
                if ( $grid[ $current ]['size'] === 'thumbnail' ) {
                    $show_excerpt = 'false';
                }
            }
        }

        // Ảnh đại diện
        if ( has_post_thumbnail() ) {
            $image_tag = get_the_post_thumbnail( null, $image_size );
        } else {
            $image_tag = '<div class="team-no-image"></div>';
        }
        
        $position = get_post_meta( get_the_ID(), '_ux_team_position', true );

        // Lấy team category (taxonomy: team_category)
        $team_terms = get_the_terms( get_the_ID(), 'team_category' );
        $team_cats  = array();
        
        if ( ! is_wp_error( $team_terms ) && ! empty( $team_terms ) ) {
            foreach ( $team_terms as $term ) {
                $team_cats[] = $term->name;
            }
        }

        $position = get_post_meta( get_the_ID(), '_ux_team_position', true );
        ?>
        <div class="<?php echo esc_attr( implode( ' ', $classes_col ) ); ?>" <?php echo $animate; ?>>
            <div class="col-inner">
                <div class="box <?php echo esc_attr( $classes_box ); ?>">
                    <div class="box-image" <?php echo get_shortcode_inline_css( $css_args_img ); ?>>
                        <div class="<?php echo esc_attr( $classes_image ); ?>" <?php echo get_shortcode_inline_css( $css_image_height ); ?>>
                            <a href="<?php the_permalink(); ?>" class="plain" aria-label="<?php echo esc_attr( get_the_title() ); ?>">
                                <?php echo $image_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                            </a>
                            <?php if ( $image_overlay ) : ?>
                                <div class="overlay" style="background-color: <?php echo esc_attr( $image_overlay ); ?>"></div>
                            <?php endif; ?>
                            <?php if ( $style === 'shade' ) : ?>
                                <div class="shade"></div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="box-text <?php echo esc_attr( $classes_text ); ?>" <?php echo get_shortcode_inline_css( $css_args ); ?>>
                        <div class="box-text-inner team-post-inner">
                            <h3 class="post-title is-<?php echo esc_attr( $title_size ); ?> <?php echo esc_attr( $title_style ); ?>">
                                <a href="<?php the_permalink(); ?>" class="plain"><?php the_title(); ?></a>
                            </h3>
                            
                            <?php if ( ! empty( $team_cats ) ) : ?>
                                <p class="is-xsmall team-category">
                                    <?php echo esc_html( implode( ', ', $team_cats ) ); ?>
                                </p>
                            <?php endif; ?>
                            
                            <div class="is-divider"></div>



                            <?php if ( $position ) : ?>
                                <p class="is-xsmall uppercase team-position">
                                    <?php echo esc_html( $position ); ?>
                                </p>
                            <?php endif; ?>

                            <div class="is-divider"></div>

                            <?php if ( $show_excerpt !== 'false' ) : ?>
                                <p class="team-excerpt <?php echo $show_excerpt !== 'visible' ? 'show-on-hover hover-' . esc_attr( $show_excerpt ) : ''; ?>">
                                    <?php echo flatsome_get_the_excerpt( $excerpt_length ); ?>
                                </p>
                            <?php endif; ?>
                            <a href="<?php the_permalink(); ?>" class="readmore readmore-icon" aria-label="<?php echo esc_attr( get_the_title() ); ?>"><span>Xem thêm</span></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    wp_reset_postdata();

    get_flatsome_repeater_end( $repeater );

    if ( class_exists( 'Flatsome_Relay' ) ) {
        Flatsome_Relay::render_container_close();
    }

    $content = ob_get_clean();
    return $content;
}

add_shortcode( 'ux_team_members',      'ux_team_members' );
