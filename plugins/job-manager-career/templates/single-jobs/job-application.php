<?php
/**
 *The template file for single job application form
 * 
 * This template can be overridden by copying it to yourtheme/job-manager-career/single-jobs/job-application.php
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

<div class="thjmf-job-application" tabindex="1" style="display: none;">
    <p class="thjmf-form-field thjmf-form-row thjmf-form-row-wide thjmf-validation-required thjmf-field-has-placeholder-label" id="thjmf_name_field" data-priority="">
        <label for="thjmf_first_name" class="thjmf-valign-label"><?php echo esc_html__('Name', 'job-manager-career'); ?>&nbsp;<span><abbr class="required" title="<?php echo esc_attr__( 'required', 'job-manager-career' )?>">*</abbr></span></label>
        <span class="thjmf-input-wrapper ">
            <input type="text" class="input-text thjmf-has-placeholder-label" name="name" id="name">
        </span>
    </p>
    <p class="thjmf-form-row thjmf-form-row-first thjmf-field-text thjmf-dialling-code-field thjmf-field-has-placeholder-label" id="phone_field" data-priority="3">
        <label for="phone" class="thjmf-valign-label"><?php echo esc_html__('Phone', 'job-manager-career'); ?></label>
        <span class="thjmf-input-wrapper">
            <?php if(apply_filters('thjm_advanced_phone_field', true, 'phone') ){
                thjmf_advanced_phone_field_features();
            }?>
            <input type="text" class="input-text thjmf-has-placeholder-label thjmf-dial-phone-number" name="phone" id="phone">
        </span>
    </p>
    <p class="thjmf-form-field thjmf-form-row thjmf-form-row-last thjmf-validation-required thjmf-field-has-placeholder-label" id="thjmf_email_field" data-priority="">
        <label for="thjmf_email" class="thjmf-valign-label"><?php echo esc_html__('Email', 'job-manager-career'); ?>&nbsp;<span><abbr class="required" title="<?php echo esc_attr__( 'required', 'job-manager-career' )?>">*</abbr></span></label>
        <span class="thjmf-input-wrapper ">
            <input type="text" class="input-text thjmf-has-placeholder-label" name="email" id="email">
        </span>
    </p>
    <p class="thjmf-form-row thjmf-form-row-wide thjmf-field-file thjmf-validation-required" id="resume_field" data-priority="5">
        <label>
            <?php echo esc_html__('Resume', 'job-manager-career'); ?>&nbsp;<abbr class="required" title="<?php echo esc_attr__( 'required', 'job-manager-career' )?>">*</abbr>
        </label>
        <span class="thjmf-input-wrapper">
            <input type="file" class="input-file thjmf-file-upload" name="resume" id="resume" placeholder="">
            <label class="thjmf-upload-title"><a href="#" class="thjmf-file-upload-link"><?php echo esc_html('Upload File', 'job-manager-career'); ?></a>&nbsp;&nbsp;<abbr class="required" title="<?php echo esc_attr('required', 'job-manager-career'); ?>">*</abbr></label>
        </span>
    </p>
    <p class="thjmf-form-field thjmf-form-row thjmf-form-row-wide thjmf-field-has-placeholder-label thjmf-field-textarea" id="thjmf_cover_letter_field" data-priority="">
        <label for="thjmf_cover_letter" class="thjmf-valign-label"><?php echo esc_html__('Cover Letter', 'job-manager-career'); ?>&nbsp;</label>
        <span class="thjmf-input-wrapper ">
            <textarea class="input-text thjmf-has-placeholder-label" name="cover_letter" id="cover_letter"></textarea>
        </span>
    </p>
    <?php do_action('thjm_before_application_submit_button'); ?>
    <button class="button thjmf-job-button" id="thjmf_apply_job" name="thjmf_apply_job"><?php echo esc_html__('Submit', 'job-manager-career'); ?></button>
</div>
