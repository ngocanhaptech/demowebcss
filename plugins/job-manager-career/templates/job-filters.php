<?php
/**
 * Filters in job manager career plugin shortcode.
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/job-filters.php
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

if( !$location_filter && !$job_type_filter && !$category_filter ){
	return;
}
?>

<div class="thjmf-job-filter-panel">
	<div class="thjmf-primary-filters thjmf-filter-row <?php echo esc_attr($primary_filter_class); ?> ">
		<?php if( $location_filter): ?>
			<div class="thjmf-job-filter thjmf-filter-location">
				<label for="thjmf_location_filter"><?php echo esc_html__('Location', 'job-manager-career'); ?></label>
				<input type="text" name="thjmf_location_filter" id="thjmf_location_filter" placeholder="<?php echo esc_attr__('City, State or Pin code', 'job-manager-career'); ?>" value="<?php echo esc_attr($job_location); ?>" />
				<img src="<?php thjmf_template_image('location-filter.svg'); ?>" alt="<?php echo esc_attr__('location', 'job-manager-career'); ?>" />
				<?php thjmf_location_filter_dropdown(); ?>
			</div>
		<?php endif; ?>
		<?php if( $location_filter ): ?>
			<button class="button thjmf-job-button" name="thjmf_find_job" id="thjmf_find_job"><?php echo esc_html__('Find Job', 'job-manager-career'); ?></button>
		<?php endif; ?>
	</div>
	<div class="thjmf-secondary-filters thjmf-filter-row">
		<?php if( $job_type_filter): ?>
			<div class="thjmf-job-filter">
				<?php thjmf_job_type_filter_dropdown($job_type); ?>
			</div>
		<?php endif; ?>
		<?php if( $category_filter): ?>
			<div class="thjmf-job-filter">
				<?php thjmf_category_filter_dropdown($job_category); ?>
			</div>
		<?php endif; ?>
		<?php if( !$location_filter ): ?>
			<button class="button thjmf-job-button" name="thjmf_find_job" id="thjmf_find_job"><?php echo esc_html__('Find Job', 'job-manager-career'); ?></button>
		<?php endif; ?>
	</div>
</div>
