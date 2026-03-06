<?php
defined( 'ABSPATH' ) || exit;

/**
 * Render filter bar cho cpt_posts.
 *
 * @param string $relay_id  ID của relay container.
 * @param array  $atts      Shortcode atts hiện tại.
 * @param string $post_type Post type để query đúng authors.
 */
function cpt_posts_filter_bar( $relay_id, $atts, $post_type = 'post' ) {
    // Lấy authors có bài publish thuộc post_type này
    $authors = get_users( array(
        'has_published_posts' => array( $post_type ),
        'orderby'             => 'display_name',
        'order'               => 'ASC',
        'fields'              => array( 'ID', 'display_name', 'user_nicename' ),
    ) );

    $show_author = count( $authors ) >= 2
                   && ( $atts['filter_author'] === 'true' );

    $show_order  = $atts['filter_order'] === 'true';

    // Không render gì nếu không có filter nào được bật
    if ( ! $show_author && ! $show_order ) return '';

    $current_author = isset( $atts['author'] ) ? $atts['author'] : '';
    $current_order  = isset( $atts['order'] )  ? $atts['order']  : 'DESC';

    ob_start();
    ?>
    <div class="cpt-filter-bar"
         data-relay-id="<?php echo esc_attr( $relay_id ); ?>">

        <?php if ( $show_author ) : ?>
        <div class="cpt-filter-group">
            <label for="cpt-filter-author-<?php echo esc_attr( $relay_id ); ?>">
                <?php esc_html_e( 'Tác giả', 'cpt-posts-relay' ); ?>
            </label>
            <select id="cpt-filter-author-<?php echo esc_attr( $relay_id ); ?>"
                    class="cpt-filter-select"
                    data-filter-key="author">
                <option value="" <?php selected( $current_author, '' ); ?>>
                    <?php esc_html_e( 'Tất cả', 'cpt-posts-relay' ); ?>
                </option>
                <?php foreach ( $authors as $u ) : ?>
                    <option value="<?php echo esc_attr( $u->user_nicename ); ?>"
                            <?php selected( $current_author, $u->user_nicename ); ?>>
                        <?php echo esc_html( $u->display_name ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <?php endif; ?>

        <?php if ( $show_order ) : ?>
        <div class="cpt-filter-group">
            <label for="cpt-filter-order-<?php echo esc_attr( $relay_id ); ?>">
                <?php esc_html_e( 'Sắp xếp', 'cpt-posts-relay' ); ?>
            </label>
            <select id="cpt-filter-order-<?php echo esc_attr( $relay_id ); ?>"
                    class="cpt-filter-select"
                    data-filter-key="order">
                <option value="DESC" <?php selected( $current_order, 'DESC' ); ?>>
                    <?php esc_html_e( 'Mới nhất', 'cpt-posts-relay' ); ?>
                </option>
                <option value="ASC" <?php selected( $current_order, 'ASC' ); ?>>
                    <?php esc_html_e( 'Cũ nhất', 'cpt-posts-relay' ); ?>
                </option>
            </select>
        </div>
        <?php endif; ?>

    </div>
    <?php
    return ob_get_clean();
}
