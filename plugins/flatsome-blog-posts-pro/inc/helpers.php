<?php
/**
 * Helper functions
 *
 * @package Flatsome_Blog_Posts_Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Lấy danh sách post types public
 * @return array
 */
function fbpp_get_post_type_options() {
    $post_types = get_post_types( array( 'public' => true ), 'objects' );
    $options    = array();

    foreach ( $post_types as $post_type ) {
        $options[ $post_type->name ] = $post_type->label;
    }

    return $options;
}

/**
 * Lấy danh sách tác giả có bài viết (có cache)
 * @param string $post_type
 * @return array
 */
function fbpp_get_post_authors( $post_type = 'post' ) {
    $cache_key = 'fbpp_authors_' . $post_type;
    $authors   = get_transient( $cache_key );

    if ( false !== $authors ) {
        return $authors;
    }

    $args = array(
        'post_type'      => $post_type,
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    );

    $query      = new WP_Query( $args );
    $author_ids = array();

    if ( $query->have_posts() ) {
        foreach ( $query->posts as $post_id ) {
            $author_id = get_post_field( 'post_author', $post_id );
            if ( ! in_array( $author_id, $author_ids, true ) ) {
                $author_ids[] = $author_id;
            }
        }
    }

    $authors = array();
    foreach ( $author_ids as $author_id ) {
        $user = get_userdata( $author_id );
        if ( $user ) {
            $authors[ $author_id ] = $user->display_name;
        }
    }

    asort( $authors );
    set_transient( $cache_key, $authors, DAY_IN_SECONDS );

    return $authors;
}

/**
 * Lấy danh sách tác giả cho select option (tất cả user có quyền author)
 * @return array
 */
function fbpp_get_author_options() {
    $options = array( '' => __( 'All Authors', 'flatsome-blog-posts-pro' ) );
    $users   = get_users( array(
        'who'     => 'authors',
        'orderby' => 'display_name',
        'order'   => 'ASC',
    ) );

    foreach ( $users as $user ) {
        $options[ $user->ID ] = $user->display_name;
    }

    return $options;
}

/**
 * Xóa cache author khi có bài viết mới/cập nhật
 */
add_action( 'save_post', 'fbpp_clear_author_cache' );
function fbpp_clear_author_cache( $post_id ) {
    $post_type = get_post_type( $post_id );
    delete_transient( 'fbpp_authors_' . $post_type );
}