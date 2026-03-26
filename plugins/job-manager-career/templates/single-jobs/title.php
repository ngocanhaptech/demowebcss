<?php
/**
 *The template file for job title in single job page
 * 
 * This template can be overridden by copying it to yourtheme/job-manager-career/single-jobs/title.php
 *
 * @link       https://themehigh.com
 * @author     ThemeHigh
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 * @category   Template
 * @since      1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>

<div class="thjmf-job-header thjmf-js-job-header<?php echo esc_attr($wrapper_class); ?>">
    <div class="thjmf-job-title-group">
        <h1 class="thjmf-job-title thjmf-js-job-title entry-title"><?php echo thjmf_get_job_title(isset( $featured ) && $featured ); ?></h1>
        <div class="thjmf-title-actions">
            <?php if( isset( $social_share ) && $social_share ): ?>
                <div class="thjmf-share-job">
                    <img src="<?php thjmf_template_image('share.svg'); ?>" class="thjmf-social-share" />
                    <div class="thjmf-social-share-icons">
                        <?php if( $email_share ) : ?>
                            <a href="<?php thjmf_social_share_url('email'); ?>" target="_blank">
                                <img src="<?php thjmf_template_image('email-share.svg'); ?>" alt="<?php echo esc_attr__('Share to email', 'job-manager-career'); ?>" />
                            </a>
                        <?php endif;?>
                        <?php if( $whatsapp_share ) : ?>
                            <a href="<?php thjmf_social_share_url('whatsapp'); ?>" target="_blank">
                                <img src="<?php thjmf_template_image('whatsapp-share.svg'); ?>" alt="<?php echo esc_attr__('Share to whatsapp', 'job-manager-career'); ?>" />
                            </a>
                        <?php endif;?>
                        <?php if( $facebook_share ) : ?>
                            <a href="<?php thjmf_social_share_url('facebook'); ?>" target="_blank">
                                <img src="<?php thjmf_template_image('facebook-share.svg'); ?>" alt="<?php echo esc_attr__('Share to facebook', 'job-manager-career'); ?>" />
                            </a>
                        <?php endif;?>
                        <?php if( $twitter_share ) : ?>
                            <a href="<?php thjmf_social_share_url('twitter'); ?>" target="_blank">
                                <img src="<?php thjmf_template_image('twitter-share.svg'); ?>" alt="<?php echo esc_attr__('Share to twitter', 'job-manager-career'); ?>" />
                            </a>
                        <?php endif;?>
                        <?php if( $linkedin_share ) : ?>
                            <a href="<?php thjmf_social_share_url('linkedin'); ?>" target="_blank">
                                <img src="<?php thjmf_template_image('linkedin-share.svg'); ?>" alt="<?php echo esc_attr__('Share to linkedin', 'job-manager-career'); ?>" />
                            </a>
                        <?php endif;?>
                    </div>
                </div>
            <?php endif; ?>
            <?php if( thjmf_is_appliable_job() ): ?>
                <button class="button thjmf-show-form thjmf-job-button thjmf-js-job-apply-button" data-position="top"><?php echo esc_html__('Apply Now','job-manager-career'); ?></button>
            <?php endif; ?>
        </div>
    </div>
</div>