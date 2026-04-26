class LM_Assets_Manager {
    public function register() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend' ] );
    }

    public function enqueue_frontend() {
        global $post;
        if ( ! $post ) {
            return;
        }

        // Lawyer list (cũ)
        if ( has_shortcode( $post->post_content, 'ux_lawyer_list' ) ) {
            wp_enqueue_style( 'lm-frontend', LM_PLUGIN_URL . 'assets/css/lm-frontend.css', [], '1.0' );
            wp_enqueue_script( 'lm-quickview', LM_PLUGIN_URL . 'assets/js/lm-quickview.js', [ 'jquery' ], '1.0', true );
            wp_localize_script( 'lm-quickview', 'lm_ajax', [ 'ajax_url' => admin_url( 'admin-ajax.php' ) ] );
        }

        // Document list (mới)
        if ( has_shortcode( $post->post_content, 'ux_document_list' ) ) {
            wp_enqueue_style( 'lm-document-frontend', LM_PLUGIN_URL . 'assets/css/document-frontend.css', [], '1.0' );
            wp_enqueue_script( 'lm-document-quickview', LM_PLUGIN_URL . 'assets/js/document-quickview.js', [ 'jquery' ], '1.0', true );
            wp_localize_script( 'lm-document-quickview', 'lm_ajax', [ 'ajax_url' => admin_url( 'admin-ajax.php' ) ] );
        }
    }
}