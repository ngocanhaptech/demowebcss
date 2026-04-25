( function ( $ ) {
    'use strict';

    $( document ).on( 'flatsome-relay-request-done', function ( e, response, $container, relayData ) {

        // Chỉ xử lý team_member
        if ( ! relayData || relayData.postType !== 'team_member' ) return;

        // Response không thành công
        if ( ! response.success || typeof response.data !== 'string' ) return;

        var $newContent = $( response.data );
        var $newRow     = $newContent.find( '.row' );
        var $oldRow     = $container.find( '.row' );

        // Xử lý packery (grid)
        var $packery = $newContent.find( '[data-packery-options]' );

        // Remove animation attrs để tránh re-animate khi inject
        $newContent.find( '[data-animate]' ).removeAttr( 'data-animate' );

        // Trigger trước khi replace
        $( document.body ).trigger( 'flatsome-relay-before-replace-element', [ $container, $newContent ] );

        // Detach Flatsome scripts khỏi container cũ
        if ( typeof Flatsome !== 'undefined' && Flatsome.detach ) {
            Flatsome.detach( $container );
        }

        // Replace toàn bộ container
        $container.replaceWith( $newContent );

        // Re-attach Flatsome scripts cho container mới
        if ( typeof Flatsome !== 'undefined' && Flatsome.attach ) {
            Flatsome.attach( $newContent );
        }

        // Init packery nếu là grid
        if ( $packery.length ) {
            $packery.imagesLoaded( function () {
                $packery.packery();
            } );
        }

        // Scroll lên đầu container mới
        $( 'html, body' ).animate( {
            scrollTop: $newContent.offset().top - 100
        }, 300 );
    } );

} )( jQuery );
