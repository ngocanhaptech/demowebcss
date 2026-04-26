<?php
abstract class LM_UX_Element_Base {
    protected $shortcode;
    protected $name;
    protected $options = [];

    public function register() {
        if ( ! function_exists( 'add_ux_builder_shortcode' ) ) return;
        add_ux_builder_shortcode( $this->shortcode, [
            'name'      => $this->name,
            'category'  => __( 'Content', 'lm' ),
            'wrap'      => false,
            'options'   => $this->options,
        ] );
    }
}