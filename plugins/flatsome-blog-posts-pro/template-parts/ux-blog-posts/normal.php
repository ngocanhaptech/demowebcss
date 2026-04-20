<?php
/**
 * Normal style template
 *
 * @package Flatsome_Blog_Posts_Pro
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Các biến được extract từ $atts
$classes_box = array( 'box', 'box-normal', 'box-text-' . $text_pos );
if ( $style == 'overlay' ) $classes_box[] = 'dark';
if ( $style == 'shade' ) $classes_box[] = 'dark';
if ( $image_hover ) $classes_image[] = 'image-' . $image_hover;
if ( $image_radius ) $image_style = 'border-radius:' . $image_radius . '%';
if ( $image_height ) $image_padding = 'padding-top:' . $image_height;

$readmore_text = $readmore ?: __( 'Read more', 'flatsome-blog-posts-pro' );
?>
<div class="col-inner">
    <div class="<?php echo esc_attr( implode( ' ', $classes_box ) ); ?> box-blog-post has-hover">
        <?php if ( has_post_thumbnail() ) : ?>
            <div class="box-image" style="<?php echo esc_attr( $image_style ); ?>">
                <div class="<?php echo esc_attr( implode( ' ', $classes_image ) ); ?>" style="<?php echo esc_attr( $image_padding ); ?>">
                    <a href="<?php the_permalink(); ?>" class="plain">
                        <?php the_post_thumbnail( $image_size ); ?>
                    </a>
                    <?php if ( $image_overlay ) : ?>
                        <div class="overlay" style="background-color: <?php echo esc_attr( $image_overlay ); ?>"></div>
                    <?php endif; ?>
                    <?php if ( $style == 'shade' ) : ?>
                        <div class="shade"></div>
                    <?php endif; ?>
                </div>
                <?php if ( $post_icon && get_post_format() == 'video' ) : ?>
                    <div class="absolute no-click x50 y50 md-x50 md-y50 lg-x50 lg-y50">
                        <div class="overlay-icon">
                            <?php echo get_flatsome_icon( 'icon-play' ); ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="box-text text-<?php echo esc_attr( $text_align ); ?>" style="background-color: <?php echo esc_attr( $text_bg ); ?>; padding: <?php echo esc_attr( $text_padding ); ?>">
            <div class="box-text-inner blog-post-inner">
                <?php if ( $show_category == 'true' ) : ?>
                    <p class="cat-label is-xxsmall op-7 uppercase">
                        <?php the_category( ' ' ); ?>
                    </p>
                <?php endif; ?>

                <h5 class="post-title is-<?php echo esc_attr( $title_size ); ?> <?php echo esc_attr( $title_style ); ?>">
                    <a href="<?php the_permalink(); ?>" class="plain"><?php the_title(); ?></a>
                </h5>

                <?php if ( ( ! has_post_thumbnail() && $show_date == 'text' ) || $show_date == 'text' ) : ?>
                    <div class="post-meta is-small op-8">
                        <?php echo get_the_date(); ?>
                        <span class="post-author"><i class="icon-user-o mr-half"></i> <?php the_author_posts_link(); ?></span>
                    </div>
                <?php endif; ?>

                <div class="is-divider"></div>

                <?php if ( $show_excerpt == 'true' ) : ?>
                    <p class="from_the_blog_excerpt">
                        <?php echo flatsome_get_the_excerpt( $excerpt_length ); ?>
                    </p>
                <?php endif; ?>

                <?php if ( $readmore ) : ?>
                    <a href="<?php the_permalink(); ?>" class="button <?php echo esc_attr( $readmore_color ); ?> is-<?php echo esc_attr( $readmore_style ); ?> is-<?php echo esc_attr( $readmore_size ); ?> mb-0">
                        <?php echo esc_html( $readmore_text ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <?php if ( has_post_thumbnail() && ( $show_date == 'badge' || $show_date == 'true' ) ) : ?>
            <div class="badge absolute top post-date badge-<?php echo esc_attr( $badge_style ?: 'outline' ); ?>">
                <div class="badge-inner">
                    <span class="post-date-day"><?php echo get_the_time( 'd' ); ?></span><br>
                    <span class="post-date-month is-xsmall"><?php echo get_the_time( 'M' ); ?></span>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>