<?php
/**
 * The template for displaying job content in the single-thjm_jobs.php template
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/content-single-job.php
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

do_action( 'thjm_before_single_job' );

?>
<div id="thjmf_job-<?php the_ID(); ?>" class="<?php echo esc_attr( thjmf_get_single_job_wrapper_class() ); ?>">

	<header class="entry-header">
		<?php do_action( 'thjm_single_job_header' ); ?>
	</header>
	<div class="entry-jobs entry-content">
		<?php

		do_action( 'thjm_before_single_job_content' );

		do_action( 'thjm_single_job_content' );

		do_action( 'thjm_after_single_job_content' );	
		?>
	</div>
</div>

<?php do_action( 'thjm_after_single_job' );