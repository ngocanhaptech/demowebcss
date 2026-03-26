<?php
/**
 *The template file for job features in single job page
 * 
 * This template can be overridden by copying it to yourtheme/job-manager-career/single-jobs/features.php
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

do_action('thjm_before_single_job_feature');

thjmf_display_job_features( $features, $details );

do_action('thjm_after_single_job_feature');