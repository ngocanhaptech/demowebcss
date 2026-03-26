<?php
/**
 *The template file for title in the job listing loop
 * 
 * This template can be overridden by copying it to yourtheme/job-manager-career/loop/title.php
 *
 * @link       https://themehigh.com
 * @author     ThemeHigh
 * @package    job-manager-career
 * @subpackage job-manager-career/templates
 * @category   Template
 * @since      1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>

<div class="thjmf-js-job-header thjmf-loop-job-header <?php echo isset($social_share) && !$social_share ? 'thjmf-social-share-disabled' : ''; ?>">
    <div class="thjmf-job-title-group">
        <h2 class="thjmf-loop-job-title thjmf-js-job-title">
            <?php echo thjmf_get_job_title(isset( $featured ) && $featured ); ?>
        </h2>
        <?php if( isset( $social_share ) && $social_share ): ?>
            <div class="thjmf-share-job">
                <img src="<?php thjmf_template_image('share.svg'); ?>" class="thjmf-social-share" alt="Share job" />
                <div class="thjmf-social-share-icons">
                    <?php if( $email_share ) : ?>
                        <a href="<?php thjmf_social_share_url('email'); ?>" target="_blank">
                            <img src="<?php thjmf_template_image('email-share.svg'); ?>" alt="<?php echo esc_attr__('Share to email', 'job-manager-career'); ?>" />
                        </a>
                    <?php endif;?>
                    <?php if( $whatsapp_share ) : ?>
                        <a href="<?php thjmf_social_share_url('whatsapp'); ?>" target="_blank">
                            <img src="<?php thjmf_template_image('whatsapp-share.svg'); ?>" alt="<?php echo esc_attr('Share to whatsapp', 'job-manager-career'); ?>" />
                        </a>
                    <?php endif;?>
                    <?php if( $facebook_share ) : ?>
                        <a href="<?php thjmf_social_share_url('facebook'); ?>" target="_blank">
                            <img src="<?php thjmf_template_image('facebook-share.svg'); ?>" alt="<?php echo esc_attr('Share to facebook', 'job-manager-career'); ?>" />
                        </a>
                    <?php endif;?>
                    <?php if( $twitter_share ) : ?>
                        <a href="<?php thjmf_social_share_url('twitter'); ?>" target="_blank">
                            <img src="<?php thjmf_template_image('twitter-share.svg'); ?>" alt="<?php echo esc_attr('Share to twitter', 'job-manager-career'); ?>" />
                        </a>
                    <?php endif;?>
                    <?php if( $linkedin_share ) : ?>
                        <a href="<?php thjmf_social_share_url('linkedin'); ?>" target="_blank">
                            <img src="<?php thjmf_template_image('linkedin-share.svg'); ?>" alt="<?php echo esc_attr('Share to linkedin', 'job-manager-career'); ?>" />
                        </a>
                    <?php endif;?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>