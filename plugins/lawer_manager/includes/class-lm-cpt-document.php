<?php

class LM_CPT_Document extends LM_CPT_Base {

    protected $post_type = 'document';

    public function __construct() {
        $this->args = array(
            'labels' => array(
                'name'               => __( 'Tài liệu', 'lm' ),
                'singular_name'      => __( 'Tài liệu', 'lm' ),
                'add_new'            => __( 'Thêm tài liệu', 'lm' ),
                'add_new_item'       => __( 'Thêm tài liệu mới', 'lm' ),
                'edit_item'          => __( 'Sửa tài liệu', 'lm' ),
                'new_item'           => __( 'Tài liệu mới', 'lm' ),
                'view_item'          => __( 'Xem tài liệu', 'lm' ),
                'search_items'       => __( 'Tìm tài liệu', 'lm' ),
                'not_found'          => __( 'Không tìm thấy tài liệu', 'lm' ),
                'not_found_in_trash' => __( 'Không có tài liệu trong thùng rác', 'lm' ),
                'menu_name'          => __( 'Tài liệu', 'lm' ),
            ),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array(
                'slug'       => 'tai-lieu',
                'with_front' => false,
            ),
            'capability_type'    => 'post',
            'has_archive'        => 'tai_lieu',
            'hierarchical'       => false,
            'menu_position'      => 22,
            'menu_icon'          => 'dashicons-media-document',
            'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
            'show_in_rest'       => true,
        );
    }


    public function register() {
        // Gọi register() của base để hook do_register() vào init
        parent::register();
    
        // Meta boxes
        add_action( 'add_meta_boxes', [ $this, 'register_meta_boxes' ] );
        add_action( 'save_post_' . $this->post_type, [ $this, 'save_meta_boxes' ] );
    }
    
    public function do_register() {
        // Đăng ký CPT
        parent::do_register();
    
        // Đăng ký taxonomy NGAY SAU CPT trong cùng thời điểm
        $this->register_taxonomy();
    }

    public function register_taxonomy() {
        error_log( 'LM_CPT_Document::register_taxonomy running. Post type: ' . $this->post_type );
        $labels = array(
            'name'              => __( 'Danh mục tài liệu', 'lm' ),
            'singular_name'     => __( 'Danh mục tài liệu', 'lm' ),
            'search_items'      => __( 'Tìm danh mục', 'lm' ),
            'all_items'         => __( 'Tất cả danh mục', 'lm' ),
            'parent_item'       => __( 'Danh mục cha', 'lm' ),
            'parent_item_colon' => __( 'Danh mục cha:', 'lm' ),
            'edit_item'         => __( 'Sửa danh mục', 'lm' ),
            'update_item'       => __( 'Cập nhật danh mục', 'lm' ),
            'add_new_item'      => __( 'Thêm danh mục mới', 'lm' ),
            'new_item_name'     => __( 'Tên danh mục mới', 'lm' ),
            'menu_name'         => __( 'Danh mục tài liệu', 'lm' ),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array(
                'slug'       => 'danh-muc-tai-lieu',
                'with_front' => false,
            ),
            'show_in_rest'      => true,
        );

        register_taxonomy( 'document-categories', array( $this->post_type ), $args );
    }

    public function register_meta_boxes() {
        add_meta_box(
            'lm_document_download_box',
            __( 'Link tải tài liệu', 'lm' ),
            array( $this, 'render_meta_box_download' ),
            $this->post_type,
            'normal',
            'high'
        );
    }

    public function render_meta_box_download( $post ) {
        wp_nonce_field( 'lm_document_download_nonce', 'lm_document_download_nonce_field' );
        $url = get_post_meta( $post->ID, '_lm_document_download_url', true );
        ?>
        <p>
            <label for="lm_document_download_url">
                <?php _e( 'URL tải tài liệu (PDF/DOC/ZIP...)', 'lm' ); ?>
            </label>
        </p>
        <input type="url"
               name="lm_document_download_url"
               id="lm_document_download_url"
               class="widefat"
               placeholder="https://example.com/file.pdf"
               value="<?php echo esc_attr( $url ); ?>" />
        <?php
    }

    public function save_meta_boxes( $post_id ) {
        if ( ! isset( $_POST['lm_document_download_nonce_field'] ) ||
             ! wp_verify_nonce( $_POST['lm_document_download_nonce_field'], 'lm_document_download_nonce' )
        ) {
            return;
        }
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        if ( isset( $_POST['lm_document_download_url'] ) ) {
            $url = esc_url_raw( $_POST['lm_document_download_url'] );
            update_post_meta( $post_id, '_lm_document_download_url', $url );
        }
    }
}