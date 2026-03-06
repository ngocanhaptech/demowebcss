( function ( $ ) {
    'use strict';

    // ── Gửi Ajax request ─────────────────────────────────────────
    function sendRequest( $relay, newAtts, appendMode ) {
        var data = $relay.data( 'cpt-relay' );
        if ( ! data ) return;

        newAtts.page_number = appendMode ? String( (data.currentPage || 1) + 1 ) : '1';

        // Merge atts
        var mergedAtts = $.extend( {}, data.atts, newAtts );
        data.atts = mergedAtts;
        $relay.data( 'cpt-relay', data );

        // Abort request đang chạy
        var pending = $relay.data( 'cpt-relay-xhr' );
        if ( pending ) pending.abort();

        setLoading( $relay, true );

        var xhr = $.ajax( {
            url  : cptRelayVars.ajaxurl,
            data : {
                action : 'cpt_relay_request',
                nonce  : cptRelayVars.nonce,
                tag    : 'cpt_posts',
                atts   : mergedAtts,
            },
        } )
        .done( function ( res ) {
            $relay.data( 'cpt-relay-xhr', null );
            setLoading( $relay, false );

            if ( ! res.success || typeof res.data !== 'string' ) {
                console.error( '[cpt-relay] Error:', res );
                return;
            }

            var $new = $( res.data );

            if ( appendMode ) {
                // Load More: thêm các .col vào row hiện tại
                var $existingRow = $relay.find( '.row' ).first();
                var $newCols     = $new.find( '.col' );
                $existingRow.append( $newCols );

                // Cập nhật data
                var newData  = $new.data( 'cpt-relay' );
                if ( newData ) {
                    data.currentPage = newData.currentPage;
                    data.totalPages  = newData.totalPages;
                    $relay.data( 'cpt-relay', data );
                    $relay.attr( 'data-cpt-relay', JSON.stringify( data ) );
                }

                // Ẩn nút nếu hết trang
                if ( data.currentPage >= data.totalPages ) {
                    $relay.find( '.ux-relay__load-more-button' ).hide();
                }

                // Update count
                $relay.find( '.ux-relay__current-count' ).text(
                    $relay.find( '.col' ).length
                );

            } else {
                // Pagination / filter: replace toàn bộ container
                $new.find( '[data-animate]' ).removeAttr( 'data-animate' );
                $relay.replaceWith( $new );

                // Reinit Flatsome nếu có
                if ( typeof Flatsome !== 'undefined' ) {
                    Flatsome.attach( $new );
                }

                // Scroll lên đầu container nếu đổi trang
                if ( newAtts.page_number && parseInt( newAtts.page_number ) > 1 ) {
                    var $filterBar = $( '.cpt-filter-bar[data-relay-id="' + data.atts._id + '"]' );
                    var scrollTarget = $filterBar.length ? $filterBar : $new;
                    $( 'html, body' ).animate( {
                        scrollTop: scrollTarget.offset().top - 80
                    }, 300 );
                }

                $( document.body ).trigger( 'cpt-relay-done', [ res, $new, data ] );
            }
        } )
        .fail( function ( xhr ) {
            if ( xhr.statusText !== 'abort' ) {
                setLoading( $relay, false );
                console.error( '[cpt-relay] Ajax failed', xhr );
            }
        } );

        $relay.data( 'cpt-relay-xhr', xhr );
    }

    // ── Loading state ─────────────────────────────────────────────
    function setLoading( $relay, loading ) {
        $relay.toggleClass( 'cpt-relay--loading', loading );
        $relay.find( '.row' ).css( 'opacity', loading ? '.3' : '' );
    }

    // ── Tìm relay container theo _id ─────────────────────────────
    function findRelay( relayId ) {
        return $( '[data-cpt-relay]' ).filter( function () {
            var d = $( this ).data( 'cpt-relay' );
            return d && d.atts && d.atts._id === relayId;
        } );
    }

    // ── Filter bar: author / order ────────────────────────────────
    $( document ).on( 'change', '.cpt-filter-select', function () {
        var $select   = $( this );
        var relayId   = $select.closest( '.cpt-filter-bar' ).data( 'relay-id' );
        var filterKey = $select.data( 'filter-key' );
        var filterVal = $select.val();
        var $relay    = findRelay( relayId );

        if ( ! $relay.length ) return;

        var newAtts = {};
        newAtts[ filterKey ] = filterVal;

        sendRequest( $relay, newAtts, false );
    } );

    // ── Pagination: click số trang ────────────────────────────────
    $( document ).on( 'click', '.cpt-relay .ux-relay__pagination a.page-number', function ( e ) {
        e.preventDefault();

        var $link    = $( this );
        var $relay   = $link.closest( '.cpt-relay' );
        var href     = $link.attr( 'href' ) || '';

        // Lấy số trang từ #/page/x
        var match    = href.match( /\/page\/(\d+)/ );
        var pageNum  = match ? match[1] : '1';

        sendRequest( $relay, { page_number: pageNum }, false );
    } );

    // ── Pagination: prev/next buttons ─────────────────────────────
    $( document ).on( 'click', '.cpt-relay .ux-relay__nav-button', function ( e ) {
        e.preventDefault();

        var $btn   = $( this );
        var $relay = $btn.closest( '.cpt-relay' );
        var data   = $relay.data( 'cpt-relay' );
        if ( ! data ) return;

        var dir     = $btn.data( 'cpt-dir' );
        var current = parseInt( data.currentPage ) || 1;
        var total   = parseInt( data.totalPages )  || 1;
        var newPage = dir === 'next' ? current + 1 : current - 1;

        if ( newPage < 1 || newPage > total ) return;

        sendRequest( $relay, { page_number: String( newPage ) }, false );
    } );

    // ── Load More button ─────────────────────────────────────────
    $( document ).on( 'click', '.cpt-relay .ux-relay__load-more-button', function ( e ) {
        e.preventDefault();
        var $relay = $( this ).closest( '.cpt-relay' );
        sendRequest( $relay, {}, true );
    } );

} )( jQuery );
