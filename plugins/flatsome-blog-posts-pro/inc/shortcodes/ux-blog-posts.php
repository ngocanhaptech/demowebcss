<?php
/**
 * Shortcode xử lý chính: [ux_blog_posts]
 *
 * @package Flatsome_Blog_Posts_Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Render shortcode
 */
function fbpp_ux_blog_posts_shortcode( $atts, $content = null, $tag = '' ) {
    // Lưu defined atts để dùng cho Relay
    $defined_atts = $atts;

    $default_atts = array(
        // Core attributes
        '_id'                => '',
        'style'              => 'normal',
        'class'              => '',
        'visibility'         => '',
        // Layout
        'type'               => 'row', // row, slider, masonry, grid
        'columns'            => '3',
        'columns__md'        => '',
        'columns__sm'        => '1',
        'col_spacing'        => '',
        'width'              => '',
        'grid'               => '1',
        'grid_height'        => '600px',
        'grid_height__md'    => '500px',
        'grid_height__sm'    => '400px',
        // Slider
        'slider_nav_style'   => 'reveal',
        'slider_nav_position'=> '',
        'slider_nav_color'   => '',
        'slider_bullets'     => 'false',
        'slider_arrows'      => 'true',
        'auto_slide'         => 'false',
        'infinitive'         => 'true',
        'depth'              => '',
        'depth_hover'        => '',
        // Relay
        'relay'                     => '',
        'relay_control_result_count'=> 'true',
        'relay_control_position'    => 'bottom',
        'relay_control_align'       => 'center',
        'relay_id'                  => '',
        'relay_class'               => '',
        // Posts query
        'posts'              => '8',
        'offset'             => '',
        'orderby'            => 'date',
        'order'              => 'DESC',
        'post_type'          => 'post',
        'author'             => '', // Nhiều ID cách nhau dấu phẩy
        'cat'                => '',
        'category'           => '', // Fallback
        'tags'               => '',
        'ids'                => '', // Custom IDs
        'page_number'        => '1',
        // Post options
        'excerpt'            => 'visible',
        'excerpt_length'     => 15,
        'show_category'      => 'false',
        'show_date'          => 'badge', // badge, text, false
        'badge_style'        => '',
        'comments'           => 'true',
        'post_icon'          => 'true',
        // Read more
        'readmore'           => '',
        'readmore_color'     => '',
        'readmore_style'     => 'outline',
        'readmore_size'      => 'small',
        // Title
        'title_size'         => 'large',
        'title_style'        => '',
        // Box styles
        'text_pos'           => 'bottom',
        'text_padding'       => '',
        'text_bg'            => '',
        'text_size'          => '',
        'text_color'         => '',
        'text_hover'         => '',
        'text_align'         => 'center',
        'image_size'         => 'medium',
        'image_width'        => '',
        'image_radius'       => '',
        'image_height'       => '56%',
        'image_hover'        => '',
        'image_hover_alt'    => '',
        'image_overlay'      => '',
        'image_depth'        => '',
        'image_depth_hover'  => '',
        'animate'            => '',
        // Extended filter bar
        'show_filter_bar'    => 'true',
        'filter_style'       => 'tabs',
        'filter_align'       => 'center',
    );

    $atts = shortcode_atts( $default_atts, $atts, $tag );

    // Stop if visibility is hidden
    if ( $atts['visibility'] === 'hidden' ) {
        return '';
    }

    // Pagination
    $paged = get_query_var( 'paged' ) ? (int) get_query_var( 'paged' ) : 1;
    if ( get_query_var( 'page' ) ) {
        $paged = (int) get_query_var( 'page' );
    }

    // Filter từ URL
    $filter_author  = isset( $_GET['fbpp_author'] ) ? sanitize_text_field( $_GET['fbpp_author'] ) : '';
    $filter_orderby = isset( $_GET['fbpp_orderby'] ) ? sanitize_text_field( $_GET['fbpp_orderby'] ) : $atts['orderby'];
    $filter_order   = isset( $_GET['fbpp_order'] ) ? sanitize_text_field( $_GET['fbpp_order'] ) : $atts['order'];

    // Tính offset cho phân trang
    $offset = 0;
    if ( ! empty( $atts['offset'] ) ) {
        $offset = intval( $atts['offset'] );
        if ( $paged > 1 ) {
            $offset += ( $paged - 1 ) * intval( $atts['posts'] );
        }
    }

    // Build query args
    $args = array(
        'post_type'           => $atts['post_type'],
        'post_status'         => 'publish',
        'posts_per_page'      => intval( $atts['posts'] ),
        'paged'               => $paged,
        'orderby'             => $filter_orderby,
        'order'               => $filter_order,
        'offset'              => $offset,
        'ignore_sticky_posts' => true,
    );

    // Category
    if ( ! empty( $atts['cat'] ) ) {
        $args['cat'] = $atts['cat'];
    } elseif ( ! empty( $atts['category'] ) ) {
        $args['category_name'] = $atts['category'];
    }

    // Tags
    if ( ! empty( $atts['tags'] ) ) {
        $args['tag__in'] = array_filter( array_map( 'trim', explode( ',', $atts['tags'] ) ) );
    }

    // Author (hỗ trợ nhiều ID)
    if ( ! empty( $atts['author'] ) ) {
        $author_ids = array_filter( array_map( 'absint', explode( ',', $atts['author'] ) ) );
        if ( ! empty( $author_ids ) ) {
            $args['author__in'] = $author_ids;
        }
    }

    // Custom IDs
    if ( ! empty( $atts['ids'] ) ) {
        $ids = array_filter( array_map( 'trim', explode( ',', $atts['ids'] ) ) );
        if ( ! empty( $ids ) ) {
            $args['post__in']       = $ids;
            $args['orderby']        = 'post__in';
            $args['posts_per_page'] = -1;
            $args['offset']         = 0;
            $args['paged']          = 1;
        }
    }

    // Hook tạm sửa found_posts cho offset
    $found_posts_filter = null;
    if ( $offset && empty( $atts['ids'] ) ) {
        $found_posts_filter = function ( $found_posts, $query ) use ( $offset ) {
            return $found_posts - $offset;
        };
        add_filter( 'found_posts', $found_posts_filter, 1, 2 );
    }

    $query = new WP_Query( $args );

    if ( isset( $found_posts_filter ) ) {
        remove_filter( 'found_posts', $found_posts_filter, 1 );
    }

    // Lưu vào global để dùng trong template
    global $fbpp_query;
    $fbpp_query = $query;

    ob_start();

    // Mở Relay container (nếu có)
    if ( class_exists( 'Flatsome_Relay' ) && ! empty( $atts['relay'] ) ) {
        Flatsome_Relay::render_container_open( $query, $tag, $defined_atts, $atts );
    }

    // Render filter bar
    if ( 'true' === $atts['show_filter_bar'] ) {
        fbpp_render_filter_bar( $atts, $query );
    }

    // Chuẩn bị repeater args (dùng cho get_flatsome_repeater_start)
    $repeater = array(
        'id'                    => $atts['_id'] ? $atts['_id'] : 'fbpp-' . wp_rand(),
        'tag'                   => $tag,
        'type'                  => $atts['type'],
        'class'                 => $atts['class'],
        'visibility'            => $atts['visibility'],
        'style'                 => $atts['style'],
        'slider_style'          => $atts['slider_nav_style'],
        'slider_nav_position'   => $atts['slider_nav_position'],
        'slider_nav_color'      => $atts['slider_nav_color'],
        'slider_bullets'        => $atts['slider_bullets'],
        'auto_slide'            => $atts['auto_slide'],
        'infinitive'            => $atts['infinitive'],
        'row_spacing'           => $atts['col_spacing'],
        'row_width'             => $atts['width'],
        'columns'               => $atts['type'] == 'grid' ? '0' : $atts['columns'],
        'columns__md'           => $atts['columns__md'],
        'columns__sm'           => $atts['columns__sm'],
        'depth'                 => $atts['depth'],
        'depth_hover'           => $atts['depth_hover'],
        'title'                 => '',
        'attrs'                 => '',
    );

    if ( $atts['type'] == 'grid' && function_exists( 'flatsome_get_grid_height' ) ) {
        flatsome_get_grid_height( $atts['grid_height'], $repeater['id'] );
    }

    if ( function_exists( 'get_flatsome_repeater_start' ) ) {
        get_flatsome_repeater_start( $repeater );
    } else {
        echo '<div class="row ' . esc_attr( $atts['class'] ) . '">';
    }

    // Loop posts
    if ( $query->have_posts() ) {
        $grid = array();
        $grid_total = 0;
        $current_grid = 0;

        if ( $atts['type'] == 'grid' && function_exists( 'flatsome_get_grid' ) ) {
            $grid = flatsome_get_grid( $atts['grid'] );
            $grid_total = count( $grid );
        }

        while ( $query->have_posts() ) {
            $query->the_post();

            $col_class = array( 'post-item' );
            $image_size = $atts['image_size'];

            if ( $atts['type'] == 'grid' ) {
                if ( $grid_total > $current_grid ) {
                    $current_grid++;
                }
                $current = $current_grid - 1;
                $col_class[] = 'grid-col';
                if ( isset( $grid[ $current ]['height'] ) && $grid[ $current ]['height'] ) {
                    $col_class[] = 'grid-col-' . $grid[ $current ]['height'];
                }
                if ( isset( $grid[ $current ]['span'] ) && $grid[ $current ]['span'] ) {
                    $col_class[] = 'large-' . $grid[ $current ]['span'];
                }
                if ( isset( $grid[ $current ]['md'] ) && $grid[ $current ]['md'] ) {
                    $col_class[] = 'medium-' . $grid[ $current ]['md'];
                }
                if ( isset( $grid[ $current ]['size'] ) && $grid[ $current ]['size'] ) {
                    $image_size = $grid[ $current ]['size'];
                }
            }

            // Ghi đè image_size vào atts để dùng trong template
            $atts['image_size'] = $image_size;
            ?>
            <div class="col <?php echo esc_attr( implode( ' ', $col_class ) ); ?>" <?php if ( $atts['animate'] ) echo 'data-animate="' . esc_attr( $atts['animate'] ) . '"'; ?>>
                <?php fbpp_get_template_part( $atts['style'], $atts ); ?>
            </div>
            <?php
        }
        wp_reset_postdata();
    } else {
        echo '<p>' . esc_html__( 'No posts found.', 'flatsome-blog-posts-pro' ) . '</p>';
    }

    // Kết thúc repeater
    if ( function_exists( 'get_flatsome_repeater_end' ) ) {
        get_flatsome_repeater_end( $atts );
    } else {
        echo '</div>';
    }

    // Đóng Relay container
    if ( class_exists( 'Flatsome_Relay' ) && ! empty( $atts['relay'] ) ) {
        Flatsome_Relay::render_container_close();
    }

    return ob_get_clean();
}
add_shortcode( 'ux_blog_posts', 'fbpp_ux_blog_posts_shortcode' );

