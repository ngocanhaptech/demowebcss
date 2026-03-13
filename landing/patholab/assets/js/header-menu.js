(function () {
    var toggle = document.querySelector(".header-nav-toggle");

    if (!toggle) return;

    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });

    // Đóng menu khi click ra ngoài (tuỳ chọn)
    document.addEventListener("click", function (e) {
      var menu = document.querySelector(".main-menu");
      if (!menu) return;

      var clickedInsideMenu = menu.contains(e.target);
      var clickedToggle = toggle.contains(e.target);

      if (!clickedInsideMenu && !clickedToggle) {
        document.body.classList.remove("menu-open");
      }
    });
  })();