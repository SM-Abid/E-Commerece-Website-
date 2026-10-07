/* ============================================================
   NOVA — Shop (advanced filtering, sorting, pagination)
   ============================================================ */
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img;

  const SORTS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'discount', label: 'Biggest Discount' }
  ];

  const FEATURE_LIST = ['Noise cancelling', 'Wireless', 'Water resistant', 'Fast charging', 'Smart home', 'Sustainable', 'Limited edition'];

  function featureSet(p) {
    const f = [];
    if (p.sub === 'audio') f.push('Noise cancelling', 'Wireless');
    if (p.sub === 'watch' || p.sub === 'gaming') f.push('Wireless');
    if ((p.specs && (p.specs['Water resistance'] || p.specs['Water'])) || p.tags.includes('anc')) f.push('Water resistant');
    if (p.specs && (p.specs['Charging'] || p.specs['Battery'] || p.specs['Battery life'])) f.push('Fast charging');
    if (p.sub === 'appliance') f.push('Smart home');
    if ((p.material || '').match(/Recycled|FSC|Organic/i)) f.push('Sustainable');
    if (p.badge === 'limited') f.push('Limited edition');
    return Array.from(new Set(f));
  }

  function state() {
    return {
      q: '', cat: [], brand: [], color: [], size: [], rating: 0,
      minPrice: 0, maxPrice: 2500,
      inStock: false, onSale: false, material: [], feature: [],
      sort: 'recommended', page: 1, perPage: 12, view: 'grid'
    };
  }
  let f = state();
  let lastRendered = [];

  function fromQuery(q) {
    const s = state();
    if (q.cat && q.cat !== 'all') s.cat = [q.cat];
    if (q.brand) s.brand = [q.brand];
    if (q.q) s.q = q.q;
    if (q.sort) s.sort = q.sort;
    if (q.min) s.minPrice = +q.min;
    if (q.max) s.maxPrice = +q.max;
    if (q.sale) s.onSale = true;
    return s;
  }

  function apply(list) {
    let out = list.slice();
    if (f.q) {
      const r = D.search(f.q);
      const ids = new Set(r.products.map(p => p.id));
      out = out.filter(p => ids.has(p.id));
    }
    if (f.cat.length) out = out.filter(p => f.cat.includes(p.cat));
    if (f.brand.length) out = out.filter(p => f.brand.includes(p.brandId));
    if (f.color.length) out = out.filter(p => p.colors.some(c => f.color.includes(c.name)));
    if (f.size.length) out = out.filter(p => p.sizes && p.sizes.some(s => f.size.includes(s)));
    if (f.rating) out = out.filter(p => p.rating >= f.rating);
    out = out.filter(p => p.price >= f.minPrice && p.price <= f.maxPrice);
    if (f.inStock) out = out.filter(p => p.stock > 0);
    if (f.onSale) out = out.filter(p => p.off > 0);
    if (f.material.length) out = out.filter(p => f.material.some(m => (p.material || '').includes(m)));
    if (f.feature.length) out = out.filter(p => {
      const fs = featureSet(p);
      return f.feature.every(x => fs.includes(x));
    });
    switch (f.sort) {
      case 'popular': out.sort((a, b) => b.sold - a.sold); break;
      case 'newest': out.sort((a, b) => a.ageDays - b.ageDays); break;
      case 'price-asc': out.sort((a, b) => a.price - b.price); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'rating': out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews); break;
      case 'discount': out.sort((a, b) => b.off - a.off); break;
      default: out.sort((a, b) => (b.rating * Math.log10(b.reviews + 10)) - (a.rating * Math.log10(a.reviews + 10)));
    }
    return out;
  }

  function activeChips() {
    const chips = [];
    f.cat.forEach(c => chips.push({ k: 'cat', v: c, label: (D.categories.find(x => x.id === c) || {}).name }));
    f.brand.forEach(b => chips.push({ k: 'brand', v: b, label: (D.brands.find(x => x.id === b) || {}).name }));
    f.color.forEach(c => chips.push({ k: 'color', v: c, label: c }));
    f.size.forEach(s => chips.push({ k: 'size', v: s, label: s }));
    f.material.forEach(m => chips.push({ k: 'material', v: m, label: m }));
    f.feature.forEach(x => chips.push({ k: 'feature', v: x, label: x }));
    if (f.rating) chips.push({ k: 'rating', v: f.rating, label: f.rating + '★ & up' });
    if (f.minPrice > 0 || f.maxPrice < 2500) chips.push({ k: 'price', v: 'p', label: S.money(f.minPrice) + ' – ' + S.money(f.maxPrice) });
    if (f.inStock) chips.push({ k: 'inStock', v: 1, label: 'In stock' });
    if (f.onSale) chips.push({ k: 'onSale', v: 1, label: 'On sale' });
    if (f.q) chips.push({ k: 'q', v: f.q, label: '“' + f.q + '”' });
    return chips;
  }

  function allMaterials() {
    const m = {};
    D.products.forEach(p => (p.material || '').split(/[&,]/).forEach(x => { const t = x.trim(); if (t) m[t] = 1; }));
    return Object.keys(m).sort().slice(0, 10);
  }
  function allColors() {
    const m = {};
    D.products.forEach(p => p.colors.forEach(c => m[c.name] = c.hex));
    return Object.keys(m).map(n => ({ name: n, hex: m[n] }));
  }
  function allSizes() {
    const m = {};
    D.products.forEach(p => (p.sizes || []).forEach(s => m[s] = 1));
    return Object.keys(m).slice(0, 12);
  }

  /* ---------- Render ---------- */
  async function shop(ctx) {
    const view = U.qs('#view');
    f = fromQuery(ctx.query || {});
    view.innerHTML = '<div class="container section"><div class="shop-layout">' +
      '<div class="skeleton sk-block" style="height:600px"></div>' +
      '<div>' + UI.skeletonGrid(8) + '</div></div></div>';
    await U.sleep(300);
    view.innerHTML = shell();
    paint();
    UI.observeReveals(view);
    wire(view);
  }

  function shell() {
    return '' +
      '<div class="page-head"><div class="container">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><span>Shop</span></div>' +
      '<div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:16px">' +
      '<div><h1>All products</h1><p class="muted mt-2" id="resultCount">Loading…</p></div>' +
      '<div class="row" style="gap:8px">' +
      '<div class="searchbox" style="width:280px">' + I.icon('search', 'ic') +
      '<input id="shopQ" placeholder="Search products…" value="' + U.h(f.q) + '" aria-label="Search products"></div>' +
      '<select class="input" id="sortSel" style="width:190px" aria-label="Sort by">' +
      SORTS.map(s => '<option value="' + s.id + '"' + (f.sort === s.id ? ' selected' : '') + '>' + s.label + '</option>').join('') +
      '</select>' +
      '<button class="iconbtn" id="viewToggle" data-tip="Toggle view" aria-label="Toggle view">' + I.icon(f.view === 'grid' ? 'list' : 'grid') + '</button>' +
      '</div></div></div></div>' +
      '<div class="container" style="padding-bottom:80px">' +
      '<div class="shop-layout">' +
      '<aside class="filters" id="filters" aria-label="Filters">' + filtersHtml() + '</aside>' +
      '<div><div class="active-chips" id="chips"></div>' +
      '<div id="gridWrap"></div>' +
      '<div id="moreWrap" class="text-center mt-6"></div>' +
      '</div></div></div>' +
      '<button class="btn btn-primary only-mobile" id="mFilterBtn" style="position:fixed;left:50%;transform:translateX(-50%);bottom:78px;z-index:60;box-shadow:var(--shadow-lg);display:none">' +
      I.icon('filter') + 'Filters</button>';
  }

  function filtersHtml() {
    return '' +
      '<div class="row-between mb-3"><h4 style="font-size:16px">Filters</h4>' +
      '<button class="btn btn-sm btn-ghost" id="clearFilters">Clear all</button></div>' +
      '<div class="searchbox mb-4" style="height:40px">' + I.icon('search', 'ic') +
      '<input id="filterSearch" placeholder="Search filters…" aria-label="Search filters"></div>' +

      group('Category', 'cat', D.categories.map(c => ({ v: c.id, label: c.name, n: c.count })), f.cat) +
      group('Brand', 'brand', D.brands.map(b => ({ v: b.id, label: b.name, n: b.products })), f.brand) +

      '<div class="filter-group"><div class="fg-head">Price</div>' +
      '<div class="fg-body">' +
      '<div id="dualRange" class="dual" data-min="0" data-max="2500" data-lo="' + f.minPrice + '" data-hi="' + f.maxPrice + '">' +
      '<div class="dual-track"><div class="dual-fill"></div>' +
      '<div class="dual-thumb" data-th="lo" tabindex="0" role="slider" aria-label="Minimum price"></div>' +
      '<div class="dual-thumb" data-th="hi" tabindex="0" role="slider" aria-label="Maximum price"></div></div></div>' +
      '<div class="row-between" style="font-size:13px"><span id="pLo">' + S.money(f.minPrice) + '</span><span id="pHi">' + S.money(f.maxPrice) + '</span></div>' +
      '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">' +
      [[0, 50], [50, 150], [150, 400], [400, 1000], [1000, 2500]].map(r =>
        '<button class="chip" style="font-size:12px;padding:4px 10px" data-pr="' + r[0] + '-' + r[1] + '">' + S.money(r[0]) + '–' + S.money(r[1]) + '</button>').join('') +
      '</div></div></div>' +

      '<div class="filter-group"><div class="fg-head">Rating</div><div class="fg-body" style="gap:6px">' +
      [4.5, 4, 3.5, 3].map(r =>
        '<label class="radio" style="width:100%"><input type="radio" name="rt" value="' + r + '"' + (f.rating === r ? ' checked' : '') + '><span class="dot"></span>' +
        '<span class="row" style="gap:6px">' + I.stars(r) + '<span class="muted" style="font-size:12px">&amp; up</span></span></label>').join('') +
      '<label class="radio" style="width:100%"><input type="radio" name="rt" value="0"' + (f.rating === 0 ? ' checked' : '') + '><span class="dot"></span><span>Any rating</span></label>' +
      '</div></div>' +

      '<div class="filter-group"><div class="fg-head">Color</div><div class="fg-body">' +
      '<div class="color-options">' + allColors().map(c =>
        '<button class="color-opt' + (f.color.includes(c.name) ? ' active' : '') + '" data-color="' + U.h(c.name) + '" title="' + U.h(c.name) + '" aria-label="' + U.h(c.name) + '"><i style="background:' + c.hex + '"></i></button>').join('') +
      '</div></div></div>' +

      '<div class="filter-group"><div class="fg-head">Size</div><div class="fg-body">' +
      '<div class="row" style="gap:6px;flex-wrap:wrap">' + allSizes().map(s =>
        '<button class="chip" style="font-size:12px;padding:4px 10px' + (f.size.includes(s) ? ';background:var(--text);color:var(--bg)' : '') + '" data-size="' + U.h(s) + '">' + U.h(s) + '</button>').join('') +
      '</div></div></div>' +

      '<div class="filter-group"><div class="fg-head">Availability</div><div class="fg-body">' +
      '<label class="checkbox"><input type="checkbox" data-flag="inStock"' + (f.inStock ? ' checked' : '') + '><span class="box"></span>In stock only</label>' +
      '<label class="checkbox"><input type="checkbox" data-flag="onSale"' + (f.onSale ? ' checked' : '') + '><span class="box"></span>On sale</label>' +
      '</div></div>' +

      group('Material', 'material', allMaterials().map(m => ({ v: m, label: m })), f.material) +
      group('Features', 'feature', FEATURE_LIST.map(x => ({ v: x, label: x })), f.feature);
  }

  function group(title, key, items, selected) {
    return '<div class="filter-group" data-group="' + key + '">' +
      '<button class="fg-head open" data-toggle="' + key + '" aria-expanded="true">' + U.h(title) +
      '<span class="badge" style="margin-left:6px;font-size:10px">' + items.length + '</span>' + I.icon('chevronDown') + '</button>' +
      '<div class="fg-body">' + items.map(it =>
        '<label class="checkbox" data-opt="' + U.h(it.v) + '"><input type="checkbox" data-f="' + key + '" value="' + U.h(it.v) + '"' +
        (selected.includes(it.v) ? ' checked' : '') + '><span class="box"></span>' +
        '<span style="flex:1">' + U.h(it.label) + '</span>' + (it.n != null ? '<span class="soft" style="font-size:11px">' + it.n + '</span>' : '') + '</label>').join('') +
      '</div></div>';
  }

  /* ---------- Paint results ---------- */
  function paint() {
    const all = apply(D.products);
    const shown = all.slice(0, f.page * f.perPage);
    lastRendered = all;
    const count = U.qs('#resultCount');
    if (count) count.innerHTML = '<b>' + all.length + '</b> products' + (f.q ? ' for “' + U.h(f.q) + '”' : '') +
      ' <span class="dot-sep"></span> showing ' + Math.min(shown.length, all.length) + ' of ' + all.length;

    const chips = U.qs('#chips');
    if (chips) {
      const cs = activeChips();
      chips.innerHTML = cs.length ?
        cs.map(c => '<button class="chip" data-chip="' + c.k + '" data-val="' + U.h(String(c.v)) + '">' + U.h(c.label) + ' ' + I.icon('close', 'x', 'width:12px;height:12px') + '</button>').join('') +
        '<button class="chip" id="clearFilters2" style="border-style:dashed">Clear all</button>' : '';
    }

    const wrap = U.qs('#gridWrap');
    if (!all.length) {
      wrap.innerHTML = UI.empty({
        icon: 'search',
        title: 'No products match those filters',
        text: 'Try removing a filter, widening the price range, or searching something broader.',
        actions: '<button class="btn btn-primary" data-clearall>Reset filters</button><a class="btn btn-secondary" href="#/shop">Browse everything</a>'
      });
      U.qs('#moreWrap').innerHTML = '';
      return;
    }
    wrap.innerHTML = f.view === 'grid'
      ? '<div class="prod-grid cols-3 reveal-stagger">' + shown.map(p => UI.productCard(p)).join('') + '</div>'
      : '<div class="col gap-3">' + shown.map(p => listRow(p)).join('') + '</div>';

    const more = U.qs('#moreWrap');
    more.innerHTML = shown.length < all.length
      ? '<button class="btn btn-secondary btn-lg" id="loadMore">Load more (' + (all.length - shown.length) + ' remaining)</button>'
      : '<div class="soft" style="font-size:13px">You have reached the end · ' + all.length + ' products</div>';
    UI.observeReveals(U.qs('#gridWrap'));
  }

  function listRow(p) {
    return '<div class="card" style="display:flex;gap:18px;padding:16px;align-items:center">' +
      '<a href="#/product/' + p.id + '" style="flex:0 0 120px"><img src="' + img(p.imgs[0], 240, 240) + '" alt="" loading="lazy" style="width:120px;height:120px;object-fit:cover;border-radius:12px"></a>' +
      '<div style="flex:1;min-width:0">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<h3 class="pcard-name" style="font-size:16px"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></h3>' +
      '<div class="mt-1">' + UI.ratingBlock(p) + '</div>' +
      '<p class="muted mt-2" style="font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + U.h(p.desc) + '</p>' +
      '</div>' +
      '<div class="col" style="align-items:flex-end;gap:8px;flex:0 0 auto">' +
      UI.priceHtml(p) +
      '<div class="row" style="gap:6px"><button class="btn btn-primary btn-sm" data-add="' + p.id + '">' + I.icon('cart') + 'Add</button>' +
      '<button class="btn btn-secondary btn-sm btn-icon" data-wish="' + p.id + '" aria-label="Wishlist">' + I.icon('heart') + '</button>' +
      '<button class="btn btn-secondary btn-sm btn-icon" data-compare="' + p.id + '" aria-label="Compare">' + I.icon('scale') + '</button></div>' +
      '<div class="soft" style="font-size:12px">' + (p.stock > 10 ? 'In stock' : 'Only ' + p.stock + ' left') + '</div>' +
      '</div></div>';
  }

  /* ---------- Wiring ---------- */
  function wire(view) {
    const filters = U.qs('#filters');

    filters.addEventListener('change', (e) => {
      const cb = e.target.closest('input[data-f]');
      if (cb) {
        const key = cb.dataset.f, val = cb.value;
        const arr = f[key];
        const i = arr.indexOf(val);
        if (cb.checked && i < 0) arr.push(val); else if (!cb.checked && i >= 0) arr.splice(i, 1);
        f.page = 1; paint(); syncChecks(); return;
      }
      if (e.target.name === 'rt') { f.rating = parseFloat(e.target.value); f.page = 1; paint(); return; }
      const flag = e.target.closest('[data-flag]');
      if (flag) { f[flag.dataset.flag] = flag.checked; f.page = 1; paint(); return; }
    });

    filters.addEventListener('click', (e) => {
      const tog = e.target.closest('[data-toggle]');
      if (tog) {
        const body = tog.parentElement.querySelector('.fg-body');
        tog.classList.toggle('open');
        body.classList.toggle('hidden');
        tog.setAttribute('aria-expanded', tog.classList.contains('open'));
        return;
      }
      const c = e.target.closest('[data-color]');
      if (c) {
        const v = c.dataset.color, i = f.color.indexOf(v);
        if (i >= 0) f.color.splice(i, 1); else f.color.push(v);
        c.classList.toggle('active'); f.page = 1; paint(); return;
      }
      const sz = e.target.closest('[data-size]');
      if (sz) {
        const v = sz.dataset.size, i = f.size.indexOf(v);
        if (i >= 0) f.size.splice(i, 1); else f.size.push(v);
        f.page = 1; paint(); refreshFilterPanel(); return;
      }
      const pr = e.target.closest('[data-pr]');
      if (pr) {
        const [a, b] = pr.dataset.pr.split('-').map(Number);
        f.minPrice = a; f.maxPrice = b; f.page = 1; paint(); mountDual(); syncPriceLabels(); return;
      }
      if (e.target.closest('#clearFilters')) { reset(); }
    });

    const fs = U.qs('#filterSearch');
    fs.addEventListener('input', U.debounce((e) => {
      const v = e.target.value.trim().toLowerCase();
      U.qsa('.filter-group [data-opt]', filters).forEach(l => {
        const txt = l.textContent.toLowerCase();
        l.style.display = !v || txt.includes(v) ? '' : 'none';
      });
    }, 160));

    const sq = U.qs('#shopQ');
    sq.addEventListener('input', U.debounce((e) => {
      f.q = e.target.value.trim(); f.page = 1; paint();
    }, 220));

    U.qs('#sortSel').addEventListener('change', (e) => { f.sort = e.target.value; f.page = 1; paint(); });
    U.qs('#viewToggle').addEventListener('click', (e) => {
      f.view = f.view === 'grid' ? 'list' : 'grid';
      e.currentTarget.innerHTML = I.icon(f.view === 'grid' ? 'list' : 'grid');
      paint();
    });

    view.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (chip) { removeChip(chip.dataset.chip, chip.dataset.val); return; }
      if (e.target.closest('#clearFilters2') || e.target.closest('[data-clearall]')) { reset(); return; }
      if (e.target.closest('#loadMore')) {
        const btn = e.target.closest('#loadMore');
        btn.innerHTML = '<span class="spinner"></span> Loading';
        btn.disabled = true;
        setTimeout(() => { f.page++; paint(); }, 420);
        return;
      }
      if (e.target.closest('#mFilterBtn')) { openMobileFilters(); }
    });

    mountDual();

    /* infinite scroll */
    window.addEventListener('scroll', U.throttle(() => {
      if (location.hash.indexOf('#/shop') !== 0) return;
      if (window.innerHeight + window.scrollY > document.body.offsetHeight - 700) {
        const btn = U.qs('#loadMore');
        if (btn && !btn.disabled) btn.click();
      }
    }, 300));
  }

  function removeChip(k, v) {
    if (k === 'price') { f.minPrice = 0; f.maxPrice = 2500; }
    else if (k === 'rating') f.rating = 0;
    else if (k === 'inStock' || k === 'onSale') f[k] = false;
    else if (k === 'q') { f.q = ''; const sq = U.qs('#shopQ'); if (sq) sq.value = ''; }
    else {
      const i = f[k].indexOf(v);
      if (i >= 0) f[k].splice(i, 1);
    }
    f.page = 1; paint(); refreshFilterPanel();
  }

  function reset() {
    const q = f.q;
    f = state(); f.q = q;
    U.qs('#filters').innerHTML = filtersHtml();
    mountDual(); syncPriceLabels();
    const sq = U.qs('#shopQ'); if (sq) sq.value = q;
    const sel = U.qs('#sortSel'); if (sel) sel.value = 'recommended';
    paint();
  }

  function refreshFilterPanel() {
    U.qs('#filters').innerHTML = filtersHtml();
    mountDual(); syncPriceLabels();
  }
  function syncChecks() { }

  function syncPriceLabels() {
    const lo = U.qs('#pLo'), hi = U.qs('#pHi');
    if (lo) lo.textContent = S.money(f.minPrice);
    if (hi) hi.textContent = S.money(f.maxPrice);
  }

  /* ---------- Dual range slider ---------- */
  function mountDual() {
    const el = U.qs('#dualRange');
    if (!el) return;
    const min = +el.dataset.min, max = +el.dataset.max;
    let lo = +el.dataset.lo, hi = +el.dataset.hi;
    const fill = el.querySelector('.dual-fill');
    const thumbs = Array.from(el.querySelectorAll('.dual-thumb'));
    const pct = v => ((v - min) / (max - min)) * 100;

    function paint() {
      fill.style.left = pct(lo) + '%';
      fill.style.width = (pct(hi) - pct(lo)) + '%';
      thumbs[0].style.left = pct(lo) + '%';
      thumbs[1].style.left = pct(hi) + '%';
      thumbs[0].setAttribute('aria-valuenow', lo);
      thumbs[1].setAttribute('aria-valuenow', hi);
    }
    paint();

    let dragging = null;
    function valueFromX(clientX) {
      const r = el.getBoundingClientRect();
      const p = U.clamp((clientX - r.left) / r.width, 0, 1);
      return Math.round(min + p * (max - min));
    }
    function onMove(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const v = valueFromX(x);
      if (dragging === 'lo') lo = Math.min(v, hi - 10);
      else hi = Math.max(v, lo + 10);
      lo = U.clamp(lo, min, max); hi = U.clamp(hi, min, max);
      paint(); syncPriceLabels();
    }
    function onUp() {
      if (!dragging) return;
      dragging = null;
      f.minPrice = lo; f.maxPrice = hi; f.page = 1; paint();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }
    thumbs.forEach(th => {
      const start = (e) => {
        e.preventDefault();
        dragging = th.dataset.th;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
      };
      th.addEventListener('mousedown', start);
      th.addEventListener('touchstart', start, { passive: false });
      th.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 100 : 20;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          if (th.dataset.th === 'lo') lo = U.clamp(lo - step, min, hi - 10); else hi = U.clamp(hi - step, lo + 10, max);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          if (th.dataset.th === 'lo') lo = U.clamp(lo + step, min, hi - 10); else hi = U.clamp(hi + step, lo + 10, max);
        } else return;
        e.preventDefault(); paint(); syncPriceLabels();
        f.minPrice = lo; f.maxPrice = hi; f.page = 1; paint();
      });
    });
  }

  /* ---------- Mobile filter drawer ---------- */
  function openMobileFilters() {
    const el = U.qs('#mFilterDrawer');
    const host = document.createElement('div');
    host.innerHTML = filtersHtml();
    el.innerHTML = '<div class="drawer-head"><h4>Filters</h4>' +
      '<button class="iconbtn" data-mclose aria-label="Close">' + I.icon('close') + '</button></div>' +
      '<div class="drawer-body" id="mFilterBody"></div>' +
      '<div class="drawer-foot"><button class="btn btn-primary btn-block" data-mclose>Show ' + lastRendered.length + ' results</button></div>';
    U.qs('#mFilterBody').appendChild(host.firstChild);
    el.classList.add('left', 'open');
    UI.backdrop(() => closeMobileFilters());
    el.onclick = (e) => {
      if (e.target.closest('[data-mclose]')) { closeMobileFilters(); return; }
      const cb = e.target.closest('input[data-f]');
      if (cb) {
        const key = cb.dataset.f, val = cb.value, arr = f[key], i = arr.indexOf(val);
        if (cb.checked && i < 0) arr.push(val); else if (!cb.checked && i >= 0) arr.splice(i, 1);
        f.page = 1; paint(); return;
      }
      if (e.target.name === 'rt') { f.rating = parseFloat(e.target.value); f.page = 1; paint(); return; }
      const flag = e.target.closest('[data-flag]');
      if (flag) { f[flag.dataset.flag] = flag.checked; f.page = 1; paint(); return; }
      const tog = e.target.closest('[data-toggle]');
      if (tog) {
        const body = tog.parentElement.querySelector('.fg-body');
        tog.classList.toggle('open'); body.classList.toggle('hidden'); return;
      }
      const c = e.target.closest('[data-color]');
      if (c) { const v = c.dataset.color, i = f.color.indexOf(v); if (i >= 0) f.color.splice(i, 1); else f.color.push(v); c.classList.toggle('active'); f.page = 1; paint(); return; }
      const pr = e.target.closest('[data-pr]');
      if (pr) { const [a, b] = pr.dataset.pr.split('-').map(Number); f.minPrice = a; f.maxPrice = b; f.page = 1; paint(); }
    };
  }
  function closeMobileFilters() {
    U.qs('#mFilterDrawer').classList.remove('open');
    UI.hideBackdrop();
    refreshFilterPanel();
  }

  NOVA.Router.register('/shop', shop);
})();
