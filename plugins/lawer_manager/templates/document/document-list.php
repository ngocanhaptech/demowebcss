<div class="col document-item">
    <div class="col-inner">
        <h4><?php the_title(); ?></h4>
        <p><?php echo get_the_excerpt(); ?></p>
        <?php if ( $download_url ) : ?>
            <a href="<?php echo esc_url( $download_url ); ?>" class="button">Download</a>
        <?php endif; ?>
        <?php if ( $has_qv ) : ?>
            <button class="button lm-quickview-btn" data-shortcode="<?php echo esc_attr( $shortcode_qv ); ?>">Quick view</button>
        <?php endif; ?>
    </div>
</div>