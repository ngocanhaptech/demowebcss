var thjmf_public  = (function($, window, document) {
	'use strict';

	var REQUIRED_HTML = '<div class="thjmf-validation-message">Required Field<img src="'+thjmf_public_var.assets_url+'/images/validation-error.svg" /></div>';
	var FILTERS = ['thjmf_location_filter', 'thjmf_category_filter', 'thjmf_job_type_filter'];
	$(window).on('resize', function(){
		if( !$('#thjmf_apply_now_popup').hasClass('thjmf-popup-active') ){
			return;
		}

		var screen_width = $(window).width();
		var popup = $('#thjmf_apply_now_popup');
		var popup_container = popup.find('.thjmf-popup-wrapper');
		var height = popup_container.height();

		var header_height = popup_container.find('.thjmf-popup-header').height();
		var footer_height = popup_container.find('.thjmf-popup-footer-actions').outerHeight();
		var scroll_h = (height - (header_height+footer_height))+'px';

		var width = '';
		var left = '';
		var top = '12px';
		var bottom = '12px';
        var admin_bar = $('#wpadminbar').length ? true : false;
		if( screen_width <= 500 ){
			width = '78%';
			left = '12%';
			top = admin_bar ? '56px' : top;
			bottom = '80px';
		}else if( screen_width <= 768 && screen_width > 500 ){
			width = '62%';
			left = '19%';
			top = admin_bar ? '56px' : top;
			bottom = '80px';
		}else if( screen_width > 768 && screen_width <= 1025){
			width = '50%';
			left = '25%';
            top = admin_bar ? '44px' : top;
			if( screen_width <= 783 && admin_bar ){
				top = '56px';
			}
		}else if( screen_width > 1025){
			width = '40%';
			left = '30%';
            top = admin_bar ? '44px' : top;
		}

		popup.find('.thjmf-popup-outer-wrapper').css('height',scroll_h);
		popup.find('.thjmf-popup-wrapper').css({
			'top'  : top, 
			'bottom'  : bottom, 
			'left' : left,
			'width': width 
		});
    });

    $("#thjmf_resume").change(function () {
        var fileExtension = ['pdf', 'doc', 'docx'];
        if( fileupload_change_event( $(this).val() ) ){
        	alert("Only these formats are allowed : "+fileExtension.join(', '));
        	$(this).val('');
        }
    });

    $("#thjmf_location_filter").keyup(function() {
	 	var input = $(this);
	 	var location_menu = input.closest('.thjmf-job-filter').addClass('thjmf-filter-location-open').find('ul');
	 	var top = input.outerHeight();
	 	location_menu.show().css('top', top);
	 	location_menu.html(get_locations(input));
	 	
	 }).blur(function(){
	 	var input = $(this);
	 	if(input.val() === ''){
	 		input.data('slug', '');
	 	}
	 	input.closest('.thjmf-job-filter').removeClass('thjmf-filter-location-open').find('ul').hide();
	 });

	$('.thjmf-location-dropdown-wrapper').on('mousedown', 'li', function() {
		var selected_option = $(this);
		selected_option.closest('.thjmf-job-filter').find('input').val(selected_option.html()).data('slug', selected_option.data('slug'));
	});

	$('#thjmf_show_form').click(function(){
		$('#thjmf_job_application .thjmf-job-application').toggle();
		$('.thjmf-form-notification').remove();
	});

	$('.thjmf-show-form').click(function(){
		var button = $(this);
		if( button.data('position') === "top" ){
			var form_div = $('#thjmf_job_application .thjmf-job-application');
			form_div.focus();
			if( form_div.is(":hidden") ){
				form_div.show();
			}
			var element_top = form_div.offset().top;
			var adjustment = window.innerHeight / 4;
			if( !is_form_in_viewport( element_top, form_div, adjustment ) ){
				$('body, html').animate({scrollTop: element_top - adjustment});//offset of 80
			}
		}
	});

	$('.thjmf-country-dial-codes').click(function(){
		$(this).closest('.thjmf-form-row').addClass('thjmf-dialling-list-active');
	});

	$(".thjmf-job-application .thjmf-has-placeholder-label").focus(function(event){
		prepare_application_text_field( $(this), 'click' );
	});

	$(".thjmf-job-application .thjmf-has-placeholder-label").blur(function(){
		prepare_application_text_field( $(this), 'blur' );
	});

	$('#thjmf_job_application').on('click', '.thjmf-close-notification', function(event){
		$(this).closest('.thjmf-form-notification').remove();
	});

	$('.thjmf-job-application').on('click', '.thjmf-inline-flags', function(){
		var selected = $(this);
		var content = selected.html();
		var selected_country = selected.data('value');
		var dial_code_input = $('.thjmf-country-dial-codes');
		dial_code_input.html(content);
		$(this).closest('.thjmf-form-row').removeClass('thjmf-dialling-list-active');
		var selected_code = dial_code_input.find('.thjmf-dialling-code').html();
		$('#phone_dial_code').val(selected_code);
		$('#phone_country_code').val(selected_country);
	});

	$('.thjmf-job-application').on('click', '.thjmf-validation-message', function(){
		var message_block = $(this);
		remove_validation_message(message_block, false);
	});

	$('.thjmf-file-upload-link').click(function(event){
		event.preventDefault();
		var upload_wrapper = $(this).closest('.thjmf-form-row');
		upload_wrapper.find('.thjmf-file-upload').click();
		setTimeout(function(){
			upload_wrapper.find('.thjmf-file-required').removeClass('thjmf-file-required');
			upload_wrapper.find('.thjmf-validation-message').remove();
		},500); 
	});

	$('.thjmf-job-application').on('click', '.thjmf-remove-uploaded-file', function(){
		var remove = $(this);
		remove.closest('.thjmf-uploaded-file-meta').remove();
		var file_upload_field = remove.closest('.thjmf-field-file').find('.thjmf-file-upload');
		var elem = $('#resume');
		elem.wrap('<form>').closest('form').get(0).reset();
		elem.unwrap();
	});

	$('body').click(function(e) {
		var modal = $(this).find('.thjmf-social-share-icons');
		var target = $(e.target);
		if( ! target.closest('.thjmf-share-job').length ){
			modal.hide();
		}
		if( should_close_dialling_list(target) ){
			$(this).find('.thjmf-dialling-list-active').removeClass('thjmf-dialling-list-active');
		}
	});

	$(".thjmf-file-upload").change(function (e) {
		var file = $(this);
		var field = file.attr('name');
		var fileExtension = ['pdf', 'doc', 'docx'];
		var wrapper = file.closest('.thjmf-input-wrapper');
		if( fileupload_change_event( $(this).val() ) ){
			alert("The file types allowed are "+fileExtension.join(', '));
			$(this).val('');
			if( !file.hasClass('thjmf-validation-required') ){
				file.addClass('thjmf-validation-required');
			}
			if( wrapper.find('.thjmf-chosen-file').length > 0 ){
				wrapper.find('.thjmf-chosen-file').remove();
			}
		}else{
			var file_to_upload = '<span class="thjmf-uploaded-file-meta">';
			file_to_upload += '<label class="thjmf-upload-subtitle thjmf-chosen-file">'+e.target.files[0].name+'</label>';
			file_to_upload += '<span class="dashicons dashicons-no-alt thjmf-remove-uploaded-file"></span>';
			file_to_upload += '</span>';
			wrapper.append(file_to_upload);
		}
	});

	$(document).on('click', '.thjmf-social-share', function(){
		$(this).closest('.thjmf-share-job').find('.thjmf-social-share-icons').toggle();
	});

	$('#thjmf_find_job').click(function(e){
		var filter_selected = false;
		$.each( FILTERS, function(index, filter){
			var filter_obj = $('#'+filter);
			if(filter_obj.length > 0 && filter_obj.val() != ""){
				filter_selected = true;
				return false;
			}
		});
		if( !filter_selected && $('#thjmf_job_filtered').length == 0 ){
			e.preventDefault();
			alert('No criteria selected');
		}
	});

	$('#thjmf_apply_job').click(function(e){
		apply_job(e, $(this));
	});

	adjust_title_icons();

	function remove_validation_message(message_block, hide_only){
		var wrapper = message_block.closest('p');
		if( wrapper.hasClass('thjmf-field-has-placeholder-label') ){
			message_block.hide();
			if( hide_only ){
				return;
			}
			wrapper.find('input').focus();
			if( message_block.closest('p').find('label').is(":visible") ){
				message_block.closest('p').find('label').hide();
			}
		}
	}

	function apply_job(event, form){
		var application_form = $('#thjmf_job_application');
		if(application_form.length){
			var validations = {};
			var validation_fields = [];
			application_form.find('*').filter(':input').each(function(){
				var field = $(this);
				if( field.is(':button') ){
					return;
				}
				if( $.inArray( field.attr('name'), validation_fields ) === -1 ){
	        		validation_fields.push(field.attr('name'));
	        	}else{
	        		return;
	        	}

				var field_name = get_field_name(field);
				var field_type = get_field_type(field);
				var wrapper = field.closest('.thjmf-form-row');
			
				if( is_required_application_field( field_name, field_type, field, wrapper ) ){
					if( is_empty_required_field( field, wrapper, field_type, application_form ) ){
						show_validation_message(field_type, wrapper, REQUIRED_HTML);
						validations[field_name] = field_type;
					}else{
						var custom_validation = has_custom_validation( field_name, field_type, field );
						if( custom_validation ){
							show_validation_message(field_type, wrapper, custom_validation);
							validations[field_name] = field_type;
						}
					}
				}
			});
			if( !$.isEmptyObject(validations)){
				var keys = Object.keys(validations);
				var top_field = "0" in keys ? keys["0"] : false;
				if( top_field.length > 0 ){
					top_field = validations[top_field] === 'file' ?  $('#'+top_field).closest('.thjmf-form-row') : $('#'+top_field);
					var position = top_field.offset().top - 80;
					$('body, html').animate({scrollTop: position});
				}
				event.preventDefault();
			
			}
		}
	}

	function get_field_type( field ){
		var type = field.attr('type');
		if( field.is("textarea") ){
			type = "textarea";

		}else if( field.is("select") ){
			type = "select";
		}
		return type;
	}

	function get_field_name( field ){
		var name = field.attr('name');
		name = name.replace(/\[\]$/,'');
		return name;
	}

	function is_required_application_field( name ){
		if( $.inArray(name, thjmf_public_var.required_apply_form_fields) == -1 ){
			return;
		}

		return true;
	}

	function is_empty_required_field( field, wrapper, type, form ){
		if( wrapper.find('.thjmf-validation-message').length > 0 ){
			wrapper.find('.thjmf-validation-message').remove();
		}

		if( type === 'radio' || type == 'checkbox' ){
			if( form.find('input[name="'+field.attr('name')+'"]').is(':checked') ){
				return;
			}
		}else if( field.val() !== "" ){
			return
		}

		return true;
	}

	function has_custom_validation( name, type, field ){
		var valid = true;
		var validation = false;
		if( name in thjmf_public_var.form_validations ){
			if( typeof(thjmf_public_var.form_validations[name].regex) != "undefined" && thjmf_public_var.form_validations[name].regex !== null ){
				var pattern = new RegExp( thjmf_public_var.form_validations[name].regex );
				if( pattern ){
					var valid = pattern.test(field.val());
				}
			}
		}
		if( !valid && typeof(thjmf_public_var.form_validations[name].message) != "undefined" && thjmf_public_var.form_validations[name].message !== "" ){
			return '<div class="thjmf-validation-message">'+thjmf_public_var.form_validations[name].message+'</div>';
		}
		return validation;
	}

	function show_validation_message( type, wrapper, message ){
		if( type === "text" ){
			wrapper.find('.thjmf-input-wrapper').append(message);
		}else if( type === "file" ){
			wrapper.find('.thjmf-input-wrapper').addClass('thjmf-file-required');
			wrapper.find('.thjmf-input-wrapper').append(message);
		}else {
			wrapper.find('.thjmf-input-wrapper').append(message);
		}
	}

	function should_close_dialling_list(target){
		return ! target.hasClass('emoji') && ! target.hasClass('thjmf-country-dial-codes') && ! target.hasClass('thjmf-dialling-code') && ! target.hasClass('thjmf-inline-flags');
	}

	function prepare_application_text_field( field, action ){
		var label = field.closest('.thjmf-form-row').find('label');
		if( action === "click" ){
			if( label.is(":visible") ){
				label.hide();
			}
			if( field.siblings('.thjmf-validation-message').length > 0 ){
				remove_validation_message( field.siblings('.thjmf-validation-message'), true );
			}
		}else{
			if( field.val() !== "" ){
				label.hide();
			}else{
				if( label.is(":hidden") ){
					label.show();
				}
			}
		}
	}

	function is_form_in_viewport( element_top, form_div, adjustment ){
		element_top = element_top + adjustment;
		var screen_window = $(window);
	    var element_bottom = form_div.offset().top + form_div.outerHeight();
	    var screen_bottom = screen_window.scrollTop()+window.innerHeight;
	  	var screen_top = screen_window.scrollTop();

	    if ( (screen_bottom > element_top) && (screen_top < element_bottom) ){
	        // the element is visible
			return true;
	    } else {
	        // the element is not visible
	    	return false;
	    }
	}

	function adjust_title_icons(){
		var body = $('.thjmf-job-body-js');
		var job_apply_button = body.find('.thjmf-js-job-apply-button');
		var job_share_icon = body.find('.thjmf-share-job');
		var job_title = body.find('.thjmf-js-job-title');
		var job_title_line_height = job_title.css('line-height');
		var featured_icon = body.find('.thjmf-featured-icon');
		if( job_apply_button.length || job_share_icon.length ){
			if( job_share_icon.length ){
				job_share_icon.css('line-height', get_margin_top(job_title_line_height, 'share-icon', '', ''));
			}
			if( job_apply_button.length ){
				job_apply_button.css('margin-top', get_margin_top(job_title_line_height, 'single-job', job_apply_button, ''));
			}
		}
	}

	function get_margin_top(line_height, type, job_button, featured_icon_height){
		var line_height_string = line_height.replace(/[^0-9\.]/g,'');
		var new_line_height = '';
		if( type == "single-job" ){
			new_line_height = (line_height_string - job_button.outerHeight() ) / 2;
			new_line_height = new_line_height + 1; //Buffer
		}else if(type == "share-icon"){
			new_line_height = line_height_string - 2; //2 is a buffer value
		}else if(type == "featured-icon"){
			new_line_height = (line_height_string/2) - (featured_icon_height/2);
		}
		return line_height.replace(line_height_string, new_line_height);
	}

	function get_locations(field){
		var filtered_locations = '';
		var searched = field.val().toLowerCase();
		$.each( thjmf_public_var.locations, function(index, value){
			var location = value.name.toLowerCase();
			if( location.indexOf(searched) != -1 ){
				filtered_locations += '<li data-slug="'+value.slug+'">'+value.name+'</li>';
			}
		});
		return filtered_locations === "" ? '<li>No location found</li>' : filtered_locations; 
	}

    function fileupload_change_event( $ext ){
    	var fileExtension = ['pdf', 'doc', 'docx'];
        if ($.inArray($ext.split('.').pop().toLowerCase(), fileExtension) == -1) {
            return true;
        }
        return false;
    }
	
	function eventSavePopupForm(e, elm){
		var validation_msg = '';
		var form = $(elm).closest('form');
		var valid = validateApplyNowForm(form);
		if($.isArray(valid) && valid.length !== 0 && valid !== '' ){
			e.preventDefault();
			validation_msg = render_validation_msgs( valid );
			var form_notice = form.find('.thjmf-validation-notice');
			form_notice.html(validation_msg).focus();
		}
	}

	function render_validation_msgs( msgs ){
		var errors = '';
		$.each(msgs, function( index, el) {
			errors += '<p>'+el+'</p>';
		});
		return errors;
	}

	function validateApplyNowForm(form){
		var validation_arr = [];
		form.find('.thjmf-validation-error').removeClass('thjmf-validation-error');
		form.find('.thjmf-validation-required').each(function() {
			var field = $(this).find('input');
			var field_type = field.attr('type');
			if(field_type == null){
				field_type = field.is('select') ? 'select' : "";
			}
			var field_name = field.attr('name');
			var label = setValidationProps( field_name, field );

			switch(field_type){
				case 'text':
				default:
					if( field.val() == '' || field.val() == null ){
						validation_arr.push( label+' is a required field' );
					}else if( field_name == 'thjmf_email' && !isEmail( field.val() ) ){
						validation_arr.push( 'Invalid '+label );
					}
					break;
				case 'radio':
					if( form.find('input[name="'+field_name+'"]:checked').val() == null ){
						validation_arr.push( label+' is a required field' );
					}
					break;
				case 'file':
					if( fileupload_change_event( form.find('input[name="'+field_name+'"]').val() ) ){
						validation_arr.push( label+' is a required field' );
					}
					break;
			}
		});
		return validation_arr;
	}

	function setValidationProps( field_name, field ){
		var label = '';
		var label_elm = field.closest('.thjmf-form-field').find(' > label');
		if(label_elm.length){
			label = label_elm[0].childNodes[0].nodeValue;
			label = label !== '' ? label : str_replace('_', ' ', field_name);
			label = '<b>'+label+'</b>';
		}
		return label;
	}

	function eventApplyJob(elm){
		var screen_width = $(window).width();
		var popup = $('#thjmf_apply_now_popup');
		var popup_content = popup.find('.thjmf-popup-content');
		popup_content.find('.thjmf-validation-notice').html('');
		var popup_container = popup.find('.thjmf-popup-wrapper');
		popup.css({
			visibility: 'hidden',
			display: 'block',
		});
		var width = popup_container.width();	
		popup.css({
			visibility: '',
			display: '',
			left : '',
		});

		var width_styles = "popup_style" in thjmf_public_var ? thjmf_public_var.popup_style : false;
		var width1 = width_styles && "width1" in width_styles ? width_styles.width1 : '40%';
		var width2 = width_styles && "width2" in width_styles ? width_styles.width2 : '50%';
		var width3 = width_styles && "width3" in width_styles ? width_styles.width3 : '62%';
		var width4 = width_styles && "width4" in width_styles ? width_styles.width4 : '78%';

		var width = '';
		var left = '';
		var top = '12px';
		var bottom = '12px';
        var admin_bar = $('#wpadminbar').length ? true : false;
		if( screen_width <= 500 ){
			width = width4;
			left = '12%';
			top = admin_bar ? '56px' : top;
			bottom = '80px';
		}else if( screen_width <= 768 && screen_width > 500 ){
			width = width3;
			left = '19%';
			top = admin_bar ? '56px' : top;
			bottom = '80px';
		}else if( screen_width > 768 && screen_width <= 1025){
			width = width2;
			left = '25%';
            top = admin_bar ? '44px' : top;
			if( screen_width <= 783 && admin_bar ){
				top = '56px';
			}
		}else if( screen_width > 1025){
			width = width1;
			left = '30%';
            top = admin_bar ? '44px' : top;
		}


		popup.find('.thjmf-popup-wrapper').css({
			'top'  : top, 
			'bottom'  : bottom, 
			'left' : left,
			'width': width 
		});
		popup.addClass('thjmf-popup-active');

		var height = popup_container.height();
		var header_height = popup_container.find('.thjmf-popup-header').height();
		var footer_height = popup_container.find('.thjmf-popup-footer-actions').outerHeight();
		var scroll_h = (height - (header_height+footer_height))+'px';
		popup.find('.thjmf-popup-outer-wrapper').css('height',scroll_h);
	}

	function eventClosePopup(elm){
		var popup = $('#thjmf_apply_now_popup');
		popup.removeClass('thjmf-popup-active');
		popup.find('.thjmf-validation-notice').html('');
	}

	function filterJobsEvent(elm){
		var form = $('#thjmf_job_filter_form');
		var all_blank = true;
		form.find('select').each(function(index, el) {
			if( $(this).val() != '' ){
				all_blank = false;
			}
		});
		if( all_blank){
			event.preventDefault();
			alert('No filter criteria selected');
		}
	}

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}
	
	return {
		eventApplyJob  : eventApplyJob,
		eventClosePopup : eventClosePopup,
		eventSavePopupForm : eventSavePopupForm,
		filterJobsEvent : filterJobsEvent,
   	};
}(window.jQuery, window, document));	

function thjmEventApplyJob(elm){
	thjmf_public.eventApplyJob(elm);		
}

function thjmEventClosePopup(elm){
	thjmf_public.eventClosePopup(elm);
}

function thjmEventSavePopupForm(e, elm){
	thjmf_public.eventSavePopupForm(e, elm);
}

function thjmfFilterJobsEvent(e){
	thjmf_public.filterJobsEvent(e);
}