/**
 * Render filter bar
 */
function fbpp_render_filter_bar( $atts, $query ) {
    $current_author  = isset( $_GET['fbpp_author'] ) ? sanitize_text_field( $_GET['fbpp_author'] ) : '';
    $current_orderby = isset( $_GET['fbpp_orderby'] ) ? sanitize_text_field( $_GET['fbpp_orderby'] ) : $atts['orderby'];
    $current_order   = isset( $_GET['fbpp_order'] ) ? sanitize_text_field( $_GET['fbpp_order'] ) : $atts['order'];

    $authors = fbpp_get_post_authors( $atts['post_type'] );

    $filter_classes = array(
        'fbpp-filter',
        'fbpp-filter--' . $atts['filter_style'],
        'text-' . $atts['filter_align'],
        'mb-half',
    );
    $filter_classes = implode( ' ', array_filter( $filter_classes ) );

    $base_url = strtok( $_SERVER['REQUEST_URI'], '?' );
    ?>
    <div class="<?php echo esc_attr( $filter_classes ); ?>">
        <form method="get" action="<?php echo esc_url( $base_url ); ?>" class="fbpp-filter__form">
            <?php
            // Giữ lại query params khác
            foreach ( $_GET as $key => $value ) {
                if ( strpos( $key, 'fbpp_' ) === 0 ) {
                    continue;
                }
                echo '<input type="hidden" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '">';
            }
            ?>

            <?php if ( 'dropdown' === $atts['filter_style'] ) : ?>
                <div class="fbpp-filter__group">
                    <select name="fbpp_author" class="fbpp-filter__select">
                        <option value="all" <?php selected( $current_author, 'all' ); ?>>
                            <?php esc_html_e( 'All Authors', 'flatsome-blog-posts-pro' ); ?>
                        </option>
                        <?php foreach ( $authors as $author_id => $author_name ) : ?>
                            <option value="<?php echo esc_attr( $author_id ); ?>" <?php selected( $current_author, $author_id ); ?>>
                                <?php echo esc_html( $author_name ); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            <?php else : ?>
                <div class="fbpp-filter__group fbpp-filter__tabs">
                    <a href="<?php echo esc_url( add_query_arg( 'fbpp_author', 'all', $base_url ) ); ?>" 
                       class="fbpp-filter__tab <?php echo ( 'all' === $current_author || empty( $current_author ) ) ? 'is-active' : ''; ?>">
                        <?php esc_html_e( 'All Authors', 'flatsome-blog-posts-pro' ); ?>
                    </a>
                    <?php foreach ( $authors as $author_id => $author_name ) : ?>
                        <a href="<?php echo esc_url( add_query_arg( 'fbpp_author', $author_id, $base_url ) ); ?>" 
                           class="fbpp-filter__tab <?php echo $current_author == $author_id ? 'is-active' : ''; ?>">
                            <?php echo esc_html( $author_name ); ?>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <div class="fbpp-filter__group">
                <select name="fbpp_orderby" class="fbpp-filter__select">
                    <option value="date" <?php selected( $current_orderby, 'date' ); ?>>
                        <?php esc_html_e( 'Newest', 'flatsome-blog-posts-pro' ); ?>
                    </option>
                    <option value="title" <?php selected( $current_orderby, 'title' ); ?>>
                        <?php esc_html_e( 'Title (A-Z)', 'flatsome-blog-posts-pro' ); ?>
                    </option>
                    <option value="modified" <?php selected( $current_orderby, 'modified' ); ?>>
                        <?php esc_html_e( 'Last Updated', 'flatsome-blog-posts-pro' ); ?>
                    </option>
                    <option value="comment_count" <?php selected( $current_orderby, 'comment_count' ); ?>>
                        <?php esc_html_e( 'Most Commented', 'flatsome-blog-posts-pro' ); ?>
                    </option>
                </select>
                <input type="hidden" name="fbpp_order" value="<?php echo esc_attr( $current_order ); ?>">
            </div>

            <button type="submit" class="fbpp-filter__button button primary is-small">
                <?php esc_html_e( 'Apply', 'flatsome-blog-posts-pro' ); ?>
            </button>
        </form>
    </div>
    <?php
}

