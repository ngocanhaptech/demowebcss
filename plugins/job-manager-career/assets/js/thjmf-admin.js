var thjmf_settings  = (function($, window, document) {
	'use strict';

	var VALIDATOR_JOB_DETAIL_FIELDS_HTML  = '<tr><td class="thjmf-cell-nolabel">';
	VALIDATOR_JOB_DETAIL_FIELDS_HTML += '<input type="text" name="i_job_def_feature[]" value="" style="width:160px;height:30px;margin:0px 19px 0 0;" placeholder="Feature" autocomplete="'+thjmf_var['autocomplete']+'">';
	VALIDATOR_JOB_DETAIL_FIELDS_HTML += '<span class="dashicons dashicons-trash thjmf-dashicon-delete" onclick="thjmfRemoveCurrentDataRow(this)"></span>';
	VALIDATOR_JOB_DETAIL_FIELDS_HTML += '</td></tr>';

   /*------------------------------------
	*---- ON-LOAD FUNCTIONS - SATRT -----	
	*------------------------------------*/
	$(function() {
		setup_onclick_functions();
	});
   /*------------------------------------
	*---- ON-LOAD FUNCTIONS - END -------
	*------------------------------------*/
	function setup_onclick_functions(){
		setup_datepicker('thjmf-datepicker-field');
	}

	function setup_datepicker(elm){
		$('.'+elm).datepicker({
			dateFormat: "dd-mm-yy",
			minDate: 0,

		});
	}

	function toggle_switch_event_listener(elm){
		var element = $(elm);
		var checked = element.prop("checked") ? true : false;
		var wrapper = element.closest('.thjmf-switch-wrapper');
		wrapper = wrapper.length ? wrapper.find('.thjmf-switch-hidden') : element.siblings('input[type="hidden"]');
		wrapper.val(checked); 

		if( element.attr('name') == 'i_enable_apply_form'){
	        //Show/Hide apply form message based on Switch Toggle
	        var toggle_table = element.closest('.thjmf-settings-tab-form-table');
	        if( checked ){
	            toggle_table.addClass('thjmf-inactive');
	            toggle_table.find('.thjmf-toggle-row input').attr('readonly', true);
	        }else{
	        	toggle_table.removeClass('thjmf-inactive');
	            toggle_table.find('.thjmf-toggle-row input').removeAttr('readonly');
	        }
	    }else if( element.attr('name') == 'i_enable_social_share' ){
			var social_icons = element.closest('table').find('.thjmf-social-share-icons');
			if( checked ){
				social_icons.removeClass('thjmf-disabled-social-share');
			}else{
				social_icons.addClass('thjmf-disabled-social-share');
			}
		}
	}

	function addFeatureJobDetail(elm){
		$(VALIDATOR_JOB_DETAIL_FIELDS_HTML).insertBefore( $(elm).closest('tr') );
	}

	function removeCurrentDataRow(elm){
		$(elm).closest('tr').remove();
	}

	function copyShortcodeEvent(elm){
		var input = $(elm).closest('.thjmf-shortcode-info').find('input.thjmf-shortcode-text');
		input.select();
		document.execCommand('copy');
		alert("Shortcode copied");
		input.blur(); 
	}

	function widgetPopUp() {
		var x = document.getElementById("myDIV");
    	var y = document.getElementById("myWidget");
    	var th_animation=document.getElementById("th_quick_border_animation")
    	var th_arrow = document.getElementById("th_arrow_head");

    	if (x.style.display === "none" || !x.style.display) {
        	x.style.display = "block";
//         	y.style.background = "#D34156";
        	th_arrow.style="transform:rotate(-12.5deg);";
        	th_animation.style="box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);";
        	th_animation.style.animation='none';
    	} else {
        	x.style.display = "none";
//         	y.style.background = "#000000";
        	th_arrow.style="transform:rotate(45deg);"
        	th_animation.style.animation='pulse 1.5s infinite';
    	}
	}
	function widgetClose() {
    	var z = document.getElementById("myDIV");
	    var za = document.getElementById("myWidget");
		var th_animation=document.getElementById("th_quick_border_animation")
	    var th_arrow = document.getElementById("th_arrow_head");
	    z.style.display = "none";
		th_arrow.style="transform:rotate(45deg);"
	    th_animation.style.animation='pulse 1.5s infinite';
	//     za.style.background = "black";
	}
	
	return {
		thjmwidgetPopUp : widgetPopUp,
		thjmwidgetClose : widgetClose,
		toggle_switch_event_listener : toggle_switch_event_listener,
		addFeatureJobDetail  : addFeatureJobDetail,
		removeCurrentDataRow  :  removeCurrentDataRow,
		copyShortcodeEvent : copyShortcodeEvent, 
   	};
}(window.jQuery, window, document));	

function thjmfSwitchCbChangeListener(elm){
	thjmf_settings.toggle_switch_event_listener(elm);
}

function thjmfAddFeatureJobDetail(elm){
	thjmf_settings.addFeatureJobDetail(elm);
}

function thjmfRemoveCurrentDataRow(elm){
	thjmf_settings.removeCurrentDataRow(elm);
}

function thjmfCopyShortcodeEvent(elm){
	thjmf_settings.copyShortcodeEvent(elm);
}
function thjmfwidgetPopUp(){
	thjmf_settings.thjmwidgetPopUp();
}

function thjmfwidgetClose() {
	thjmf_settings.thjmwidgetClose();
}