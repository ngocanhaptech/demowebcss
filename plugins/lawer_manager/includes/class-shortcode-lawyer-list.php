<?php
class LM_Shortcode_Lawyer_List extends LM_Shortcode_Base {
    protected $tag = 'ux_lawyers';
    
    /**
     * Load template part cho lawyer item
     *
     * @param string $style Style name (badge, normal, ...)
     * @param array  $vars  Variables to extract in template
     */
    private function get_template_part( $style, $vars = array() ) {
        $template_file = LM_PLUGIN_PATH . 'template-parts/ux-lawyers/' . $style . '.php';
    
        if ( ! file_exists( $template_file ) ) {
            $template_file = LM_PLUGIN_PATH . 'template-parts/ux-lawyers/normal.php';
        }
    
        if ( file_exists( $template_file ) ) {
            extract( $vars );
            include $template_file;
        } else {
            // Fallback nếu không có file nào (hiếm khi xảy ra)
            echo '<!-- Missing template for style: ' . esc_attr( $style ) . ' -->';
        }
    }

    public function render( $atts ) {
        $defined_atts = $atts;

        $atts = shortcode_atts( [
            'posts'         => 8,
            'ids'           => '',
            'lawyer_cat'    => '',
            'orderby'       => 'menu_order',
            'order'         => 'ASC',
            'columns'       => 3,
            'columns__sm' => 1,
            'style'         => 'badge',
            'show_quickview'=> 'false',   // quickview button
            // các attrs về layout, slider (copy từ team_member)
            '_id'           => 'lawyer-' . rand(),
            'type'          => 'row',
            'col_spacing'   => 'small',
            'image_size'    => 'medium',
            'image_height'  => '56%',
            'text_align'    => 'center',
            'title_size'    => 'large',
            'excerpt'       => 'visible',
            'excerpt_length'=> 15,         
            // pagination ajax
            'relay'                      => '',
            'relay_control_result_count' => 'true',
            'relay_control_position'     => 'bottom',
            'relay_control_align'        => 'center',
            'relay_id'                   => '',
            'relay_class'                => '',
            'page_number'                => 1,
        ], $atts );

        
        // Ẩn nếu visibility = hidden (đã support trong view)
        if ( isset( $atts['visibility'] ) && $atts['visibility'] === 'hidden' ) return '';
        
        // === Xử lý phân trang AJAX ===
        // Xử lý phân trang cho relay AJAX
        if ( ! empty( $atts['relay'] ) && isset( $atts['page_number'] ) ) {
            // Khi gọi qua AJAX, page_number được gửi trong atts
            $paged = max( 1, intval( $atts['page_number'] ) );
        } else {
            // Non-AJAX: lấy từ query var
            $paged = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1;
            if ( get_query_var( 'page' ) ) {
                $paged = get_query_var( 'page' );
            }
        }
        $atts['page_number'] = $paged; 

        // Build query args
        $args = [
            'post_type'      => 'lawyer',
            'post_status'    => 'publish',
            'posts_per_page' => intval( $atts['posts'] ),
            'orderby'        => $atts['orderby'],
            'order'          => $atts['order'],
            'paged'          => $paged,
        ];

        if ( ! empty( $atts['lawyer_cat'] ) ) {
            $args['tax_query'] = [[
                'taxonomy' => 'lawyer_category',
                'field'    => 'slug',
                'terms'    => explode( ',', $atts['lawyer_cat'] ),
            ]];
        }

        if ( ! empty( $atts['ids'] ) ) {
            $args['post__in'] = explode( ',', $atts['ids'] );
            $args['posts_per_page'] = -1;
            $args['orderby'] = 'post__in';
        }

        $query = new WP_Query( $args );
        if ( ! $query->have_posts() ) return '';

        ob_start();

        // === Mở container Relay ===
        if ( class_exists( 'Flatsome_Relay' ) ) {
            Flatsome_Relay::render_container_open( $query, $this->tag, $defined_atts, $atts );
        }


       

        // Chuẩn bị các biến cho repeater
        $classes_box   = [ 'box', 'box-lawyer', 'has-hover' ];
        $classes_image = [];
        $classes_text  = [];

        $style = $atts['style'];
        if ( $style === 'text-overlay' ) {
            $image_hover = 'zoom';
        }
        $style = str_replace( 'text-', '', $style );

        if ( $style )                    $classes_box[] = 'box-' . $style;
        if ( $style === 'overlay' || $style === 'shade' ) $classes_box[] = 'dark';
        if ( $style === 'badge' )        $classes_box[] = 'hover-dark';
        if ( isset( $atts['text_pos'] ) && $atts['text_pos'] ) $classes_box[] = 'box-text-' . $atts['text_pos'];

        if ( ! empty( $atts['image_hover'] ) )   $classes_image[] = 'image-' . $atts['image_hover'];
        if ( ! empty( $atts['image_hover_alt'] ) ) $classes_image[] = 'image-' . $atts['image_hover_alt'];
        if ( ! empty( $atts['image_height'] ) )   $classes_image[] = 'image-cover';

        $classes_text[] = 'text-' . $atts['text_align'];
        if ( ! empty( $atts['text_size'] ) ) $classes_text[] = 'is-' . $atts['text_size'];

        // Tạo repeater
        $repeater = [
            'id'           => $atts['_id'],
            'class'        => $atts['class'] ?? '',
            'type'         => $atts['type'],
            'style'        => $style,
            'columns'      => $atts['columns'],
            'columns__sm'  => $atts['columns__sm'] ?? '',
            'columns__md'  => $atts['columns__md'] ?? '',
            'row_spacing'  => $atts['col_spacing'],
        ];

        get_flatsome_repeater_start( $repeater );

        while ( $query->have_posts() ) {
            $query->the_post();
            $shortcode_qv = get_post_meta( get_the_ID(), '_lm_bio_shortcode', true );
            $has_qv = $shortcode_qv && $atts['show_quickview'] === 'true';
        
            // Gọi template theo style
            $this->get_template_part( $atts['style'], array(
                'classes_box'   => $classes_box,
                'classes_image' => $classes_image,
                'classes_text'  => $classes_text,
                'atts'          => $atts,
                'has_qv'        => $has_qv,
                'shortcode_qv'  => $shortcode_qv,
            ) );
        }
        wp_reset_postdata();

        get_flatsome_repeater_end( $repeater );

        // === Đóng container Relay ===
        if ( class_exists( 'Flatsome_Relay' ) ) {
            Flatsome_Relay::render_container_close();
        }

        return ob_get_clean();
    }
}