/**
 * Load template part
 */
function fbpp_get_template_part( $style, $atts ) {
    // Ưu tiên template trong plugin
    $template_file = FBPP_PATH . 'template-parts/ux-blog-posts/' . $style . '.php';
    if ( ! file_exists( $template_file ) ) {
        // Fallback: dùng layout của Flatsome
        $template_file = get_template_directory() . '/template-parts/posts/layout.php';
        if ( ! file_exists( $template_file ) ) {
            $template_file = FBPP_PATH . 'template-parts/ux-blog-posts/normal.php';
        }
    }

    if ( file_exists( $template_file ) ) {
        extract( $atts );
        include $template_file;
    } else {
        // Hiển thị đơn giản
        ?>
        <div class="col-inner">
            <?php if ( has_post_thumbnail() ) : ?>
                <div class="box-image">
                    <a href="<?php the_permalink(); ?>">
                        <?php the_post_thumbnail( $atts['image_size'] ); ?>
                    </a>
                </div>
            <?php endif; ?>
            <div class="box-text">
                <h5 class="post-title">
                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                </h5>
                <?php if ( 'false' !== $atts['show_excerpt'] ) : ?>
                    <div class="post-excerpt">
                        <?php echo flatsome_get_the_excerpt( intval( $atts['excerpt_length'] ) ); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}