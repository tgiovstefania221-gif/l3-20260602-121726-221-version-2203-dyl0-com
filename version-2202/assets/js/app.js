const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@latest";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMobileNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function setupImageFallbacks() {
  document.querySelectorAll("img[data-fallback-image]").forEach((image) => {
    image.addEventListener("error", () => {
      image.style.opacity = "0";
      const fallback = image.parentElement?.querySelector(".poster-fallback");
      if (fallback) {
        fallback.style.display = "flex";
      }
    }, { once: true });
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => showSlide(index + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex);
      start();
    });
  });

  prev?.addEventListener("click", () => {
    showSlide(index - 1);
    start();
  });

  next?.addEventListener("click", () => {
    showSlide(index + 1);
    start();
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  showSlide(0);
  start();
}

function getCardText(card) {
  return [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genre,
    card.dataset.tags,
    card.textContent
  ].join(" ").toLowerCase();
}

function setupPageFiltering() {
  const toolbar = document.querySelector("[data-filter-toolbar]");
  const list = document.querySelector("[data-card-list]");

  if (!toolbar || !list) {
    return;
  }

  const searchInput = toolbar.querySelector("[data-page-search]");
  const sortSelect = toolbar.querySelector("[data-page-sort]");
  const count = toolbar.querySelector("[data-filter-count]");
  const originalCards = Array.from(list.querySelectorAll("[data-movie-card]"));

  function sortCards(cards) {
    const value = sortSelect?.value || "default";
    const sorted = [...cards];

    if (value === "year-desc") {
      sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    }

    if (value === "year-asc") {
      sorted.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
    }

    if (value === "title-asc") {
      sorted.sort((a, b) => (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN"));
    }

    if (value === "default") {
      return originalCards;
    }

    return sorted;
  }

  function applyFilter() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const sortedCards = sortCards(originalCards);
    let visible = 0;

    sortedCards.forEach((card) => {
      list.appendChild(card);
      const matched = !query || getCardText(card).includes(query);
      card.classList.toggle("is-hidden-by-filter", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `显示 ${visible} / ${originalCards.length} 部`;
    }
  }

  searchInput?.addEventListener("input", applyFilter);
  sortSelect?.addEventListener("change", applyFilter);
  applyFilter();
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const description = movie.oneLine || movie.summary || "";

  return `
    <article class="movie-card" data-movie-card>
      <a class="poster-frame" href="${movie.detail}" aria-label="观看${escapeHtml(movie.title)}">
        <img class="poster-image" src="./${movie.imageId}.jpg" alt="${escapeHtml(movie.title)}封面" loading="lazy" data-fallback-image>
        <span class="poster-fallback">日韩视频</span>
        <span class="type-badge">${escapeHtml(movie.type)}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(String(movie.year))}</span>
        </div>
        <h3><a href="${movie.detail}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(description).slice(0, 96)}</p>
        <div class="movie-tags">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    };
    return entities[char];
  });
}

function setupGlobalSearch() {
  const form = document.querySelector(".search-page-form");
  const input = document.querySelector("[data-global-search-input]");
  const results = document.querySelector("[data-global-search-results]");
  const summary = document.querySelector("[data-global-search-summary]");
  const movies = window.MOVIE_SEARCH_DATA || [];

  if (!form || !input || !results || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  input.value = initialQuery;

  function render(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      results.innerHTML = "";
      summary.textContent = `已载入 ${movies.length} 部影片，输入关键词开始搜索。`;
      return;
    }

    const matched = movies.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine,
        movie.summary
      ].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });

    summary.textContent = `搜索“${query}”，找到 ${matched.length} 部影片。`;
    results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join("");
    setupImageFallbacks();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const nextUrl = query ? `./search.html?q=${encodeURIComponent(query)}` : "./search.html";
    window.history.replaceState(null, "", nextUrl);
    render(query);
  });

  input.addEventListener("input", () => render(input.value));
  render(initialQuery);
}

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${HLS_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Hls));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = HLS_CDN;
    script.async = true;
    script.onload = () => resolve(window.Hls);
    script.onerror = () => reject(new Error("HLS library failed to load."));
    document.head.appendChild(script);
  });
}

function setupVideoPlayer() {
  const video = document.querySelector("[data-player]");
  const playButton = document.querySelector("[data-play-button]");
  const status = document.querySelector("[data-player-status]");

  if (!video) {
    return;
  }

  const source = video.dataset.playerSrc || video.querySelector("source")?.src;
  let initialized = false;

  async function initializePlayer() {
    if (initialized || !source) {
      return;
    }

    initialized = true;
    if (status) {
      status.textContent = "正在初始化 HLS 播放源...";
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      if (status) {
        status.textContent = "当前浏览器原生支持 m3u8 播放。";
      }
      return;
    }

    try {
      const Hls = await loadHlsLibrary();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (status) {
            status.textContent = "HLS 播放源加载完成，可点击播放。";
          }
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (status && data?.fatal) {
            status.textContent = "播放源加载失败，请刷新页面或稍后重试。";
          }
        });
      } else if (status) {
        status.textContent = "当前浏览器暂不支持 HLS 播放。";
      }
    } catch (error) {
      if (status) {
        status.textContent = "HLS 组件加载失败，请检查网络后重试。";
      }
    }
  }

  playButton?.addEventListener("click", async () => {
    await initializePlayer();
    try {
      await video.play();
      playButton.classList.add("is-hidden");
    } catch (error) {
      if (status) {
        status.textContent = "浏览器阻止了自动播放，请再次点击播放器。";
      }
    }
  });

  video.addEventListener("play", () => {
    playButton?.classList.add("is-hidden");
  });

  video.addEventListener("click", initializePlayer, { once: true });
  initializePlayer();
}

ready(() => {
  setupMobileNavigation();
  setupImageFallbacks();
  setupHeroCarousel();
  setupPageFiltering();
  setupGlobalSearch();
  setupVideoPlayer();
});
