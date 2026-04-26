<div class="col lawyercol">
    <div class="col-inner">
        <div class="<?php echo esc_attr( implode( ' ', $classes_box ) ); ?>">
            <?php if ( has_post_thumbnail() ) : ?>
            <div class="box-image">
                <div class="<?php echo esc_attr( implode( ' ', $classes_image ) ); ?>" style="padding-top:<?php echo esc_attr( $atts['image_height'] ); ?>">
                    <a href="<?php the_permalink(); ?>" class="plain">
                        <?php the_post_thumbnail( $atts['image_size'] ); ?>
                    </a>
                </div>
            </div>
            <?php endif; ?>
            <div class="box-text <?php echo esc_attr( implode( ' ', $classes_text ) ); ?>">
                <div class="box-text-inner">
                    <h3 class="post-title is-<?php echo esc_attr( $atts['title_size'] ); ?>">
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    </h3>
                    <?php 
                    $terms = get_the_terms( get_the_ID(), 'lawyer_category' );
                    if ( $terms && ! is_wp_error( $terms ) ) : ?>
                        <p class="lawyer-category is-xsmall">
                            <?php echo esc_html( implode( ', ', wp_list_pluck( $terms, 'name' ) ) ); ?>
                        </p>
                    <?php endif; ?>
                    <div class="is-divider"></div>
                    <?php if ( $atts['excerpt'] !== 'false' ) : ?>
                        <p class="lawyer-excerpt"><?php echo flatsome_get_the_excerpt( $atts['excerpt_length'] ); ?></p>
                    <?php endif; ?>
                    <?php if ( $has_qv ) : ?>
                        <button class="button small lm-quickview-btn" data-shortcode="<?php echo esc_attr( $shortcode_qv ); ?>">
                            <?php esc_html_e( 'Quick view', 'lm' ); ?>
                        </button>
                    <?php endif; ?>
                    <a href="<?php the_permalink(); ?>" class="readmore readmore-icon"><?php esc_html_e( 'Xem thêm', 'lm' ); ?></a>
                </div>
            </div>
        </div>
    </div>
</div>