/* Pixel Arena — mobile storefront behaviour. No build step, no dependencies
   (hls.js is lazy-loaded from a CDN only when a browser can't play HLS natively). */
(function () {
  'use strict';

  var GAMES = window.XO_GAMES || [];
  var byId = {};
  GAMES.forEach(function (g) { byId[g.id] = g; });
  var FEATURED = (window.XO_FEATURED || []).map(function (id) { return byId[id]; }).filter(Boolean);

  var PLATFORMS = [
    { key: 'all', label: 'All' },
    { key: 'pc', label: 'PC' },
    { key: 'ps', label: 'PlayStation' },
    { key: 'xbox', label: 'Xbox' }
  ];
  var PLATFORM_NAME = { pc: 'PC', ps: 'PlayStation', xbox: 'Xbox' };
  var PLATFORM_SHORT = { pc: 'PC', ps: 'PS', xbox: 'XBOX' };
  var LIB_KEY = 'xo.library.v1';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICON = {
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.8v14.4L19 12z"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };

  var state = { platform: 'all', query: '', view: 'store', library: loadLibrary() };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function loadLibrary() {
    try {
      var ids = JSON.parse(localStorage.getItem(LIB_KEY) || '[]');
      return Array.isArray(ids) ? ids.filter(function (id) { return byId[id]; }) : [];
    } catch (e) { return []; }
  }
  function saveLibrary() {
    try { localStorage.setItem(LIB_KEY, JSON.stringify(state.library)); } catch (e) { /* private mode */ }
  }
  function inLibrary(id) { return state.library.indexOf(id) !== -1; }

  function platsText(g) { return g.platforms.map(function (p) { return PLATFORM_SHORT[p]; }).join(' · '); }
  function priceHtml(g) {
    if (g.price === 'Free') return '<span class="price is-free">Free</span>';
    return '<span class="price' + (g.discount ? ' is-sale' : '') + '">' + esc(g.price) + '</span>';
  }
  function matchesPlatform(g) { return state.platform === 'all' || g.platforms.indexOf(state.platform) !== -1; }
  function matchesQuery(g, q) {
    if (!q) return true;
    var hay = (g.title + ' ' + g.developer + ' ' + g.publisher + ' ' + g.genres.join(' ')).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
  }
  function libButton(g, extra) {
    var on = inLibrary(g.id);
    return '<button class="btn btn-primary ' + (extra || '') + '" type="button" data-lib="' + g.id + '" data-lib-kind="text" aria-pressed="' + on + '">' +
      (on ? ICON.check : ICON.plus) + '<span class="lbl">' + (on ? 'In Library' : 'Add to Library') + '</span></button>';
  }
  function fadeIn(img) {
    if (img.complete && img.naturalWidth) img.classList.add('is-loaded');
    else img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
  }

  /* ---------------- Hero carousel ---------------- */
  var hero = { index: 0, timer: null, duration: 7000 };
  var LOGO = { area: 16000, maxH: 96, maxW: 300 };

  // Steam logos ship with uneven transparent padding. Crop each to its measured artwork and size it
  // by visual area, so every title carries the same weight and sits flush with the text column.
  function logoHtml(g) {
    var img = '<img class="slide-logo" src="' + g.logo + '" alt="' + esc(g.title) + '">';
    var c = g.logoCrop;
    if (!c) return img;
    var w = Math.round(Math.min(Math.sqrt(LOGO.area * c.aspect), LOGO.maxH * c.aspect, LOGO.maxW));
    return '<span class="logo-crop' + (g.logoTone === 'dark' ? ' is-dark' : '') + '" style="width:' + w + 'px;aspect-ratio:' + c.aspect +
      ';--x:' + c.x + ';--y:' + c.y + ';--w:' + c.w + ';--h:' + c.h + '">' + img + '</span>';
  }

  function renderHero() {
    var rail = $('hero-rail');
    rail.innerHTML = FEATURED.map(function (g, i) {
      var meta = [esc(g.genres[0]), esc(g.year)].filter(Boolean);
      meta.push('<span class="slide-price">' + (g.discount ? '<s>' + esc(g.originalPrice) + '</s> ' : '') + esc(g.price) + '</span>');
      return '<article class="slide' + (i === 0 ? ' is-current' : '') + (g.heroTone === 'light' ? ' is-light' : '') + '" data-open="' + g.id + '" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + FEATURED.length + '">' +
        '<img class="slide-art" src="' + g.hero + '" alt="" style="object-position:' + g.focus + ' 40%"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' +
        '<div class="slide-shade"></div>' +
        '<div class="slide-body">' +
        '<p class="eyebrow">Featured' + (g.discount ? ' · ' + g.discount + '% off' : '') + '</p>' +
        '<h2 class="slide-title">' + logoHtml(g) + '</h2>' +
        '<p class="slide-meta">' + meta.join('<span class="sep">/</span>') + '</p>' +
        '<div class="slide-actions">' +
        '<button class="btn btn-primary" type="button" data-lib="' + g.id + '" data-lib-kind="text" aria-pressed="' + inLibrary(g.id) + '">' +
        (inLibrary(g.id) ? ICON.check : ICON.plus) + '<span class="lbl">' + (inLibrary(g.id) ? 'In Library' : 'Add to Library') + '</span></button>' +
        '<button class="btn btn-ghost" type="button" data-trailer="' + g.id + '">' + ICON.play + 'Trailer</button>' +
        '</div>' +
        '</div>' +
        '</article>';
    }).join('');

    // Logos are art; fall back to typeset title if one fails to load.
    rail.querySelectorAll('.slide-logo').forEach(function (img) {
      img.addEventListener('error', function () {
        img.closest('.slide-title').innerHTML = '<span class="slide-title-text">' + esc(img.alt) + '</span>';
      }, { once: true });
    });

    $('hero-progress').innerHTML = FEATURED.map(function (g, i) {
      return '<button class="seg" type="button" role="tab" data-seg="' + i + '" aria-label="' + esc(g.title) + '"></button>';
    }).join('');

    var scrollT;
    rail.addEventListener('scroll', function () {
      clearTimeout(scrollT);
      scrollT = setTimeout(function () {
        var i = Math.round(rail.scrollLeft / rail.clientWidth);
        if (i !== hero.index) setHero(i, false);
      }, 80);
    }, { passive: true });

    var heroEl = rail.parentNode;
    var pause = function () { heroEl.classList.add('is-paused'); clearTimeout(hero.timer); };
    var resume = function () { heroEl.classList.remove('is-paused'); setHero(hero.index, false, true); };
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resume, { passive: true });
    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('mouseleave', resume);
    document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });

    setHero(0, false);
  }

  function setHero(i, scroll, restartOnly) {
    var n = FEATURED.length;
    if (!n) return;
    i = (i + n) % n;
    hero.index = i;
    var rail = $('hero-rail');
    if (scroll) rail.scrollTo({ left: i * rail.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    rail.querySelectorAll('.slide').forEach(function (s, k) { s.classList.toggle('is-current', k === i); });
    $('hero-progress').querySelectorAll('.seg').forEach(function (s, k) {
      s.classList.toggle('is-done', k < i || (reduceMotion && k === i));
      s.classList.remove('is-active');
      s.setAttribute('aria-selected', String(k === i));
      if (k === i && !reduceMotion) { void s.offsetWidth; s.classList.add('is-active'); }
      s.style.setProperty('--seg-dur', hero.duration + 'ms');
    });
    $('hero-counter').innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(n).padStart(2, '0');
    clearTimeout(hero.timer);
    if (!reduceMotion) {
      hero.timer = setTimeout(function () {
        if (state.view === 'store' && !document.querySelector('.sheet:not([hidden]), .player:not([hidden])')) setHero(hero.index + 1, true);
        else setHero(hero.index, false);
      }, hero.duration);
    }
  }

  /* ---------------- Platform tabs ---------------- */
  function renderPlatformTabs() {
    document.querySelectorAll('[data-platforms]').forEach(function (bar) {
      bar.innerHTML = PLATFORMS.map(function (p) {
        var count = p.key === 'all' ? GAMES.length : GAMES.filter(function (g) { return g.platforms.indexOf(p.key) !== -1; }).length;
        return '<button class="pf" type="button" role="tab" data-platform="' + p.key + '" aria-selected="' + (state.platform === p.key) + '">' +
          p.label + '<sup>' + count + '</sup></button>';
      }).join('') + '<span class="pf-ink" aria-hidden="true"></span>';
    });
  }
  // One accent bar that glides to the selected platform instead of each tab toggling its own.
  function placeInk() {
    document.querySelectorAll('[data-platforms]').forEach(function (bar) {
      var ink = bar.querySelector('.pf-ink');
      var on = bar.querySelector('[aria-selected="true"]');
      if (!ink || !on || !on.offsetWidth) return; // bar is in a hidden view; placed when it is shown
      ink.style.width = on.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      if (!bar.classList.contains('ink-ready')) requestAnimationFrame(function () { bar.classList.add('ink-ready'); });
    });
  }
  function setPlatform(key) {
    if (state.platform === key) return;
    state.platform = key;
    document.querySelectorAll('[data-platform]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-platform') === key));
    });
    placeInk();
    renderGrid();
    renderSearch();
  }

  /* ---------------- Store grid ---------------- */
  function cardHtml(g, i) {
    var on = inLibrary(g.id);
    return '<article class="card" data-open="' + g.id + '" style="animation-delay:' + Math.min(i * 35, 280) + 'ms">' +
      '<div class="card-art">' +
      '<img src="' + g.cover + '" alt="" loading="lazy" decoding="async">' +
      (g.discount ? '<span class="card-off' + (g.coverLogo === 'bottom' ? ' is-top' : '') + '">-' + g.discount + '%</span>' : '') +
      '<button class="card-save" type="button" data-lib="' + g.id + '" data-lib-kind="icon" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Add ') + esc(g.title) + (on ? ' from library' : ' to library') + '">' +
      '<span>' + (on ? ICON.check : ICON.plus) + '</span></button>' +
      '</div>' +
      '<h3 class="card-title">' + esc(g.title) + '</h3>' +
      '<div class="card-meta"><span class="plats">' + platsText(g) + '</span>' + priceHtml(g) + '</div>' +
      '</article>';
  }
  function renderGrid() {
    var list = GAMES.filter(matchesPlatform);
    var grid = $('grid');
    grid.innerHTML = list.length ? list.map(cardHtml).join('') :
      '<div class="empty"><strong>Nothing here yet</strong>No games for this platform.</div>';
    grid.querySelectorAll('img').forEach(fadeIn);
    $('grid-count').textContent = list.length + (list.length === 1 ? ' game' : ' games');
  }

  /* ---------------- Search ---------------- */
  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    q.split(/\s+/).filter(Boolean).forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }
  function rowHtml(g, q, i) {
    return '<article class="row" data-open="' + g.id + '" style="animation-delay:' + Math.min(i * 30, 240) + 'ms">' +
      '<div class="row-art"><img src="' + g.cover + '" alt="" loading="lazy" decoding="async"></div>' +
      '<div><h3 class="row-title">' + highlight(g.title, q) + '</h3>' +
      '<p class="row-sub">' + esc(g.developer) + ' · ' + esc(g.year) + '</p>' +
      '<span class="plats">' + platsText(g) + '</span></div>' +
      priceHtml(g) +
      '</article>';
  }
  function renderSearch() {
    var body = $('search-body');
    var q = state.query.trim();
    $('search-clear').hidden = !q;
    if (!q) {
      var counts = {};
      GAMES.filter(matchesPlatform).forEach(function (g) { g.genres.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; }); });
      var genres = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
      body.innerHTML = '<p class="result-label">Browse by genre</p><div class="genres">' +
        genres.map(function (x) {
          return '<button class="genre" type="button" data-genre="' + esc(x) + '">' + esc(x) + '<span>' + counts[x] + ICON.right + '</span></button>';
        }).join('') + '</div>';
      var rated = GAMES.filter(function (g) { return g.metacritic && matchesPlatform(g); })
        .sort(function (a, b) { return b.metacritic - a.metacritic; }).slice(0, 5);
      if (rated.length) {
        body.innerHTML += '<p class="result-label" style="padding-top:28px">Highest rated · Metacritic</p>' +
          rated.map(function (g, i) { return rowHtml(g, '', i).replace('</h3>', ' <span class="row-score">' + g.metacritic + '</span></h3>'); }).join('');
      }
      return;
    }
    var list = GAMES.filter(function (g) { return matchesPlatform(g) && matchesQuery(g, q); });
    var where = state.platform === 'all' ? '' : ' on ' + PLATFORM_NAME[state.platform];
    if (!list.length) {
      body.innerHTML = '<div class="empty"><strong>No matches for “' + esc(q) + '”' + esc(where) + '</strong>Try a studio, a genre, or a shorter title.' +
        '<br><button class="text-btn" type="button" data-reset-search>Clear search' + (where ? ' & filter' : '') + '</button></div>';
      return;
    }
    body.innerHTML = '<p class="result-label">' + list.length + (list.length === 1 ? ' result' : ' results') + esc(where) + '</p>' +
      list.map(function (g, i) { return rowHtml(g, q, i); }).join('');
  }

  /* ---------------- Library ---------------- */
  function renderLibrary() {
    var body = $('library-body');
    var n = state.library.length;
    $('library-count').textContent = n ? n + (n === 1 ? ' game' : ' games') : '';
    var badge = $('tab-badge');
    badge.hidden = !n;
    badge.textContent = n;
    if (!n) {
      var art = FEATURED.slice(1, 3).concat(FEATURED.slice(0, 1));
      body.innerHTML = '<div class="lib-empty">' +
        '<div class="lib-stack" aria-hidden="true">' + art.map(function (g) { return '<img src="' + g.cover + '" alt="">'; }).join('') + '</div>' +
        '<h2>Your shelf is empty</h2>' +
        '<p>Add games from the store and they’ll wait for you here — saved on this device.</p>' +
        '<a class="btn btn-primary" href="#/store">Browse the store</a>' +
        '</div>';
      return;
    }
    body.innerHTML = state.library.slice().reverse().map(function (id, i) {
      var g = byId[id];
      return '<article class="row lib-row" data-open="' + g.id + '" style="animation-delay:' + Math.min(i * 30, 240) + 'ms">' +
        '<div class="row-art"><img src="' + g.cover + '" alt="" loading="lazy"></div>' +
        '<div><h3 class="row-title">' + esc(g.title) + '</h3>' +
        '<p class="row-sub">' + esc(g.developer) + ' · ' + esc(g.year) + '</p>' +
        '<span class="plats">' + platsText(g) + '</span>' +
        '<div class="lib-actions">' +
        '<button class="chip-btn" type="button" data-trailer="' + g.id + '">' + ICON.play + 'Trailer</button>' +
        '<button class="chip-btn is-quiet" type="button" data-lib="' + g.id + '" data-lib-kind="remove">Remove</button>' +
        '</div></div>' +
        '</article>';
    }).join('') + '<p class="lib-note">Saved on this device</p>';
  }

  function toggleLibrary(id) {
    var g = byId[id];
    if (!g) return;
    var adding = !inLibrary(id);
    if (adding) state.library.push(id);
    else state.library = state.library.filter(function (x) { return x !== id; });
    saveLibrary();
    syncLibraryButtons(id);
    renderLibrary();
    if (adding) {
      var badge = $('tab-badge');
      badge.classList.remove('is-bump'); void badge.offsetWidth; badge.classList.add('is-bump');
    }
    toast(adding ? 'Added ' + g.title : 'Removed ' + g.title, adding);
  }
  function syncLibraryButtons(id) {
    var on = inLibrary(id);
    document.querySelectorAll('[data-lib="' + id + '"]').forEach(function (b) {
      var kind = b.getAttribute('data-lib-kind');
      if (kind === 'remove') return;
      b.setAttribute('aria-pressed', String(on));
      if (kind === 'icon') {
        b.innerHTML = '<span>' + (on ? ICON.check : ICON.plus) + '</span>';
        b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + byId[id].title + (on ? ' from library' : ' to library'));
      } else {
        var old = b.querySelector('svg');
        if (old) old.outerHTML = on ? ICON.check : ICON.plus;
        b.querySelector('.lbl').textContent = on ? 'In Library' : 'Add to Library';
      }
    });
  }

  /* ---------------- Toast ---------------- */
  var toastT;
  function toast(text, withLink) {
    var t = $('toast');
    $('toast-text').textContent = text;
    $('toast-link').hidden = !withLink || state.view === 'library';
    t.classList.toggle('in-sheet', !$('sheet').hidden);
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------------- Details sheet ---------------- */
  var lastFocus = null;
  function openDetails(id) {
    var g = byId[id];
    if (!g) return;
    lastFocus = document.activeElement;
    var sheet = $('sheet');
    var facts = [
      ['Released', esc(g.year)],
      ['Developer', esc(g.developer)],
      g.metacritic ? ['Metacritic', '<span class="mc">' + g.metacritic + '</span>'] : ['Publisher', esc(g.publisher)]
    ];
    $('sheet-scroll').innerHTML =
      '<div class="d-art">' +
      '<img src="' + g.hero + '" alt="" style="object-position:' + g.focus + ' 40%">' +
      '<div class="slide-shade"></div>' +
      '<button class="icon-btn d-close" type="button" data-close-sheet aria-label="Close details">' + ICON.down + '</button>' +
      (g.trailer ? '<button class="d-play" type="button" data-trailer="' + g.id + '"><span>' + ICON.play + '</span><span>Watch trailer</span></button>' : '') +
      '</div>' +
      '<div class="d-body">' +
      '<p class="eyebrow">' + esc(g.genres.join(' · ')) + '</p>' +
      '<h1 class="d-title" id="sheet-title">' + esc(g.title) + '</h1>' +
      '<dl class="d-facts">' + facts.map(function (f) { return '<div class="d-fact"><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="d-desc">' + esc(g.description) + '</p>' +
      '<h2 class="d-h">Available on</h2>' +
      '<ul class="d-platforms">' + ['pc', 'ps', 'xbox'].map(function (p) {
        var on = g.platforms.indexOf(p) !== -1;
        return '<li class="' + (on ? 'is-on' : 'is-off') + '">' + PLATFORM_NAME[p] + '<small>' + (on ? 'Available' : 'Not available') + '</small></li>';
      }).join('') + '</ul>' +
      (g.screenshots.length ? '<h2 class="d-h">Screenshots</h2><div class="d-shots">' + g.screenshots.map(function (s) {
        return '<img src="' + s + '" alt="' + esc(g.title) + ' screenshot" loading="lazy">';
      }).join('') + '</div>' : '') +
      '<h2 class="d-h">Details</h2>' +
      '<dl class="d-info">' +
      '<div><dt>Developer</dt><dd>' + esc(g.developer) + '</dd></div>' +
      '<div><dt>Publisher</dt><dd>' + esc(g.publisher) + '</dd></div>' +
      '<div><dt>Release date</dt><dd>' + esc(g.released) + '</dd></div>' +
      '</dl>' +
      '</div>';
    $('sheet-bar').innerHTML =
      '<div class="bar-price">' +
      (g.discount ? '<span class="off">-' + g.discount + '%  <s>' + esc(g.originalPrice) + '</s></span>' : '<s></s>') +
      '<strong>' + esc(g.price) + '</strong>' +
      '</div>' + libButton(g);
    sheet.classList.remove('is-closing');
    sheet.hidden = false;
    $('sheet-scroll').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    var closeBtn = sheet.querySelector('.d-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function closeDetails(fromHash) {
    var sheet = $('sheet');
    if (sheet.hidden) return;
    var finish = function () {
      sheet.hidden = true;
      sheet.classList.remove('is-closing');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    if (reduceMotion) finish();
    else { sheet.classList.add('is-closing'); setTimeout(finish, 230); }
    if (!fromHash && /^#\/game\//.test(location.hash)) history.back();
  }

  /* ---------------- Trailer ---------------- */
  var hls = null;
  var hlsLoading = null;
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (hlsLoading) return hlsLoading;
    hlsLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      s.onload = function () { window.Hls ? resolve(window.Hls) : reject(); };
      s.onerror = function () { hlsLoading = null; reject(); };
      document.head.appendChild(s);
    });
    return hlsLoading;
  }
  function trailerFailed(msg) {
    $('player-fallback-text').textContent = msg || 'We couldn’t load this video stream. Check your connection and try again.';
    $('player-fallback').hidden = false;
  }
  function openTrailer(id) {
    var g = byId[id];
    if (!g) return;
    var player = $('player');
    var video = $('player-video');
    $('player-title').textContent = g.title;
    $('player-kicker').textContent = g.trailer ? g.trailer.name.replace(g.title, '').replace(/^[s-–:|]+/, '') || 'Trailer' : 'Trailer';
    $('player-fallback').hidden = true;
    player.hidden = false;
    document.body.style.overflow = 'hidden';
    $('player-close').focus({ preventScroll: true });

    if (!g.trailer || !g.trailer.hls) { video.removeAttribute('src'); trailerFailed('No official trailer is available for this game yet.'); return; }
    video.poster = g.trailer.poster || g.hero;
    var src = g.trailer.hls;
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () { /* user can press play */ }); };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      play();
    } else {
      loadHls().then(function (Hls) {
        if (player.hidden) return;
        if (!Hls.isSupported()) { trailerFailed('This browser can’t play the trailer stream.'); return; }
        hls = new Hls({ capLevelToPlayerSize: true });
        hls.on(Hls.Events.ERROR, function (e, data) { if (data.fatal) { trailerFailed(); hls.destroy(); hls = null; } });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, play);
      }).catch(function () { trailerFailed('The video player couldn’t be loaded. Check your connection and try again.'); });
    }
    video.onerror = function () { trailerFailed(); };
  }
  function closeTrailer() {
    var player = $('player');
    if (player.hidden) return;
    var video = $('player-video');
    video.pause();
    if (hls) { hls.destroy(); hls = null; }
    video.removeAttribute('src');
    video.load();
    player.hidden = true;
    if ($('sheet').hidden) document.body.style.overflow = '';
  }

  /* ---------------- Routing ---------------- */
  var storeScroll = 0;
  function route() {
    var h = location.hash || '#/store';
    var m = h.match(/^#\/game\/(\w+)/);
    if (m) { openDetails(m[1]); return; }
    closeDetails(true);
    var view = (h.match(/^#\/(store|search|friends|library)/) || [0, 'store'])[1];
    if (state.view === 'store') storeScroll = window.scrollY;
    var changed = view !== state.view;
    state.view = view;
    document.querySelectorAll('.view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== view; });
    document.querySelectorAll('.tab').forEach(function (t) {
      var on = t.getAttribute('data-tab') === view;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    if (changed) window.scrollTo(0, view === 'store' ? storeScroll : 0);
    if (view === 'search' && changed) setTimeout(function () { $('search-input').focus({ preventScroll: true }); }, 60);
    placeInk();
    updateTopbar();
  }
  function updateTopbar() {
    var bar = $('topbar');
    var heroH = document.querySelector('.hero').offsetHeight;
    bar.classList.toggle('is-plain', state.view !== 'store');
    bar.classList.toggle('is-solid', state.view === 'store' && window.scrollY > heroH - 120);
  }

  /* ---------------- Events ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lib],[data-trailer],[data-platform],[data-seg],[data-genre],[data-reset-search],[data-close-sheet],[data-open]');
    if (!t) return;
    if (t.hasAttribute('data-lib')) { e.preventDefault(); toggleLibrary(t.getAttribute('data-lib')); return; }
    if (t.hasAttribute('data-trailer')) { openTrailer(t.getAttribute('data-trailer')); return; }
    if (t.hasAttribute('data-platform')) { setPlatform(t.getAttribute('data-platform')); return; }
    if (t.hasAttribute('data-seg')) { setHero(+t.getAttribute('data-seg'), true); return; }
    if (t.hasAttribute('data-genre')) { setQuery(t.getAttribute('data-genre')); return; }
    if (t.hasAttribute('data-reset-search')) { setQuery(''); setPlatform('all'); $('search-input').focus(); return; }
    if (t.hasAttribute('data-close-sheet')) { closeDetails(false); return; }
    if (t.hasAttribute('data-open')) { location.hash = '#/game/' + t.getAttribute('data-open'); }
  });

  function setQuery(q) {
    state.query = q;
    $('search-input').value = q;
    renderSearch();
  }
  $('search-input').addEventListener('input', function (e) { state.query = e.target.value; renderSearch(); });
  $('search-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.blur(); });
  $('search-clear').addEventListener('click', function () { setQuery(''); $('search-input').focus(); });
  $('player-close').addEventListener('click', closeTrailer);
  $('toast-link').addEventListener('click', function () { if (!$('sheet').hidden) closeDetails(true); $('toast').hidden = true; });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('player').hidden) closeTrailer();
    else if (!$('sheet').hidden) closeDetails(false);
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', function () { if (state.view === 'store') updateTopbar(); }, { passive: true });
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    // Mobile URL bars fire resize on scroll; only re-align the carousel when the width really changes.
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      var rail = $('hero-rail');
      rail.scrollLeft = hero.index * rail.clientWidth;
    }
    placeInk();
    updateTopbar();
  });
  // Tab widths change once the display font arrives.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInk);

  /* ---------------- Friends & Playing Together (local mock, same data as desktop) ---------------- */
  var SOC = window.XO_SOCIAL;
  var social = SOC && { friends: SOC.FRIENDS.slice(), requests: SOC.REQUESTS.slice(), sent: {}, invited: {}, joined: null, sheet: null };
  var PEOPLE = {};
  if (SOC) [SOC.ME].concat(SOC.FRIENDS, SOC.REQUESTS, SOC.SUGGESTED).forEach(function (p) { PEOPLE[p.id] = p; });

  // Deterministic 5×5 mirrored pixel avatar — identical algorithm to the desktop PixelAvatar.
  function avatarCells(name) {
    var h = 2166136261;
    for (var i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 16777619); }
    h >>>= 0;
    var cells = [];
    for (var y = 0; y < 5; y++) for (var x = 0; x < 3; x++) {
      if ((h >>> (y * 3 + x)) & 1) { cells.push([x, y]); if (x < 2) cells.push([4 - x, y]); }
    }
    return cells;
  }
  function avatarHtml(p, size, status) {
    var rects = avatarCells(p.name).map(function (c) { return '<rect x="' + c[0] + '" y="' + c[1] + '" width="1" height="1"/>'; }).join('');
    return '<span class="pavatar" style="--c:' + p.color + ';width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="-1 -1 7 7" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>' +
      (status ? '<i class="pavatar-dot" style="background:' + SOC.STATUS[status].color + '"></i>' : '') + '</span>';
  }
  function statusHtml(s) { return '<span class="fx-status" style="color:' + SOC.STATUS[s].color + '">' + SOC.STATUS[s].label + '</span>'; }
  function sessionsNow() {
    return SOC.SESSIONS.map(function (s) {
      return Object.assign({}, s, { members: social.joined === s.id ? s.members.concat(SOC.ME.id) : s.members });
    });
  }
  function findSession(id) { return sessionsNow().filter(function (s) { return s.id === id; })[0]; }

  function renderFriends() {
    if (!SOC) return;
    var L = SOC.LABELS;
    var online = social.friends.filter(function (f) { return f.status !== 'offline'; }).length;
    $('fx-online').textContent = online + ' online';
    var badge = $('fx-badge');
    badge.hidden = !social.requests.length;
    badge.textContent = social.requests.length;

    var sessions = sessionsNow().map(function (s) {
      var g = byId[s.game];
      var isIn = social.joined === s.id;
      var full = s.members.length >= s.max;
      var slots = '';
      for (var i = s.members.length; i < s.max; i++) slots += '<span class="fx-slot"></span>';
      return '<article class="fx-session' + (isIn ? ' is-joined' : '') + '">' +
        '<div class="fx-session-art" data-open="' + g.id + '"><img src="' + g.hero + '" alt="" loading="lazy" style="object-position:' + g.focus + ' 40%"></div>' +
        '<div class="fx-session-body">' +
          '<p class="fx-live' + (s.live ? ' is-live' : '') + '"><i></i>' + (isIn ? 'You’re in this session' : esc(s.statusLabel)) + '</p>' +
          '<h3 class="fx-session-name">' + esc(s.name) + '</h3>' +
          '<p class="fx-session-game">' + esc(g.title) + ' · hosted by ' + esc(PEOPLE[s.host].name) + '</p>' +
          '<div class="fx-stack">' + s.members.map(function (id) { return avatarHtml(PEOPLE[id], 28); }).join('') + slots +
            '<span class="fx-count"><b>' + s.members.length + '</b>/' + s.max + ' players</span></div>' +
          '<div class="fx-actions">' +
            '<button class="btn btn-ghost" type="button" data-fx-invite="' + s.id + '">Invite</button>' +
            (isIn ? '<button class="btn btn-primary" type="button" aria-pressed="true" data-fx-lobby="' + s.id + '">' + ICON.check + 'Open lobby</button>'
                  : '<button class="btn btn-primary" type="button" data-fx-join="' + s.id + '"' + (full ? ' disabled' : '') + '>' + (full ? 'Full' : 'Join') + '</button>') +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    var requests = social.requests.length ? social.requests.map(function (r) {
      return '<li class="fx-row">' + avatarHtml(r, 42, r.status) +
        '<div class="fx-text"><p class="fx-name">' + esc(r.name) + '</p><p class="fx-meta">Wants to be friends</p></div>' +
        '<div class="fx-row-actions"><button class="fx-btn is-primary" type="button" data-fx-accept="' + r.id + '">Accept</button>' +
        '<button class="fx-btn is-quiet" type="button" data-fx-decline="' + r.id + '">Decline</button></div></li>';
    }).join('') : '<li class="fx-empty">You’re all caught up.</li>';

    var friends = social.friends.map(function (f) {
      var g = f.game && byId[f.game];
      var s = f.session && findSession(f.session);
      var isIn = s && social.joined === s.id;
      return '<li class="fx-row is-' + f.status + '">' + avatarHtml(f, 46, f.status) +
        '<div class="fx-text"><p class="fx-name">' + esc(f.name) + '</p><p class="fx-meta">' + statusHtml(f.status) + ' · ' + esc(f.activity) + '</p></div>' +
        (g ? '<span class="fx-game" data-open="' + g.id + '"><img src="' + g.cover + '" alt="" loading="lazy"></span>' : '') +
        (s ? '<button class="fx-btn' + (isIn ? ' is-done' : '') + '" type="button" ' + (isIn ? 'data-fx-lobby' : 'data-fx-join') + '="' + s.id + '"' +
          (!isIn && s.members.length >= s.max ? ' disabled' : '') + '>' + (isIn ? 'In lobby' : 'Join') + '</button>' : '') +
      '</li>';
    }).join('');

    var find = SOC.SUGGESTED.map(function (p) {
      var sent = social.sent[p.id];
      return '<li class="fx-row">' + avatarHtml(p, 42, p.status) +
        '<div class="fx-text"><p class="fx-name">' + esc(p.name) + '</p><p class="fx-meta">' + esc(p.activity) + '</p></div>' +
        '<button class="fx-btn' + (sent ? ' is-done' : '') + '" type="button" data-fx-add="' + p.id + '"' + (sent ? ' disabled' : '') + '>' +
          (sent ? ICON.check + 'Request Sent' : ICON.plus + 'Add Friend') + '</button></li>';
    }).join('');

    $('friends-body').innerHTML =
      '<p class="fx-note">' + esc(L.note) + '</p>' +
      '<h2 class="result-label">' + esc(L.sessions) + '</h2><div class="fx-sessions">' + sessions + '</div>' +
      '<h2 class="result-label">' + esc(L.requests) + ' <b>' + social.requests.length + '</b></h2><ul class="fx-list">' + requests + '</ul>' +
      '<h2 class="result-label">' + esc(L.friends) + ' <b>' + social.friends.length + '</b></h2><ul class="fx-list">' + friends + '</ul>' +
      '<h2 class="result-label">' + esc(L.find) + '</h2><ul class="fx-list">' + find + '</ul>';
    if (social.sheet) renderSheet();
  }

  function renderSheet() {
    var sh = social.sheet;
    var s = findSession(sh.id);
    var g = byId[s.game];
    var head = function (kicker, title) {
      return '<div class="psheet-grab" aria-hidden="true"></div><div class="psheet-head"><div><p class="eyebrow">' + esc(kicker) + '</p>' +
        '<h2 class="psheet-title" id="psheet-title">' + esc(title) + '</h2></div>' +
        '<button class="icon-btn psheet-close" type="button" data-fx-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    };
    var html;
    if (sh.kind === 'lobby') {
      var isIn = social.joined === s.id;
      var open = '';
      for (var i = s.members.length; i < s.max; i++) open += '<li class="is-open"><span class="fx-slot"></span>Open slot</li>';
      html = head('Lobby · ' + g.title, s.name) +
        '<div class="psheet-art"><img src="' + g.hero + '" alt="" style="object-position:' + g.focus + ' 40%"></div>' +
        '<ul class="fx-lobby">' + s.members.map(function (id) {
          var p = PEOPLE[id];
          return '<li>' + avatarHtml(p, 34, p.status || 'online') + '<span>' + esc(p.name) + '</span>' +
            (id === s.host ? '<em>Host</em>' : '') + (id === SOC.ME.id ? '<em class="is-you">You</em>' : '') + '</li>';
        }).join('') + open + '</ul>' +
        '<p class="fx-note">' + esc(SOC.LABELS.note) + '</p>' +
        '<div class="fx-actions"><button class="btn btn-ghost" type="button" data-fx-invite="' + s.id + '">Invite friends</button>' +
        (isIn ? '<button class="btn btn-primary" type="button" aria-pressed="true" data-fx-leave="' + s.id + '">Leave session</button>'
              : '<button class="btn btn-primary" type="button" data-fx-join="' + s.id + '"' + (s.members.length >= s.max ? ' disabled' : '') + '>Join</button>') + '</div>';
    } else {
      html = head(SOC.LABELS.sessions, 'Invite to ' + s.name) + '<ul class="fx-list">' + social.friends.map(function (f) {
        var inS = s.members.indexOf(f.id) !== -1;
        var done = social.invited[s.id + ':' + f.id];
        return '<li class="fx-row">' + avatarHtml(f, 42, f.status) +
          '<div class="fx-text"><p class="fx-name">' + esc(f.name) + '</p><p class="fx-meta">' + statusHtml(f.status) + '</p></div>' +
          '<button class="fx-btn' + (inS || done ? ' is-done' : ' is-primary') + '" type="button" data-fx-invite-to="' + s.id + ':' + f.id + '"' + (inS || done ? ' disabled' : '') + '>' +
            (inS ? 'In session' : done ? ICON.check + 'Invited' : 'Invite') + '</button></li>';
      }).join('') + '</ul><p class="fx-note">' + esc(SOC.LABELS.note) + '</p>';
    }
    $('psheet-panel').innerHTML = html;
  }
  function openSheet(kind, id) {
    social.sheet = { kind: kind, id: id };
    renderSheet();
    $('psheet').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    if (!social || !social.sheet) return;
    social.sheet = null;
    $('psheet').hidden = true;
    if ($('sheet').hidden && $('player').hidden) document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (!SOC) return;
    if (e.target === $('psheet')) { closeSheet(); return; }
    var t = e.target.closest('[data-fx-accept],[data-fx-decline],[data-fx-add],[data-fx-join],[data-fx-lobby],[data-fx-leave],[data-fx-invite],[data-fx-invite-to],[data-fx-close]');
    if (!t || t.disabled) return;
    var v;
    if ((v = t.getAttribute('data-fx-accept'))) {
      var r = PEOPLE[v];
      social.requests = social.requests.filter(function (x) { return x.id !== v; });
      social.friends.push(r);
      toast(r.name + ' is now your friend');
    } else if ((v = t.getAttribute('data-fx-decline'))) {
      social.requests = social.requests.filter(function (x) { return x.id !== v; });
      toast('Declined ' + PEOPLE[v].name + '’s request');
    } else if ((v = t.getAttribute('data-fx-add'))) {
      social.sent[v] = true;
      toast('Friend request sent to ' + PEOPLE[v].name);
    } else if ((v = t.getAttribute('data-fx-join'))) {
      social.joined = v;
      toast('You joined ' + findSession(v).name);
      openSheet('lobby', v);
    } else if ((v = t.getAttribute('data-fx-lobby'))) {
      openSheet('lobby', v);
    } else if ((v = t.getAttribute('data-fx-leave'))) {
      var name = findSession(v).name;
      social.joined = null;
      closeSheet();
      toast('You left ' + name);
    } else if ((v = t.getAttribute('data-fx-invite'))) {
      openSheet('invite', v);
    } else if ((v = t.getAttribute('data-fx-invite-to'))) {
      var parts = v.split(':');
      social.invited[v] = true;
      toast('Invite to ' + findSession(parts[0]).name + ' sent to ' + PEOPLE[parts[1]].name);
    } else if (t.hasAttribute('data-fx-close')) {
      closeSheet();
      return;
    }
    renderFriends();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && social && social.sheet) closeSheet(); });

  /* ---------------- Boot ---------------- */
  renderFriends();
  renderHero();
  renderPlatformTabs();
  renderGrid();
  renderSearch();
  renderLibrary();
  if (/^#\/game\//.test(location.hash)) {
    // Deep link: render the store underneath, then open the game.
    var deep = location.hash;
    history.replaceState(null, '', '#/store');
    route();
    location.hash = deep;
  } else {
    route();
  }
})();
