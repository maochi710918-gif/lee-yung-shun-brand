(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById("progressBar");
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + "%";

    var nav = document.getElementById("siteNav");
    if (scrollTop > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  reveals.forEach(function (el) {
    var delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.setProperty("--rd", delay + "ms");
    io.observe(el);
  });

  /* ---------- Count-up stats ---------- */
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var isDecimal = target % 1 !== 0;
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = easeOutExpo(progress);
      var val = target * eased;
      el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  var countIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(function (el) { countIo.observe(el); });

  /* ---------- P&L chart bars ---------- */
  var chart = document.getElementById("plChart");
  if (chart) {
    var baselineY = 160;
    var scale = 2.1; /* px per million NTD */
    var bars = chart.querySelectorAll(".pl-bar");

    function layoutBar(g) {
      var v = parseFloat(getComputedStyle(g).getPropertyValue("--v"));
      var rect = g.querySelector("rect");
      var text = g.querySelector("text");
      var h = Math.abs(v) * scale;
      if (v >= 0) {
        rect.setAttribute("data-y", baselineY - h);
        rect.setAttribute("data-h", h);
        text.setAttribute("y", baselineY - h - 12);
      } else {
        rect.setAttribute("data-y", baselineY);
        rect.setAttribute("data-h", h);
        text.setAttribute("y", baselineY + h + 22);
      }
      var label = (v > 0 ? "+" : "") + v.toFixed(1) + "M";
      text.textContent = label;
    }
    bars.forEach(layoutBar);

    var chartIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          chart.classList.add("is-active");
          bars.forEach(function (g) {
            var rect = g.querySelector("rect");
            rect.setAttribute("y", rect.getAttribute("data-y"));
            rect.setAttribute("height", rect.getAttribute("data-h"));
          });
          chartIo.unobserve(chart);
        }
      });
    }, { threshold: 0.3 });
    chartIo.observe(chart);
  }

  /* ---------- Milestones drag-to-scroll ---------- */
  var scroller = document.getElementById("msScroller");
  if (scroller) {
    var isDown = false, startX, scrollLeft;
    scroller.addEventListener("mousedown", function (e) {
      isDown = true;
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
    });
    ["mouseleave", "mouseup"].forEach(function (evt) {
      scroller.addEventListener(evt, function () { isDown = false; });
    });
    scroller.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - scroller.offsetLeft;
      scroller.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  }
})();
