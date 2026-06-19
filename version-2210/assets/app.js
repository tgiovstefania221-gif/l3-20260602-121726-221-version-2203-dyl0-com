(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var filterGroup = document.querySelector('[data-filter-group]');
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item'));
    var currentFilter = 'all';

    function apply() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search') || card.textContent);
        var type = normalize(card.getAttribute('data-type'));
        var filter = normalize(currentFilter);
        var matchQuery = !query || search.indexOf(query) !== -1;
        var matchFilter = filter === 'all' || type.indexOf(filter) !== -1 || search.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', apply);
    }

    if (filterGroup) {
      filterGroup.addEventListener('click', function (event) {
        var button = event.target.closest('[data-filter]');
        if (!button) {
          return;
        }
        currentFilter = button.getAttribute('data-filter') || 'all';
        Array.prototype.slice.call(filterGroup.querySelectorAll('[data-filter]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
