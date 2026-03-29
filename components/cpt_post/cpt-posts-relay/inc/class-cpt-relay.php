<?php
defined( 'ABSPATH' ) || exit;

/**
 * CPT_Relay – tương tự Flatsome_Relay nhưng standalone,
 * không phụ thuộc theme. Hỗ trợ pagination, load-more, prev-next.
 */
final class CPT_Relay {

    private static $query;
    private static $defined_atts;
    private static $atts;
    private static $tag = 'cpt_posts';
    private static $enabled;
    private static $control;
    private static $control_result_count;
    private static $control_position;
    private static $control_align;

    private function __construct() {}

    // ── State ────────────────────────────────────────────────────
    private static function set_state( $query, $defined_atts, $atts ) {
        self::$query                = $query;
        self::$defined_atts         = $defined_atts;
        self::$atts                 = $atts;
        self::$enabled              = ! empty( $atts['relay'] )
                                      && $atts['type'] !== 'slider'
                                      && $query->max_num_pages > 1;
        self::$control              = $atts['relay'];
        self::$control_result_count = $atts['relay_control_result_count'] === 'true';
        self::$control_position     = $atts['relay_control_position'];
        self::$control_align        = $atts['relay_control_align'];
    }

    public static function is_enabled() {
        return self::$enabled;
    }

    // ── Assets ───────────────────────────────────────────────────
    public static function enqueue_assets() {
        wp_enqueue_script( 'cpt-relay-js' );
        wp_enqueue_style( 'cpt-relay-css' );
    }

    // ── Container ────────────────────────────────────────────────
    public static function render_container_open( $query, $defined_atts, $atts ) {
        self::set_state( $query, $defined_atts, $atts );
        if ( ! self::$enabled ) return;

        self::enqueue_assets();

        $id      = ! empty( $atts['relay_id'] ) ? $atts['relay_id'] : 'cpt-relay-' . wp_rand();
        $classes = array(
            'cpt-relay',
            'ux-relay',                          // Dùng class Flatsome để tái dụng CSS
            'ux-relay--' . self::$control,
        );

        if ( ! empty( $atts['relay_class'] ) ) $classes[] = $atts['relay_class'];
        if ( ! empty( $atts['visibility'] ) )  $classes[] = $atts['visibility'];

        $data = array(
            'tag'         => self::$tag,
            'atts'        => self::$defined_atts,
            'currentPage' => (int) $atts['page_number'],
            'totalPages'  => (int) $query->max_num_pages,
            'totalPosts'  => (int) $query->found_posts,
            'postCount'   => (int) $query->post_count,
        );
        ?>
        <div id="<?php echo esc_attr( $id ); ?>"
             class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
             data-cpt-relay="<?php echo esc_attr( wp_json_encode( $data ) ); ?>">
        <?php
        self::render_control_section( 'top' );
    }

    public static function render_container_close() {
        if ( ! self::$enabled ) return;
        self::render_control_section( 'bottom' );
        echo '</div>';
    }

    // ── Controls ─────────────────────────────────────────────────
    private static function render_control_section( $position ) {
        $pos = self::$control_position;

        if ( $position === 'top'    && $pos !== 'top'    && $pos !== 'top-bottom' ) return;
        if ( $position === 'bottom' && $pos !== 'bottom' && $pos !== 'top-bottom' ) return;

        $classes = array(
            'cpt-relay__control',
            'ux-relay__control',
            'ux-relay__control--' . $position,
            'container',
            'pb-half',
        );
        if ( self::$control_align ) $classes[] = 'text-' . self::$control_align;
        ?>
        <div class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>">
            <?php self::render_control( self::$control ); ?>
        </div>
        <?php
    }

