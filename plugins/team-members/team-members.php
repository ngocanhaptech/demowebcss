<?php
/**
 * Plugin Name: Team Members Management
 * Description: Manage team members (CPT) và tích hợp với Flatsome UX Builder.
 * Version:     1.0.0
 * Author:      Ngoc Anh
 * Text Domain: ux_team_member
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'TEAMEMBERS_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'TEAMEMBERS_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Đăng ký CPT: team_member
 */
add_action( 'init', function() {
    $labels = array(
        'name'               => __( 'Team Members', 'ux_team_member' ),
        'singular_name'      => __( 'Team Member', 'ux_team_member' ),
        'add_new'            => __( 'Add New', 'ux_team_member' ),
        'add_new_item'       => __( 'Add New Team Member', 'ux_team_member' ),
        'edit_item'          => __( 'Edit Team Member', 'ux_team_member' ),
        'new_item'           => __( 'New Team Member', 'ux_team_member' ),
        'view_item'          => __( 'View Team Member', 'ux_team_member' ),
        'search_items'       => __( 'Search Team Members', 'ux_team_member' ),
        'not_found'          => __( 'No team members found', 'ux_team_member' ),
        'not_found_in_trash' => __( 'No team members found in Trash', 'ux_team_member' ),
        'menu_name'          => __( 'Team', 'ux_team_member' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-groups',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'has_archive'        => false,
        'rewrite'            => array( 'slug' => 'team' ),
        'show_in_rest'       => true,
    );

    register_post_type( 'team_member', $args );
} );

/**
 * Cho phép sử dụng UX Builder trên CPT team_member
 */
add_action( 'init', function () {
    if ( function_exists( 'add_ux_builder_post_type' ) ) {
        add_ux_builder_post_type( 'team_member' );
    }
} );

/**
 * Đăng ký taxonomy: team_category cho team_member
 */
function team_member_register_category_taxonomy() {
    $labels = array(
        'name'          => __( 'Team Categories', 'ux_team_member' ),
        'singular_name' => __( 'Team Category', 'ux_team_member' ),
        'edit_item'     => __( 'Edit Team Category', 'ux_team_member' ),
        'update_item'   => __( 'Update Team Category', 'ux_team_member' ),
        'add_new_item'  => __( 'Add New Team Category', 'ux_team_member' ),
        'new_item_name' => __( 'New Team Category Name', 'ux_team_member' ),
        'menu_name'     => __( 'Team Categories', 'ux_team_member' ),
    );

    $args = array(
        'labels'       => $labels,
        'hierarchical' => true,
        'rewrite'      => array( 'slug' => 'team-category' ),
        'show_in_rest' => true,
    );

    register_taxonomy( 'team_category', 'team_member', $args );
}
add_action( 'init', 'team_member_register_category_taxonomy' );

/**
 * Meta box cho Team Member (Position / Role)
 */
add_action( 'add_meta_boxes', function() {
    add_meta_box(
        'ux_team_meta',
        __( 'Team Member Details', 'ux_team_member' ),
        'ux_team_meta_box_callback',
        'team_member',
        'normal',
        'default'
    );
} );

function ux_team_meta_box_callback( $post ) {
    wp_nonce_field( 'ux_team_meta_nonce', 'ux_team_meta_nonce' );
    $position = get_post_meta( $post->ID, '_ux_team_position', true );
    ?>
    <p>
        <label for="ux_team_position"><strong><?php esc_html_e( 'Position / Role', 'ux_team_member' ); ?></strong></label><br>
        <input type="text" id="ux_team_position" name="ux_team_position" class="widefat"
               value="<?php echo esc_attr( $position ); ?>" placeholder="Designer, Developer, CEO...">
    </p>
    <?php
}

/**
 * Lưu meta cho CPT team_member
 */
add_action( 'save_post_team_member', function( $post_id ) {
    if ( ! isset( $_POST['ux_team_meta_nonce'] ) ||
         ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ux_team_meta_nonce'] ) ), 'ux_team_meta_nonce' )
    ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    if ( isset( $_POST['ux_team_position'] ) ) {
        $value = sanitize_text_field( wp_unslash( $_POST['ux_team_position'] ) );
        update_post_meta( $post_id, '_ux_team_position', $value );
    }
} );

/**
 * Nạp logic shortcode frontend
 */
add_action( 'init', function() {
    $shortcode_file = TEAMEMBERS_PLUGIN_PATH . 'inc/shortcodes/ux_team_members.php';
    if ( file_exists( $shortcode_file ) ) {
        require_once $shortcode_file;
    }
} );

/**
 * Load UX Builder integration (element ux_team_members)
 */
add_action(
    'after_setup_theme',
    function () {
        if ( function_exists( 'add_ux_builder_shortcode' ) ) {
            $ux_builder_file = TEAMEMBERS_PLUGIN_PATH . 'inc/ux-builder/ux_team_members.php';
            if ( file_exists( $ux_builder_file ) ) {
                require_once $ux_builder_file;
            }
        }
    },
    20
);

/**
 * Override flatsome_ajax_apply_shortcode để thêm ux_team_members vào whitelist.
 * Unhook hàm gốc của Flatsome, đăng ký lại hàm mới.
 */
add_action( 'init', function() {
    remove_action( 'wp_ajax_flatsome_ajax_apply_shortcode',        'flatsome_ajax_apply_shortcode' );
    remove_action( 'wp_ajax_nopriv_flatsome_ajax_apply_shortcode', 'flatsome_ajax_apply_shortcode' );
}, 20 );

function team_members_ajax_apply_shortcode() {
    $tag  = isset( $_GET['tag'] ) ? flatsome_clean( wp_unslash( $_GET['tag'] ) ) : '';
    $atts = isset( $_GET['atts'] ) ? flatsome_clean( wp_unslash( (array) $_GET['atts'] ) ) : '';

    $allowed_tags = array(
        // Flatsome gốc
        'blog_posts',
        'ux_bestseller_products',
        'ux_featured_products',
        'ux_sale_products',
        'ux_latest_products',
        'ux_custom_products',
        'product_lookbook',
        'products_pinterest_style',
        'ux_products',
        // Custom CPT
        'ux_team_members',
    );

    // Cho phép plugin khác thêm tag vào whitelist
    $allowed_tags = apply_filters( 'flatsome_relay_shortcodes', $allowed_tags );

    if (
        empty( $tag )
        || empty( $atts )
        || ! in_array( $tag, $allowed_tags, true )
    ) {
        wp_send_json_error( array(
            'message' => 'Invalid request',
        ) );
    }

    $markup = flatsome_apply_shortcode( $tag, $atts );

    wp_send_json_success( trim( $markup ) );
}

add_action( 'wp_ajax_flatsome_ajax_apply_shortcode',        'team_members_ajax_apply_shortcode' );
add_action( 'wp_ajax_nopriv_flatsome_ajax_apply_shortcode', 'team_members_ajax_apply_shortcode' );

// ============================================================
// ENQUEUE ASSETS
// ============================================================
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_script(
        'team-members-relay',
        TEAMEMBERS_PLUGIN_URL . 'assets/js/team-members-relay.js',
        array( 'jquery', 'flatsome-relay' ),  // phụ thuộc flatsome-relay load trước
        '1.0.0',
        true   // load ở footer
    );
} );