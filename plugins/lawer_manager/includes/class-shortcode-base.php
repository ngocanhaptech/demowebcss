<?php
abstract class LM_Shortcode_Base {
    protected $tag;

    public function register() {
        add_shortcode( $this->tag, [ $this, 'render' ] );
    }

    abstract public function render( $atts );
}