jQuery(function($) {
    $(document).on('flatsome-relay-request-done', function(e, response, $container, relayData) {
        // Chỉ xử lý nếu post_type là lawyer
        if (!relayData || relayData.postType !== 'lawyer') return;
        if (!response.success || typeof response.data !== 'string') return;

        var $newContent = $(response.data);
        var $newRow = $newContent.find('.row'); // hoặc container chính

        // Replace container cũ bằng container mới
        $container.replaceWith($newContent);

        // Re-attach Flatsome scripts
        if (typeof Flatsome !== 'undefined' && Flatsome.attach) {
            Flatsome.attach($newContent);
        }

        // Nếu có packery (grid layout) thì re-init
        if ($newContent.find('.packery').length) {
            $newContent.imagesLoaded(function() {
                $newContent.packery();
            });
        }

        // Scroll lên đầu container mới (tuỳ chọn)
        $('html, body').animate({
            scrollTop: $newContent.offset().top - 100
        }, 300);
    });
});