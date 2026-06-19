(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll("img");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        image.setAttribute("aria-hidden", "true");
      }, { once: true });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var category = scope.querySelector("[data-filter-category]");
      var year = scope.querySelector("[data-filter-year]");
      var list = document.querySelector("[data-filter-list]");
      var count = scope.querySelector("[data-filter-count]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(search && search.value);
        var categoryValue = normalize(category && category.value);
        var minYear = parseInt(year && year.value, 10) || 0;
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" "));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardYear = parseInt(card.getAttribute("data-year"), 10) || 0;
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesCategory = !categoryValue || cardCategory === categoryValue;
          var matchesYear = !minYear || cardYear >= minYear;
          var isVisible = matchesQuery && matchesCategory && matchesYear;

          card.classList.toggle("is-hidden", !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + " 部内容";
        }
      }

      [search, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q");

      if (queryFromUrl && search) {
        search.value = queryFromUrl;
      }

      apply();
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");

      if (!video || !button) {
        return;
      }

      function playMp4() {
        var mp4 = shell.getAttribute("data-mp4");

        if (!mp4) {
          return Promise.reject(new Error("No MP4 source"));
        }

        video.src = mp4;
        video.controls = true;
        return video.play();
      }

      function playHlsOrFallback() {
        var hls = shell.getAttribute("data-hls");

        if (hls && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hls;
          video.controls = true;
          return video.play().catch(playMp4);
        }

        if (hls && window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          var hlsPlayer = new window.Hls();
          hlsPlayer.loadSource(hls);
          hlsPlayer.attachMedia(video);
          video.controls = true;

          return new Promise(function (resolve) {
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(resolve).catch(function () {
                playMp4().then(resolve).catch(resolve);
              });
            });

            hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                hlsPlayer.destroy();
                playMp4().then(resolve).catch(resolve);
              }
            });
          });
        }

        return playMp4();
      }

      button.addEventListener("click", function () {
        button.classList.add("is-hidden");
        playHlsOrFallback().catch(function () {
          button.classList.remove("is-hidden");
          button.querySelector("span:last-child").textContent = "播放源加载失败";
        });
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupImageFallbacks();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
