<?php
/**
 * Template for displaying single jobs
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/single-thjm_jobs.php
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

get_header();

/**
 * thjm_before_main_content hook.
 *
 * @hooked thjmf_single_job_before_content - 10
 */
do_action( 'thjm_before_main_content' );

while ( have_posts() ) :
	the_post();
	thjmf_get_template_part( 'content', 'single-job' );
endwhile; // end of the loop.

/**
 * thjm_after_main_content hook.
 *
 * @hooked thjmf_single_job_after_content - 10
 */
do_action( 'thjm_after_main_content' );

get_footer();
