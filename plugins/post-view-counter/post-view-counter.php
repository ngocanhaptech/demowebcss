<?php
/**
 * Plugin Name: Post View Counter (Custom Table)
 * Description: Đếm lượt xem bài viết và lưu theo user agent vào bảng riêng.
 * Version:     1.0.0
 * Author:      Lê Ngọc Anh (custom)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Tên bảng trong DB
 */
function pvc_get_table_name() {
    global $wpdb;
    return $wpdb->prefix . 'post_view_counter';
}

/**
 * Tạo bảng khi activate plugin
 */
function pvc_activate_plugin() {
    global $wpdb;

    $table_name      = pvc_get_table_name();
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id BIGINT(20) UNSIGNED NOT NULL,
        views BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
        agent VARCHAR(50) NOT NULL DEFAULT '',
        last_viewed DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
        PRIMARY KEY  (id),
        KEY post_id (post_id),
        KEY post_agent (post_id, agent)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}
register_activation_hook( __FILE__, 'pvc_activate_plugin' );

/**
 * Nhận diện đơn giản browser từ user agent
 */
function pvc_detect_agent_label( $user_agent ) {
    $ua = strtolower( $user_agent );

    if ( strpos( $ua, 'chrome' ) !== false && strpos( $ua, 'edg' ) === false ) {
        return 'Chrome';
    }
    if ( strpos( $ua, 'firefox' ) !== false ) {
        return 'Firefox';
    }
    if ( strpos( $ua, 'safari' ) !== false && strpos( $ua, 'chrome' ) === false ) {
        return 'Safari';
    }
    if ( strpos( $ua, 'edg' ) !== false ) {
        return 'Edge';
    }
    if ( strpos( $ua, 'opr' ) !== false || strpos( $ua, 'opera' ) !== false ) {
        return 'Opera';
    }

    return 'Others';
}

/**
 * Check bot/crawler để không đếm (tuỳ chọn)
 */
function pvc_is_crawler() {
    $crawler_list = array(
        'bot',
        'crawl',
        'spider',
        'slurp',
        'facebookexternalhit',
        'mediapartners-google',
        'bingpreview',
        'ahrefs',
        'semrush',
    );

    $agent = strtolower( $_SERVER['HTTP_USER_AGENT'] ?? '' );
    if ( empty( $agent ) ) {
        return true;
    }

    foreach ( $crawler_list as $crawler ) {
        if ( strpos( $agent, $crawler ) !== false ) {
            return true;
        }
    }

    return false;
}

/**
 * Tăng view cho post_id trong bảng custom
 */
function pvc_increment_post_view_table( $post_id = 0 ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }
    if ( ! $post_id ) {
        return;
    }

    // Không đếm bot
    if ( pvc_is_crawler() ) {
        return;
    }

    // Không đếm admin (tuỳ bạn)
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        return;
    }

    global $wpdb;
    $table_name = pvc_get_table_name();

    $user_agent_full = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $agent_label     = pvc_detect_agent_label( $user_agent_full );
    $now             = current_time( 'mysql' );

    // Tăng views cho cặp (post_id, agent)
    // Nếu record chưa tồn tại thì insert, nếu tồn tại thì update +1
    $existing = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT id, views FROM {$table_name} WHERE post_id = %d AND agent = %s LIMIT 1",
            $post_id,
            $agent_label
        )
    );

    if ( $existing ) {
        $wpdb->update(
            $table_name,
            array(
                'views'      => $existing->views + 1,
                'last_viewed'=> $now,
            ),
            array( 'id' => $existing->id ),
            array( '%d', '%s' ),
            array( '%d' )
        );
    } else {
        $wpdb->insert(
            $table_name,
            array(
                'post_id'    => $post_id,
                'views'      => 1,
                'agent'      => $agent_label,
                'last_viewed'=> $now,
            ),
            array( '%d', '%d', '%s', '%s' )
        );
    }
}

/**
 * Hook: tự động đếm view trên single post
 */
function pvc_track_post_view_table() {
    if ( ! is_single() ) {
        return;
    }

    global $post;
    if ( ! $post ) {
        return;
    }

    // Nếu muốn đếm cho mọi post type thì bỏ điều kiện dưới:
    // if ( 'post' !== $post->post_type ) return;

    pvc_increment_post_view_table( $post->ID );
}
add_action( 'template_redirect', 'pvc_track_post_view_table' );

/**
 * Lấy tổng view của 1 bài từ bảng custom
 */
function pvc_get_post_total_views( $post_id = 0 ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }
    if ( ! $post_id ) {
        return 0;
    }

    global $wpdb;
    $table_name = pvc_get_table_name();

    $total = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT SUM(views) FROM {$table_name} WHERE post_id = %d",
            $post_id
        )
    );

    if ( null === $total ) {
        return 0;
    }

    return (int) $total;
}

/**
 * Lấy view theo agent cho 1 bài
 */
function pvc_get_post_views_group_by_agent( $post_id = 0 ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }
    if ( ! $post_id ) {
        return array();
    }

    global $wpdb;
    $table_name = pvc_get_table_name();

    $rows = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT agent, views FROM {$table_name} WHERE post_id = %d",
            $post_id
        ),
        ARRAY_A
    );

    if ( empty( $rows ) ) {
        return array();
    }

    $data = array();
    foreach ( $rows as $row ) {
        $data[ $row['agent'] ] = (int) $row['views'];
    }

    return $data;
}

