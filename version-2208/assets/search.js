(function () {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var status = document.getElementById('searchStatus');
    var results = document.getElementById('searchResults');
    var movies = window.SEARCH_MOVIES || [];
    if (input) {
        input.value = q;
    }
    var normalize = function (value) {
        return String(value || '').toLowerCase();
    };
    var matched = movies;
    if (q) {
        var needle = normalize(q);
        matched = movies.filter(function (movie) {
            return normalize(movie.title).indexOf(needle) !== -1 ||
                normalize(movie.year).indexOf(needle) !== -1 ||
                normalize(movie.region).indexOf(needle) !== -1 ||
                normalize(movie.type).indexOf(needle) !== -1 ||
                normalize(movie.category).indexOf(needle) !== -1 ||
                normalize(movie.genre).indexOf(needle) !== -1 ||
                normalize(movie.tags).indexOf(needle) !== -1 ||
                normalize(movie.oneLine).indexOf(needle) !== -1;
        });
    } else {
        matched = movies.slice().sort(function (a, b) {
            return b.score - a.score;
        }).slice(0, 40);
    }
    if (status) {
        status.textContent = q ? '找到 ' + matched.length + ' 条相关影片。' : '默认展示热度较高的 40 部影片。';
    }
    if (!results) {
        return;
    }
    results.innerHTML = matched.slice(0, 200).map(function (movie) {
        return '<article class="movie-card">' +
            '<a class="poster-frame" href="' + movie.url + '">' +
            '<img src="./' + movie.image + '" alt="' + movie.title + '封面" loading="lazy" data-cover>' +
            '<span class="poster-badge">' + movie.category + '</span>' +
            '<span class="poster-play">▶</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>' +
            '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
            '<p>' + movie.oneLine + '</p>' +
            '<div class="tag-row"><span>' + movie.type + '</span><span>' + movie.category + '</span></div>' +
            '</div>' +
            '</article>';
    }).join('');
})();
