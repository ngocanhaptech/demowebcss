(function ($) {
    'use strict';

    let isRTL = $('body').prop('dir') === 'rtl';

    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 200) {
            $('header.fixed-top').addClass('nav-fixed');
            $('.header_sticky_bar').removeClass('d-none');
            $('header.no-sticky').removeClass('nav-fixed');
            //$('.section-banner-scroll').addClass('banner_sticky');
        } else {
            $('header.fixed-top').removeClass('nav-fixed');
            $('.header_sticky_bar').addClass('d-none');
            //$('.section-banner-scroll').removeClass('banner_sticky');
        }

        if (scroll >= 200) {
            $('.section-banner-scroll').addClass('banner_sticky');
        }else{
            $('.section-banner-scroll').removeClass('banner_sticky');
            let topox = 242 - scroll;
            $('.banner-scroll-item').css('top', topox + 'px');
        }

        /*if ($(this).scrollTop() > 150) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }*/
        //
        var lastId,
            menuItems = $(".header_wrap").find("a.page-scroll"),
            topMenuHeight = $(".header_wrap").innerHeight() + 20,
            scrollItems = menuItems.map(function () {
                var items = $($(this).attr("href"));
                if (items.length) {
                    return items;
                }
            });
        var fromTop = $(this).scrollTop() + topMenuHeight;
        var cur = scrollItems.map(function () {
            if ($(this).offset().top < fromTop)
                return this;
        });
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";
        if (lastId !== id) {
            lastId = id;
            menuItems.closest('.page-scroll').removeClass("active").end().filter("[href='#" + id + "']").closest('.page-scroll').addClass("active");
        }
    });
    //Click
    $('.row-menu-item, #navbarSideToggleMobile').on('click', 'span.dropdown-tgg, li.dropdown > a.nav-link', function (e) {
        var $navLink = $(this).hasClass('nav-link') ? $(this) : $(this).closest('.nav-link');
        var href = ($navLink.attr('href') || '').trim();
        // Category names navigate normally; only the arrow or a placeholder
        // (such as "Danh Mục Sản Phẩm") opens the submenu.
        if ($(this).is('a') && href && href !== '#' && !/^javascript:/i.test(href)) {
            return;
        }
        if (!$navLink.next('.dropdown-menu').length) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (!$navLink.next('.dropdown-menu').hasClass('show')) {
            $navLink.parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $navLink.next(".dropdown-menu");
        $subMenu.toggleClass('show');
        $navLink.find('.dropdown-tgg').toggleClass('open');
        $navLink.parent("li").toggleClass('show');

        $navLink.parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function () {
            $('.dropdown-menu .show').removeClass("show");
        });

        return false;
    });
    
    $(document).on('click', '.close-nav', function(){
        $(this).parents('#navbarSideToggleMobile').removeClass('show');
    });     

    $('[data-toggle="dropdown"]').dropdown();

    var navBar = $('.header_wrap');
    var navbarLinks = navBar.find(".navbar-collapse ul li a.page-scroll");

    $.each(navbarLinks, function () {

        var navbarLink = $(this);

        navbarLink.on('click', function () {
            navBar.find(".navbar-collapse").collapse('hide');
            $("header").removeClass("active");
        });

    });

    $('.navbar-toggler').on('click', function () {
        $("header").toggleClass("active");
        if ($('.search-overlay').hasClass('open')) {
            $(".search-overlay").removeClass('open');
            $(".search_trigger").removeClass('open');
        }
    });

    var setHeight = function () {
        var height_header = $(".header_wrap").height();
        $('.header_sticky_bar').css({ 'height': height_header + 53 });
    };

    $(window).on('load', function () {
        setHeight();
    });

    $(window).on('resize', function () {
        setHeight();
    });

    $('.sidetoggle').on('click', function () {
        $(this).addClass('open');
        $('body').addClass('sidetoggle_active');
        $('.sidebar_menu').addClass('active');
        $("body").append('<div id="header-overlay" class="header-overlay"></div>');
    });

    $(document).on('click', '#header-overlay, .sidemenu_close', function () {
        $('.sidetoggle').removeClass('open');
        $('body').removeClass('sidetoggle_active');
        $('.sidebar_menu').removeClass('active');
        $('#header-overlay').fadeOut('3000', function () {
            $('#header-overlay').remove();
        });
        return false;
    });

    $(".categories_btn").on('click', function () {
        $('.side_navbar_toggler').attr('aria-expanded', 'false');
        $('#navbarSidetoggle').removeClass('show');
    });

    $(".side_navbar_toggler").on('click', function () {
        $('.categories_btn').attr('aria-expanded', 'false');
        $('#navCatContent').removeClass('show');
    });

    $(".pr_search_trigger").on('click', function () {
        $(this).toggleClass('show');
        $('.product_search_form').toggleClass('show');
    });

    var rclass = true;

    $("html").on('click', function () {
        if (rclass) {
            $('.categories_btn').addClass('collapsed');
            $('.categories_btn,.side_navbar_toggler').attr('aria-expanded', 'false');
            $('#navCatContent,#navbarSidetoggle').removeClass('show');
        }
        rclass = true;
    });

    $(".categories_btn,#navCatContent,#navbarSidetoggle .navbar-nav,.side_navbar_toggler").on('click', function () {
        rclass = false;
    });

    var topheaderHeight = $(".top-header").innerHeight();
    var mainheaderHeight = $(".header_wrap").innerHeight();
    var headerHeight = mainheaderHeight - topheaderHeight - 20;
    $('a.page-scroll[href*="#"]:not([href="#"])').on('click', function () {
        $('a.page-scroll.active').removeClass('active');
        $(this).closest('.page-scroll').addClass('active');
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            var target = $(this.hash),
                speed = $(this).data("speed") || 800;
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - headerHeight
                }, speed);
            }
        }
    });

    $(".scrollup").on('click', function (e) {
        /*e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 600);
        return false;*/
        $('.support-online').toggleClass('d-block');
        $('.open-compare-modal').toggleClass('d-flex');
    });

    // Defer only product rows below the viewport. Their native links/images stay visible in a one-row preview.
    var pendingCarousels = new Map();
    var carouselObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            carouselObserver.unobserve(entry.target);
            pendingCarousels.delete(entry.target);
            carousel_slider($(entry.target), true);
        });
    }, {rootMargin: '200px 0px'}) : null;
    function previewCarousel($carousel, options) {
        var width = document.documentElement.clientWidth, settings = options;
        Object.keys(options.responsive || {}).map(Number).sort(function (a, b) {return a - b;}).forEach(function (point) {
            if (width >= point) settings = Object.assign({}, settings, options.responsive[point]);
        });
        var items = Number(settings.items) || 1, margin = Number(settings.margin) || 0;
        $carousel[0].style.setProperty('--ict-preview-items', items);
        $carousel[0].style.setProperty('--ict-preview-gap', margin + 'px');
        $carousel.addClass('ict-carousel-pending');
    }
    $(window).on('resize.ictPendingCarousels', function () {
        pendingCarousels.forEach(function (options, element) {previewCarousel($(element), options);});
    });
    function carousel_slider($targets, force) {
        ($targets || $('.carousel_slider')).each(function () {
            var $carousel = $(this);
            if ($carousel.data('owl.carousel')) return;
            var carousel;
            var options = {
                rtl: isRTL,
                dots: $carousel.data("dots"),
                dotsData: $carousel.data("dotsdata") ? $carousel.data("dotsdata") : false,
                loop: $carousel.data("loop"),
                items: $carousel.data("items"),
                margin: $carousel.data("margin"),
                mouseDrag: $carousel.data("mouse-drag"),
                touchDrag: $carousel.data("touch-drag"),
                autoHeight: $carousel.data("autoheight"),
                center: $carousel.data("center"),
                nav: $carousel.data("nav"),
                rewind: $carousel.data("rewind"),
                navText: $carousel.data("navleft") ? [$carousel.data("navleft"), $carousel.data("navright")] : ['<i class="ion-ios-arrow-left"></i>', '<i class="ion-ios-arrow-right"></i>'],
                autoplay: $carousel.data("autoplay"),
                animateIn: $carousel.data("animate-in"),
                animateOut: $carousel.data("animate-out"),
                autoplayTimeout: $carousel.data("autoplay-timeout"),
                smartSpeed: $carousel.data("smart-speed"),
                responsive: $carousel.data("responsive"),
                stagePadding:  $carousel.data("stage-padding") ? $carousel.data("stage-padding") : 0
            };
            if (!force && carouselObserver && $carousel.hasClass('product_slider')
                && !options.autoHeight && !options.center && !options.stagePadding
                && !Object.values(options.responsive || {}).some(function (value) {return value.rows > 1 || value.autoWidth === true;})) {
                previewCarousel($carousel, options);
                var bounds = this.getBoundingClientRect();
                // During a rolling release an old cached stylesheet may accompany this script.
                // Defer only when the preview CSS is actually present; otherwise retain native eager initialization.
                if (getComputedStyle(this).display === 'flex' && (!bounds.width || bounds.top > window.innerHeight + 200)) {
                    pendingCarousels.set(this, options);
                    carouselObserver.observe(this);
                    return;
                }
            }
            $carousel.removeClass('ict-carousel-pending');
            this.style.removeProperty('--ict-preview-items');
            this.style.removeProperty('--ict-preview-gap');
            var viewport1 = function () {
                var width;
                width = document.documentElement && document.documentElement.clientWidth;
                return width;
            };
            var severalRows = false;
            var orderedBreakpoints = [];
            for (var breakpoint in options.responsive) {
                if (options.responsive[breakpoint].rows > 1) {
                    severalRows = true;
                }
                orderedBreakpoints.push(parseInt(breakpoint));
            }
            if (severalRows) {
                orderedBreakpoints.sort(function (a, b) {
                    return b - a;
                });
                var slides = $carousel.find('[data-slide]');
                var slidesNb = slides.length;
                if (slidesNb > 0) {
                    var rowsNb;
                    var previousRowsNb = undefined;
                    var colsNb;
                    var previousColsNb = undefined;
                    var updateRowsColsNb1 = function () {
                        var width = viewport1();
                        for (var i = 0; i < orderedBreakpoints.length; i++) {
                            var breakpoint = orderedBreakpoints[i];
                            if (width >= breakpoint || i == (orderedBreakpoints.length - 1)) {
                                var breakpointSettings = options.responsive['' + breakpoint];
                                rowsNb = breakpointSettings.rows;
                                colsNb = breakpointSettings.items;
                                break;
                            }
                        }
                    };
                    var updateCarousel1 = function () {
                        updateRowsColsNb1();
                        if (slidesNb > colsNb) {
                            if (rowsNb != previousRowsNb || colsNb != previousColsNb) {
                                var reInit = false;
                                if (carousel) {
                                    carousel.trigger('destroy.owl.carousel');
                                    carousel = undefined;
                                    slides = $carousel.find('[data-slide]').detach().appendTo($carousel);
                                    $carousel.find('.fake-col-wrapper').remove();
                                    reInit = true;
                                }
                                if ($carousel.data("sort")) {
                                    var perPage = rowsNb * colsNb;
                                    var pageIndex = Math.floor(slidesNb / perPage);
                                    var fakeColsNb = pageIndex * colsNb + (slidesNb >= (pageIndex * perPage + colsNb) ? colsNb : (slidesNb % colsNb));
                                    var count = 0;
                                    var arrIndex = [];
                                    for (var i = 0; i < fakeColsNb; i++) {
                                        var fakeCol = $('<div class="fake-col-wrapper"></div>').appendTo($carousel);
                                        for (var j = 0; j < rowsNb; j++) {
                                            var index = Math.floor(count / perPage) * perPage + (i % colsNb) + j * colsNb;
                                            arrIndex.push(index);
                                            if (index < slidesNb) {
                                                slides.filter('[data-slide=' + index + ']').detach().appendTo(fakeCol);
                                            }
                                            count++;
                                        }
                                    }
                                    for (let s = 0; s < slidesNb; s++) {
                                        if (!arrIndex.includes(s)) {
                                            var fakeCol = $('<div class="fake-col-wrapper"></div>').appendTo($carousel);
                                            slides.filter('[data-slide=' + s + ']').detach().appendTo(fakeCol);
                                        }
                                    }
                                } else {
                                    var fakeColsNb = Math.ceil(slidesNb / rowsNb);
                                    var count = 0;
                                    for (var i = 0; i < fakeColsNb; i++) {
                                        if (count > slidesNb) {
                                            break;
                                        }
                                        var fakeCol = $('<div class="fake-col-wrapper"></div>').appendTo($carousel);
                                        for (var j = 0; j < rowsNb; j++) {
                                            slides.filter('[data-slide=' + count + ']').detach().appendTo(fakeCol);
                                            count++;
                                        }
                                    }
                                }

                                previousRowsNb = rowsNb;
                                previousColsNb = colsNb;
                                if (reInit) {
                                    carousel = $carousel.owlCarousel(options);
                                }
                            }
                        }
                    };
                    $(window).on('resize', updateCarousel1);
                    updateCarousel1();
                }
            }
            carousel = $carousel.owlCarousel(options);
        });
    }

    carousel_slider();

    if ($(".fit-videos").length > 0) {
        $(".fit-videos").fitVids({
            customSelector: "iframe[src^='https://w.soundcloud.com']"
        });
    }

    $('#countdown-flashsale').each(function () {
        var endTime = $(this).data('time');

        let trans = key => {
            window.trans = window.trans || {};
            return window.trans[key] !== 'undefined' && window.trans[key] ? window.trans[key] : key;
        }

        $(this).countdown(endTime, function (tm) {
            $(this).html(tm.strftime('<div class="countdown_box"><div class="countdown-wrap"><span class="countdown days">%D</span><span>  </span>' +
                '</div></div><div class="countdown_box"><div class="countdown-wrap">' +
                '<span class="countdown hours">%H</span><span>  </span></div></div><div class="countdown_box"><div class="countdown-wrap">' +
                '<span class="countdown minutes">%M</span><span>  </span></div></div><div class="countdown_box">' +
                '<div class="countdown-wrap"><span class="countdown seconds">%S</span></div></div>'
            ));
        });

    });

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('.product').popover('disable');
    } else {
        $('[data-toggle="popover"]').popover({
            html: true,
            content: function () {
                var elementId = $(this).attr("data-popover-content");

                if (elementId) {
                    return $(elementId).html();
                }
            }
        });
    }


    function number_format(number, decimals, dec_point, thousands_sep) {
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }

    // Shared product search is owned by ict-storefront.js.

    $('.banner-left .carousel .carousel-item').on('click', function (e) {
        let url = $(this).attr('data-url');
        if (url) {
            window.location.href = url;
        }
    });

    $('a[href*=\\#]').on('click', function (e) {
        e.preventDefault();

        let flagTop = true;

        if ($(this).hasClass('product_img_zoom')) {
            flagTop = false;
        }

        if ($(this).hasClass('product_gallery_item')) {
            flagTop = false;
        }

        if ($(this).hasClass('view-more-coupon')) {
            flagTop = false;
        }

        if (flagTop == true) {
            if ($(this.hash).length) {
                $('html, body').animate({
                    scrollTop: $(this.hash).offset().top - 150
                }, 100);
            }
        }
    });


    $(window).on('load', function () {
        $.ajax({
            url: window.siteUrl + '/ajax/cart',
            method: 'GET',
            success: response => {
                if (!response.error) {
                    $('.cart_box').html(response.data.html);
                    $('.btn-shopping-cart span').text(response.data.count);
                }
            }
        });
    });

    if ($.fn.lazyload) { // native loading="lazy" replaced jquery.lazyload (perf-images)
        $('img.lazy').lazyload({
            event: 'lazyload',
            effect: 'show',
            effectspeed: 0
        })
            .trigger('lazyload');
    }

    $(document).on('click', '.refresh', async function (event) {
        if ($.fn.lazyload) { $('img.main-slide').lazyload(); }
    });

    $(document).on('click', '.no-click', async function (event) {
        return false;
    });

    function scrollableRow() {
        const $scrollableRow = $('#scrollableRow');
        let isDown = false;
        let startX;
        let scrollLeft;

        $scrollableRow.mousedown(function (e) {
            isDown = true;
            $scrollableRow.addClass('active');
            startX = e.pageX - $scrollableRow.offset().left;
            scrollLeft = $scrollableRow.scrollLeft();
        });

        $scrollableRow.mouseleave(function () {
            isDown = false;
            $scrollableRow.removeClass('active');
        });

        $scrollableRow.mouseup(function () {
            isDown = false;
            $scrollableRow.removeClass('active');
        });

        $scrollableRow.mousemove(function (e) {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - $scrollableRow.offset().left;
            const walk = (x - startX) * 3; // scroll-fast
            $scrollableRow.scrollLeft(scrollLeft - walk);
        });
    }
    scrollableRow();

    // Mega menu loader chuyển sang inline script trong footer.blade.php
    // để chạy mọi trang (home.js chỉ enqueue ở homepage qua config.php).

    function widthMegaMenu(width, w_mn, w_mn_home, w_cat_prod) {
        var left = -(w_mn + w_mn_home + w_cat_prod + 20);
        var width_child = width - w_cat_prod;
        $('.mega-menu-container').css({ 'width': width + 'px', 'left': left + 'px' });
        $('.mega-menu-child-dv').css({ 'width': width_child + 'px', 'left': (w_cat_prod + 5) + 'px' });
    }

    var width = $('.mega-width').width();
    var w_mn = $('#navbarSidetoggle .w-mn').outerWidth();
    var w_mn_home = $('#navbarSidetoggle .w-mn-home').width();
    var width_screen = window.screen.width;
    if (width_screen <= 1199 && width_screen >= 992) {
        w_mn_home = 0;
    }

    var w_cat_prod = $('.bottom_header #navCatContent').outerWidth();

    widthMegaMenu(width, w_mn, w_mn_home, w_cat_prod);

    window.addEventListener('resize', function (event) {
        width = $('.mega-width').outerWidth();
        w_mn = $('#navbarSidetoggle .w-mn').outerWidth();
        w_mn_home = $('#navbarSidetoggle .w-mn-home').outerWidth();
        if (width_screen <= 1199 && width_screen >= 992) {
            w_mn_home = 0;
        }
        w_cat_prod = $('.bottom_header #navCatContent').outerWidth();
        widthMegaMenu(width, w_mn, w_mn_home, w_cat_prod);
    }, true);

    $('#navbarSidetoggle > ul > li').hover(function () {
        $('.w-sub-mega li:first-child').addClass('active');
    });

    $('.w-sub-mega li').hover(function () {
        $('.w-sub-mega li').removeClass('active');
    });

    $(document).ready(function () {
        if ($(window).width() >= 992) {
            $(document).on('mouseenter', 'li.menu-nlas', function () {
                $(this).find('.dropdown-menu > ul > li:first-child').addClass('s-first-hover');
            });
            $(document).on('mouseenter', 'li.menu-nlas > .dropdown-menu > ul li', function () {
                $('li').removeClass('s-first-hover');
                $(this).find('.dropdown-menu > ul > li:first-child').addClass('s-first-hover');
            });
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        if (typeof Swiper === 'undefined') { return; } // swiper bundle is not loaded (perf-captcha-assets)
        if (document.querySelector(".product-class-1640")) {
            document.querySelectorAll(".main-slider-2").forEach((mainSliderEl, index) => {
                
                let thumbSliderEl = document.querySelectorAll(".thumbnail-slider-2")[index];
                
                if (thumbSliderEl && mainSliderEl) {
                    let prodThumbs = new Swiper(thumbSliderEl, {
                        centeredSlides: false,
                        centeredSlidesBounds: true,
                        direction: "horizontal",
                        spaceBetween: 10,
                        slidesPerView: 4,
                        freeMode: false,
                        watchSlidesVisibility: true,
                        watchSlidesProgress: true,
                        watchOverflow: true,
                        breakpoints: {
                            767: {
                                centeredSlides: true,
                                direction: "vertical",
                                slidesPerView: 5
                            }
                        }
                    });
                
                    let mainSlider = new Swiper(mainSliderEl, {
                        direction: "horizontal",
                        spaceBetween: 10,
                        navigation: {
                            nextEl: `.swiper-button-next`,
                            prevEl: `.swiper-button-prev`
                        },
                        a11y: {
                            prevSlideMessage: "Previous slide",
                            nextSlideMessage: "Next slide",
                        },
                        keyboard: {
                            enabled: true,
                        },
                        thumbs: {
                            swiper: prodThumbs
                        }
                    });
                
                    mainSlider.on("slideChangeTransitionStart", function () {
                        prodThumbs.slideTo(mainSlider.activeIndex);
                    });
                    prodThumbs.on("transitionStart", function () {
                        mainSlider.slideTo(prodThumbs.activeIndex);
                    });
                
                    function adjustThumbnailHeight() {
                        let largeImage = mainSliderEl.closest(".swiper-container-wrapper").querySelector(".swiper-right");
                        if (largeImage) {
                            let largeImageHeight = largeImage.offsetHeight;
                            thumbSliderEl.style.height = largeImageHeight + 'px';
                        }
                    }
                    if (window.innerWidth > 766) {
                        setTimeout(adjustThumbnailHeight, 500);
                        window.addEventListener("resize", adjustThumbnailHeight);
                    }

                    lightGallery(mainSliderEl, {
                        selector: '.swiper-corner',
                        thumbnail: true,
                        download:false
                    });
                }
            });
        }
        
        //
        $('.spec-click').on('click', function(){
            let action = $(this).data('actions');
            $('html, body').animate({
                scrollTop: $('#'+action).offset().top
            }, 'smooth');

        });

        function addVideo(that, videoUrl) {
            let videoPl = that.parents('.swiper-right');
            videoPl.find(".video-overlay-wrapper").html(`
                <iframe width="100%" height="100%" src="${videoUrl}?autoplay=1&&mute=0&rel=0" 
                        frameborder="0" allowfullscreen>
                </iframe>
            `);
            videoPl.find('.video-overlay').removeClass('d-none');
        }

        function addQRCode(that, imgUrl) {
            let videoPl = that.parents('.swiper-right');
            videoPl.find('.video-overlay-wrapper').html( `
                <img src="${imgUrl}" alt="QR Code">
            `);
            videoPl.find('.video-overlay').removeClass('d-none');
        }

        $('.video-click').on('click', function(){
            let video = $(this).data('videos');
            addVideo($(this), video);
        });

        $('.qrcode-click').on('click', function(){
            let img = $(this).data('qrcode');
            addQRCode($(this), img);
        });

        $(document).on('click', '.close-video', function(){
            let videoPl = $(this).parents('.swiper-right');
            videoPl.find('.video-overlay-wrapper').html('');
            videoPl.find('.video-overlay').addClass('d-none');
        });
    });
    
    
    function adjustAds() {
        const container = document.querySelector(".section-banner-scroll .container");
        const leftAd = document.querySelector(".banner-scroll-left");
        const rightAd = document.querySelector(".banner-scroll-right");
    
        if (!container || !leftAd || !rightAd) return;
    
        const leftImg = leftAd.querySelector("img");
        const rightImg = rightAd.querySelector("img");
    
        if (!leftImg || !rightImg) return;
    
        const screenWidth = window.innerWidth;
        const containerWidth = container.offsetWidth;
        const marginSpace = (screenWidth - containerWidth) / 2;
        let imgWidth = marginSpace - 20;
        let remainWidth = 17.5;
        if(screenWidth >= 1920){
            imgWidth = 200;
            remainWidth = ((marginSpace - 200)/2) + 7.5;
        }

        if (containerWidth <= screenWidth) {
            leftAd.style.left = `${remainWidth}px`;
            rightAd.style.right = `${remainWidth}px`;
            leftImg.style.width = `${imgWidth}px`;
            rightImg.style.width = `${imgWidth}px`;
        }
    }

    window.addEventListener("load", adjustAds);
    window.addEventListener("resize", adjustAds); 

})(jQuery);