/**
 * Shortcode: [post_views] -> tổng lượt xem
 */
function pvc_post_views_shortcode_table( $atts ) {
    $atts = shortcode_atts(
        array(
            'id' => 0,
        ),
        $atts
    );

    $post_id = $atts['id'] ? (int) $atts['id'] : get_the_ID();
    if ( ! $post_id ) {
        return '';
    }

    $total = pvc_get_post_total_views( $post_id );

    return esc_html( $total );
}
add_shortcode( 'post_views', 'pvc_post_views_shortcode_table' );

/**
 * Shortcode: [post_views_agents] -> view theo browser
 */
function pvc_post_views_agents_shortcode_table( $atts ) {
    $atts = shortcode_atts(
        array(
            'id' => 0,
        ),
        $atts
    );

    $post_id = $atts['id'] ? (int) $atts['id'] : get_the_ID();
    if ( ! $post_id ) {
        return '';
    }

    $agents = pvc_get_post_views_group_by_agent( $post_id );
    if ( empty( $agents ) ) {
        return '';
    }

    $html = '<ul class="pvc-view-agents">';
    foreach ( $agents as $agent => $views ) {
        $html .= '<li>' . esc_html( $agent ) . ': ' . esc_html( $views ) . '</li>';
    }
    $html .= '</ul>';

    return $html;
}
add_shortcode( 'post_views_agents', 'pvc_post_views_agents_shortcode_table' );

// Đăng ký submenu trong admin
add_action( 'admin_menu', 'pvc_register_admin_menu' );

function pvc_register_admin_menu() {
    // Thêm submenu dưới Tools (Công cụ)
    add_submenu_page(
        'tools.php',                    // parent slug
        'Post Views Stats',             // page title
        'Post Views',                   // menu title
        'manage_options',               // capability
        'pvc-post-views-stats',         // menu slug
        'pvc_render_admin_page_stats'   // callback hiển thị nội dung
    );
}

function pvc_render_admin_page_stats() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'pvc' ) );
    }

    global $wpdb;
    $table_name = pvc_get_table_name();

    // Lấy 20 bài có view nhiều nhất
    $limit = 20;

    $results = $wpdb->get_results(
        "
        SELECT post_id, agent, SUM(views) as views
        FROM {$table_name}
        GROUP BY post_id, agent
        ORDER BY post_id, views DESC
        ",
        ARRAY_A
    );

    // Gom theo post_id
    $posts_data = array();
    foreach ( $results as $row ) {
        $pid = (int) $row['post_id'];

        if ( ! isset( $posts_data[ $pid ] ) ) {
            $posts_data[ $pid ] = array(
                'total'  => 0,
                'agents' => array(),
            );
        }

        $posts_data[ $pid ]['total'] += (int) $row['views'];
        $posts_data[ $pid ]['agents'][ $row['agent'] ] = (int) $row['views'];
    }

    // Sắp xếp theo tổng view giảm dần
    uasort(
        $posts_data,
        function ( $a, $b ) {
            return $b['total'] <=> $a['total'];
        }
    );

    // Cắt còn 20 bài
    $posts_data = array_slice( $posts_data, 0, $limit, true );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Post Views Statistics', 'pvc' ); ?></h1>
        <p><?php esc_html_e( 'Thống kê lượt xem bài viết theo trình duyệt (browser).', 'pvc' ); ?></p>

        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th><?php esc_html_e( 'Post', 'pvc' ); ?></th>
                    <th><?php esc_html_e( 'Total Views', 'pvc' ); ?></th>
                    <th><?php esc_html_e( 'Views by Browser', 'pvc' ); ?></th>
                </tr>
            </thead>
            <tbody>
            <?php if ( empty( $posts_data ) ) : ?>
                <tr>
                    <td colspan="3"><?php esc_html_e( 'Chưa có dữ liệu lượt xem.', 'pvc' ); ?></td>
                </tr>
            <?php else : ?>
                <?php foreach ( $posts_data as $post_id => $data ) : 
                    $post = get_post( $post_id );
                    if ( ! $post ) {
                        continue;
                    }
                    ?>
                    <tr>
                        <td>
                            <strong>
                                <a href="<?php echo esc_url( get_edit_post_link( $post_id ) ); ?>">
                                    <?php echo esc_html( get_the_title( $post_id ) ); ?>
                                </a>
                            </strong>
                            <br>
                            <small>ID: <?php echo (int) $post_id; ?> | 
                                <a href="<?php echo esc_url( get_permalink( $post_id ) ); ?>" target="_blank">
                                    <?php esc_html_e( 'View post', 'pvc' ); ?>
                                </a>
                            </small>
                        </td>
                        <td>
                            <?php echo (int) $data['total']; ?>
                        </td>
                        <td>
                            <?php
                            if ( ! empty( $data['agents'] ) ) {
                                $agent_strings = array();
                                foreach ( $data['agents'] as $agent => $views ) {
                                    $agent_strings[] = esc_html( $agent ) . ': ' . (int) $views;
                                }
                                echo implode( ' | ', $agent_strings );
                            } else {
                                esc_html_e( 'No data', 'pvc' );
                            }
                            ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}