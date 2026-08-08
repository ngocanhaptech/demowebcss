<?php

class BM_CPT_Brand extends BM_CPT_Base {

    protected $post_type = 'brand';

    public function __construct() {
        $this->args = [
            'labels' => [
                'name'               => __( 'Nhãn hiệu', 'bm' ),
                'singular_name'      => __( 'Nhãn hiệu', 'bm' ),
                'add_new'            => __( 'Thêm nhãn hiệu', 'bm' ),
                'add_new_item'       => __( 'Thêm nhãn hiệu mới', 'bm' ),
                'edit_item'          => __( 'Sửa nhãn hiệu', 'bm' ),
                'new_item'           => __( 'Nhãn hiệu mới', 'bm' ),
                'view_item'          => __( 'Xem nhãn hiệu', 'bm' ),
                'search_items'       => __( 'Tìm nhãn hiệu', 'bm' ),
                'not_found'          => __( 'Không tìm thấy nhãn hiệu', 'bm' ),
                'not_found_in_trash' => __( 'Không có nhãn hiệu trong thùng rác', 'bm' ),
                'menu_name'          => __( 'Brand Manager', 'bm' ),
            ],
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => [
                'slug'       => 'nhan-hieu',
                'with_front' => false,
            ],
            'capability_type'    => 'post',
            'has_archive'        => 'nhan_hieu',
            'hierarchical'       => false,
            'menu_position'      => 23,
            'menu_icon'          => 'dashicons-awards',
            'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
            'show_in_rest'       => true,
        ];
    }

    public function register() {
        // Đăng ký CPT trong init
        parent::register();

        // Taxonomy nhóm nhãn hiệu (tùy chọn, có thể bỏ nếu anh không cần)
        add_action( 'init', [ $this, 'register_taxonomy' ], 20 );

        // Meta boxes
        add_action( 'add_meta_boxes', [ $this, 'register_meta_boxes' ] );
        add_action( 'save_post_' . $this->post_type, [ $this, 'save_meta_boxes' ] );
    }

    public function register_taxonomy() {
        $labels = [
            'name'              => __( 'Danh mục nhãn hiệu', 'bm' ),
            'singular_name'     => __( 'Danh mục nhãn hiệu', 'bm' ),
            'search_items'      => __( 'Tìm danh mục', 'bm' ),
            'all_items'         => __( 'Tất cả danh mục', 'bm' ),
            'parent_item'       => __( 'Danh mục cha', 'bm' ),
            'parent_item_colon' => __( 'Danh mục cha:', 'bm' ),
            'edit_item'         => __( 'Sửa danh mục', 'bm' ),
            'update_item'       => __( 'Cập nhật danh mục', 'bm' ),
            'add_new_item'      => __( 'Thêm danh mục mới', 'bm' ),
            'new_item_name'     => __( 'Tên danh mục mới', 'bm' ),
            'menu_name'         => __( 'Danh mục nhãn hiệu', 'bm' ),
        ];

        $args = [
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => [
                'slug'       => 'danh-muc-nhan-hieu',
                'with_front' => false,
            ],
            'show_in_rest'      => true,
        ];

        register_taxonomy( 'brand-categories', [ $this->post_type ], $args );
    }

    public function register_meta_boxes() {
        add_meta_box(
            'bm_brand_info_box',
            __( 'Thông tin nhãn hiệu', 'bm' ),
            [ $this, 'render_meta_box_brand_info' ],
            $this->post_type,
            'normal',
            'high'
        );
    }

