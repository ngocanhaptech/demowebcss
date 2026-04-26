<?php
abstract class LM_CPT_Base {
    protected $post_type;
    protected $args = [];

    public function register() {
        add_action( 'init', [ $this, 'do_register' ] );
    }

    public function do_register() {
        register_post_type( $this->post_type, $this->args );
    }
}