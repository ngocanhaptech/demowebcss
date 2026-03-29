<?php
/**
 *The template file for job tags in single job page
 * 
 * This template can be overridden by copying it to yourtheme/job-manager-career/single-jobs/tags.php
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
echo '<div class="thjmf-job-tags">';
if( $show_date && !empty( $date ) ): ?>
    <span class="thjmf-job-tag">
        <img src="<?php thjmf_template_image('time.svg'); ?>" alt="<?php echo esc_attr__('Posted time', 'job-manager-career'); ?>" />
        <?php echo esc_html( $date ); ?>
    </span>
<?php endif;
if( $show_location && !empty( $location ) ): ?>
    <span class="thjmf-job-tag">
        <img src="<?php thjmf_template_image('location.svg'); ?>" alt="<?php echo esc_attr__('Location', 'job-manager-career'); ?>" />
        <?php echo esc_html( $location ); ?>
    </span>
<?php endif;
if( $show_job_type && !empty( $type ) ): ?>
    <span class="thjmf-job-tag">
        <img src="<?php thjmf_template_image('job-type.svg'); ?>" alt="<?php echo esc_attr__('Job type', 'job-manager-career'); ?>" />
        <?php echo esc_html( $type ); ?>
    </span>
<?php endif;
echo '</div>';

