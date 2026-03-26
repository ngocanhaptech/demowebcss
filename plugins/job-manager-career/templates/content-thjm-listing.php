<?php
/**
 *The template file for job listing content
 *
 *This template can be overridden by copying it to yourtheme/job-manager-career/content-thjm-listing.php
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

/**
 * Hook: thjm_before_job_loop_item.
 *
 * @hooked thjmf_template_loop_job_list_open - 10
 */
do_action( 'thjm_before_job_loop_item' );

/**
 * Hook: thjm_before_job_loop_item_title.
 *
 */
do_action( 'thjm_before_job_loop_item_title' );

/**
 * Hook: thjm_job_loop_item_title.
 *
 * @hooked thjmf_template_loop_job_title - 10
 */
do_action( 'thjm_job_loop_item_title' );

/**
 * Hook: thjm_after_job_loop_item_title.
 *
 * @hooked thjmf_template_loop_job_tags - 10
 * @hooked thjmf_template_loop_job_excerpt - 20
 * @hooked thjmf_template_loop_job_detail_button - 30
 */
do_action( 'thjm_after_job_loop_item_title' );

/**
 * Hook: thjm_after_job_loop_item.
 *
 * @hooked thjmf_template_loop_job_list_close - 10
 */
do_action( 'thjm_after_job_loop_item' );