    public function render_meta_box_brand_info( $post ) {
        wp_nonce_field( 'bm_brand_info_nonce', 'bm_brand_info_nonce_field' );

        $fields = [
            'image_url'          => [ 'label' => __( 'Logo / Mẫu nhãn (URL hình)', 'bm' ) ],
            'application_number' => [ 'label' => __( 'Số đơn', 'bm' ) ],
            'registration_number'=> [ 'label' => __( 'Số bằng', 'bm' ) ],
            'classes'            => [ 'label' => __( 'Nhóm (ví dụ: 3,5,35)', 'bm' ) ],
            'status_text'        => [ 'label' => __( 'Trạng thái (text hiển thị)', 'bm' ) ],
            'filing_date'        => [ 'label' => __( 'Ngày nộp đơn (YYYY-MM-DD)', 'bm' ) ],
            'publication_date'   => [ 'label' => __( 'Ngày công bố (YYYY-MM-DD)', 'bm' ) ],
            'grant_date'         => [ 'label' => __( 'Ngày cấp bằng (YYYY-MM-DD)', 'bm' ) ],
            'expiry_date'        => [ 'label' => __( 'Ngày hết hạn (YYYY-MM-DD)', 'bm' ) ],
            'owner_name'         => [ 'label' => __( 'Chủ đơn', 'bm' ) ],
            'owner_address'      => [ 'label' => __( 'Địa chỉ chủ đơn', 'bm' ) ],
            'representative'     => [ 'label' => __( 'Đại diện SHCN', 'bm' ) ],
            'application_type'   => [ 'label' => __( 'Loại đơn (0: quốc gia, 1: quốc tế)', 'bm' ) ],
        ];

        echo '<table class="form-table">';
        foreach ( $fields as $key => $field ) {
            $meta_key = '_bm_brand_' . $key;
            $value    = get_post_meta( $post->ID, $meta_key, true );
            ?>
            <tr>
                <th scope="row">
                    <label for="<?php echo esc_attr( $meta_key ); ?>">
                        <?php echo esc_html( $field['label'] ); ?>
                    </label>
                </th>
                <td>
                    <input type="text"
                           name="<?php echo esc_attr( $meta_key ); ?>"
                           id="<?php echo esc_attr( $meta_key ); ?>"
                           class="regular-text"
                           value="<?php echo esc_attr( $value ); ?>" />
                </td>
            </tr>
            <?php
        }
        echo '</table>';
    }

    public function save_meta_boxes( $post_id ) {
        if ( ! isset( $_POST['bm_brand_info_nonce_field'] )
             || ! wp_verify_nonce( $_POST['bm_brand_info_nonce_field'], 'bm_brand_info_nonce' )
        ) {
            return;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        $keys = [
            'image_url',
            'application_number',
            'registration_number',
            'classes',
            'status_text',
            'filing_date',
            'publication_date',
            'grant_date',
            'expiry_date',
            'owner_name',
            'owner_address',
            'representative',
            'application_type',
        ];

        foreach ( $keys as $key ) {
            $meta_key = '_bm_brand_' . $key;
            if ( isset( $_POST[ $meta_key ] ) ) {
                $val = sanitize_text_field( wp_unslash( $_POST[ $meta_key ] ) );
                update_post_meta( $post_id, $meta_key, $val );
            }
        }

        $keys = [
        'image_url',
        'application_number',
        'registration_number',
        'classes',
        'status_text',
        'filing_date',
        'publication_date',
        'grant_date',
        'expiry_date',
        'owner_name',
        'owner_address',
        'representative',
        'application_type',
    ];

    $data = [];

    foreach ( $keys as $key ) {
        $meta_key = '_bm_brand_' . $key;

        if ( isset( $_POST[ $meta_key ] ) ) {
            $val = sanitize_text_field( wp_unslash( $_POST[ $meta_key ] ) );
            update_post_meta( $post_id, $meta_key, $val );
            $data[ $key ] = $val;
        } else {
            $data[ $key ] = '';
        }
    }

    // Ghi vào bảng riêng
    global $wpdb;
    $table = BM_DB_Helper::table_brands();

    $row = [
        'post_id'             => $post_id,
        'brand_title'         => get_the_title( $post_id ),
        'image_url'           => $data['image_url'],
        'application_number'  => $data['application_number'],
        'registration_number' => $data['registration_number'],
        'classes'             => $data['classes'],
        'status_text'         => $data['status_text'],
        'filing_date'         => $data['filing_date'] ?: null,
        'publication_date'    => $data['publication_date'] ?: null,
        'grant_date'          => $data['grant_date'] ?: null,
        'expiry_date'         => $data['expiry_date'] ?: null,
        'owner_name'          => $data['owner_name'],
        'owner_address'       => $data['owner_address'],
        'representative'      => $data['representative'],
        'application_type'    => $data['application_type'] !== '' ? (int) $data['application_type'] : null,
    ];

    // INSERT hoặc UPDATE (dựa trên post_id)
    $wpdb->replace( $table, $row );
    }
}