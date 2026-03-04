document.addEventListener("DOMContentLoaded", function() {
    const marquee = document.getElementById("marquee");
    const container = document.querySelector(".logos-container");

    // Nhân bản nội dung bên trong để tạo hiệu ứng nối liền
    const clone = marquee.cloneNode(true);
    container.appendChild(clone);
});