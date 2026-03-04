document.addEventListener('DOMContentLoaded', function () {
    // Hỗ trợ nhiều instance trên 1 trang
    var containers = document.querySelectorAll('.logos-container');

    containers.forEach(function (container) {
        var marquee = container.querySelector('.logos-marquee');
        if (!marquee) return;

        // Clone nội dung để tạo hiệu ứng chạy nối liền
        var clone = marquee.cloneNode(true);
        container.appendChild(clone);
    });
});
