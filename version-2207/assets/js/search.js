(function () {
  var form = document.querySelector("[data-search-page-form]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var defaults = document.querySelector("[data-search-default]");
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-float">▶</span>',
      '    <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.description) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function search(keyword) {
    var q = keyword.trim().toLowerCase();

    if (!q) {
      results.innerHTML = "";
      defaults.style.display = "block";
      return;
    }

    var matched = (window.siteSearchMovies || []).filter(function (movie) {
      var haystack = [movie.title, movie.description, movie.category, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 120);

    defaults.style.display = "none";

    if (!matched.length) {
      results.innerHTML = '<div class="no-results"><h2>未找到相关影片</h2><p>可以尝试更换片名、年份、地区或题材关键词。</p></div>';
      return;
    }

    results.innerHTML = [
      '<div class="result-heading">',
      '  <h2>相关影片</h2>',
      '  <p>' + escapeHtml(keyword) + '</p>',
      '</div>',
      '<div class="movie-grid grid-4">',
      matched.map(movieCard).join(""),
      '</div>'
    ].join("");
  }

  if (input) {
    input.value = initial;
  }

  search(initial);

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var keyword = input ? input.value.trim() : "";
      var url = keyword ? "./search.html?q=" + encodeURIComponent(keyword) : "./search.html";
      window.history.replaceState(null, "", url);
      search(keyword);
    });
  }
}());
