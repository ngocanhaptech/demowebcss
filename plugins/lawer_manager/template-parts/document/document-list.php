<?php
// Nhận $classes_box, $classes_image, $classes_text, $atts, $download_url, $has_qv, $shortcode_qv.
?>
<div class="col document-item">
    <div class="col-inner <?php echo esc_attr( implode( ' ', $classes_box ) ); ?>">

        <div class="document-header">
            <h4 class="document-title">
                <a href="<?php the_permalink(); ?>">
                    <?php the_title(); ?>
                </a>
            </h4>

            <?php if ( $download_url ) : ?>
                <a class="button small document-download-btn"
                   href="<?php echo esc_url( $download_url ); ?>"
                   target="_blank"
                   rel="noopener">
                    <?php esc_html_e( 'Tải tài liệu', 'lm' ); ?>
                </a>
            <?php endif; ?>
        </div>

        <div class="document-excerpt <?php echo esc_attr( implode( ' ', $classes_text ) ); ?>">
            <?php echo wp_trim_words( get_the_excerpt(), 20 ); ?>
        </div>

        <?php if ( $has_qv ) : ?>
            <div class="document-actions">
                <button class="button outline document-quickview-btn"
                        data-shortcode="<?php echo esc_attr( $shortcode_qv ); ?>">
                    <?php esc_html_e( 'Xem chi tiết', 'lm' ); ?>
                </button>
            </div>
        <?php endif; ?>

    </div>
</div>