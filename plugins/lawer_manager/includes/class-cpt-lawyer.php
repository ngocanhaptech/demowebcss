<?php
class LM_CPT_Lawyer extends LM_CPT_Base {
    public function __construct() {
        $this->post_type = 'lawyer';
        $this->args = [
            'labels' => [
                'name'               => __( 'Đội ngũ luật sư', 'lm' ),
                'singular_name'      => __( 'Luật sư', 'lm' ),
                'add_new'            => __( 'Thêm mới', 'lm' ),
                'add_new_item'       => __( 'Thêm Luật sư mới', 'lm' ),
                'edit_item'          => __( 'Sửa Luật sư', 'lm' ),
                'new_item'           => __( 'Luật sư mới', 'lm' ),
                'view_item'          => __( 'Xem Luật sư', 'lm' ),
                'search_items'       => __( 'Tìm Luật sư', 'lm' ),
                'not_found'          => __( 'Không tìm thấy', 'lm' ),
                'not_found_in_trash' => __( 'Không tìm thấy trong thùng rác', 'lm' ),
                'menu_name'          => __( 'Luật sư', 'lm' ),
            ],
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'menu_icon'          => 'dashicons-welcome-learn-more',
            'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes' ],
            'has_archive'        => 'lawyer',
            'rewrite'            => [ 'slug' => 'doi-ngu-luat-su' ],
            'show_in_rest'       => true,
        ];

        // Đăng ký taxonomy lawyer_category
        add_action( 'init', [ $this, 'register_taxonomy' ] );

        // Thêm meta box bio shortcode
        add_action( 'add_meta_boxes', [ $this, 'add_bio_shortcode_metabox' ] );
        add_action( 'save_post_lawyer', [ $this, 'save_bio_shortcode_metabox' ] );
    }

    public function register_taxonomy() {
        $labels = [
            'name'          => __( 'Chuyên mục luật sư', 'lm' ),
            'singular_name' => __( 'Chuyên mục', 'lm' ),
            'edit_item'     => __( 'Sửa chuyên mục', 'lm' ),
            'update_item'   => __( 'Cập nhật', 'lm' ),
            'add_new_item'  => __( 'Thêm chuyên mục mới', 'lm' ),
            'new_item_name' => __( 'Tên chuyên mục mới', 'lm' ),
            'menu_name'     => __( 'Chuyên mục', 'lm' ),
        ];
        $args = [
            'labels'       => $labels,
            'hierarchical' => true,
            'rewrite'      => [ 'slug' => 'lawyer-category' ],
            'show_in_rest' => true,
        ];
        register_taxonomy( 'lawyer_category', 'lawyer', $args );
    }

    public function add_bio_shortcode_metabox() {
        add_meta_box(
            'lm_bio_shortcode_metabox',
            __( 'Tiểu sử - Shortcode', 'lm' ),
            [ $this, 'render_bio_shortcode_metabox' ],
            'lawyer',
            'normal',
            'default'
        );
    }

    public function render_bio_shortcode_metabox( $post ) {
        wp_nonce_field( 'lm_bio_shortcode_nonce', 'lm_bio_shortcode_nonce' );
        $value = get_post_meta( $post->ID, '_lm_bio_shortcode', true );
        ?>
        <p>
            <label for="lm_bio_shortcode"><strong><?php _e( 'Shortcode tiểu sử', 'lm' ); ?></strong></label><br>
            <textarea name="lm_bio_shortcode" id="lm_bio_shortcode" rows="3" style="width:100%;"><?php echo esc_textarea( $value ); ?></textarea>
            <small><?php _e( 'Ví dụ: [block id="bio-luat-su-tho"] hoặc bất kỳ shortcode nào', 'lm' ); ?></small>
        </p>
        <?php
    }

    public function save_bio_shortcode_metabox( $post_id ) {
        if ( ! isset( $_POST['lm_bio_shortcode_nonce'] ) ||
             ! wp_verify_nonce( $_POST['lm_bio_shortcode_nonce'], 'lm_bio_shortcode_nonce' ) ) {
            return;
        }
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        if ( isset( $_POST['lm_bio_shortcode'] ) ) {
            $value = wp_kses_post( wp_unslash( $_POST['lm_bio_shortcode'] ) );
            update_post_meta( $post_id, '_lm_bio_shortcode', $value );
        }
    }
}