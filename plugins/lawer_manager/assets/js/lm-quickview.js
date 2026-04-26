jQuery(function($) {
    $(document).on('click', '.lm-quickview-btn', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var shortcode = $btn.data('shortcode');
        if (!shortcode) return;

        $btn.addClass('loading').prop('disabled', true);

        $.post(lm_ajax.ajax_url, {
            action: 'lm_lawyer_quickview',
            shortcode: shortcode
        }, function(res) {
            $btn.removeClass('loading').prop('disabled', false);
            if (res.success) {
                // Kiểm tra Magnific Popup của Flatsome
                if (typeof $.magnificPopup !== 'undefined') {
                    $.magnificPopup.open({
                        items: {
                            src: '<div class="lm-quickview-popup mfp-hide">' + res.data.html + '</div>',
                            type: 'inline'
                        },
                        type: 'inline',
                        mainClass: 'mfp-fade',
                        closeBtnInside: true,
                        callbacks: {
                            open: function() {
                                // Kích hoạt Flatsome script cho nội dung mới
                                if (typeof Flatsome !== 'undefined' && Flatsome.attach) {
                                    Flatsome.attach($('.lm-quickview-popup'));
                                }
                            }
                        }
                    });
                } else {
                    // Fallback: tạo modal đơn giản và gọi Flatsome.attach
                    var $modal = $('#lm-quickview-fallback');
                    if (!$modal.length) {
                        $modal = $('<div id="lm-quickview-fallback" style="animation: slideInRight .2s ease-out forwards; position: fixed;top: 0%;right: 0%;bottom: 0px;width: 80%;width: 1400px; max-width: 100%;background: rgb(255, 255, 255);z-index: 10000;border: 1px solid rgb(221, 221, 221);border-radius: 0px;box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 20px;display: flex;flex-direction: column;align-items: center;justify-content: center;"><div style="padding:0px;height:0; border-bottom:0px solid #ddd; text-align:right;"><a class="close-modal" style="position: absolute;right: 5%;top: 5%;box-shadow: 0 3px 9px #0000001c;background: #ffffff; width: 50px;height: 50px;text-align: center; display: flex; justify-content: center; align-items: flex-start; padding-top: 10px; z-index: 1; border-radius: 50%; line-height: 25px;  font-size: 18px;  vertical-align: middle;">&times;</a></div><div class="content" style="padding:20px; max-height:90vh; overflow:auto;"></div></div><style>@keyframes slideInRight { from {  transform: translateX(100%); } to {  transform: translateX(0); }</style>');
                        $('body').append($modal);
                        $modal.on('click', '.close-modal', function(e) {e.stopPropagation(); $modal.fadeOut(); });
                        $(document).on('click', function(e) {
                            e.stopPropagation();
                            if ($modal.is(':visible') && !$modal.is(e.target) && !$modal.has(e.target).length) {
                                $modal.fadeOut();
                            }
                        });
                    }
                    $modal.find('.content').html(res.data.html);
                    $modal.fadeIn();

                    // Kích hoạt Flatsome script cho nội dung mới
                    if (typeof Flatsome !== 'undefined' && Flatsome.attach) {
                        Flatsome.attach($modal.find('.content'));
                    }

                    // Re-initialize slider/gallery nếu cần (thủ công)
                    $modal.find('.row-slider').each(function() {
                        if ($.fn.flickity) {
                            $(this).flickity('destroy');
                            $(this).flickity({
                                imagesLoaded: true,
                                groupCells: '100%',
                                dragThreshold: 5,
                                cellAlign: 'left',
                                wrapAround: true,
                                prevNextButtons: true,
                                percentPosition: true,
                                pageDots: false,
                                rightToLeft: false,
                                autoPlay: false
                            });
                        }
                    });
                }
            } else {
                alert('Lỗi: ' + (res.data.message || 'Không thể tải nội dung'));
            }
        }).fail(function() {
            $btn.removeClass('loading').prop('disabled', false);
            alert('Lỗi kết nối AJAX');
        });
    });
});