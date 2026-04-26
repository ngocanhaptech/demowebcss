<?php
class LM_UX_Element_Lawyer_List extends LM_UX_Element_Base {
    public function __construct() {
        $this->shortcode = 'ux_lawyers';
        $this->name      = __( 'Lawyer List', 'lm' );

        $this->options = [
            'content_group' => [
                'type'    => 'group',
                'heading' => __( 'Content', 'lm' ),
                'options' => [
                    'posts'    => [ 'type' => 'scrubfield', 'heading' => __( 'Số luật sư', 'lm' ), 'default' => 8 ],
                    'lawyer_cat' => [
                        'type'    => 'select',
                        'heading' => __( 'Chuyên mục', 'lm' ),
                        'options' => $this->get_lawyer_cats(),
                    ],
                    'ids'      => [
                        'type'    => 'select',
                        'heading' => __( 'Chọn luật sư', 'lm' ),
                        'options' => $this->get_lawyers(),
                    ],
                    'orderby' => [
                        'type'    => 'select',
                        'heading' => __( 'Sắp xếp theo', 'lm' ),
                        'default' => 'menu_order',
                        'options' => [
                            'menu_order' => __( 'Menu order', 'lm' ),
                            'date'       => __( 'Ngày', 'lm' ),
                            'title'      => __( 'Tiêu đề', 'lm' ),
                            'rand'       => __( 'Ngẫu nhiên', 'lm' ),
                        ],
                    ],
                    'order' => [
                        'type'    => 'select',
                        'heading' => __( 'Thứ tự', 'lm' ),
                        'default' => 'ASC',
                        'options' => [ 'ASC' => 'Tăng dần', 'DESC' => 'Giảm dần' ],
                    ],
                ],
            ],
            'layout_group' => [
                'type'    => 'group',
                'heading' => __( 'Layout', 'lm' ),
                'options' => [
                    'type' => [
                        'type'    => 'select',
                        'heading' => __( 'Kiểu hiển thị', 'lm' ),
                        'default' => 'row',
                        'options' => [
                            'row'    => 'Row',
                            'slider' => 'Slider',
                            'grid'   => 'Grid',
                        ],
                    ],
                    'columns' => [ 'type' => 'slider', 'heading' => __( 'Số cột', 'lm' ), 'default' => 3, 'min' => 1, 'max' => 6 ],
                    'style'   => [
                        'type'    => 'select',
                        'heading' => __( 'Kiểu box', 'lm' ),
                        'default' => 'badge',
                        'options' => [ 'badge' => 'Badge', 'overlay' => 'Overlay', 'shade' => 'Shade', 'simple' => 'Simple' ],
                    ],
                ],
            ],
            // === Thêm group mới cho Relay ===
            'relay_tab' => [
                'type'    => 'group',
                'heading' => __( 'Relay (Ajax pagination)', 'lm' ),
                'options' => [
                    'relay' => [
                        'type'    => 'select',
                        'heading' => __( 'Relay mode', 'lm' ),
                        'default' => '',
                        'options' => [
                            ''           => __( 'None', 'lm' ),
                            'pagination' => __( 'Page numbers (Ajax)', 'lm' ),
                            'load-more'  => __( 'Load more button (Ajax)', 'lm' ),
                            'prev-next'  => __( 'Prev/Next (Ajax)', 'lm' ),
                        ],
                    ],
                    'relay_control_position' => [
                        'type'    => 'select',
                        'heading' => __( 'Control position', 'lm' ),
                        'default' => 'bottom',
                        'options' => [
                            'top'        => __( 'Top', 'lm' ),
                            'bottom'     => __( 'Bottom', 'lm' ),
                            'top-bottom' => __( 'Top & Bottom', 'lm' ),
                        ],
                    ],
                    'relay_control_align' => [
                        'type'    => 'select',
                        'heading' => __( 'Control alignment', 'lm' ),
                        'default' => 'center',
                        'options' => [
                            'left'   => __( 'Left', 'lm' ),
                            'center' => __( 'Center', 'lm' ),
                            'right'  => __( 'Right', 'lm' ),
                        ],
                    ],
                    'relay_control_result_count' => [
                        'type'       => 'select',
                        'heading'    => __( 'Show result count', 'lm' ),
                        'default'    => 'false',
                        'conditions' => 'relay === "load-more"',
                        'options'    => [
                            'false' => __( 'No', 'lm' ),
                            'true'  => __( 'Yes', 'lm' ),
                        ],
                    ],
                ],
            ],
            'quickview_group' => [
                'type'    => 'group',
                'heading' => __( 'Quick View', 'lm' ),
                'options' => [
                    'show_quickview' => [
                        'type'    => 'select',
                        'heading' => __( 'Hiển thị nút Quick View', 'lm' ),
                        'default' => 'false',
                        'options' => [ 'false' => 'Không', 'true' => 'Có' ],
                    ],
                ],
            ],
        ];
    }


    private function get_lawyer_cats() {
        $terms = get_terms( [ 'taxonomy' => 'lawyer_category', 'hide_empty' => false ] );
        $opts = [ '' => __( 'Tất cả', 'lm' ) ];
        if ( is_array( $terms ) && ! is_wp_error( $terms ) ) {
            foreach ( $terms as $term ) {
                if ( is_object( $term ) ) {
                    $opts[ $term->slug ] = $term->name;
                }
            }
        }
        return $opts;
    }

    private function get_lawyers() {
        $lawyers = get_posts( [ 'post_type' => 'lawyer', 'posts_per_page' => -1, 'orderby' => 'title' ] );
        $opts = [ '' => __( '-- Tự động --', 'lm' ) ];
        if ( is_array( $lawyers ) ) {
            foreach ( $lawyers as $p ) {
                $opts[ $p->ID ] = $p->post_title;
            }
        }
        return $opts;
    }
}