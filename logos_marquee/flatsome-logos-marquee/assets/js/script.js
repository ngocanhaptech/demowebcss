document.addEventListener("DOMContentLoaded", function() {
    const containers = document.querySelectorAll(".logos-container");
    
    containers.forEach(function(container) {
        const marquee = container.querySelector(".logos-marquee");
        if (marquee) {
            // Nhân bản nội dung bên trong để tạo hiệu ứng nối liền
            const clone = marquee.cloneNode(true);
            container.appendChild(clone);
        }
    });
});