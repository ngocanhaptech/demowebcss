<?php
class LM_Meta_Box_Helper {
    public static function add_textarea( $post, $field_id, $field_label, $description = '' ) {
        $value = get_post_meta( $post->ID, $field_id, true );
        ?>
        <p>
            <label for="<?php echo esc_attr( $field_id ); ?>">
                <strong><?php echo esc_html( $field_label ); ?></strong>
            </label><br>
            <textarea name="<?php echo esc_attr( $field_id ); ?>" id="<?php echo esc_attr( $field_id ); ?>" rows="2" style="width:100%;"><?php echo esc_textarea( $value ); ?></textarea>
            <?php if ( $description ) : ?>
                <small><?php echo esc_html( $description ); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }

    public static function save( $post_id, $nonce_action, $nonce_name, $fields ) {
        if ( ! isset( $_POST[ $nonce_name ] ) || ! wp_verify_nonce( $_POST[ $nonce_name ], $nonce_action ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        foreach ( $fields as $field_name => $sanitize_callback ) {
            if ( isset( $_POST[ $field_name ] ) ) {
                $value = call_user_func( $sanitize_callback, wp_unslash( $_POST[ $field_name ] ) );
                update_post_meta( $post_id, $field_name, $value );
            }
        }
    }
}