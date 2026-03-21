/**
 * UI Portfolio Engine - GSAP & ScrollTrigger Implementation
 * Triết lý: Mỗi project item là một "Layer" trong không gian 3D.
 */

gsap.registerPlugin(ScrollTrigger);

class PortfolioParallax {
    constructor() {
        this.items = document.querySelectorAll('.tp-project-2-item');
        this.cursor = document.getElementById('custom-cursor');
        
        this.initParallax();
        this.initCursor();
        this.initHoverEffect();
    }

    initParallax() {
        this.items.forEach((item, index) => {
            const thumb = item.querySelector('.tp-project-2-thumb');
            const img = item.querySelector('img');
            const speed = parseFloat(item.dataset.parallaxSpeed) || 0.1;

            // 1. Chuyển động xoay và nghiêng khi vào viewport (WebGL Style)
            gsap.fromTo(item, 
                { 
                    rotationX: -10, 
                    rotationZ: index % 2 === 0 ? -5 : 5,
                    scale: 0.9,
                    y: 100,
                    opacity: 0 
                },
                {
                    rotationX: 0,
                    rotationZ: 0,
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top bottom-=100",
                        toggleActions: "play none none reverse"
                    }
                }
            );

            // 2. Hiệu ứng Smooth Parallax cho hình ảnh bên trong (Inner Image Movement)
            gsap.to(img, {
                yPercent: 20 * (speed * 10),
                ease: "none",
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }

    initCursor() {
        // Di chuyển cursor theo chuột mượt mà bằng GSAP quickSetter
        const xSetter = gsap.quickSetter(this.cursor, "x", "px");
        const ySetter = gsap.quickSetter(this.cursor, "y", "px");

        window.addEventListener("mousemove", (e) => {
            xSetter(e.clientX - 40);
            ySetter(e.clientY - 40);
        });
    }

    initHoverEffect() {
        this.items.forEach(item => {
            const thumb = item.querySelector('.tp-project-2-thumb');
            const img = item.querySelector('img');

            item.addEventListener('mouseenter', () => {
                // Hiển thị cursor
                gsap.to(this.cursor, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
                
                // Zoom nhẹ ảnh
                gsap.to(img, { scale: 1.3, duration: 0.6, ease: "power2.out" });
                
                // Hiệu ứng Tilt nhẹ (Nghiêng theo hướng chuột)
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const moveX = (x - centerX) / 20;
                    const moveY = (y - centerY) / 20;

                    gsap.to(thumb, {
                        rotateY: moveX,
                        rotateX: -moveY,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                });
            });

            item.addEventListener('mouseleave', () => {
                // Ẩn cursor
                gsap.to(this.cursor, { scale: 0, duration: 0.3, ease: "power2.in" });
                
                // Trả ảnh về trạng thái cũ
                gsap.to(img, { scale: 1.2, duration: 0.6, ease: "power2.out" });
                
                // Trả lại góc nghiêng
                gsap.to(thumb, { rotateY: 0, rotateX: 0, duration: 0.5 });
            });
        });
    }
}

// Khởi tạo khi DOM đã sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
    new PortfolioParallax();
});