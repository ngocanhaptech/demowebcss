<?php

class BM_UX_Element_Brand_List extends BM_UX_Element_Base {

    public function __construct() {
        $this->shortcode = 'ux_brand_list';
        $this->name      = __( 'Brand List', 'bm' );

        $this->options   = [
            'content_group' => [
                'type'    => 'group',
                'heading' => __( 'Content', 'bm' ),
                'options' => [
                    'posts'     => [
                        'type'    => 'scrubfield',
                        'heading' => __( 'Số lượng', 'bm' ),
                        'default' => 20,
                    ],
                    'brand_cat' => [
                        'type'    => 'select',
                        'heading' => __( 'Danh mục nhãn hiệu', 'bm' ),
                        'options' => $this->get_brand_cats(),
                    ],
                    'status'    => [
                        'type'    => 'select',
                        'heading' => __( 'Trạng thái', 'bm' ),
                        'default' => '',
                        'options' => [
                            ''                   => __( 'Tất cả', 'bm' ),
                            'Cấp bằng'           => __( 'Cấp bằng', 'bm' ),
                            'Đang giải quyết'    => __( 'Đang giải quyết', 'bm' ),
                            'Từ chối'            => __( 'Từ chối', 'bm' ),
                            'Rút đơn'            => __( 'Rút đơn', 'bm' ),
                        ],
                    ],
                    'app_type'  => [
                        'type'    => 'select',
                        'heading' => __( 'Loại đơn', 'bm' ),
                        'default' => '',
                        'options' => [
                            ''  => __( 'Tất cả', 'bm' ),
                            '0' => __( 'Đơn quốc gia', 'bm' ),
                            '1' => __( 'Đơn quốc tế', 'bm' ),
                        ],
                    ],
                    'show_filter' => [
                        'type'    => 'select',
                        'heading' => __( 'Hiển thị filter bar', 'bm' ),
                        'default' => 'true',
                        'options' => [
                            'true'  => __( 'Có', 'bm' ),
                            'false' => __( 'Không', 'bm' ),
                        ],
                    ],
                    'ajax' => [
                        'type'    => 'select',
                        'heading' => __( 'Phân trang AJAX', 'bm' ),
                        'default' => 'true',
                        'options' => [
                            'true'  => __( 'Có', 'bm' ),
                            'false' => __( 'Không', 'bm' ),
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Lấy danh mục nhãn hiệu cho dropdown.
     */
    private function get_brand_cats() {
        $terms = get_terms( [
            'taxonomy'   => 'brand-categories',
            'hide_empty' => false,
        ] );

        $opts = [ '' => __( 'Tất cả', 'bm' ) ];

        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            return $opts;
        }

        foreach ( $terms as $term ) {
            if ( ! is_object( $term ) ) {
                continue;
            }
            $opts[ $term->slug ] = $term->name;
        }

        return $opts;
    }
}