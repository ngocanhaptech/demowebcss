<?php
/**
 *The template file for details button in the job listing loop
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/loop/details-button.php
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

echo wp_kses_post( apply_filters(
    'thjm_loop_job_details_button',
    sprintf(
        '<a href="%s" class="button thjmf-loop-job-details-button">'.__('Details','job-manager-career').'</a>',
        esc_url( get_the_permalink() ),
    ),
) );
