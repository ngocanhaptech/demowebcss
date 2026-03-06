<?php
defined( 'ABSPATH' ) || exit;

// Lấy danh sách CPT đã đăng ký
$post_types_options = array();
$post_types = get_post_types( array( 'public' => true ), 'objects' );
foreach ( $post_types as $pt ) {
    $post_types_options[ $pt->name ] = $pt->label;
}

ux_builder_add_element( array(
    'name'     => __( 'CPT Posts', 'cpt-posts-relay' ),
    'tag'      => 'cpt_posts',
    'category' => __( 'Content', 'cpt-posts-relay' ),
    'icon'     => 'el-icon-list-alt',

    'params' => array(

        // ── Tab: Content ────────────────────────────────────────
        array(
            'type'    => 'select',
            'heading' => __( 'Post Type', 'cpt-posts-relay' ),
            'param_name' => 'post_type',
            'value'   => 'post',
            'options' => $post_types_options,
        ),
        array(
            'type'       => 'number',
            'heading'    => __( 'Số bài hiển thị', 'cpt-posts-relay' ),
            'param_name' => 'posts',
            'value'      => '6',
            'min'        => 1,
            'max'        => 48,
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Sắp xếp theo', 'cpt-posts-relay' ),
            'param_name' => 'orderby',
            'value'      => 'date',
            'options'    => array(
                'date'       => __( 'Ngày đăng', 'cpt-posts-relay' ),
                'title'      => __( 'Tiêu đề', 'cpt-posts-relay' ),
                'menu_order' => __( 'Menu Order', 'cpt-posts-relay' ),
                'rand'       => __( 'Ngẫu nhiên', 'cpt-posts-relay' ),
                'modified'   => __( 'Ngày sửa', 'cpt-posts-relay' ),
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Thứ tự', 'cpt-posts-relay' ),
            'param_name' => 'order',
            'value'      => 'DESC',
            'options'    => array(
                'DESC' => __( 'Mới nhất (DESC)', 'cpt-posts-relay' ),
                'ASC'  => __( 'Cũ nhất (ASC)',  'cpt-posts-relay' ),
            ),
        ),

        // ── Tab: Filter Bar ─────────────────────────────────────
        array(
            'type'       => 'select',
            'heading'    => __( 'Hiện Filter Bar', 'cpt-posts-relay' ),
            'param_name' => 'show_filter',
            'value'      => 'false',
            'options'    => array(
                'false' => __( 'Tắt', 'cpt-posts-relay' ),
                'true'  => __( 'Bật', 'cpt-posts-relay' ),
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Filter: Tác giả', 'cpt-posts-relay' ),
            'param_name' => 'filter_author',
            'value'      => 'true',
            'options'    => array(
                'true'  => __( 'Hiện', 'cpt-posts-relay' ),
                'false' => __( 'Ẩn',   'cpt-posts-relay' ),
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Filter: Sắp xếp', 'cpt-posts-relay' ),
            'param_name' => 'filter_order',
            'value'      => 'true',
            'options'    => array(
                'true'  => __( 'Hiện', 'cpt-posts-relay' ),
                'false' => __( 'Ẩn',   'cpt-posts-relay' ),
            ),
        ),

        // ── Tab: Relay (Pagination) ─────────────────────────────
        array(
            'type'       => 'select',
            'heading'    => __( 'Pagination', 'cpt-posts-relay' ),
            'param_name' => 'relay',
            'value'      => '',
            'options'    => array(
                ''          => __( 'Tắt', 'cpt-posts-relay' ),
                'pagination'=> __( 'Số trang', 'cpt-posts-relay' ),
                'load-more' => __( 'Load More', 'cpt-posts-relay' ),
                'prev-next' => __( 'Prev / Next', 'cpt-posts-relay' ),
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Vị trí pagination', 'cpt-posts-relay' ),
            'param_name' => 'relay_control_position',
            'value'      => 'bottom',
            'options'    => array(
                'bottom'     => 'Bottom',
                'top'        => 'Top',
                'top-bottom' => 'Top & Bottom',
            ),
        ),

        // ── Tab: Layout ─────────────────────────────────────────
        array(
            'type'       => 'select',
            'heading'    => __( 'Layout type', 'cpt-posts-relay' ),
            'param_name' => 'type',
            'value'      => 'row',
            'options'    => array(
                'row'     => 'Row',
                'slider'  => 'Slider',
                'masonry' => 'Masonry',
            ),
        ),
        array(
            'type'       => 'number',
            'heading'    => __( 'Columns (Desktop)', 'cpt-posts-relay' ),
            'param_name' => 'columns',
            'value'      => '3',
            'min'        => 1, 'max' => 6,
        ),
        array(
            'type'       => 'number',
            'heading'    => __( 'Columns (Tablet)', 'cpt-posts-relay' ),
            'param_name' => 'columns__md',
            'value'      => '2',
            'min'        => 1, 'max' => 4,
        ),
        array(
            'type'       => 'number',
            'heading'    => __( 'Columns (Mobile)', 'cpt-posts-relay' ),
            'param_name' => 'columns__sm',
            'value'      => '1',
            'min'        => 1, 'max' => 2,
        ),

        // ── Tab: Card Display ───────────────────────────────────
        array(
            'type'       => 'select',
            'heading'    => __( 'Hiện Excerpt', 'cpt-posts-relay' ),
            'param_name' => 'excerpt',
            'value'      => 'visible',
            'options'    => array(
                'visible' => 'Luôn hiện',
                'fade'    => 'Fade on hover',
                'false'   => 'Ẩn',
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Hiện tên tác giả', 'cpt-posts-relay' ),
            'param_name' => 'show_author',
            'value'      => 'false',
            'options'    => array(
                'false' => 'Ẩn',
                'true'  => 'Hiện',
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Ngày đăng', 'cpt-posts-relay' ),
            'param_name' => 'show_date',
            'value'      => 'badge',
            'options'    => array(
                'badge' => 'Badge',
                'text'  => 'Text',
                'false' => 'Ẩn',
            ),
        ),
        array(
            'type'       => 'select',
            'heading'    => __( 'Hiện Category', 'cpt-posts-relay' ),
            'param_name' => 'show_category',
            'value'      => 'false',
            'options'    => array(
                'false' => 'Ẩn',
                'true'  => 'Hiện',
                'label' => 'Label style',
            ),
        ),
    ),
) );
