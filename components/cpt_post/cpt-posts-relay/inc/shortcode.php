<?php
defined( 'ABSPATH' ) || exit;

/**
 * Shortcode [cpt_posts]
 *
 * Sử dụng:
 * [cpt_posts post_type="portfolio" posts="6" relay="pagination"
 *            filter_author="true" filter_order="true"
 *            show_filter="true"]
 */
function cpt_posts_shortcode( $atts, $content = null, $tag = '' ) {

    $defined_atts = (array) $atts;

    // Giữ _id nếu đã được truyền (relay Ajax sẽ truyền lại)
    $default_id = ! empty( $atts['_id'] ) ? $atts['_id'] : 'cpt-' . wp_rand();

    extract( $atts = shortcode_atts( array(
        '_id'        => $default_id,
        'class'      => '',
        'visibility' => '',

        // ── Post Type ────────────────────────────────────────────
        'post_type'  => 'post',   // Bất kỳ CPT nào: 'portfolio', 'product', 'event'...
        'post_status'=> 'publish',

        // ── Layout ───────────────────────────────────────────────
        'type'        => 'row',   // row | slider | masonry | grid
        'columns'     => '3',
        'columns__md' => '2',
        'columns__sm' => '1',
        'col_spacing' => '',
        'width'       => '',

        // Slider options
        'slider_nav_style'    => 'reveal',
        'slider_nav_position' => '',
        'slider_nav_color'    => '',
        'slider_bullets'      => 'false',
        'slider_arrows'       => 'true',
        'auto_slide'          => 'false',
        'infinitive'          => 'true',
        'depth'               => '',
        'depth_hover'         => '',

        // Grid options
        'grid'            => '1',
        'grid_height'     => '600px',
        'grid_height__md' => '500px',
        'grid_height__sm' => '400px',

        // ── Relay (Pagination) ────────────────────────────────────
        'relay'                      => '',        // pagination | load-more | prev-next
        'relay_control_result_count' => 'true',
        'relay_control_position'     => 'bottom',  // top | bottom | top-bottom
        'relay_control_align'        => 'center',
        'relay_id'                   => '',
        'relay_class'                => '',

        // ── Query ─────────────────────────────────────────────────
        'posts'       => '6',
        'ids'         => '',
        'cat'         => '',
        'tags'        => '',
        'tax_query'   => '',          // JSON string, ví dụ: '[{"taxonomy":"genre","field":"slug","terms":"action"}]'
        'meta_key'    => '',
        'offset'      => '',
        'orderby'     => 'date',     // date | title | menu_order | rand | meta_value
        'order'       => 'DESC',     // DESC | ASC
        'page_number' => '1',
        'author'      => '',         // user_nicename hoặc ID

        // ── Filter Bar ────────────────────────────────────────────
        'show_filter'   => 'false',  // Bật/tắt toàn bộ filter bar
        'filter_author' => 'true',   // Hiện dropdown tác giả
        'filter_order'  => 'true',   // Hiện dropdown sắp xếp

        // ── Display ───────────────────────────────────────────────
        'excerpt'        => 'visible',
        'excerpt_length' => 15,
        'show_date'      => 'badge',  // badge | text | false
        'badge_style'    => '',
        'show_category'  => 'false',
        'show_author'    => 'false',  // Hiện tên tác giả trong card
        'comments'       => 'false',
        'post_icon'      => 'true',

        // Read more
        'readmore'       => '',
        'readmore_color' => '',
        'readmore_style' => 'outline',
        'readmore_size'  => 'small',

        // Title
        'title_size'  => 'large',
        'title_style' => '',

        // Box styles
        'style'             => '',
        'animate'           => '',
        'text_pos'          => 'bottom',
        'text_padding'      => '',
        'text_bg'           => '',
        'text_size'         => '',
        'text_color'        => '',
        'text_hover'        => '',
        'text_align'        => 'center',
        'image_size'        => 'medium',
        'image_width'       => '',
        'image_radius'      => '',
        'image_height'      => '56%',
        'image_hover'       => '',
        'image_hover_alt'   => '',
        'image_overlay'     => '',
        'image_depth'       => '',
        'image_depth_hover' => '',
    ), $atts ) );

    if ( $visibility === 'hidden' ) return '';

    // ── Build classes ─────────────────────────────────────────────
    ob_start();

    $classes_box   = array();
    $classes_image = array();
    $classes_text  = array();

    $style_clean = str_replace( 'text-', '', $style );
    if ( $style === 'text-overlay' ) $image_hover = 'zoom';

    if ( $style_clean === 'overlay' && ! $image_overlay ) $image_overlay = 'rgba(0,0,0,.25)';

    if ( $style_clean )               $classes_box[] = 'box-' . $style_clean;
    if ( $style_clean === 'overlay' ) $classes_box[] = 'dark';
    if ( $style_clean === 'shade' )   $classes_box[] = 'dark';
    if ( $style_clean === 'badge' )   $classes_box[] = 'hover-dark';
    if ( $text_pos )                  $classes_box[] = 'box-text-' . $text_pos;

    if ( $image_hover )     $classes_image[] = 'image-' . $image_hover;
    if ( $image_hover_alt ) $classes_image[] = 'image-' . $image_hover_alt;
    if ( $image_height )    $classes_image[] = 'image-cover';

    if ( $text_hover )            $classes_text[] = 'show-on-hover hover-' . $text_hover;
    if ( $text_align )            $classes_text[] = 'text-' . $text_align;
    if ( $text_size )             $classes_text[] = 'is-' . $text_size;
    if ( $text_color === 'dark' ) $classes_text[] = 'dark';

    $css_args_img     = array(
        array( 'attribute' => 'border-radius', 'value' => $image_radius, 'unit' => '%' ),
        array( 'attribute' => 'width',         'value' => $image_width,  'unit' => '%' ),
    );
    $css_image_height = array( array( 'attribute' => 'padding-top', 'value' => $image_height ) );
    $css_args_text    = array(
        array( 'attribute' => 'background-color', 'value' => $text_bg ),
        array( 'attribute' => 'padding',          'value' => $text_padding ),
    );

    $animate_attr = $animate ? 'data-animate="' . esc_attr( $animate ) . '"' : '';

    $classes_box   = implode( ' ', $classes_box );
    $classes_image = implode( ' ', $classes_image );
    $classes_text  = implode( ' ', $classes_text );

    // ── WP_Query ──────────────────────────────────────────────────
    if ( ! empty( $offset ) ) {
        $found_posts_cb = function ( $found, $q ) use ( $offset ) {
            return $found - (int) $offset;
        };
        add_filter( 'found_posts', $found_posts_cb, 1, 2 );
    }

    $query_offset = (int) $page_number > 1
        ? (int) $offset + ( (int) $page_number - 1 ) * (int) $posts
        : (int) $offset;

    // Build post types (hỗ trợ multiple: "post,portfolio")
    $post_types = array_filter( array_map( 'trim', explode( ',', $post_type ) ) );

    $args = array(
        'post_status'         => sanitize_text_field( $post_status ),
        'post_type'           => count( $post_types ) === 1 ? $post_types[0] : $post_types,
        'posts_per_page'      => (int) $posts,
        'offset'              => $query_offset,
        'paged'               => (int) $page_number,
        'ignore_sticky_posts' => true,
        'orderby'             => sanitize_key( $orderby ),
        'order'               => in_array( strtoupper( $order ), array( 'ASC', 'DESC' ), true ) ? strtoupper( $order ) : 'DESC',
    );

    // Category
    if ( ! empty( $cat ) ) $args['cat'] = $cat;

    // Tags
    if ( ! empty( $tags ) ) {
        $args['tag__in'] = array_filter( array_map( 'trim', explode( ',', $tags ) ) );
    }

    // Meta key (cho orderby=meta_value)
    if ( ! empty( $meta_key ) ) $args['meta_key'] = sanitize_key( $meta_key );

    // Tax query từ JSON
    if ( ! empty( $tax_query ) ) {
        $decoded = json_decode( stripslashes( $tax_query ), true );
        if ( is_array( $decoded ) ) $args['tax_query'] = $decoded;
    }

    // Author filter
    if ( ! empty( $author ) ) {
        if ( is_numeric( $author ) ) {
            $args['author'] = (int) $author;
        } else {
            $u = get_user_by( 'slug', sanitize_key( $author ) );
            if ( $u ) $args['author'] = $u->ID;
        }
    }

    // Custom IDs
    if ( ! empty( $ids ) ) {
        $ids_arr = array_filter( array_map( 'intval', explode( ',', $ids ) ) );
        $args = array(
            'post__in'           => $ids_arr,
            'post_type'          => $post_types ?: array( 'any' ),
            'posts_per_page'     => 9999,
            'orderby'            => 'post__in',
            'ignore_sticky_posts'=> true,
        );
    }

    $the_query = new WP_Query( $args );

    if ( isset( $found_posts_cb ) ) {
        remove_filter( 'found_posts', $found_posts_cb, 1 );
    }

    // ── Relay container open ──────────────────────────────────────
    // Đảm bảo _id luôn có trong defined_atts để JS tìm đúng container
    $defined_atts['_id'] = $_id;

    // ── Filter bar (ngoài relay container, cố định) ───────────────
    if ( $show_filter === 'true' ) {
        echo cpt_posts_filter_bar( $_id, $atts, $post_types[0] ?? 'post' );
    }

    CPT_Relay::render_container_open( $the_query, $defined_atts, $atts );

    // ── Repeater wrapper ──────────────────────────────────────────
    $repeater_atts = array(
        'id'                  => $_id,
        'type'                => $type,
        'class'               => $class,
        'visibility'          => $visibility,
        'style'               => $style_clean,
        'columns'             => $columns,
        'columns__md'         => $columns__md,
        'columns__sm'         => $columns__sm,
        'row_spacing'         => $col_spacing,
        'row_width'           => $width,
        'slider_style'        => $slider_nav_style,
        'slider_nav_position' => $slider_nav_position,
        'slider_nav_color'    => $slider_nav_color,
        'slider_bullets'      => $slider_bullets,
        'auto_slide'          => $auto_slide,
        'infinitive'          => $infinitive,
        'depth'               => $depth,
        'depth_hover'         => $depth_hover,
    );

    // Dùng Flatsome repeater nếu theme đang active, fallback sang custom
    if ( function_exists( 'get_flatsome_repeater_start' ) ) {
        get_flatsome_repeater_start( $repeater_atts );
    } else {
        cpt_posts_repeater_start( $repeater_atts );
    }

    // ── Loop posts ────────────────────────────────────────────────
    while ( $the_query->have_posts() ) :
        $the_query->the_post();

        $col_class = array( 'post-item' );
        if ( get_post_format() === 'video' ) $col_class[] = 'has-post-icon';
        ?>
        <div class="col <?php echo esc_attr( implode( ' ', $col_class ) ); ?>" <?php echo $animate_attr; ?>>
            <div class="col-inner">
                <div class="box <?php echo esc_attr( $classes_box ); ?> box-blog-post has-hover">

                    <?php if ( has_post_thumbnail() ) : ?>
                    <div class="box-image" <?php echo cpt_get_inline_css( $css_args_img ); ?>>
                        <div class="<?php echo esc_attr( $classes_image ); ?>"
                             <?php echo cpt_get_inline_css( $css_image_height ); ?>>
                            <a href="<?php the_permalink(); ?>" class="plain"
                               aria-label="<?php echo esc_attr( get_the_title() ); ?>">
                                <?php the_post_thumbnail( $image_size ); ?>
                            </a>
                            <?php if ( $image_overlay ) : ?>
                                <div class="overlay"
                                     style="background-color:<?php echo esc_attr( $image_overlay ); ?>"></div>
                            <?php endif; ?>
                        </div>
                        <?php if ( $post_icon && get_post_format() ) : ?>
                            <div class="absolute no-click x50 y50">
                                <div class="overlay-icon">
                                    <?php
                                    if ( function_exists( 'get_flatsome_icon' ) ) {
                                        echo get_flatsome_icon( 'icon-play' );
                                    }
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>

                    <div class="box-text <?php echo esc_attr( $classes_text ); ?>"
                         <?php echo cpt_get_inline_css( $css_args_text ); ?>>
                        <div class="box-text-inner blog-post-inner">

                            <?php do_action( 'cpt_posts_before_card', get_the_ID(), $atts ); ?>

                            <?php if ( $show_category !== 'false' ) : ?>
                                <p class="cat-label is-xxsmall op-7 uppercase">
                                    <?php
                                    $terms = get_the_terms( get_the_ID(), 'category' );
                                    if ( $terms && ! is_wp_error( $terms ) ) {
                                        foreach ( $terms as $term ) {
                                            echo '<a href="' . esc_url( get_term_link( $term ) ) . '">'
                                                . esc_html( $term->name ) . '</a> ';
                                        }
                                    }
                                    ?>
                                </p>
                            <?php endif; ?>

                            <h5 class="post-title is-<?php echo esc_attr( $title_size ); ?> <?php echo esc_attr( $title_style ); ?>">
                                <a href="<?php the_permalink(); ?>" class="plain">
                                    <?php the_title(); ?>
                                </a>
                            </h5>

                            <?php if ( $show_date === 'text' ) : ?>
                                <div class="post-meta is-small op-8">
                                    <?php echo get_the_date(); ?>
                                </div>
                            <?php endif; ?>

                            <?php if ( $show_author === 'true' ) : ?>
                                <div class="post-author is-xsmall op-8">
                                    <?php
                                    printf(
                                        '<a href="%s">%s</a>',
                                        esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
                                        esc_html( get_the_author() )
                                    );
                                    ?>
                                </div>
                            <?php endif; ?>

                            <div class="is-divider"></div>

                            <?php if ( $excerpt !== 'false' ) : ?>
                                <p class="from_the_blog_excerpt <?php
                                    if ( $excerpt !== 'visible' ) echo 'show-on-hover hover-' . esc_attr( $excerpt );
                                ?>">
                                    <?php
                                    if ( function_exists( 'flatsome_get_the_excerpt' ) ) {
                                        echo flatsome_get_the_excerpt( $excerpt_length );
                                    } else {
                                        echo wp_trim_words( get_the_excerpt(), $excerpt_length );
                                    }
                                    ?>
                                </p>
                            <?php endif; ?>

                            <?php if ( $readmore ) : ?>
                                <a href="<?php the_permalink(); ?>"
                                   class="button <?php echo esc_attr( $readmore_color ); ?> is-<?php echo esc_attr( $readmore_style ); ?> is-<?php echo esc_attr( $readmore_size ); ?> mb-0">
                                    <?php echo wp_kses_post( $readmore ); ?>
                                </a>
                            <?php endif; ?>

                            <?php do_action( 'cpt_posts_after_card', get_the_ID(), $atts ); ?>

                        </div>
                    </div>

                    <?php if ( has_post_thumbnail() && in_array( $show_date, array( 'badge', 'true' ), true ) ) : ?>
                        <?php
                        if ( ! $badge_style ) {
                            $badge_style = function_exists( 'get_theme_mod' )
                                ? get_theme_mod( 'blog_badge_style', 'outline' )
                                : 'outline';
                        }
                        ?>
                        <div class="badge absolute top post-date badge-<?php echo esc_attr( $badge_style ); ?>">
                            <div class="badge-inner">
                                <span class="post-date-day"><?php echo get_the_time( 'd' ); ?></span><br>
                                <span class="post-date-month is-xsmall"><?php echo get_the_time( 'M' ); ?></span>
                            </div>
                        </div>
                    <?php endif; ?>

                </div>
            </div>
        </div>
        <?php
    endwhile;
    wp_reset_postdata();

    // ── Repeater end ──────────────────────────────────────────────
    if ( function_exists( 'get_flatsome_repeater_end' ) ) {
        get_flatsome_repeater_end( $atts );
    } else {
        echo '</div>';
    }

    CPT_Relay::render_container_close();

    return ob_get_clean();
}

add_shortcode( 'cpt_posts', 'cpt_posts_shortcode' );

// ── Fallback repeater khi không có Flatsome ───────────────────────
function cpt_posts_repeater_start( $atts ) {
    $cols = array(
        'large-columns-' . $atts['columns'],
        'medium-columns-' . ( $atts['columns__md'] ?: '2' ),
        'small-columns-'  . ( $atts['columns__sm'] ?: '1' ),
    );
    if ( $atts['row_spacing'] ) $cols[] = 'row-' . $atts['row_spacing'];
    echo '<div class="row ' . esc_attr( implode( ' ', $cols ) ) . '">';
}

// ── Inline CSS helper (standalone, không cần Flatsome) ───────────
function cpt_get_inline_css( $args ) {
    $style = '';
    foreach ( $args as $item ) {
        if ( ! empty( $item['value'] ) ) {
            $unit   = isset( $item['unit'] ) ? $item['unit'] : '';
            $style .= $item['attribute'] . ':' . $item['value'] . $unit . ';';
        }
    }
    return $style ? 'style="' . esc_attr( $style ) . '"' : '';
}
