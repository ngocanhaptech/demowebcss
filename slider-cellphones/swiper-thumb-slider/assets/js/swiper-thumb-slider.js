/**
 * Swiper Thumb Slider JavaScript
 */

(function($) {
    'use strict';

    window.FlatsomeSwiperThumbSlider = {
        
        instances: {},

        /**
         * Initialize all instances
         */
        init: function() {
            $('.swiper-thumb-slider-wrapper').each(function() {
                FlatsomeSwiperThumbSlider.initInstance($(this));
            });
        },

        /**
         * Initialize single instance
         */
        initInstance: function($wrapper) {
            var instanceId = $wrapper.data('instance');
            
            // Prevent duplicate initialization
            if (FlatsomeSwiperThumbSlider.instances[instanceId]) {
                return;
            }

            // Get settings
            var autoPlay = parseInt($wrapper.data('autoplay')) || 5000;
            var speed = parseInt($wrapper.data('speed')) || 600;
            var loop = $wrapper.data('loop') === 'true';
            var effect = $wrapper.data('effect') || 'slide';
            var spaceBetween = parseInt($wrapper.data('space')) || 10;
            var thumbsColumns = parseInt($wrapper.data('thumbs-columns')) || 3;
            var thumbsSpace = parseInt($wrapper.data('thumbs-space')) || 10;

            var $thumbSlider = $wrapper.find('.thumb-slider');
            var $mainSlider = $wrapper.find('.main-slider');

            // Initialize Thumb Slider first
            var swiperThumbs = new Swiper($thumbSlider[0], {
                spaceBetween: thumbsSpace,
                slidesPerView: thumbsColumns,
                freeMode: true,
                watchSlidesProgress: true,
                breakpoints: {
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 5
                    },
                    550: {
                        slidesPerView: Math.min(thumbsColumns, 3),
                        spaceBetween: thumbsSpace
                    },
                    768: {
                        slidesPerView: thumbsColumns,
                        spaceBetween: thumbsSpace
                    }
                }
            });

            // Build effect-specific options
            var effectOptions = {};
            
            switch(effect) {
                case 'fade':
                    effectOptions = {
                        effect: 'fade',
                        fadeEffect: {
                            crossFade: true
                        }
                    };
                    break;
                    
                case 'cube':
                    effectOptions = {
                        effect: 'cube',
                        cubeEffect: {
                            shadow: true,
                            slideShadows: true,
                            shadowOffset: 20,
                            shadowScale: 0.94
                        }
                    };
                    break;
                    
                case 'coverflow':
                    effectOptions = {
                        effect: 'coverflow',
                        coverflowEffect: {
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true
                        }
                    };
                    break;
                    
                case 'flip':
                    effectOptions = {
                        effect: 'flip',
                        flipEffect: {
                            slideShadows: true,
                            limitRotation: true
                        }
                    };
                    break;
                    
                default:
                    effectOptions = {
                        effect: 'slide'
                    };
            }

            // Initialize Main Slider
            var swiperMain = new Swiper($mainSlider[0], {
                spaceBetween: spaceBetween,
                loop: loop,
                speed: speed,
                autoplay: autoPlay > 0 ? {
                    delay: autoPlay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                } : false,
                
                // Navigation
                navigation: {
                    nextEl: $mainSlider.find('.swiper-button-next')[0],
                    prevEl: $mainSlider.find('.swiper-button-prev')[0],
                },
                
                // Pagination
                pagination: {
                    el: $mainSlider.find('.swiper-pagination')[0],
                    clickable: true,
                    dynamicBullets: true
                },
                
                // Thumbs
                thumbs: {
                    swiper: swiperThumbs
                },
                
                // Keyboard control
                keyboard: {
                    enabled: true,
                    onlyInViewport: true
                },
                
                // Accessibility
                a11y: {
                    enabled: true
                },
                
                // Add effect options
                ...effectOptions,
                
                // Events
                on: {
                    init: function() {
                        $wrapper.removeClass('loading');
                        
                        // Dispatch custom event
                        $(document).trigger('swiper-thumb-slider-ready', {
                            instanceId: instanceId,
                            swiper: this
                        });
                    },
                    
                    slideChange: function() {
                        $(document).trigger('swiper-thumb-slider-change', {
                            instanceId: instanceId,
                            activeIndex: this.activeIndex
                        });
                    }
                }
            });

            // Store instances
            FlatsomeSwiperThumbSlider.instances[instanceId] = {
                main: swiperMain,
                thumbs: swiperThumbs,
                wrapper: $wrapper
            };

            // Add loading class
            $wrapper.addClass('loading');
        },

        /**
         * Destroy instance
         */
        destroy: function(instanceId) {
            if (!FlatsomeSwiperThumbSlider.instances[instanceId]) {
                return;
            }

            var instance = FlatsomeSwiperThumbSlider.instances[instanceId];
            
            if (instance.main) {
                instance.main.destroy(true, true);
            }
            
            if (instance.thumbs) {
                instance.thumbs.destroy(true, true);
            }

            delete FlatsomeSwiperThumbSlider.instances[instanceId];
        },

        /**
         * Get instance
         */
        getInstance: function(instanceId) {
            return FlatsomeSwiperThumbSlider.instances[instanceId] || null;
        }
    };

    // Initialize on document ready
    $(document).ready(function() {
        FlatsomeSwiperThumbSlider.init();
    });

    // Reinitialize after UX Builder updates
    $(document).on('ux-builder-element-rendered', function(e) {
        setTimeout(function() {
            FlatsomeSwiperThumbSlider.init();
        }, 300);
    });

    // Clean up on UX Builder element removed
    $(document).on('ux-builder-element-removed', function(e, element) {
        var $wrapper = $(element).find('.swiper-thumb-slider-wrapper');
        if ($wrapper.length) {
            var instanceId = $wrapper.data('instance');
            FlatsomeSwiperThumbSlider.destroy(instanceId);
        }
    });

})(jQuery);