    private static function render_control( $control ) {
        switch ( $control ) {
            case 'pagination':
                self::render_pagination();
                break;

            case 'load-more':
                ?>
                <button class="cpt-relay__button ux-relay__button ux-relay__load-more-button button primary mb-0">
                    <?php esc_html_e( 'Load more', 'cpt-posts-relay' ); ?>
                    <?php if ( self::$control_result_count ) {
                        printf(
                            '<span class="ux-relay__result-count">(<span class="ux-relay__current-count">%d</span> / %d)</span>',
                            self::$query->post_count,
                            self::$query->found_posts
                        );
                    } ?>
                </button>
                <?php
                break;

            case 'prev-next':
                ?>
                <button class="cpt-relay__button ux-relay__button ux-relay__nav-button ux-relay__nav-button--prev"
                        data-cpt-dir="prev" disabled
                        aria-label="<?php esc_attr_e( 'Previous', 'cpt-posts-relay' ); ?>">
                    <svg aria-hidden="true" class="ux-relay__button-icon" viewBox="0 0 100 100">
                        <path d="M 10,50 L 60,100 L 70,90 L 30,50 L 70,10 L 60,0 Z"></path>
                    </svg>
                </button>
                <button class="cpt-relay__button ux-relay__button ux-relay__nav-button ux-relay__nav-button--next"
                        data-cpt-dir="next"
                        aria-label="<?php esc_attr_e( 'Next', 'cpt-posts-relay' ); ?>">
                    <svg aria-hidden="true" class="ux-relay__button-icon" viewBox="0 0 100 100">
                        <path d="M 10,50 L 60,100 L 70,90 L 30,50 L 70,10 L 60,0 Z"
                              transform="translate(100,100) rotate(180)"></path>
                    </svg>
                </button>
                <?php
                break;
        }
    }

    private static function render_pagination() {
        $args = array(
            'base'      => '#/page/%#%',
            'format'    => '#/page/%#%',
            'current'   => (int) self::$atts['page_number'],
            'total'     => self::$query->max_num_pages,
            'mid_size'  => 3,
            'type'      => 'array',
            'prev_text' => '&#8249;',
            'next_text' => '&#8250;',
        );

        $pages = paginate_links( $args );
        if ( ! is_array( $pages ) ) return;

        echo '<ul class="ux-relay__pagination page-numbers nav-pagination links">';
        foreach ( $pages as $page ) {
            $page = str_replace( 'page-numbers', 'page-number', $page );
            // Strip full URL, chỉ giữ #/page/x
            $page = preg_replace_callback( '/href="([^"]*)"/', function ( $m ) {
                $pos = strrpos( $m[1], '#' );
                return $pos !== false ? 'href="' . substr( $m[1], $pos ) . '"' : $m[0];
            }, $page );
            echo "<li>$page</li>"; // phpcs:ignore
        }
        echo '</ul>';
    }

    // ── Ajax handler ─────────────────────────────────────────────
    public static function ajax_handler() {
        // Verify nonce
        if ( ! check_ajax_referer( 'cpt_relay_nonce', 'nonce', false ) ) {
            wp_send_json_error( array( 'message' => 'Invalid nonce' ) );
        }

        $tag  = isset( $_GET['tag'] )  ? sanitize_key( wp_unslash( $_GET['tag'] ) )               : '';
        $atts = isset( $_GET['atts'] ) ? self::sanitize_atts( wp_unslash( (array) $_GET['atts'] ) ) : array();

        if ( $tag !== 'cpt_posts' || empty( $atts ) ) {
            wp_send_json_error( array( 'message' => 'Invalid request' ) );
        }

        $markup = do_shortcode( '[cpt_posts ' . self::atts_to_string( $atts ) . ']' );
        wp_send_json_success( trim( $markup ) );
    }

    private static function sanitize_atts( $atts ) {
        $clean = array();
        foreach ( $atts as $key => $value ) {
            $key   = sanitize_key( $key );
            $value = is_array( $value )
                ? array_map( 'sanitize_text_field', $value )
                : sanitize_text_field( $value );
            $clean[ $key ] = $value;
        }
        return $clean;
    }

    private static function atts_to_string( $atts ) {
        $parts = array();
        foreach ( $atts as $key => $value ) {
            if ( $value !== '' && $value !== null ) {
                $parts[] = $key . '="' . esc_attr( $value ) . '"';
            }
        }
        return implode( ' ', $parts );
    }
}

// Đăng ký Ajax actions
add_action( 'wp_ajax_cpt_relay_request',        array( 'CPT_Relay', 'ajax_handler' ) );
add_action( 'wp_ajax_nopriv_cpt_relay_request', array( 'CPT_Relay', 'ajax_handler' ) );
