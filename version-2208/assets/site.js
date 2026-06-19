(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img[data-cover]').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('is-missing');
        });
    });

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panelNode) {
        var section = panelNode.closest('section');
        var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
        var yearValue = 'all';
        var kindValue = 'all';
        var update = function () {
            cards.forEach(function (card) {
                var okYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
                var okKind = kindValue === 'all' || card.getAttribute('data-kind') === kindValue;
                card.style.display = okYear && okKind ? '' : 'none';
            });
        };
        panelNode.querySelectorAll('[data-filter-year]').forEach(function (button) {
            button.addEventListener('click', function () {
                yearValue = button.getAttribute('data-filter-year');
                panelNode.querySelectorAll('[data-filter-year]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                update();
            });
        });
        panelNode.querySelectorAll('[data-filter-kind]').forEach(function (button) {
            button.addEventListener('click', function () {
                kindValue = button.getAttribute('data-filter-kind');
                panelNode.querySelectorAll('[data-filter-kind]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                update();
            });
        });
    });
})();
