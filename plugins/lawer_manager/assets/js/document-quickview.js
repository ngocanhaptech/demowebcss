jQuery(function($) {
    $(document).on('click', '.document-quickview-btn', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var shortcode = $btn.data('shortcode');
        if (!shortcode) return;

        $.post(lm_ajax.ajax_url, {
            action: 'lm_document_quickview',
            shortcode: shortcode
        }, function(res) {
            if (res.success) {
                if ($.magnificPopup) {
                    $.magnificPopup.open({
                        items: {
                            src: '<div class="lm-document-quickview">'+res.data.html+'</div>',
                            type: 'inline'
                        },
                        type: 'inline'
                    });
                } else {
                    alert(res.data.html);
                }
            }
        });
    });
});