<div class="col lawyercol">
    <div class="col-inner">
        <div class="box box-team has-hover box-simple box-text-bottom">
            <?php if ( $has_qv ) : ?>
                        <a class="button small lm-quickview-btn" data-shortcode="<?php echo esc_attr( $shortcode_qv ); ?>" style="
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
        z-index: 9;
    background: transparent;
">
                            <?php esc_html_e( 'Quick view', 'lm' ); ?>
                        </a>
            <div class="box-image">
                <div class="image-cover" style="padding-top:180;">
                    <a href="<?php the_permalink(); ?>" class="plain">
                                <?php the_post_thumbnail( $atts['image_size'] ); ?>
                            </a>
                                                                        </div>
            </div>
            <div class="box-text text-center">
                <div class="box-text-inner team-post-inner">
                    <h3 class="post-title is-<?php echo esc_attr( $atts['title_size'] ); ?>">
                        <a href="<?php the_permalink(); ?>" class="plain"><?php the_title(); ?></a>
                    </h3>
                    
                                                    
                    <?php 
                    $terms = get_the_terms( get_the_ID(), 'lawyer_category' );
                    if ( $terms && ! is_wp_error( $terms ) ) : ?>
                        <p class="lawyer-category is-xsmall team-category">
                            <?php echo esc_html( implode( ', ', wp_list_pluck( $terms, 'name' ) ) ); ?>
                        </p>
                    <?php endif; ?>
                                                
                    <div class="is-divider"></div>
        
        
        
                    
                    <div class="is-divider"></div>
                    
                    <?php endif; ?>
        
                                                    <p class="team-excerpt "><?php echo flatsome_get_the_excerpt( $atts['excerpt_length'] ); ?></p>
                                                <a href="<?php the_permalink(); ?>" class="readmore readmore-icon"></a>
                </div>
            </div>
        </div>
    </div>
</div>