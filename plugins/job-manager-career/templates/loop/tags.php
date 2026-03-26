<?php
/**
 *The template file for tags in the job listing loop
 * 
 *This template can be overridden by copying it to yourtheme/job-manager-career/loop/tags.php
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
    <span class="thjmf-job-tag thjmf-loop-job-tag-time">
        <img src="<?php thjmf_template_image('time.svg'); ?>" alt="Posted time" />
        <span class="thjmf-job-tag-name"><?php echo esc_html( $date ); ?></span>
    </span>
<?php endif;
if( $show_location && !empty( $location ) ): ?>
    <span class="thjmf-job-tag thjmf-loop-job-tag-location">
        <img src="<?php thjmf_template_image('location.svg'); ?>" alt="Location" />
        <span class="thjmf-job-tag-name"><?php echo esc_html( $location ); ?></span>
    </span>
<?php endif;
if( $show_job_type && !empty( $type ) ): ?>
    <span class="thjmf-job-tag thjmf-loop-job-tag-type">
        <img src="<?php thjmf_template_image('job-type.svg'); ?>" alt="Job type" />
        <span class="thjmf-job-tag-name"><?php echo esc_html( $type ); ?></span>
    </span>
<?php endif;
echo '</div>';

