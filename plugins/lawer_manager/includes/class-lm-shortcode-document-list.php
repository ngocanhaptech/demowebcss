<?php

class LM_Shortcode_Document_List extends LM_Shortcode_Base {

    protected $tag = 'ux_document_list';

    public function render( $atts ) {
    $defined_atts = $atts;

    // Map option từ UX Builder (camelCase) sang snake_case
    if ( isset( $atts['docCat'] ) && ! isset( $atts['doc_cat'] ) ) {
        $atts['doc_cat'] = $atts['docCat'];
    }
    if ( isset( $atts['showQuickview'] ) && ! isset( $atts['show_quickview'] ) ) {
        $atts['show_quickview'] = $atts['showQuickview'];
    }

    $atts = shortcode_atts( [
        'posts'          => 8,
        'ids'            => '',
        'doc_cat'        => '',
        'orderby'        => 'date',
        'order'          => 'DESC',
        'columns'        => 3,
        'columns__sm'    => 1,
        'style'          => 'list',
        'show_quickview' => 'false',
        '_id'            => 'document-' . rand(),
        'type'           => 'row',
        'col_spacing'    => 'small',
        'image_size'     => 'medium',
        'image_height'   => '',
        'text_align'     => 'left',
        'text_size'      => '',
        'excerpt'        => 'visible',
        'excerpt_length' => 20,
        // relay ...
    ], $atts );

        if ( isset( $atts['visibility'] ) && $atts['visibility'] === 'hidden' ) {
            return '';
        }

        // Phân trang giống lawyer
        if ( ! empty( $atts['relay'] ) && isset( $atts['page_number'] ) ) {
            $paged = max( 1, intval( $atts['page_number'] ) );
        } else {
            $paged = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1;
            if ( get_query_var( 'page' ) ) {
                $paged = get_query_var( 'page' );
            }
            $atts['page_number'] = $paged;
        }

        // Query giống lawyer, chỉ đổi post_type + taxonomy
        $args = [
            'post_type'      => 'document',
            'post_status'    => 'publish',
            'posts_per_page' => intval( $atts['posts'] ),
            'orderby'        => $atts['orderby'],
            'order'          => $atts['order'],
            'paged'          => $paged,
        ];

        if ( ! empty( $atts['doc_cat'] ) ) {
            $args['tax_query'] = [[
                'taxonomy' => 'document-categories',
                'field'    => 'slug',
                'terms'    => explode( ',', $atts['doc_cat'] ),
            ]];
        }

        if ( ! empty( $atts['ids'] ) ) {
            $args['post__in']       = explode( ',', $atts['ids'] );
            $args['posts_per_page'] = -1;
            $args['orderby']        = 'post__in';
        }
        
        // $query = new WP_Query( $args );
        // error_log( '=== DOCUMENT QUERY ===' );
        // error_log( 'Posts per page: ' . $args['posts_per_page'] );
        // error_log( 'Total found: ' . $query->found_posts );
        // error_log( 'SQL: ' . $query->request );

        $query = new WP_Query( $args );
        if ( ! $query->have_posts() ) {
            return '';
        }

        ob_start();

        if ( class_exists( 'Flatsome_Relay' ) ) {
            Flatsome_Relay::render_container_open( $query, $this->tag, $defined_atts, $atts );
        }

        // Chuẩn bị class repeater giống luật sư
        $classes_box   = [ 'box', 'box-document', 'has-hover' ];
        $classes_image = [];
        $classes_text  = [];

        $style = $atts['style'];
        if ( $style === 'text-overlay' ) {
            $image_hover = 'zoom';
            $style       = str_replace( 'text-', '', $style );
        }

        if ( $style ) {
            $classes_box[] = 'box-' . $style;
        }
        if ( $style === 'overlay' || $style === 'shade' ) {
            $classes_box[] = 'dark';
        }
        if ( $style === 'badge' ) {
            $classes_box[] = 'hover-dark';
        }
        if ( isset( $atts['text_pos'] ) && $atts['text_pos'] ) {
            $classes_box[] = 'box-text-' . $atts['text_pos'];
        }

        if ( ! empty( $atts['image_hover'] ) ) {
            $classes_image[] = 'image-' . $atts['image_hover'];
        }
        if ( ! empty( $atts['image_hover_alt'] ) ) {
            $classes_image[] = 'image-' . $atts['image_hover_alt'];
        }
        if ( ! empty( $atts['image_height'] ) ) {
            $classes_image[] = 'image-cover';
        }

        $classes_text[] = 'text-' . $atts['text_align'];
        if ( ! empty( $atts['text_size'] ) ) {
            $classes_text[] = 'is-' . $atts['text_size'];
        }

        $repeater = [
            'id'          => $atts['_id'],
            'class'       => $atts['class'] ?? '',
            'type'        => $atts['type'],
            'style'       => $style,
            'columns'     => $atts['columns'],
            'columns__sm' => $atts['columns__sm'] ?? '',
            'columns__md' => $atts['columns__md'] ?? '',
            'row_spacing' => $atts['col_spacing'],
        ];

        get_flatsome_repeater_start( $repeater );

        while ( $query->have_posts() ) {
            $query->the_post();

            $download_url = get_post_meta( get_the_ID(), '_lm_document_download_url', true );
            $shortcode_qv = get_post_meta( get_the_ID(), '_lm_document_shortcode_quickview', true );
            $has_qv       = $shortcode_qv && $atts['show_quickview'] === 'true';

            $this->get_template_part( $atts['style'], [
                'classes_box'   => $classes_box,
                'classes_image' => $classes_image,
                'classes_text'  => $classes_text,
                'atts'          => $atts,
                'download_url'  => $download_url,
                'has_qv'        => $has_qv,
                'shortcode_qv'  => $shortcode_qv,
            ] );
        }

        wp_reset_postdata();

        get_flatsome_repeater_end( $repeater );

        if ( class_exists( 'Flatsome_Relay' ) ) {
            Flatsome_Relay::render_container_close();
        }

        return ob_get_clean();
    }

    protected function get_template_part( $style, $args ) {
        $style = $style ? $style : 'list';
        $file  = LM_PLUGIN_PATH . 'templates/document/document-' . $style . '.php';

        if ( file_exists( $file ) ) {
            extract( $args );
            include $file;
        }
    }
}