(function($) {
    $(document).ready(function() {

        function bmReloadBrandList($wrapper, extraData) {
            var atts = $wrapper.data('atts') || {};

            var $form = $wrapper.prev('.bm-brand-filter-bar');
            if ($form.length) {
                var formData = $form.serializeArray();
                formData.forEach(function(item) {
                    atts[item.name] = item.value;
                });
            }

            var paged = extraData.paged || 1;

            $.ajax({
                url: bmBrandManager.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'bm_brand_list',
                    atts: atts,
                    paged: paged
                },
                beforeSend: function() {
                    $wrapper.addClass('is-loading');
                },
                success: function(res) {
                    if (res.success && res.data && res.data.html) {
                        $wrapper.replaceWith(res.data.html);
                        initBrandManager();
                    }
                },
                complete: function() {
                    $wrapper.removeClass('is-loading');
                }
            });
        }

        function initBrandManager() {
            $('.bm-brand-list-wrapper[data-ajax="true"]').each(function() {
                var $wrapper = $(this);

                if (!$wrapper.data('atts')) {
                    var raw = $wrapper.attr('data-shortcode-atts');
                    var atts = {};
                    if (raw) {
                        try {
                            atts = JSON.parse(raw);
                        } catch(e) {}
                    }
                    $wrapper.data('atts', atts);
                }

                $wrapper.prev('.bm-brand-filter-bar')
                    .off('submit.bm')
                    .on('submit.bm', function(e) {
                        e.preventDefault();
                        bmReloadBrandList($wrapper, { paged: 1 });
                    });

                $wrapper
                    .off('click.bm', '.bm-page-link')
                    .on('click.bm', '.bm-page-link', function(e) {
                        e.preventDefault();
                        var page = parseInt($(this).data('page'), 10) || 1;
                        bmReloadBrandList($wrapper, { paged: page });
                    });
            });
        }

        initBrandManager();
    });
})(jQuery);