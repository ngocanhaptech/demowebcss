<?php
/**
 * No jobs content in the job listing page
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/thjm-no-jobs.php.
 *
 * @author      ThemeHigh
 * @package     job-manager-career
 * @subpackage  job-manager-career/templates
 * @category    Template
 * @version     1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<p><?php echo esc_html__('No Jobs Found', 'job-manager-career'); ?></p>
