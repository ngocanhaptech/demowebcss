<?php

class LM_UX_Element_Document_List extends LM_UX_Element_Base {

    public function __construct() {
        $this->shortcode = 'ux_document_list';
        $this->name      = __( 'Document List', 'lm' );
        $this->options   = [
            'content_group' => [
                'type'    => 'group',
                'heading' => __( 'Content', 'lm' ),
                'options' => [
                    'posts'   => [
                        'type'    => 'scrubfield',
                        'heading' => __( 'Số lượng', 'lm' ),
                        'default' => 8,
                    ],
                    'doc_cat' => [
                        'type'    => 'select',
                        'heading' => __( 'Danh mục', 'lm' ),
                        'options' => $this->get_doc_cats(),
                    ],
                    'ids'     => [
                        'type'    => 'select',
                        'heading' => __( 'Chọn tài liệu', 'lm' ),
                        'options' => $this->get_docs(),
                    ],
                ],
            ],
            'quickview_group' => [
                'type'    => 'group',
                'heading' => __( 'Quick View', 'lm' ),
                'options' => [
                    'show_quickview' => [
                        'type'    => 'select',
                        'heading' => __( 'Hiện quickview', 'lm' ),
                        'default' => 'false',
                        'options' => [
                            'false' => __( 'Không', 'lm' ),
                            'true'  => __( 'Có', 'lm' ),
                        ],
                    ],
                ],
            ],
        ];
    }

    private function get_doc_cats() {
        $terms = get_terms( [
            'taxonomy'   => 'document-categories',
            'hide_empty' => false,
        ] );
        $opts = [ '' => __( 'Tất cả', 'lm' ) ];
        if ( is_array( $terms ) && ! is_wp_error( $terms ) ) {
            foreach ( $terms as $term ) {
                $opts[ $term->slug ] = $term->name;
            }
        }
        return $opts;
    }

    private function get_docs() {
        $posts = get_posts( [
            'post_type'      => 'document',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ] );
        $opts = [ '' => __( '-- Tự động --', 'lm' ) ];
        foreach ( $posts as $p ) {
            $opts[ $p->ID ] = $p->post_title;
        }
        return $opts;
    }
}