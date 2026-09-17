(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Theme toggle (light/dark) ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "kiln-theme";

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    var isDark =
      theme === "dark" ||
      (theme !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  try {
    var saved = window.localStorage.getItem(STORAGE_KEY);
    applyTheme(saved);
  } catch (e) {
    applyTheme(null);
  }

  themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var isDark =
      current === "dark" ||
      (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = isDark ? "light" : "dark";
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* storage unavailable — theme still applies for this session */
    }
  });

  /* ---------- Mobile menu: Dialog/Sheet with focus trap ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var sheet = document.getElementById("mobile-menu");
  var overlay = document.getElementById("sheet-overlay");
  var sheetClose = document.getElementById("sheet-close");
  var lastFocused = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function isSheetOpen() {
    return !sheet.hidden;
  }

  function openSheet() {
    lastFocused = document.activeElement;
    sheet.hidden = false;
    overlay.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    var focusables = getFocusable(sheet);
    if (focusables.length) focusables[0].focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeSheet() {
    if (!isSheetOpen()) return;
    sheet.hidden = true;
    overlay.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeSheet();
      return;
    }
    if (e.key === "Tab") {
      var focusables = getFocusable(sheet);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  menuToggle.addEventListener("click", function () {
    if (isSheetOpen()) {
      closeSheet();
    } else {
      openSheet();
    }
  });
  sheetClose.addEventListener("click", closeSheet);
  overlay.addEventListener("click", closeSheet);
  sheet.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeSheet);
  });

  /* Resize lên desktop thì đóng sheet (CSS cũng force-hide ở ≥861px) */
  var desktopQuery = window.matchMedia("(min-width: 861px)");
  function onBreakpointChange(e) {
    if (e.matches) closeSheet();
  }
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", onBreakpointChange);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(onBreakpointChange);
  }

  /* ---------- Copy-to-clipboard for code panel ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-copy-target");
      var target = document.getElementById(targetId);
      if (!target) return;
      var text = target.textContent;

      function markCopied() {
        var original = btn.textContent;
        btn.textContent = "Copied";
        btn.setAttribute("data-copied", "true");
        setTimeout(function () {
          btn.textContent = original;
          btn.removeAttribute("data-copied");
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(markCopied, function () {
          /* clipboard write failed — no crash, just skip feedback */
        });
      }
    });
  });

  /* ---------- Reveal-on-scroll (single deliberate motion pattern) ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Mega menu (Product / Solutions) — M-02 ---------- */
  var megaTriggers = Array.prototype.slice.call(
    document.querySelectorAll(".nav-trigger[data-nav]")
  );

  function closeAllMega(exceptTrigger) {
    megaTriggers.forEach(function (trigger) {
      if (trigger === exceptTrigger) return;
      var panelId = trigger.getAttribute("aria-controls");
      var panel = document.getElementById(panelId);
      trigger.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    });
  }

  function openMega(trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    closeAllMega(trigger);
    trigger.setAttribute("aria-expanded", "true");
    if (panel) panel.hidden = false;
  }

  function isMegaOpen(trigger) {
    return trigger.getAttribute("aria-expanded") === "true";
  }

  megaTriggers.forEach(function (trigger) {
    var panelId = trigger.getAttribute("aria-controls");
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var wrap = trigger.closest(".mega-wrap");

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = isMegaOpen(trigger);
      closeAllMega(trigger);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });

    /* Hover intent: chỉ trên thiết bị có hover thật (tránh dính trên touch) */
    if (wrap && window.matchMedia("(hover: hover)").matches) {
      var closeTimer = null;
      wrap.addEventListener("mouseenter", function () {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        openMega(trigger);
      });
      wrap.addEventListener("mouseleave", function () {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(function () {
          trigger.setAttribute("aria-expanded", "false");
          panel.hidden = true;
        }, 140);
      });
    }

    /* Keyboard: ArrowDown mở panel + nhảy vào link đầu, focus rời wrap thì đóng */
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        openMega(trigger);
        var firstLink = panel.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });
    if (wrap) {
      wrap.addEventListener("focusout", function (e) {
        if (!wrap.contains(e.relatedTarget)) {
          trigger.setAttribute("aria-expanded", "false");
          panel.hidden = true;
        }
      });
    }
  });

  document.addEventListener("click", function (e) {
    var withinMega = e.target.closest(".mega-wrap");
    if (!withinMega) closeAllMega(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllMega(null);
  });
})();
