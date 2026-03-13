// parallax
(function () {
    var footer = document.querySelector(".footer-main");
    var bg = document.querySelector(".footer-main .footer-bg-parallax");
    if (!footer || !bg) return;

    var ticking = false;
    var speed = 0.25; // hệ số parallax, tăng/giảm để mạnh/yếu hơn

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }

    function updateParallax() {
      var rect = footer.getBoundingClientRect();
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // chỉ tính khi footer nằm trong viewport để đỡ tốn
      if (rect.top < windowHeight && rect.bottom > 0) {
        // offset = khoảng footer đã đi vào viewport
        var offset = windowHeight - rect.top;
        var translateY = -offset * speed; // âm để nền chạy ngược chiều scroll
        bg.style.transform = "translateY(" + translateY + "px)";
      }

      ticking = false;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // chạy lần đầu khi load
    updateParallax();
  })();