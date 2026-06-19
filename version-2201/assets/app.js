document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupListingFilter();
  setupPlayer();
});

function setupMobileMenu() {
  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length === 0) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
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

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      start();
    });
  });

  show(0);
  start();
}

function setupListingFilter() {
  var form = document.querySelector("[data-filter-form]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
  var count = document.querySelector("[data-result-count]");
  var empty = document.querySelector("[data-empty]");

  if (!form || cards.length === 0) {
    hydrateSearchFromUrl();
    return;
  }

  var keywordInput = form.querySelector("[name='keyword']");
  var yearSelect = form.querySelector("[name='year']");
  var regionSelect = form.querySelector("[name='region']");
  var typeSelect = form.querySelector("[name='type']");
  var resetButton = form.querySelector("[data-reset-filter]");

  hydrateSearchFromUrl();
  runFilter();

  form.addEventListener("input", runFilter);
  form.addEventListener("change", runFilter);

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (keywordInput) keywordInput.value = "";
      if (yearSelect) yearSelect.value = "";
      if (regionSelect) regionSelect.value = "";
      if (typeSelect) typeSelect.value = "";
      runFilter();
    });
  }

  function hydrateSearchFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && keywordInput && !keywordInput.value) {
      keywordInput.value = q;
    }
  }

  function runFilter() {
    var keyword = normalize(keywordInput ? keywordInput.value : "");
    var year = yearSelect ? yearSelect.value : "";
    var region = regionSelect ? regionSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.type
      ].join(" "));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || String(card.dataset.year || "").indexOf(year) !== -1;
      var matchRegion = !region || card.dataset.region === region;
      var matchType = !type || card.dataset.type === type;
      var ok = matchKeyword && matchYear && matchRegion && matchType;

      card.style.display = ok ? "" : "none";

      if (ok) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = "当前显示 " + visible + " 部影片";
    }

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }
}

function hydrateSearchFromUrl() {
  var headerInputs = document.querySelectorAll(".header-search input[name='q'], .mobile-nav input[name='q']");
  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");

  if (!q) {
    return;
  }

  headerInputs.forEach(function (input) {
    input.value = q;
  });
}

function setupPlayer() {
  var video = document.querySelector("[data-video-player]");
  var button = document.querySelector("[data-play-button]");
  var overlay = document.querySelector("[data-player-overlay]");

  if (!video || !button) {
    return;
  }

  var loaded = false;

  button.addEventListener("click", function () {
    if (!loaded) {
      loadVideo(video);
      loaded = true;
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  });
}

function loadVideo(video) {
  var src = video.dataset.src;

  if (!src) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false
    });

    hls.loadSource(src);
    hls.attachMedia(video);
    window.__activeHls = hls;
    return;
  }

  video.src = src;
}
