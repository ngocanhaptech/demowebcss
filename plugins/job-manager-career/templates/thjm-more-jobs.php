<?php
/**
 * More jobs option in the job listing page
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/thjm-more-jobs.php.
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

<div class="thjmf-more-jobs"> 
    <?php if( $max_page == '0' ){
        return;
    }
    if( !$last_page ): ?>
        <button class="button thjmf-job-button" name="<?php echo isset( $filter_l_m ) && $filter_l_m ? "thjmf_filter_load_more" : "thjmf_load_more" ?>" type="submit" id="load_more"><?php echo esc_html__('Load more', 'job-manager-career'); ?></button>
    <?php endif; ?>
</div>