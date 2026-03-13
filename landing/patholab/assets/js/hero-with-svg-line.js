(function () {
    var svg = document.querySelector(".hero-svg");
    var path = document.getElementById("hero-path");
    var dot1 = document.getElementById("hero-dot-1");
    var dot2 = document.getElementById("hero-dot-2");

    if (!svg || !path || !dot1 || !dot2) return;

    var pathLength = path.getTotalLength();

    // tốc độ và hướng mỗi dot
    var speed1 = 0.9; // px length / frame
    var speed2 = 0.8;
    var pos1 = 0;
    var pos2 = pathLength; // đi ngược chiều

    function updateDot(dot, lengthPos) {
      var point = path.getPointAtLength(lengthPos);
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
    }

    function animate() {
      pos1 += speed1;
      pos2 -= speed2;

      if (pos1 > pathLength) pos1 = 0;
      if (pos2 < 0) pos2 = pathLength;

      updateDot(dot1, pos1);
      updateDot(dot2, pos2);

      requestAnimationFrame(animate);
    }

    // Khởi tạo vị trí ban đầu
    updateDot(dot1, pos1);
    updateDot(dot2, pos2);

    // Bắt đầu animation
    requestAnimationFrame(animate);

    // Optional: pause khi tab không visible cho tiết kiệm CPU
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return; // rAF tự tối ưu khi hidden
    });
  })();