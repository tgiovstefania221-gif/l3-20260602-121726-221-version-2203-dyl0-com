(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMobileMenu();
    bindHero();
    bindFilters();
    bindPlayers();
  });

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5600);
    }
  }

  function bindFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-filter-empty]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var activeKind = "all";

      if (input && queryValue) {
        input.value = queryValue;
      }

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var kind = card.getAttribute("data-kind") || "";
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchKind = activeKind === "all" || kind === activeKind;
          var showCard = matchKeyword && matchKind;

          card.style.display = showCard ? "" : "none";

          if (showCard) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeKind = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          applyFilter();
        });
      });

      applyFilter();
    });
  }

  function bindPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var playButton = shell.querySelector("[data-player-play]");

      if (!video) {
        return;
      }

      var source = video.querySelector("source");
      var src = source ? source.getAttribute("src") : video.getAttribute("src");

      if (src && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }

      function playVideo() {
        var result = video.paused ? video.play() : video.pause();

        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (playButton) {
        playButton.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      video.addEventListener("click", function () {
        playVideo();
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    });
  }
})();
