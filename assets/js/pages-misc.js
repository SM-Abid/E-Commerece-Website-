/* ============================================================
   NOVA — Brands · Deals · New Arrivals · Compare · Search
          Static pages (about/contact/faq/shipping/returns/legal)
          and 404
   ============================================================ */
(function () {
  if (!NOVA.ICONS && window.ICONS) NOVA.ICONS = window.ICONS;
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img, R = NOVA.Router;

  /* ============================================================
     Shared helpers
     ============================================================ */
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const FOLLOW_KEY = 'followedBrands';

  let followed = U.store.get(FOLLOW_KEY, []);
  function isFollowing(id) { return followed.indexOf(id) >= 0; }
  function toggleFollow(id) {
    const i = followed.indexOf(id);
    if (i >= 0) followed.splice(i, 1); else followed.push(id);
    U.store.set(FOLLOW_KEY, followed);
    return i < 0;
  }

  function seedOf(s) { let n = 7; const str = String(s); for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) % 99991; return n; }
  function hueOf(s) { return seedOf(s) % 360; }
  function pctOf(id, min, max) { return min + Math.floor(U.rnd(seedOf(id)) * (max - min)); }

  function crumbs(items) {
    return '<div class="crumbs">' + items.map((it, i) =>
      (i ? '<span class="sep">/</span>' : '') +
      (it.href ? '<a href="' + U.h(it.href) + '">' + U.h(it.label) + '</a>' : '<span>' + U.h(it.label) + '</span>')
    ).join('') + '</div>';
  }

  function pageHead(o) {
    return '<div class="page-head"><div class="container">' + crumbs(o.crumbs || []) +
      '<div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:18px">' +
      '<div style="flex:1;min-width:280px">' +
      (o.eyebrow ? '<div class="eyebrow"><span class="dot"></span>' + U.h(o.eyebrow) + '</div>' : '') +
      '<h1 class="mt-2" style="font-size:' + (o.big ? 'clamp(36px,5.4vw,68px)' : 'clamp(28px,4vw,44px)') + '">' + U.h(o.title) + '</h1>' +
      (o.lead ? '<p class="muted mt-3" style="max-width:64ch">' + U.h(o.lead) + '</p>' : '') +
      '</div>' + (o.right || '') + '</div>' +
      (o.below || '') +
      '</div></div>';
  }

  function iconTile(name, size) {
    const s = size || 44;
    return '<span style="width:' + s + 'px;height:' + s + 'px;border-radius:' + Math.round(s * 0.3) + 'px;background:var(--surface-2);' +
      'display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--accent-500)">' +
      I.icon(name, '', 'width:' + Math.round(s * 0.5) + 'px;height:' + Math.round(s * 0.5) + 'px') + '</span>';
  }

  function infoCard(icon, title, text) {
    return '<div class="card" style="padding:22px">' + iconTile(icon) +
      '<h4 class="mt-4" style="font-size:16px">' + U.h(title) + '</h4>' +
      '<p class="muted mt-2" style="font-size:14px;line-height:1.6">' + U.h(text) + '</p></div>';
  }

  function statCard(label, value, delta) {
    return '<div class="stat-card"><div class="l">' + U.h(label) + '</div>' +
      '<div class="v">' + U.h(value) + '</div>' +
      (delta ? '<div class="d ' + (delta.charAt(0) === '-' ? 'down' : 'up') + '">' + U.h(delta) + '</div>' : '') + '</div>';
  }

  function ring(off, size) {
    const s = size || 64;
    return '<span class="discount-ring" style="--p:' + off + '%;' + (s !== 64 ? 'width:' + s + 'px;height:' + s + 'px' : '') + '">' +
      '<span>-' + off + '%</span></span>';
  }

  function autoGrid(min, gap) {
    return 'display:grid;gap:' + (gap || 'var(--s-4)') + ';grid-template-columns:repeat(auto-fit,minmax(' + min + 'px,1fr))';
  }

  function brandMark(b, size, radius) {
    const s = size || 40;
    const h1 = hueOf(b.id), h2 = (h1 + 44) % 360;
    return '<span style="width:' + s + 'px;height:' + s + 'px;border-radius:' + (radius == null ? Math.round(s * 0.3) : radius) + 'px;' +
      'background:linear-gradient(135deg,hsl(' + h1 + ' 68% 61%),hsl(' + h2 + ' 70% 47%));color:#fff;' +
      'display:inline-flex;align-items:center;justify-content:center;flex:none;font-weight:800;' +
      'font-size:' + Math.round(s * 0.46) + 'px;letter-spacing:-.03em;box-shadow:var(--shadow-sm)">' +
      U.h(b.name.charAt(0).toUpperCase()) + '</span>';
  }

  /* Products that belong to a brand (with a deterministic fallback for
     brands whose catalogue has not been fully generated yet). */
  function brandProds(b, n) {
    let list = D.products.filter(p => p.brandId === b.id);
    if (!list.length) {
      const start = seedOf(b.id) % D.products.length;
      list = D.products.slice(start, start + 3).concat(D.products.slice(0, 3));
    }
    return n ? list.slice(0, n) : list;
  }

  function brandCover(b) {
    const ps = brandProds(b, 1);
    return ps.length ? ps[0].imgs[0] : D.categories[seedOf(b.id) % D.categories.length].img;
  }

  function thumbRow(list, size) {
    const s = size || 52;
    return list.map(p => '<img src="' + img(p.imgs[0], s * 2, s * 2) + '" alt="' + U.h(p.name) + '" loading="lazy" decoding="async" ' +
      'style="width:' + s + 'px;height:' + s + 'px;border-radius:' + Math.round(s * 0.22) + 'px;object-fit:cover;border:1px solid var(--border)">').join('');
  }

  function progressLine(claimed, tone) {
    return '<div class="progress"><div class="bar" style="width:' + claimed + '%;' +
      (tone ? 'background:' + tone : '') + '"></div></div>';
  }

  function sortSelect(id, options, current) {
    return '<select class="input" id="' + id + '" style="width:auto;min-width:180px" aria-label="Sort by">' +
      options.map(o => '<option value="' + o.id + '"' + (current === o.id ? ' selected' : '') + '>' + U.h(o.label) + '</option>').join('') +
      '</select>';
  }

  function carouselNav(target) {
    return '<div class="carousel-nav">' +
      '<button class="btn btn-secondary" data-carousel="' + target + '" data-dir="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
      '<button class="btn btn-secondary" data-carousel="' + target + '" data-dir="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div>';
  }

  function shellSkeleton(extra) {
    return '<div class="container section"><div class="skeleton sk-block" style="height:180px"></div>' +
      '<div class="mt-6">' + UI.skeletonGrid(8) + '</div>' + (extra || '') + '</div>';
  }

  function finish(view) {
    UI.observeReveals(view);
    UI.wireCarousel(view);
  }

  /* ============================================================
     1. BRAND DIRECTORY  #/brands
     ============================================================ */
  const brandDir = { q: '', letter: '' };

  async function brandsPage() {
    const view = U.qs('#view');
    view.innerHTML = shellSkeleton('<div class="mt-6"><div class="skeleton sk-block" style="height:260px"></div></div>');
    await U.sleep(360);
    view.innerHTML = brandsShell();
    paintBrandGroups();
    wireBrands();
    finish(view);
  }

  function brandsShell() {
    const total = D.brands.length;
    const totalProducts = D.brands.reduce((n, b) => n + b.products, 0);
    const featured = D.brands.slice().sort((a, b) => b.products - a.products).slice(0, 6);
    const used = {};
    D.brands.forEach(b => used[b.letter] = true);

    return '' +
      pageHead({
        crumbs: [{ label: 'Home', href: '#/' }, { label: 'Brands' }],
        eyebrow: 'The directory',
        title: 'Every brand, one place',
        lead: 'We stock ' + total + ' houses we would happily buy from ourselves — from century-old workshops to studios that shipped their first product last spring.',
        right: '<div class="searchbox" style="width:min(320px,100%)">' + I.icon('search', 'ic') +
          '<input id="brandQ" placeholder="Search brands…" value="' + U.h(brandDir.q) + '" aria-label="Search brands"></div>',
        below: '<div class="row mt-5" style="gap:10px;flex-wrap:wrap">' +
          '<span class="badge badge-glass">' + total + ' brands</span>' +
          '<span class="badge badge-glass">' + totalProducts.toLocaleString() + ' products</span>' +
          '<span class="badge badge-glass">Free returns on all of them</span></div>'
      }) +

      /* Featured carousel */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Featured', title: 'Houses we rate this season',
        lead: 'Six brands our editors keep coming back to — stocked deep, discounted rarely, returned almost never.',
        action: carouselNav('#featBrands')
      }) +
      '<div class="carousel reveal" id="featBrands">' +
      featured.map(b => '<a class="ccard" href="#/brand/' + b.id + '" style="aspect-ratio:3/4" aria-label="' + U.h(b.name) + '">' +
        '<img src="' + img(brandCover(b), 620, 820) + '" alt="' + U.h(b.name) + '" loading="lazy" decoding="async">' +
        '<span class="ccard-body"><span>' + brandMark(b, 40) +
        '<span class="name" style="display:block;margin-top:10px">' + U.h(b.name) + '</span>' +
        '<span class="count">' + b.products + ' products · ' + U.h(b.blurb) + '</span></span>' +
        '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>').join('') +
      '</div></div></section>' +

      /* Alphabet */
      '<section class="section-sm" style="border-top:1px solid var(--border)"><div class="container">' +
      '<div class="row-between mb-4" style="flex-wrap:wrap;gap:12px">' +
      '<h3 style="font-size:20px">Browse A–Z</h3>' +
      '<button class="btn btn-sm btn-ghost hidden" id="clearBrandFilter">' + I.icon('close', '', 'width:14px;height:14px') + 'Reset</button></div>' +
      '<div class="alpha-nav" id="alphaNav">' +
      '<button class="' + (brandDir.letter ? '' : 'active') + '" data-letter="">All</button>' +
      LETTERS.map(L => {
        const has = !!used[L];
        return '<button data-letter="' + L + '"' + (has ? '' : ' disabled') + ' class="' + (brandDir.letter === L ? 'active' : '') + '"' +
          (has ? '' : ' style="opacity:.32;cursor:not-allowed"') + ' aria-disabled="' + !has + '">' + L + '</button>';
      }).join('') +
      '</div></div></section>' +

      /* Groups */
      '<section style="padding-bottom:80px"><div class="container">' +
      '<div id="brandGroups">' + brandGroupsHtml() + '</div>' +
      '<div id="brandEmpty" class="hidden">' + UI.empty({
        icon: 'store',
        title: 'No brand matches that',
        text: 'Try a shorter search — or jump back to the full A–Z list.',
        actions: '<button class="btn btn-primary" data-brandreset>Show all brands</button>'
      }) + '</div>' +
      '</div></section>';
  }

  function brandGroupsHtml() {
    const byLetter = {};
    D.brands.forEach(b => { (byLetter[b.letter] = byLetter[b.letter] || []).push(b); });
    return LETTERS.filter(L => byLetter[L]).map(L =>
      '<div class="brand-group" data-group="' + L + '" id="grp-' + L + '">' +
      '<div class="letter">' + L + '</div>' +
      '<div class="grid grid-3" style="gap:var(--s-5)">' +
      byLetter[L].slice().sort((a, b) => a.name.localeCompare(b.name)).map(brandCard).join('') +
      '</div></div>').join('');
  }

  function brandCard(b) {
    const ps = brandProds(b, 3);
    const cats = Array.from(new Set(ps.map(p => p.catName))).slice(0, 2).join(' · ');
    const top = ps.slice().sort((x, y) => y.rating - x.rating)[0];
    return '<a class="bcard" href="#/brand/' + b.id + '" data-brand="' + b.id + '" data-btext="' +
      U.h((b.name + ' ' + b.blurb + ' ' + cats).toLowerCase()) + '" style="display:block">' +
      '<div class="row" style="gap:14px;align-items:flex-start">' + brandMark(b, 44) +
      '<div style="min-width:0"><div class="logo">' + U.h(b.name) + '</div>' +
      '<div class="meta">' + b.products + ' products' + (cats ? ' · ' + U.h(cats) : '') + '</div></div></div>' +
      '<p class="muted mt-3" style="font-size:13px;line-height:1.55">' + U.h(b.blurb) + '</p>' +
      '<div class="row mt-4" style="gap:8px">' + thumbRow(ps, 52) +
      (top ? '<span class="row" style="gap:6px;margin-left:auto;font-size:12px;color:var(--text-muted)">' + I.stars(top.rating) + '</span>' : '') +
      '</div>' +
      '<div class="row-between mt-4" style="padding-top:14px;border-top:1px solid var(--border)">' +
      '<span style="font-size:13px;font-weight:600">View brand</span>' +
      '<span style="color:var(--accent-500);display:inline-flex">' + I.icon('arrowRight', '', 'width:18px;height:18px') + '</span>' +
      '</div></a>';
  }

  function paintBrandGroups() {
    const q = brandDir.q.trim().toLowerCase();
    let any = false;
    U.qsa('#brandGroups [data-brand]').forEach(card => {
      const txt = card.dataset.btext || '';
      const letter = card.closest('.brand-group').dataset.group;
      const ok = (!q || txt.indexOf(q) >= 0) && (!brandDir.letter || letter === brandDir.letter);
      card.classList.toggle('hidden', !ok);
      if (ok) any = true;
    });
    U.qsa('#brandGroups .brand-group').forEach(g => {
      const visible = U.qsa('.bcard', g).filter(c => !c.classList.contains('hidden')).length;
      g.classList.toggle('hidden', !visible);
    });
    U.qs('#brandEmpty').classList.toggle('hidden', any);
    const reset = U.qs('#clearBrandFilter');
    if (reset) reset.classList.toggle('hidden', !q && !brandDir.letter);
  }

  function wireBrands() {
    const view = U.qs('#view');

    U.qs('#brandQ').addEventListener('input', U.debounce((e) => {
      brandDir.q = e.target.value;
      paintBrandGroups();
    }, 140));

    U.qs('#alphaNav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-letter]');
      if (!btn || btn.disabled) return;
      brandDir.letter = btn.dataset.letter;
      U.qsa('#alphaNav button').forEach(b => b.classList.toggle('active', b === btn));
      paintBrandGroups();
      const g = brandDir.letter ? U.qs('#grp-' + brandDir.letter) : U.qs('#brandGroups');
      if (g && !g.classList.contains('hidden')) {
        const y = g.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });

    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-brandreset]') || e.target.closest('#clearBrandFilter')) {
        brandDir.q = ''; brandDir.letter = '';
        const inp = U.qs('#brandQ'); if (inp) inp.value = '';
        U.qsa('#alphaNav button').forEach(b => b.classList.toggle('active', b.dataset.letter === ''));
        paintBrandGroups();
      }
    });
  }

  /* ============================================================
     2. BRAND DETAIL  #/brand/:id
     ============================================================ */
  const brandPageState = { cat: 'all', sort: 'recommended' };

  const BRAND_SORTS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'newest', label: 'Newest' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest rated' }
  ];

  async function brandPage(ctx) {
    const view = U.qs('#view');
    const b = D.brands.find(x => x.id === ctx.params.id);
    if (!b) {
      view.innerHTML = '<div class="container section">' + UI.empty({
        icon: 'store',
        title: 'We could not find that brand',
        text: 'It may have been renamed or retired. The full directory is one click away.',
        actions: '<a class="btn btn-primary" href="#/brands">Browse all brands</a><a class="btn btn-secondary" href="#/shop">Shop everything</a>'
      }) + '</div>';
      finish(view);
      return;
    }
    brandPageState.cat = 'all';
    brandPageState.sort = 'recommended';
    view.innerHTML = shellSkeleton();
    await U.sleep(340);
    view.innerHTML = brandShell(b);
    paintBrandProducts(b);
    wireBrandPage(b);
    finish(view);
  }

  function brandShell(b) {
    const ps = brandProds(b);
    const cover = brandCover(b);
    const avg = ps.reduce((n, p) => n + p.rating, 0) / (ps.length || 1);
    const reviews = ps.reduce((n, p) => n + p.reviews, 0);
    const cats = Array.from(new Set(ps.map(p => p.cat)));
    const best = ps.slice().sort((x, y) => y.rating * Math.log(y.reviews + 10) - x.rating * Math.log(x.reviews + 10)).slice(0, 8);
    const related = D.brands.filter(x => x.id !== b.id)
      .sort((x, y) => (seedOf(x.id + b.id) % 100) - (seedOf(y.id + b.id) % 100)).slice(0, 3);
    const follow = isFollowing(b.id);

    return '' +
      /* Hero */
      '<section class="section-sm"><div class="container">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/brands">Brands</a><span class="sep">/</span><span>' + U.h(b.name) + '</span></div>' +
      '<div style="position:relative;overflow:hidden;border-radius:var(--r-6);border:1px solid var(--border);margin-top:16px;background:var(--surface-2)">' +
      '<img src="' + img(cover, 1400, 520) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" decoding="async">' +
      '<span style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,9,14,.86) 0%,rgba(8,9,14,.55) 48%,rgba(8,9,14,.18) 100%)"></span>' +
      '<div style="position:relative;color:#fff;padding:clamp(28px,4vw,56px);max-width:720px">' +
      '<div class="row" style="gap:14px">' + brandMark(b, 64) +
      '<div><div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.7">Brand</div>' +
      '<h1 style="font-size:clamp(30px,4.6vw,52px);color:#fff">' + U.h(b.name) + '</h1></div></div>' +
      '<p style="margin-top:16px;font-size:16px;line-height:1.6;opacity:.86;max-width:52ch">' + U.h(b.blurb) + '</p>' +
      '<div class="row mt-4" style="gap:8px;flex-wrap:wrap">' +
      '<button class="btn ' + (follow ? 'btn-light' : 'btn-primary') + '" id="followBtn" data-follow="' + b.id + '">' +
      I.icon(follow ? 'check' : 'plus') + (follow ? 'Following' : 'Follow brand') + '</button>' +
      '<a class="btn btn-light" href="#/shop?brand=' + b.id + '">Shop all ' + U.h(b.name) + '</a>' +
      '</div></div></div>' +

      /* Stats */
      '<div class="grid grid-4 mt-5" style="gap:var(--s-4)">' +
      statCard('Products', String(b.products), cats.length + ' departments') +
      statCard('Average rating', avg.toFixed(1) + '/5', reviews.toLocaleString() + ' reviews') +
      statCard('Best discount', Math.max.apply(null, ps.map(p => p.off).concat([0])) + '% off', 'Across the range') +
      statCard('Ships in', Math.min.apply(null, ps.map(p => p.shipDays)) + '–' + Math.max.apply(null, ps.map(p => p.shipDays)) + ' days', 'Free over $50') +
      '</div></div></section>' +

      /* Featured carousel */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Editors’ picks', title: 'Start here',
        lead: 'The ' + U.h(b.name) + ' pieces our team would buy first, ranked by rating and real review volume.',
        action: carouselNav('#brandFeat')
      }) +
      '<div class="carousel reveal" id="brandFeat">' +
      best.map(p => '<div style="flex:0 0 clamp(220px,23%,280px)">' + UI.productCard(p) + '</div>').join('') +
      '</div></div></section>' +

      /* Catalogue */
      '<section class="section-sm" style="border-top:1px solid var(--border)"><div class="container">' +
      '<div class="row-between mb-4" style="flex-wrap:wrap;gap:12px">' +
      '<div><h3 style="font-size:22px">The full collection</h3>' +
      '<p class="muted mt-1" style="font-size:14px" id="brandCount">—</p></div>' +
      sortSelect('brandSort', BRAND_SORTS, brandPageState.sort) + '</div>' +
      '<div class="row mb-5" style="gap:8px;flex-wrap:wrap" id="brandCats">' +
      catChips(cats, 'all') + '</div>' +
      '<div id="brandGrid"></div>' +
      '</div></section>' +

      /* Related brands */
      '<section class="section-sm" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({ eyebrow: 'If you like ' + b.name, title: 'Adjacent houses', action: '<a class="btn btn-secondary" href="#/brands">All brands ' + I.icon('arrowRight') + '</a>' }) +
      '<div class="grid grid-3 reveal-stagger">' + related.map(brandCard).join('') + '</div>' +
      '</div></section>';
  }

  function catChips(cats, active) {
    const all = '<button class="chip' + (active === 'all' ? ' active' : '') + '" data-cat="all">Everything</button>';
    return all + cats.map(c => {
      const cat = D.categories.find(x => x.id === c);
      if (!cat) return '';
      return '<button class="chip' + (active === c ? ' active' : '') + '" data-cat="' + c + '">' + U.h(cat.name) + '</button>';
    }).join('');
  }

  function paintBrandProducts(b) {
    let list = brandProds(b);
    if (brandPageState.cat !== 'all') list = list.filter(p => p.cat === brandPageState.cat);
    const s = brandPageState.sort;
    if (s === 'newest') list.sort((a, b2) => a.ageDays - b2.ageDays);
    else if (s === 'price-asc') list.sort((a, b2) => a.price - b2.price);
    else if (s === 'price-desc') list.sort((a, b2) => b2.price - a.price);
    else if (s === 'rating') list.sort((a, b2) => b2.rating - a.rating || b2.reviews - a.reviews);
    else list.sort((a, b2) => b2.rating * Math.log(b2.reviews + 10) - a.rating * Math.log(a.reviews + 10));

    const count = U.qs('#brandCount');
    if (count) count.innerHTML = '<b>' + list.length + '</b> products' +
      (brandPageState.cat !== 'all' ? ' in this department' : '') + ' <span class="dot-sep"></span> free returns';

    const grid = U.qs('#brandGrid');
    if (!list.length) {
      grid.innerHTML = UI.empty({
        icon: 'package',
        title: 'Nothing in this department yet',
        text: 'This brand focuses elsewhere — switch the filter to see the full collection.',
        actions: '<button class="btn btn-primary" data-cat="all">Show everything</button>'
      });
      return;
    }
    grid.innerHTML = '<div class="prod-grid cols-4 reveal-stagger">' + list.map(p => UI.productCard(p)).join('') + '</div>';
    UI.observeReveals(grid);
  }

  function wireBrandPage(b) {
    const view = U.qs('#view');

    view.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat]');
      if (chip) {
        brandPageState.cat = chip.dataset.cat;
        U.qsa('#brandCats .chip').forEach(c => c.classList.toggle('active', c === chip || (!chip.dataset.cat && false)));
        U.qsa('#brandCats .chip').forEach(c => c.classList.toggle('active', c.dataset.cat === brandPageState.cat));
        paintBrandProducts(b);
        return;
      }
      const fb = e.target.closest('[data-follow]');
      if (fb) {
        const on = toggleFollow(b.id);
        fb.className = 'btn ' + (on ? 'btn-light' : 'btn-primary');
        fb.innerHTML = I.icon(on ? 'check' : 'plus') + (on ? 'Following' : 'Follow brand');
        UI.toast({
          type: 'success',
          title: on ? 'Following ' + b.name : 'Unfollowed ' + b.name,
          desc: on ? 'We will ping you when new pieces drop.' : 'No more updates from this brand.'
        });
      }
    });

    U.qs('#brandSort').addEventListener('change', (e) => {
      brandPageState.sort = e.target.value;
      paintBrandProducts(b);
    });
  }

  /* ============================================================
     3. DEALS  #/deals
     ============================================================ */
  let dealsTimer = null;
  let dealEnd = 0;

  function dealsData() {
    const discounted = D.products.filter(p => p.off > 0);
    const byOff = discounted.slice().sort((a, b) => b.off - a.off);
    return {
      today: byOff.slice(0, 8),
      flash: discounted.slice().sort((a, b) => (b.off - a.off) || (a.stock - b.stock)).slice(0, 8),
      clearance: discounted.filter(p => p.price <= 320).sort((a, b) => a.price - b.price).slice(0, 6),
      best: byOff.slice(0, 6),
      limited: D.products.slice().sort((a, b) => a.stock - b.stock).filter(p => p.stock <= 60).slice(0, 8)
    };
  }

  async function dealsPage() {
    const view = U.qs('#view');
    view.innerHTML = shellSkeleton('<div class="mt-6"><div class="skeleton sk-block" style="height:220px"></div></div>');
    await U.sleep(380);
    dealEnd = Date.now() + (7 * 3600 + 42 * 60 + 18) * 1000;
    view.innerHTML = dealsShell();
    wireDeals();
    startDealsCountdown();
    finish(view);
  }

  function dealsShell() {
    const d = dealsData();
    const hero = d.today[0] || D.products[0];
    const bundles = buildBundles();

    return '' +
      pageHead({
        crumbs: [{ label: 'Home', href: '#/' }, { label: 'Deals' }],
        eyebrow: 'Saving, honestly priced',
        title: 'Deals worth your attention',
        lead: 'No inflated RRPs, no fake countdowns that reset at midnight. These are genuine reductions our buying team negotiated — and they end when the timer ends.',
        right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/shop?sale=1">All reduced</a>' +
          '<a class="btn btn-primary" href="#/new-arrivals">New arrivals</a></div>'
      }) +

      /* Hero deal */
      '<section class="section-sm"><div class="container"><div class="deals-hero reveal">' +
      '<div class="grid grid-2" style="gap:var(--s-7);align-items:center">' +
      '<div>' +
      '<div class="row" style="gap:8px"><span class="badge badge-hot">Deal of the day</span>' +
      '<span class="badge badge-glass">Ends in <b id="heroMini" style="margin-left:4px">07:42:18</b></span></div>' +
      '<h2 class="mt-4" style="font-size:clamp(26px,3.4vw,42px)">' + U.h(hero.name) + '</h2>' +
      '<p class="muted mt-3" style="max-width:46ch">' + U.h(hero.desc.slice(0, 150)) + '…</p>' +
      '<div class="row mt-5" style="gap:16px;align-items:center">' + ring(hero.off, 82) +
      '<div><div class="row" style="gap:10px;align-items:baseline">' +
      '<span style="font-size:34px;font-weight:800;letter-spacing:-.03em">' + S.money(hero.price) + '</span>' +
      (hero.was ? '<span class="soft" style="font-size:18px;text-decoration:line-through">' + S.money(hero.was) + '</span>' : '') + '</div>' +
      '<div class="muted" style="font-size:13px">You save ' + S.money((hero.was || hero.price) - hero.price) + ' · ' + hero.stock + ' left in stock</div></div></div>' +
      '<div class="row mt-6" style="gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-lg" data-add="' + hero.id + '">' + I.icon('cart') + 'Add to cart</button>' +
      '<a class="btn btn-secondary btn-lg" href="#/product/' + hero.id + '">View product</a>' +
      '<button class="btn btn-ghost btn-lg" data-wish="' + hero.id + '">' + I.icon('heart') + 'Save</button></div>' +
      '</div>' +
      '<a href="#/product/' + hero.id + '" style="display:block;border-radius:var(--r-5);overflow:hidden;border:1px solid var(--border)">' +
      '<img src="' + img(hero.imgs[0], 900, 900) + '" alt="' + U.h(hero.name) + '" style="width:100%;aspect-ratio:4/5;object-fit:cover" decoding="async"></a>' +
      '</div></div></div></section>' +

      /* Coupons */
      '<section class="section-sm" style="padding-top:0"><div class="container">' +
      '<div class="flash" style="padding:24px">' +
      '<div class="row-between mb-4" style="flex-wrap:wrap;gap:10px">' +
      '<div><h4>Active codes</h4><p class="muted" style="font-size:13px">Stack one code per order — applied automatically at checkout.</p></div>' +
      I.icon('percent', '', 'width:26px;height:26px') + '</div>' +
      '<div style="' + autoGrid(280, 'var(--s-3)') + '">' +
      D.coupons.map(c => '<div class="coupon-card"><div><div class="code">' + U.h(c.code) + '</div>' +
        '<div class="muted" style="font-size:12px;margin-top:2px">' + U.h(c.label) + (c.min ? ' · min ' + S.money(c.min) : '') + '</div></div>' +
        '<button class="btn btn-sm btn-secondary" data-coupon="' + U.h(c.code) + '">Apply</button></div>').join('') +
      '</div></div></div></section>' +

      /* Today's deals */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Updated this morning', title: 'Today’s deals',
        lead: 'Hand-picked reductions across every department. Stock is live, so what you see is what is actually left.',
        action: carouselNav('#todayTrack')
      }) +
      '<div class="carousel reveal" id="todayTrack">' + d.today.map((p, i) => dealCard(p, i)).join('') + '</div>' +
      '</div></section>' +

      /* Flash sales */
      '<section class="section-sm"><div class="container"><div class="flash reveal">' +
      '<div class="flash-head">' +
      '<div><div class="eyebrow"><span class="dot"></span>While stock lasts</div>' +
      '<h2 class="mt-2">FLASH <span class="hot">SALES</span></h2>' +
      '<p class="muted mt-2" style="max-width:48ch">Eight products, one window. When the clock hits zero the price goes back to where it was.</p></div>' +
      '<div class="col" style="align-items:flex-end;gap:10px">' +
      '<div class="soft" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">Ends in</div>' +
      '<div class="countdown" id="dealsCount" role="timer">' +
      '<span class="unit"><span class="n" data-h>07</span><span class="l">hrs</span></span><span class="sep">:</span>' +
      '<span class="unit"><span class="n" data-m>42</span><span class="l">min</span></span><span class="sep">:</span>' +
      '<span class="unit"><span class="n" data-s>18</span><span class="l">sec</span></span></div></div>' +
      '</div>' +
      '<div class="carousel" id="flashTrack">' + d.flash.map((p, i) => dealCard(p, i + 3)).join('') + '</div>' +
      '</div></div></section>' +

      /* Best discounts */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Ranked', title: 'Biggest discounts',
        lead: 'Sorted strictly by percentage off — the deepest cuts currently live on the site.'
      }) +
      '<div class="reveal-stagger" style="' + autoGrid(420, 'var(--s-4)') + '">' +
      d.best.map((p, i) => discountRow(p, i + 1)).join('') + '</div>' +
      '</div></section>' +

      /* Bundles */
      '<section class="section-sm" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Buy together', title: 'Bundle offers',
        lead: 'Take two or three pieces from the same setup and we knock 15% off the basket automatically. No code needed.',
        action: '<a class="btn btn-secondary" href="#/shop">Build your own ' + I.icon('arrowRight') + '</a>'
      }) +
      '<div class="grid grid-3 reveal-stagger">' + bundles.map(bundleCard).join('') + '</div>' +
      '</div></section>' +

      /* Clearance */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Final markdown', title: 'Clearance',
        lead: 'Last of the line. Once these sell through they will not be restocked, so sizes and colours are limited.'
      }) +
      '<div class="reveal-stagger" style="' + autoGrid(330, 'var(--s-4)') + '">' +
      d.clearance.map(clearanceCard).join('') + '</div>' +
      '</div></section>' +

      /* Limited time */
      '<section class="section-sm" style="padding-bottom:80px"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Low stock', title: 'Limited-time offers',
        lead: 'Under sixty units left across the network. If you are thinking about it, think faster.',
        action: carouselNav('#limitedTrack')
      }) +
      '<div class="carousel reveal" id="limitedTrack">' + d.limited.map((p, i) => dealCard(p, i + 6)).join('') + '</div>' +
      '</div></section>';
  }

  function dealCard(p, i) {
    const claimed = 42 + Math.floor(U.rnd(seedOf(p.id) + i) * 52);
    const left = Math.max(1, Math.min(p.stock, 60));
    return '<div style="flex:0 0 clamp(210px,22%,268px)">' +
      '<article class="pcard">' +
      '<div class="pcard-media">' +
      '<img src="' + img(p.imgs[0], 500, 625) + '" alt="' + U.h(p.name) + '" loading="lazy" decoding="async">' +
      '<div class="pcard-badges"><div class="left">' +
      '<span class="badge" style="background:#FF3B5C;color:#fff;border:0">-' + p.off + '%</span>' +
      UI.badgeHtml(p) + '</div>' +
      '<div class="right"><button class="iconbtn pcard-wish' + (S.inWishlist(p.id) ? ' active' : '') + '" data-wish="' + p.id + '" aria-label="Wishlist" style="width:34px;height:34px">' + I.icon('heart') + '</button></div></div>' +
      '<div class="pcard-actions"><button class="btn btn-primary btn-sm btn-block" data-add="' + p.id + '">' + I.icon('cart') + 'Add to cart</button></div>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<h3 class="pcard-name"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></h3>' +
      UI.priceHtml(p) +
      '<div class="row mt-2" style="gap:10px;align-items:center">' + ring(p.off, 48) +
      '<div style="flex:1;min-width:0">' +
      '<div class="row-between" style="font-size:11px;margin-bottom:4px">' +
      '<span class="stock-line"><span class="rem">' + claimed + '% claimed</span></span>' +
      '<span class="stock-line">Only <span class="rem">' + left + '</span> left</span></div>' +
      progressLine(claimed, '#FF3B5C') + '</div></div>' +
      '</div></article></div>';
  }

  function discountRow(p, rank) {
    return '<div class="card row" style="gap:16px;padding:14px 16px;align-items:center">' +
      '<span style="font-size:18px;font-weight:800;color:var(--text-soft);width:24px;text-align:center">' + rank + '</span>' +
      ring(p.off, 58) +
      '<a href="#/product/' + p.id + '" style="flex:0 0 64px">' +
      '<img src="' + img(p.imgs[0], 160, 160) + '" alt="' + U.h(p.name) + '" loading="lazy" style="width:64px;height:64px;border-radius:12px;object-fit:cover"></a>' +
      '<div style="flex:1;min-width:0">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<div class="pcard-name" style="font-size:14px"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></div>' +
      '<div class="row mt-1" style="gap:8px">' + I.stars(p.rating) + '<span class="soft" style="font-size:12px">' + p.reviews.toLocaleString() + ' reviews</span></div>' +
      '</div>' +
      '<div class="col" style="align-items:flex-end;gap:6px;flex:none">' +
      '<div class="row" style="gap:8px;align-items:baseline"><b style="font-size:17px">' + S.money(p.price) + '</b>' +
      (p.was ? '<span class="soft" style="font-size:13px;text-decoration:line-through">' + S.money(p.was) + '</span>' : '') + '</div>' +
      '<button class="btn btn-primary btn-sm" data-add="' + p.id + '">' + I.icon('cart', '', 'width:15px;height:15px') + 'Add</button>' +
      '</div></div>';
  }

  function clearanceCard(p) {
    return '<div class="card row" style="gap:16px;padding:16px;align-items:stretch">' +
      '<a href="#/product/' + p.id + '" style="flex:0 0 108px">' +
      '<img src="' + img(p.imgs[0], 260, 320) + '" alt="' + U.h(p.name) + '" loading="lazy" style="width:108px;height:100%;min-height:108px;object-fit:cover;border-radius:var(--r-3)"></a>' +
      '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">' +
      '<div class="row" style="gap:8px"><span class="badge badge-dark">Final sale</span>' +
      '<span class="pcard-brand">' + U.h(p.brand) + '</span></div>' +
      '<div class="pcard-name" style="font-size:15px"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></div>' +
      '<div class="row" style="gap:8px;align-items:baseline"><b style="font-size:18px">' + S.money(p.price) + '</b>' +
      (p.was ? '<span class="soft" style="font-size:13px;text-decoration:line-through">' + S.money(p.was) + '</span>' : '') +
      '<span style="font-size:12px;font-weight:700;color:#10B981">-' + p.off + '%</span></div>' +
      '<div class="row mt-2" style="gap:6px"><button class="btn btn-dark btn-sm" data-add="' + p.id + '">' + I.icon('cart', '', 'width:15px;height:15px') + 'Add</button>' +
      '<button class="btn btn-secondary btn-sm btn-icon" data-quick="' + p.id + '" aria-label="Quick view">' + I.icon('eye', '', 'width:15px;height:15px') + '</button>' +
      '<button class="btn btn-secondary btn-sm btn-icon" data-compare="' + p.id + '" aria-label="Compare">' + I.icon('scale', '', 'width:15px;height:15px') + '</button></div>' +
      '</div></div>';
  }

  function buildBundles() {
    const cats = ['audio', 'home', 'gaming', 'accessories', 'electronics'];
    const out = [];
    cats.forEach((c, i) => {
      const items = D.products.filter(p => p.cat === c).slice(i % 2, (i % 2) + 3);
      if (items.length < 2) return;
      const cat = D.categories.find(x => x.id === c);
      const was = items.reduce((n, p) => n + p.price, 0);
      out.push({ id: 'bundle-' + c, items: items, cat: cat ? cat.name : c, was: was, now: Math.round(was * 0.85), off: 15 });
    });
    return out.slice(0, 3);
  }

  function bundleCard(b, i) {
    return '<div class="card" style="padding:20px;display:flex;flex-direction:column;gap:14px" data-bundle="' + i + '">' +
      '<div class="row-between"><span class="badge badge-sale">Save 15%</span>' +
      '<span class="soft" style="font-size:12px">' + U.h(b.cat) + ' set</span></div>' +
      '<div class="row" style="gap:8px;align-items:center">' +
      b.items.map(p => '<a href="#/product/' + p.id + '"><img src="' + img(p.imgs[0], 160, 160) + '" alt="' + U.h(p.name) + '" loading="lazy" ' +
        'style="width:64px;height:64px;border-radius:12px;object-fit:cover;border:1px solid var(--border)"></a>').join('<span class="soft">+</span>') +
      '</div>' +
      '<div><div style="font-weight:600;font-size:14px">' + U.h(b.items[0].name.split(' ').slice(0, 3).join(' ')) + ' &amp; friends</div>' +
      '<div class="muted" style="font-size:13px;margin-top:4px">' + b.items.length + ' items · ' +
      U.h(b.items.map(p => p.name.split(' ').slice(-1)[0]).join(', ')) + '</div></div>' +
      '<div class="row" style="gap:10px;align-items:baseline"><b style="font-size:22px;font-weight:800">' + S.money(b.now) + '</b>' +
      '<span class="soft" style="text-decoration:line-through;font-size:14px">' + S.money(b.was) + '</span>' +
      '<span class="badge badge-glass">Save ' + S.money(b.was - b.now) + '</span></div>' +
      '<button class="btn btn-primary btn-block" data-addbundle="' + i + '">' + I.icon('cart') + 'Add all ' + b.items.length + ' to cart</button>' +
      '</div>';
  }

  function wireDeals() {
    const view = U.qs('#view');
    const bundles = buildBundles();

    view.addEventListener('click', (e) => {
      const cp = e.target.closest('[data-coupon]');
      if (cp) {
        S.set({ coupon: cp.dataset.coupon });
        UI.toast({ title: 'Coupon applied', desc: cp.dataset.coupon + ' will be used at checkout' });
        return;
      }
      const bd = e.target.closest('[data-addbundle]');
      if (bd) {
        const b = bundles[+bd.dataset.addbundle];
        if (!b) return;
        b.items.forEach(p => UI.addToCart(p.id, 1, { color: p.colors[0].name, size: p.sizes ? p.sizes[0] : null }));
        S.addPoints(40, 'Bundle offer — ' + b.items.length + ' items');
        UI.toast({ title: 'Bundle added', desc: b.items.length + ' items · 15% saved' });
      }
    });
  }

  function startDealsCountdown() {
    clearInterval(dealsTimer);
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const el = U.qs('#dealsCount');
      const mini = U.qs('#heroMini');
      if (!el && !mini) { clearInterval(dealsTimer); dealsTimer = null; return; }
      let diff = Math.max(0, dealEnd - Date.now());
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      if (el) {
        el.querySelector('[data-h]').textContent = pad(h);
        el.querySelector('[data-m]').textContent = pad(m);
        el.querySelector('[data-s]').textContent = pad(s);
      }
      if (mini) mini.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    };
    tick();
    dealsTimer = setInterval(tick, 1000);
  }

  /* ============================================================
     4. NEW ARRIVALS  #/new-arrivals
     ============================================================ */
  const NEW_MAX_AGE = 60;
  const newState = { cat: 'all', brand: 'all', price: 'all', rating: 0, sort: 'newest' };
  const PRICE_BANDS = [
    { id: 'all', label: 'Any price', min: 0, max: Infinity },
    { id: 'u100', label: 'Under $100', min: 0, max: 100 },
    { id: '100-300', label: '$100 – $300', min: 100, max: 300 },
    { id: '300-800', label: '$300 – $800', min: 300, max: 800 },
    { id: '800+', label: '$800 & up', min: 800, max: Infinity }
  ];

  function newProducts() {
    return D.products.filter(p => p.ageDays <= NEW_MAX_AGE).sort((a, b) => a.ageDays - b.ageDays);
  }

  async function newArrivalsPage() {
    const view = U.qs('#view');
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:300px"></div>' +
      '<div class="mt-6">' + UI.skeletonGrid(8) + '</div></div>';
    await U.sleep(360);
    view.innerHTML = newArrivalsShell();
    paintNew();
    wireNew();
    finish(view);
  }

  function newArrivalsShell() {
    const all = newProducts();
    const stage = all.slice(0, 3);
    const cats = Array.from(new Set(all.map(p => p.cat)));
    const brands = Array.from(new Set(all.map(p => p.brandId)));
    const week = newThisWeek(all);

    return '' +
      '<section class="hero" style="padding-bottom:0"><div class="container">' +
      '<div class="text-center">' +
      '<div class="eyebrow" style="justify-content:center"><span class="dot"></span>Fresh in · updated daily</div>' +
      '<h1 class="mt-3" style="font-size:clamp(44px,9vw,120px);letter-spacing:-.05em">JUST <span style="background:var(--aurora);-webkit-background-clip:text;background-clip:text;color:transparent">DROPPED</span></h1>' +
      '<p class="lead" style="margin-inline:auto;text-align:center">' + all.length + ' new pieces landed in the last two months. We test everything before it goes live, so the newest shelf is also the most honest one.</p>' +
      '</div>' +
      '<div class="reveal-stagger mt-7" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-5);align-items:start">' +
      stage.map((p, i) => dropCard(p, i)).join('') +
      '</div></div></section>' +

      '<section class="section-sm"><div class="container">' +
      '<div class="row-between mb-5" style="flex-wrap:wrap;gap:12px">' +
      '<div><h3 style="font-size:22px">Filter the drop</h3>' +
      '<p class="muted mt-1" style="font-size:14px" id="newCount">—</p></div>' +
      '<div class="tabs" id="newSort">' +
      '<button data-sort="newest" class="' + (newState.sort === 'newest' ? 'active' : '') + '">Newest</button>' +
      '<button data-sort="trending" class="' + (newState.sort === 'trending' ? 'active' : '') + '">Trending</button>' +
      '<button data-sort="popular" class="' + (newState.sort === 'popular' ? 'active' : '') + '">Popular</button>' +
      '</div></div>' +

      '<div class="col gap-3 mb-6">' +
      filterLine('Category', cats.map(c => {
        const cat = D.categories.find(x => x.id === c);
        return { v: c, label: cat ? cat.name : c };
      }), 'cat') +
      filterLine('Brand', brands.map(id => {
        const b = D.brands.find(x => x.id === id);
        return { v: id, label: b ? b.name : id };
      }), 'brand') +
      filterLine('Price', PRICE_BANDS.map(b => ({ v: b.id, label: b.label })), 'price') +
      filterLine('Rating', [{ v: '4.5', label: '4.5 & up' }, { v: '4', label: '4.0 & up' }, { v: '0', label: 'Any rating' }], 'rating') +
      '</div>' +

      '<div id="newGrid"></div>' +
      '</div></section>' +

      '<section class="section-sm" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Last seven days', title: 'New this week',
        lead: 'The very front of the queue — these went live while you were doing other things.',
        action: carouselNav('#weekTrack')
      }) +
      '<div class="carousel reveal" id="weekTrack">' +
      week.map(p => '<div style="flex:0 0 clamp(220px,23%,280px)">' + UI.productCard(p) + '</div>').join('') +
      '</div></div></section>';
  }

  function newThisWeek(all) {
    let week = all.filter(p => p.ageDays <= 7);
    if (week.length < 4) week = all.slice(0, 8);
    return week;
  }

  function dropCard(p, i) {
    const offset = [0, 34, 12][i] || 0;
    const delay = 0.05 + i * 0.14;
    return '<a href="#/product/' + p.id + '" style="display:block;margin-top:' + offset + 'px;animation:fadeUp .8s var(--ease) ' + delay + 's both">' +
      '<div style="position:relative;border-radius:var(--r-5);overflow:hidden;border:1px solid var(--border);background:var(--surface-2);aspect-ratio:4/5">' +
      '<img src="' + img(p.imgs[0], 640, 800) + '" alt="' + U.h(p.name) + '" style="width:100%;height:100%;object-fit:cover" decoding="async">' +
      '<span style="position:absolute;top:14px;left:14px" class="badge badge-new">New</span>' +
      '<span style="position:absolute;top:14px;right:14px" class="badge badge-glass">' + ageLabel(p.ageDays) + '</span>' +
      '<span style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(8,9,14,.72))"></span>' +
      '<span style="position:absolute;left:18px;right:18px;bottom:16px;color:#fff">' +
      '<span style="display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">' + U.h(p.brand) + '</span>' +
      '<span style="display:block;font-weight:700;font-size:16px;margin-top:4px;line-height:1.3">' + U.h(p.name) + '</span>' +
      '<span style="display:block;margin-top:6px;font-size:14px;opacity:.9">' + S.money(p.price) + '</span></span>' +
      '</div></a>';
  }

  function ageLabel(days) {
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 14) return 'Last week';
    return days + ' days ago';
  }

  function filterLine(title, items, key) {
    const current = newState[key];
    return '<div class="row" style="gap:12px;align-items:flex-start;flex-wrap:wrap">' +
      '<span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-soft);width:76px;padding-top:8px">' + U.h(title) + '</span>' +
      '<div class="row" style="gap:6px;flex-wrap:wrap;flex:1">' +
      (key === 'cat' || key === 'brand' || key === 'price'
        ? '<button class="chip' + ((current === 'all' || current === '0') ? ' active' : '') + '" data-fk="' + key + '" data-fv="all">All</button>'
        : '') +
      items.map(it => {
        const active = key === 'rating' ? (String(current) === String(it.v)) : (current === it.v);
        return '<button class="chip' + (active && it.v !== 'all' ? ' active' : '') + '" data-fk="' + key + '" data-fv="' + U.h(String(it.v)) + '">' + U.h(it.label) + '</button>';
      }).join('') +
      '</div></div>';
  }

  function applyNewFilters() {
    let list = newProducts();
    if (newState.cat !== 'all') list = list.filter(p => p.cat === newState.cat);
    if (newState.brand !== 'all') list = list.filter(p => p.brandId === newState.brand);
    const band = PRICE_BANDS.find(b => b.id === newState.price) || PRICE_BANDS[0];
    list = list.filter(p => p.price >= band.min && p.price <= band.max);
    if (newState.rating) list = list.filter(p => p.rating >= newState.rating);
    if (newState.sort === 'trending') list.sort((a, b) => b.sold - a.sold);
    else if (newState.sort === 'popular') list.sort((a, b) => b.rating * Math.log(b.reviews + 10) - a.rating * Math.log(a.reviews + 10));
    else list.sort((a, b) => a.ageDays - b.ageDays);
    return list;
  }

  function paintNew() {
    const list = applyNewFilters();
    const count = U.qs('#newCount');
    if (count) count.innerHTML = '<b>' + list.length + '</b> new pieces <span class="dot-sep"></span> ' +
      ({ newest: 'sorted by date added', trending: 'sorted by units sold', popular: 'sorted by rating × review volume' })[newState.sort];

    const grid = U.qs('#newGrid');
    if (!list.length) {
      grid.innerHTML = UI.empty({
        icon: 'sparkle',
        title: 'Nothing new in that slice',
        text: 'New stock arrives most weekday mornings. Try widening the filters, or take a look at the full drop.',
        actions: '<button class="btn btn-primary" data-newreset>Reset filters</button><a class="btn btn-secondary" href="#/shop">Browse everything</a>'
      });
      return;
    }
    grid.innerHTML = '<div class="prod-grid cols-4 reveal-stagger">' + list.map(newCard).join('') + '</div>';
    UI.observeReveals(grid);
  }

  function newCard(p) {
    return '<article class="pcard" data-product="' + p.id + '">' +
      '<div class="pcard-media">' +
      '<img src="' + img(p.imgs[0], 500, 625) + '" alt="' + U.h(p.name) + '" loading="lazy" decoding="async">' +
      '<div class="pcard-badges"><div class="left">' +
      '<span class="badge badge-new">New</span>' +
      '<span class="badge badge-glass">' + ageLabel(p.ageDays) + '</span>' +
      '</div><div class="right">' +
      '<button class="iconbtn pcard-wish' + (S.inWishlist(p.id) ? ' active' : '') + '" data-wish="' + p.id + '" aria-label="Wishlist" style="width:34px;height:34px">' + I.icon('heart') + '</button>' +
      '</div></div>' +
      '<div class="pcard-actions">' +
      '<button class="btn btn-dark btn-sm" data-quick="' + p.id + '">' + I.icon('eye', '', 'width:15px;height:15px') + 'Quick view</button>' +
      '<button class="btn btn-primary btn-sm" data-add="' + p.id + '">' + I.icon('cart', '', 'width:15px;height:15px') + 'Add</button>' +
      '</div></div>' +
      '<div class="pcard-body">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<h3 class="pcard-name"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></h3>' +
      '<div class="pcard-rating">' + I.stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + p.reviews.toLocaleString() + ')</span></div>' +
      UI.priceHtml(p) +
      '<div class="soft" style="font-size:12px">Added ' + U.h(ageLabel(p.ageDays)) + ' · ' + p.sold.toLocaleString() + ' sold</div>' +
      '</div></article>';
  }

  function wireNew() {
    const view = U.qs('#view');

    view.addEventListener('click', (e) => {
      const f = e.target.closest('[data-fk]');
      if (f) {
        const k = f.dataset.fk, v = f.dataset.fv;
        if (k === 'rating') newState.rating = parseFloat(v) || 0;
        else if (k === 'price') newState.price = v;
        else newState[k] = v;
        syncNewChips();
        paintNew();
        return;
      }
      const s = e.target.closest('[data-sort]');
      if (s) {
        newState.sort = s.dataset.sort;
        U.qsa('#newSort button').forEach(b => b.classList.toggle('active', b === s));
        paintNew();
        return;
      }
      if (e.target.closest('[data-newreset]')) {
        newState.cat = 'all'; newState.brand = 'all'; newState.price = 'all'; newState.rating = 0;
        syncNewChips(); paintNew();
      }
    });
  }

  function syncNewChips() {
    U.qsa('[data-fk]').forEach(btn => {
      const k = btn.dataset.fk, v = btn.dataset.fv;
      let on = false;
      if (k === 'rating') on = String(newState.rating) === String(v) || (v === 'all' && newState.rating === 0);
      else on = newState[k] === v;
      btn.classList.toggle('active', on);
    });
  }

  /* ============================================================
     5. COMPARE  #/compare
     ============================================================ */
  async function comparePage() {
    const view = U.qs('#view');
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:420px"></div></div>';
    await U.sleep(320);
    view.innerHTML = compareShell();
    paintCompare();
    wireCompare();
    finish(view);
  }

  function compareShell() {
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Compare' }],
      eyebrow: 'Side by side',
      title: 'Compare products',
      lead: 'Up to four products, spec against spec. Anything that differs between the columns is highlighted so the trade-offs are obvious.',
      right: '<div class="row" style="gap:8px">' +
        '<button class="btn btn-secondary" id="clearCompare">' + I.icon('trash') + 'Clear all</button>' +
        '<button class="btn btn-primary" id="addCompare">' + I.icon('plus') + 'Add another product</button></div>'
    }) +
      '<div class="container" style="padding-bottom:80px"><div id="compareBody"></div></div>';
  }

  function compareItems() {
    return S.state.compare.slice(0, 4).map(id => D.byId(id)).filter(Boolean);
  }

  function paintCompare() {
    const body = U.qs('#compareBody');
    if (!body) return;
    const items = compareItems();
    if (!items.length) { body.innerHTML = compareEmpty(); return; }
    body.innerHTML = compareTable(items);
  }

  function compareEmpty() {
    const picks = D.products.slice().sort((a, b) => b.rating * Math.log(b.reviews + 10) - a.rating * Math.log(a.reviews + 10)).slice(0, 8);
    return UI.empty({
      icon: 'scale',
      title: 'Nothing to compare yet',
      text: 'Add two products and we will line up their specs, materials, warranty and availability side by side.',
      actions: '<button class="btn btn-primary" id="addCompare2">' + I.icon('plus') + 'Add a product</button>' +
        '<a class="btn btn-secondary" href="#/shop">Browse the catalogue</a>'
    }) +
      '<div class="mt-8"><div class="row-between mb-4"><h4>Popular comparisons</h4>' +
      '<span class="soft" style="font-size:13px">Tap to add</span></div>' +
      '<div class="wl-grid">' + picks.map(cmpPickCard).join('') + '</div></div>';
  }

  function cmpPickCard(p) {
    const inList = S.inCompare(p.id);
    return '<div class="card" style="padding:14px;text-align:center">' +
      '<a href="#/product/' + p.id + '"><img src="' + img(p.imgs[0], 240, 240) + '" alt="' + U.h(p.name) + '" loading="lazy" ' +
      'style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--r-3)"></a>' +
      '<div class="pcard-brand mt-3">' + U.h(p.brand) + '</div>' +
      '<div class="pcard-name" style="margin-top:2px"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></div>' +
      '<div class="mt-2"><b>' + S.money(p.price) + '</b></div>' +
      '<button class="btn btn-sm ' + (inList ? 'btn-secondary' : 'btn-outline') + ' btn-block mt-3" data-cmpadd="' + p.id + '">' +
      I.icon(inList ? 'check' : 'plus', '', 'width:14px;height:14px') + (inList ? 'In comparison' : 'Compare') + '</button></div>';
  }

  function compareTable(items) {
    const specKeys = [];
    items.forEach(p => Object.keys(p.specs || {}).forEach(k => { if (specKeys.indexOf(k) < 0) specKeys.push(k); }));

    const rows = [];
    rows.push({
      label: 'Price', raw: items.map(p => String(p.price)),
      cells: items.map(p => '<b style="font-size:16px">' + S.money(p.price) + '</b>' +
        (p.was ? '<div class="soft" style="font-size:12px;text-decoration:line-through">' + S.money(p.was) + '</div>' : '') +
        (p.off ? '<div><span class="badge badge-sale">-' + p.off + '%</span></div>' : ''))
    });
    rows.push({
      label: 'Rating', raw: items.map(p => p.rating.toFixed(1)),
      cells: items.map(p => '<div class="row" style="gap:6px">' + I.stars(p.rating) + '<span class="muted" style="font-size:12px">' +
        p.rating.toFixed(1) + ' · ' + p.reviews.toLocaleString() + '</span></div>')
    });
    rows.push({
      label: 'Brand', raw: items.map(p => p.brand),
      cells: items.map(p => '<a href="#/brand/' + p.brandId + '" style="font-weight:600">' + U.h(p.brand) + '</a>')
    });
    rows.push({
      label: 'Category', raw: items.map(p => p.catName),
      cells: items.map(p => '<a href="#/shop?cat=' + p.cat + '" class="muted">' + U.h(p.catName) + '</a>')
    });
    rows.push({
      label: 'Materials', raw: items.map(p => p.material || '—'),
      cells: items.map(p => '<span class="muted" style="font-size:13px">' + U.h(p.material || '—') + '</span>')
    });
    specKeys.forEach(k => {
      rows.push({
        label: k, raw: items.map(p => (p.specs && p.specs[k]) ? String(p.specs[k]) : '—'),
        cells: items.map(p => '<span style="font-size:13px">' + U.h((p.specs && p.specs[k]) || '—') + '</span>')
      });
    });
    rows.push({
      label: 'Features', raw: items.map(p => (p.features || []).map(f => f.t).join('|')),
      cells: items.map(p => '<div class="col" style="gap:6px">' + (p.features || []).slice(0, 4).map(f =>
        '<span class="row" style="gap:6px;font-size:13px">' + I.icon(f.icon || 'check', '', 'width:14px;height:14px') +
        '<span>' + U.h(f.t) + '</span></span>').join('') + '</div>')
    });
    rows.push({
      label: 'Warranty', raw: items.map(p => p.warranty || '—'),
      cells: items.map(p => '<span style="font-size:13px">' + U.h(p.warranty || '—') + '</span>')
    });
    rows.push({
      label: 'Availability', raw: items.map(p => p.stock + '/' + p.shipDays),
      cells: items.map(p => '<div style="font-size:13px">' +
        (p.stock > 10 ? '<span style="color:var(--success);font-weight:600">In stock</span>' : '<span style="color:var(--danger);font-weight:600">Only ' + p.stock + ' left</span>') +
        '<div class="soft">Ships in ' + p.shipDays + ' day' + (p.shipDays === 1 ? '' : 's') + (p.freeShip ? ' · free' : '') + '</div></div>' +
        (p.sizes ? '<div class="soft" style="font-size:12px;margin-top:4px">Sizes: ' + U.h(p.sizes.slice(0, 4).join(', ')) + '</div>' : ''))
    });

    const DIFF = 'background:rgba(109,94,248,.07)';

    return '<div class="compare-wrap">' +
      '<table class="compare-table">' +
      '<thead><tr><th class="row-label">Product</th>' +
      items.map(p => '<th style="min-width:210px">' +
        '<div class="col" style="gap:8px;align-items:flex-start">' +
        '<a href="#/product/' + p.id + '"><img src="' + img(p.imgs[0], 200, 200) + '" alt="' + U.h(p.name) + '" loading="lazy"></a>' +
        '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
        '<a href="#/product/' + p.id + '" style="font-weight:600;font-size:14px;line-height:1.35">' + U.h(p.name) + '</a>' +
        '<div class="row" style="gap:6px"><button class="btn btn-primary btn-sm" data-add="' + p.id + '">' + I.icon('cart', '', 'width:14px;height:14px') + 'Add</button>' +
        '<button class="btn btn-secondary btn-sm btn-icon" data-cmprm="' + p.id + '" aria-label="Remove">' + I.icon('close', '', 'width:14px;height:14px') + '</button></div>' +
        '</div></th>').join('') +
      '</tr></thead><tbody>' +
      rows.map(r => {
        const differs = new Set(r.raw).size > 1;
        return '<tr><th class="row-label" style="font-weight:600;color:var(--text-muted);text-align:left">' + U.h(r.label) + '</th>' +
          r.cells.map((c, i) => '<td' + (differs ? ' style="' + DIFF + '"' : '') + '>' + c + '</td>').join('') +
          '</tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<div class="row-between mt-5" style="flex-wrap:wrap;gap:12px">' +
      '<p class="muted" style="font-size:13px">Shaded cells are the ones that differ — that is where the decision actually lives.</p>' +
      '<div class="row" style="gap:8px">' +
      (items.length < 4 ? '<button class="btn btn-secondary" id="addCompare3">' + I.icon('plus') + 'Add another (' + (4 - items.length) + ' left)</button>' : '') +
      '<button class="btn btn-ghost" id="clearCompare2">Clear all</button></div></div>';
  }

  function wireCompare() {
    const view = U.qs('#view');

    view.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-cmprm]');
      if (rm) {
        if (S.inCompare(rm.dataset.cmprm)) S.toggleCompare(rm.dataset.cmprm);
        paintCompare();
        UI.toast({ title: 'Removed from comparison' });
        return;
      }
      const add = e.target.closest('[data-cmpadd]');
      if (add) { addToCompare(add.dataset.cmpadd); return; }
      if (e.target.closest('#addCompare') || e.target.closest('#addCompare2') || e.target.closest('#addCompare3')) { openComparePicker(); return; }
      if (e.target.closest('#clearCompare') || e.target.closest('#clearCompare2')) {
        S.set({ compare: [] });
        S.emit('compare', []);
        paintCompare();
        UI.toast({ title: 'Comparison cleared' });
      }
    });
  }

  function addToCompare(id) {
    if (S.inCompare(id)) { UI.toast({ type: 'warn', title: 'Already in the comparison' }); return; }
    if (S.state.compare.length >= 4) { UI.toast({ type: 'warn', title: 'Four is the maximum', desc: 'Remove one to add another.' }); return; }
    S.toggleCompare(id);
    paintCompare();
    const p = D.byId(id);
    UI.toast({ title: 'Added to compare', desc: p ? p.name : '' });
    const modalList = U.qs('#cmpList');
    if (modalList) renderPickerList(modalList);
  }

  function openComparePicker() {
    UI.modal({
      title: 'Add a product to compare',
      width: 760,
      body: '<div class="searchbox mb-4">' + I.icon('search', 'ic') +
        '<input id="cmpQ" placeholder="Search the catalogue…" aria-label="Search products"></div>' +
        '<div id="cmpList"></div>',
      onMount: (body) => {
        const list = U.qs('#cmpList', body);
        const input = U.qs('#cmpQ', body);
        renderPickerList(list);
        input.addEventListener('input', U.debounce(() => renderPickerList(list, input.value), 160));
        list.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-cmpadd]');
          if (btn) addToCompare(btn.dataset.cmpadd);
        });
      }
    });
  }

  function renderPickerList(list, q) {
    if (!list) return;
    const term = (q || '').trim().toLowerCase();
    let pool = D.products.filter(p => !S.inCompare(p.id));
    if (term) {
      const ids = new Set(D.search(term).products.map(p => p.id));
      pool = pool.filter(p => ids.has(p.id));
    } else {
      pool = pool.slice().sort((a, b) => b.rating * Math.log(b.reviews + 10) - a.rating * Math.log(a.reviews + 10));
    }
    const full = S.state.compare.length >= 4;
    if (!pool.length) {
      list.innerHTML = UI.empty({ icon: 'search', title: 'No products found', text: 'Try a different keyword.' });
      return;
    }
    list.innerHTML = (full ? '<div class="coupon-card mb-4">You already have four products in the comparison — remove one to add another.</div>' : '') +
      '<div style="max-height:46vh;overflow:auto">' +
      pool.slice(0, 40).map(p =>
        '<button class="sr-item" data-cmpadd="' + p.id + '" style="width:100%;text-align:left;background:none;border:0"' + (full ? ' disabled' : '') + '>' +
        '<img src="' + img(p.imgs[0], 120, 120) + '" alt="" loading="lazy">' +
        '<span style="flex:1;min-width:0"><span class="t" style="display:block">' + U.h(p.name) + '</span>' +
        '<span class="s">' + U.h(p.brand) + ' · ' + U.h(p.catName) + ' · ' + p.rating.toFixed(1) + '★</span></span>' +
        '<span style="font-weight:700;flex:none">' + S.money(p.price) + '</span>' +
        '<span class="badge ' + (full ? '' : 'badge-glass') + '" style="flex:none">' + (full ? 'Full' : 'Add') + '</span>' +
        '</button>').join('') +
      '</div>';
  }

  /* ============================================================
     6. SEARCH RESULTS  #/search?q=
     ============================================================ */
  const searchState = { cat: '', brand: '', sort: 'recommended' };
  let refocusSearch = false;
  const SEARCH_SORTS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest rated' },
    { id: 'newest', label: 'Newest' }
  ];
  const POPULAR_SEARCHES = ['headphones', 'laptop', 'sneakers', 'watch', 'sofa', 'keyboard', 'backpack', 'camera'];

  async function searchPage(ctx) {
    const view = U.qs('#view');
    const q = (ctx.query && ctx.query.q) || '';
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:120px"></div>' +
      '<div class="mt-6">' + UI.skeletonGrid(8) + '</div></div>';
    await U.sleep(340);
    view.innerHTML = searchShell(q);
    paintSearch(q);
    wireSearch(q);
    finish(view);
    if (refocusSearch) {
      refocusSearch = false;
      const inp = U.qs('#searchInput');
      if (inp) { inp.focus(); const v = inp.value; inp.value = ''; inp.value = v; }
    }
  }

  function searchShell(q) {
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Search' }],
      eyebrow: 'Results',
      title: q ? 'Search' : 'search',
      lead: '',
      right: '',
      below: ''
    }).replace('>search<', '>' + (q ? 'Results for “' + U.h(q) + '”' : 'Search NOVA') + '<') +
      '<div style="padding:0 0 8px"><div class="container">' +
      '<div class="searchbox input-lg" style="max-width:720px">' + I.icon('search', 'ic') +
      '<input id="searchInput" value="' + U.h(q) + '" placeholder="What are you looking for?" aria-label="Search" style="font-size:16px">' +
      (q ? '<button class="btn btn-sm btn-ghost" id="clearSearch" aria-label="Clear">' + I.icon('close', '', 'width:14px;height:14px') + '</button>' : '') +
      '</div>' +
      '<div class="row mt-3" style="gap:8px;flex-wrap:wrap">' +
      '<span class="soft" style="font-size:12px">Popular:</span>' +
      POPULAR_SEARCHES.slice(0, 6).map(t => '<a class="chip" style="font-size:12px;padding:4px 10px" href="#/search?q=' + encodeURIComponent(t) + '">' + U.h(t) + '</a>').join('') +
      '</div></div></div>' +
      '<div class="container" style="padding-bottom:80px"><div id="searchBody"></div></div>';
  }

  function paintSearch(q) {
    const body = U.qs('#searchBody');
    if (!body) return;
    if (!q.trim()) { body.innerHTML = searchIntro(); return; }

    const r = D.search(q);
    let list = r.products.slice();
    if (searchState.cat) list = list.filter(p => p.cat === searchState.cat);
    if (searchState.brand) list = list.filter(p => p.brandId === searchState.brand);
    if (searchState.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (searchState.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (searchState.sort === 'rating') list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (searchState.sort === 'newest') list.sort((a, b) => a.ageDays - b.ageDays);
    else list.sort((a, b) => b.rating * Math.log(b.reviews + 10) - a.rating * Math.log(a.reviews + 10));

    const facetsCats = Array.from(new Set(r.products.map(p => p.cat)))
      .map(id => D.categories.find(c => c.id === id)).filter(Boolean);
    const facetsBrands = Array.from(new Set(r.products.map(p => p.brandId)))
      .map(id => D.brands.find(b => b.id === id)).filter(Boolean);
    const sugg = D.suggest(q);

    let html = '';

    if (sugg && sugg.toLowerCase() !== q.toLowerCase()) {
      html += '<div class="coupon-card mb-5">' +
        '<div class="row" style="gap:8px">' + I.icon('spark', '', 'width:18px;height:18px') +
        '<span>Did you mean <button data-sugg="' + U.h(sugg) + '" style="font-weight:700;color:var(--accent-500);text-decoration:underline">' + U.h(sugg) + '</button>?</span></div>' +
        '</div>';
    }

    html += (r.brands.length ? '<div class="section-sm" style="padding:0 0 8px">' +
      UI.sectionHeader({ eyebrow: 'Matching houses', title: 'Brands' }) +
      '<div class="grid grid-3">' + r.brands.slice(0, 3).map(brandCard).join('') + '</div></div>' : '');

    html += (r.categories.length ? '<div class="section-sm">' +
      UI.sectionHeader({ eyebrow: 'Matching departments', title: 'Categories' }) +
      '<div class="cat-grid">' + r.categories.slice(0, 5).map(c =>
        '<a class="ccard" href="#/shop?cat=' + c.id + '"><img src="' + img(c.img, 520, 650) + '" alt="' + U.h(c.name) + '" loading="lazy">' +
        '<span class="ccard-body"><span><span class="name">' + U.h(c.name) + '</span><span class="count">' + c.count.toLocaleString() + ' products</span></span>' +
        '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>').join('') +
      '</div></div>' : '');

    html += '<div class="section-sm" style="padding-top:0">' +
      '<div class="row-between mb-4" style="flex-wrap:wrap;gap:12px">' +
      '<div><h3 style="font-size:22px">Products</h3>' +
      '<p class="muted mt-1" style="font-size:14px"><b>' + list.length + '</b> result' + (list.length === 1 ? '' : 's') +
      (searchState.cat || searchState.brand ? ' after filters' : '') + '</p></div>' +
      sortSelect('searchSort', SEARCH_SORTS, searchState.sort) + '</div>';

    if (facetsCats.length > 1 || facetsBrands.length > 1) {
      html += '<div class="row mb-5" style="gap:8px;flex-wrap:wrap">' +
        (facetsCats.length > 1 ? facetsCats.map(c =>
          '<button class="chip' + (searchState.cat === c.id ? ' active' : '') + '" data-scat="' + c.id + '">' + U.h(c.name) + '</button>').join('') : '') +
        (facetsBrands.length > 1 ? facetsBrands.map(b =>
          '<button class="chip' + (searchState.brand === b.id ? ' active' : '') + '" data-sbrand="' + b.id + '">' + U.h(b.name) + '</button>').join('') : '') +
        ((searchState.cat || searchState.brand) ? '<button class="chip" style="border-style:dashed" data-sreset>Reset filters</button>' : '') +
        '</div>';
    }

    if (!list.length) {
      html += UI.empty({
        icon: 'search',
        title: 'No results for “' + q + '”',
        text: 'Check the spelling, try a broader term, or start from one of the searches below.',
        actions: POPULAR_SEARCHES.slice(0, 4).map(t =>
          '<a class="btn btn-secondary" href="#/search?q=' + encodeURIComponent(t) + '">' + U.h(t) + '</a>').join('') +
          '<a class="btn btn-primary" href="#/shop">Browse everything</a>'
      });
    } else {
      html += '<div class="prod-grid cols-4 reveal-stagger">' + list.map(p => UI.productCard(p)).join('') + '</div>';
    }
    html += '</div>';

    body.innerHTML = html;
    UI.observeReveals(body);
  }

  function searchIntro() {
    const trending = D.products.slice().sort((a, b) => b.sold - a.sold).slice(0, 8);
    return '<div class="section-sm" style="padding-top:8px">' +
      UI.empty({
        icon: 'search',
        title: 'Start typing to search',
        text: 'We index ' + D.products.length + ' products, ' + D.brands.length + ' brands and ' + D.categories.length + ' departments. Try a product, a brand or a category.',
        actions: POPULAR_SEARCHES.map(t => '<a class="btn btn-secondary" href="#/search?q=' + encodeURIComponent(t) + '">' + U.h(t) + '</a>').join('')
      }) + '</div>' +
      '<div class="section-sm">' +
      UI.sectionHeader({ eyebrow: 'While you are here', title: 'Trending this week', lead: 'Based on units sold across the last seven days.' }) +
      '<div class="prod-grid cols-4 reveal-stagger">' + trending.map(p => UI.productCard(p)).join('') + '</div>' +
      '</div>' +
      '<div class="section-sm">' +
      UI.sectionHeader({ eyebrow: 'Or browse', title: 'Departments' }) +
      '<div class="cat-grid">' + D.categories.slice(0, 5).map(c =>
        '<a class="ccard" href="#/shop?cat=' + c.id + '"><img src="' + img(c.img, 520, 650) + '" alt="' + U.h(c.name) + '" loading="lazy">' +
        '<span class="ccard-body"><span><span class="name">' + U.h(c.name) + '</span><span class="count">' + U.h(c.blurb) + '</span></span>' +
        '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>').join('') +
      '</div></div>';
  }

  function wireSearch(q) {
    const view = U.qs('#view');
    const input = U.qs('#searchInput');

    const run = (value) => {
      const v = value.trim();
      if (v === q.trim()) return;
      refocusSearch = true;
      searchState.cat = ''; searchState.brand = '';
      window.location.hash = '#/search?q=' + encodeURIComponent(v);
    };

    input.addEventListener('input', U.debounce((e) => run(e.target.value), 420));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(input.value); });

    view.addEventListener('click', (e) => {
      if (e.target.closest('#clearSearch')) { refocusSearch = true; window.location.hash = '#/search'; return; }
      const sg = e.target.closest('[data-sugg]');
      if (sg) { window.location.hash = '#/search?q=' + encodeURIComponent(sg.dataset.sugg); return; }
      const sc = e.target.closest('[data-scat]');
      if (sc) { searchState.cat = searchState.cat === sc.dataset.scat ? '' : sc.dataset.scat; paintSearch(q); return; }
      const sb = e.target.closest('[data-sbrand]');
      if (sb) { searchState.brand = searchState.brand === sb.dataset.sbrand ? '' : sb.dataset.sbrand; paintSearch(q); return; }
      if (e.target.closest('[data-sreset]')) { searchState.cat = ''; searchState.brand = ''; paintSearch(q); }
    });

    const sel = U.qs('#searchSort');
    if (sel) sel.addEventListener('change', (e) => { searchState.sort = e.target.value; paintSearch(q); });
  }

  /* ============================================================
     7. STATIC PAGES
     ============================================================ */
  async function staticPage(render) {
    const view = U.qs('#view');
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:220px"></div>' +
      '<div class="mt-6"><div class="skeleton sk-block" style="height:360px"></div></div></div>';
    await U.sleep(320);
    view.innerHTML = render();
    finish(view);
    return view;
  }

  function helpCta() {
    return '<section class="section-sm" style="padding-bottom:80px"><div class="container">' +
      '<div class="deals-hero reveal text-center">' +
      '<div class="eyebrow" style="justify-content:center"><span class="dot"></span>Still stuck?</div>' +
      '<h2 class="mt-3">Talk to a real person</h2>' +
      '<p class="muted mt-3" style="max-width:52ch;margin-inline:auto">Our team answers in under four minutes on average, seven days a week. No scripts, no ticket numbers.</p>' +
      '<div class="row" style="justify-content:center;gap:10px;margin-top:24px;flex-wrap:wrap">' +
      '<a class="btn btn-primary btn-lg" href="#/contact">Contact support</a>' +
      '<a class="btn btn-secondary btn-lg" href="#/faq">Read the FAQ</a></div>' +
      '</div></div></section>';
  }

  /* ---------- About ---------- */
  async function aboutPage() {
    const view = await staticPage(renderAbout);
    wireAbout(view);
  }

  function renderAbout() {
    const totalProducts = D.products.length;
    const totalReviews = D.products.reduce((n, p) => n + p.reviews, 0);
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'About' }],
      eyebrow: 'Our story',
      title: 'We built the store we wanted to shop at',
      lead: 'NOVA started in a Portland garage with a spreadsheet of things we had personally broken, loved and replaced. Nine years later it is still the same idea: sell fewer things, know them properly, and tell you the truth about them.',
      right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/shop">Shop the edit</a>' +
        '<a class="btn btn-primary" href="#/brands">Meet the brands</a></div>'
    }) +
      /* Band image */
      '<section class="section-sm" style="padding-top:0"><div class="container">' +
      '<div style="position:relative;border-radius:var(--r-6);overflow:hidden;border:1px solid var(--border);aspect-ratio:21/9">' +
      '<img src="' + img('1519389950473-47ba0277781c', 1600, 700) + '" alt="NOVA studio" style="width:100%;height:100%;object-fit:cover" decoding="async">' +
      '<span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,9,14,.15),rgba(8,9,14,.55))"></span>' +
      '<span style="position:absolute;left:clamp(20px,4vw,48px);bottom:clamp(18px,3vw,36px);color:#fff;max-width:44ch">' +
      '<span class="badge badge-glass">Portland, Oregon · est. 2017</span>' +
      '<span style="display:block;font-size:clamp(20px,2.6vw,32px);font-weight:700;margin-top:10px;line-height:1.15">Every product on this site has been used by someone on this team.</span>' +
      '</span></div></div></section>' +

      /* Story split */
      '<section class="section-sm"><div class="container"><div class="grid grid-2" style="gap:var(--s-8);align-items:center">' +
      '<div><div class="eyebrow"><span class="dot"></span>Why we exist</div>' +
      '<h2 class="mt-3">Curation beats infinite choice</h2>' +
      '<p class="muted mt-4" style="line-height:1.7">Marketplaces optimise for the number of things you can buy. We optimise for the number of things you should buy. That means a smaller catalogue, deeper testing, and product pages that answer the question you actually came with — including the parts that are not flattering.</p>' +
      '<p class="muted mt-3" style="line-height:1.7">If a product fails our testing we do not list it. If it fails after we list it, we delist it and publish why. That has cost us revenue more than once, and it is the reason people come back.</p>' +
      '<div class="row mt-5" style="gap:10px;flex-wrap:wrap">' +
      '<span class="badge badge-glass">Independent since 2017</span>' +
      '<span class="badge badge-glass">No paid placements</span>' +
      '<span class="badge badge-glass">No fake reviews</span></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">' +
      [['1493663284031-b7e3aefcae8e', 'The studio'], ['1505740420928-5e560c06d30e', 'The test bench'],
      ['1555041469-a586c61ea9bc', 'The home edit'], ['1516035069371-29a1b244cc32', 'The photo room']]
        .map(([id, cap]) => '<figure style="margin:0"><div style="border-radius:var(--r-4);overflow:hidden;border:1px solid var(--border);aspect-ratio:4/5">' +
          '<img src="' + img(id, 520, 650) + '" alt="' + U.h(cap) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>' +
          '<figcaption class="soft" style="font-size:12px;margin-top:8px">' + U.h(cap) + '</figcaption></figure>').join('') +
      '</div></div></div></section>' +

      /* Milestones */
      '<section class="section-sm" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({ eyebrow: 'Milestones', title: 'Nine years, in numbers', lead: 'A short, honest accounting of where we are.' }) +
      '<div class="grid grid-4 reveal-stagger">' +
      statCard('Founded', '2017', 'Portland, OR') +
      statCard('Products live', String(totalProducts), 'Across ' + D.categories.length + ' departments') +
      statCard('Verified reviews', (Math.round(totalReviews / 1000)) + 'k', 'Never filtered by sentiment') +
      statCard('Countries served', '42', 'Free returns in 19') +
      '</div>' +
      '<div class="timeline mt-7">' +
      [['2017', 'Two people, one garage', 'Started by reselling refurbished audio gear we had repaired ourselves.'],
      ['2019', 'The testing studio', 'Built a permanent bench for measuring battery life, ANC and build quality.'],
      ['2022', 'Own-brand launches', 'Aurora and Lumen began as gaps we could not find a good answer to.'],
      ['2024', 'Carbon-neutral shipping', 'Every parcel offset, and 78% of packaging is now plastic-free.'],
      ['2026', 'Same-day in 14 cities', 'Live stock from local warehouses rather than one distant hub.']]
        .map((m, i) => '<div class="tl done"><div class="rail"><span class="dot"></span><span class="bar"></span></div>' +
          '<div class="c"><div class="soft" style="font-size:12px;letter-spacing:.1em;font-weight:700">' + U.h(m[0]) + '</div>' +
          '<div class="t">' + U.h(m[1]) + '</div><div class="d">' + U.h(m[2]) + '</div></div></div>').join('') +
      '</div></div></section>' +

      /* Principles */
      '<section class="section-sm"><div class="container">' +
      UI.sectionHeader({ eyebrow: 'How we work', title: 'Three rules we do not break' }) +
      '<div class="grid grid-3 reveal-stagger">' +
      infoCard('shield', 'Say the awkward bit', 'If a product has a weak point — short cable, average battery, fiddly app — it goes in the description. Returns drop when expectations are accurate.') +
      infoCard('scale', 'Price against reality', 'We publish the price we actually sold at over the last 90 days. If a “was” price was never charged, we do not show it.') +
      infoCard('refresh', 'Own the aftermath', 'Thirty days, free returns, no interrogation. If we got it wrong we pay for it, not you.') +
      '</div></div></section>' +

      /* Sustainability */
      '<section class="section-sm"><div class="container"><div class="grid grid-2" style="gap:var(--s-8);align-items:center">' +
      '<div style="border-radius:var(--r-5);overflow:hidden;border:1px solid var(--border);aspect-ratio:5/4">' +
      '<img src="' + img('1493663284031-b7e3aefcae8e', 1000, 800) + '" alt="Sustainable materials" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>' +
      '<div><div class="eyebrow"><span class="dot"></span>Sustainability</div>' +
      '<h2 class="mt-3">Progress, not perfection</h2>' +
      '<p class="muted mt-4" style="line-height:1.7">We are not going to claim we are carbon neutral end to end — nobody shipping physical goods across oceans is. What we can show is the direction and the receipts.</p>' +
      '<ul class="col gap-3 mt-5" style="font-size:14px">' +
      [['78% plastic-free packaging', 'drop'], ['All parcels carbon-offset since 2024', 'check'],
      ['Repair guides for every product we sell', 'edit'], ['Take-back scheme for electronics and textiles', 'refresh']]
        .map(([txt, ic]) => '<li class="row" style="gap:12px;align-items:flex-start">' +
          '<span style="color:var(--accent-500);flex:none">' + I.icon(ic, '', 'width:18px;height:18px') + '</span>' +
          '<span>' + U.h(txt) + '</span></li>').join('') +
      '</ul></div></div></div></section>' +

      /* Team */
      '<section class="section-sm" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({ eyebrow: 'The people', title: 'Who picks this stuff', lead: 'A small team of testers, writers and buyers. You will see our names on the reviews.' }) +
      '<div class="grid grid-4 reveal-stagger">' +
      [['Amara O.', 'Head of curation', 'Twelve years in product design, owns 41 pairs of headphones.'],
      ['Daniel K.', 'Testing lead', 'Runs the bench. Measures everything, trusts nothing.'],
      ['Priya S.', 'Buying, home', 'Former furniture restorer. Hates particleboard.'],
      ['Jonas W.', 'Editorial', 'Writes the awkward bits into the descriptions.']]
        .map(([n, r, b]) => '<div class="card" style="padding:20px">' +
          '<span style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--accent-400),var(--accent-600));color:#fff;' +
          'display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:19px">' + U.h(n.charAt(0)) + '</span>' +
          '<div class="mt-4" style="font-weight:700">' + U.h(n) + '</div>' +
          '<div class="soft" style="font-size:12px">' + U.h(r) + '</div>' +
          '<p class="muted mt-3" style="font-size:13px;line-height:1.6">' + U.h(b) + '</p></div>').join('') +
      '</div></div></section>' +
      helpCta();
  }

  function wireAbout(view) { /* static content, no local state */ }

  /* ---------- Contact ---------- */
  async function contactPage() {
    const view = await staticPage(renderContact);
    wireContact(view);
  }

  function renderContact() {
    const c = D.customer;
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Contact' }],
      eyebrow: 'We answer in minutes',
      title: 'Contact NOVA',
      lead: 'One team handles orders, returns and product questions — so you never get bounced between departments.',
      right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/faq">Read the FAQ</a>' +
        '<a class="btn btn-primary" href="#/account/orders">Track an order</a></div>'
    }) +
      '<section class="section-sm" style="padding-top:8px"><div class="container">' +
      '<div style="display:grid;gap:var(--s-6);grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);align-items:start">' +

      /* Form */
      '<div class="card" style="padding:clamp(20px,3vw,32px)">' +
      '<h3 style="font-size:20px">Send us a message</h3>' +
      '<p class="muted mt-2" style="font-size:14px">Typical first reply: under four minutes during opening hours, under four hours overnight.</p>' +
      '<form id="contactForm" class="col gap-4 mt-5" novalidate>' +
      '<div class="input-row">' +
      '<div class="input-group" style="flex:1"><label for="cfName">Your name</label>' +
      '<input class="input" id="cfName" name="name" placeholder="Alex Mercer" required></div>' +
      '<div class="input-group" style="flex:1"><label for="cfEmail">Email</label>' +
      '<input class="input" id="cfEmail" name="email" type="email" placeholder="you@example.com" required></div>' +
      '</div>' +
      '<div class="input-row">' +
      '<div class="input-group" style="flex:1"><label for="cfOrder">Order number (optional)</label>' +
      '<input class="input" id="cfOrder" name="order" placeholder="NV-10240"></div>' +
      '<div class="input-group" style="flex:1"><label for="cfTopic">What is it about?</label>' +
      '<select class="input" id="cfTopic" name="topic">' +
      ['An order I placed', 'A return or refund', 'Product question', 'Delivery problem', 'Something else']
        .map(t => '<option>' + U.h(t) + '</option>').join('') + '</select></div>' +
      '</div>' +
      '<div class="input-group"><label for="cfMsg">Message</label>' +
      '<textarea class="input" id="cfMsg" name="message" rows="5" placeholder="Tell us what happened — include the product name if you can." required></textarea></div>' +
      '<div class="row-between" style="flex-wrap:wrap;gap:10px">' +
      '<span class="soft" style="font-size:12px">We never share your details with third parties.</span>' +
      '<button class="btn btn-primary btn-lg" type="submit">' + I.icon('mail') + 'Send message</button></div>' +
      '</form></div>' +

      /* Aside */
      '<div class="col gap-4">' +
      contactCard('mail', 'Email us', c.email, 'Replies within four minutes during opening hours.', 'mailto:' + c.email) +
      contactCard('phone', 'Call us', c.phone, 'Mon–Fri 08:00–20:00 PT, Sat–Sun 10:00–18:00 PT.', 'tel:' + c.phone.replace(/[^+\d]/g, '')) +
      contactCard('chat', 'Live chat', 'In the app, bottom right', 'The fastest route if you are already signed in.', null) +
      contactCard('mapPin', 'Studio & returns', '221B Alder Street, Portland, OR 97204', 'Drop-offs by appointment only.', null) +

      '<div class="card" style="padding:20px">' +
      '<h4 style="font-size:16px">Opening hours</h4>' +
      '<table class="table mt-3" style="font-size:13px"><tbody>' +
      [['Monday – Friday', '08:00 – 20:00 PT'], ['Saturday', '10:00 – 18:00 PT'],
      ['Sunday', '10:00 – 18:00 PT'], ['Public holidays', '10:00 – 16:00 PT']]
        .map(r => '<tr><td>' + U.h(r[0]) + '</td><td style="text-align:right;font-weight:600">' + U.h(r[1]) + '</td></tr>').join('') +
      '</tbody></table></div>' +

      '<div class="card" style="padding:20px">' +
      '<h4 style="font-size:16px">Quick answers</h4>' +
      '<div class="col gap-2 mt-3">' +
      [['Where is my order?', '#/account/orders'], ['How do I return something?', '#/returns'],
      ['What are the delivery options?', '#/shipping'], ['Do you price match?', '#/faq']]
        .map(([t, h]) => '<a class="row" href="' + h + '" style="gap:8px;padding:10px 12px;border-radius:var(--r-3);background:var(--surface-2);font-size:14px">' +
          '<span style="flex:1">' + U.h(t) + '</span><span style="color:var(--accent-500)">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></a>').join('') +
      '</div></div>' +
      '</div>' +
      '</div></div></section>' + helpCta();
  }

  function contactCard(icon, title, value, sub, href) {
    const inner = '<div class="row" style="gap:14px;align-items:flex-start">' + iconTile(icon, 44) +
      '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:14px">' + U.h(title) + '</div>' +
      '<div style="font-size:14px;margin-top:2px;word-break:break-word">' + U.h(value) + '</div>' +
      '<div class="muted" style="font-size:12px;margin-top:4px">' + U.h(sub) + '</div></div>' +
      (href ? '<span style="color:var(--accent-500)">' + I.icon('arrowUpRight', '', 'width:18px;height:18px') + '</span>' : '') + '</div>';
    return href ? '<a class="card" href="' + href + '" style="padding:18px">' + inner + '</a>'
      : '<div class="card" style="padding:18px">' + inner + '</div>';
  }

  function wireContact(view) {
    const form = U.qs('#contactForm', view);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = U.qs('#cfName', form).value.trim();
      const email = U.qs('#cfEmail', form).value.trim();
      const msg = U.qs('#cfMsg', form).value.trim();
      if (!name || !msg) { UI.toast({ type: 'error', title: 'Almost there', desc: 'Add your name and a message so we can help.' }); return; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { UI.toast({ type: 'error', title: 'Check your email', desc: 'That address does not look right.' }); return; }
      const topic = U.qs('#cfTopic', form).value;
      S.pushNotif({ type: 'order', icon: 'mail', title: 'Message sent', body: topic + ' — we will reply by email shortly.' });
      UI.toast({ title: 'Message sent', desc: 'We reply to ' + email + ' within four minutes.' });
      form.reset();
    });
  }

  /* ---------- FAQ ---------- */
  const FAQ_GROUPS = [
    {
      title: 'Orders & delivery', icon: 'truck', items: [
        ['Where is my order?', 'Every order page shows a live timeline. As soon as a parcel leaves the warehouse you get a tracking link by email and push notification — the same data our support team sees.'],
        ['Can I change my delivery address?', 'Yes, up until the parcel is handed to the carrier. Open the order in your account and use “Edit delivery”. After dispatch we can redirect with the carrier, but not always to a different country.'],
        ['Do you deliver on weekends?', 'Standard and express services run Monday to Saturday. Sunday delivery is available in 14 metro areas and shows up as an option at checkout if your postcode qualifies.'],
        ['What if my parcel goes missing?', 'Tell us within 30 days of the last tracking event. We open a carrier investigation immediately and refund or resend as soon as it concludes — usually within five working days.']
      ]
    },
    {
      title: 'Returns & refunds', icon: 'refresh', items: [
        ['How long do I have?', 'Thirty days from delivery. The item needs to be unused and in its original packaging, but you do not need the shipping box.'],
        ['Who pays for return shipping?', 'We do, on every order in our 19 free-returns countries. Print the label from your account; no printer required in most cities.'],
        ['When do I get my money back?', 'We issue the refund within two working days of the parcel reaching our warehouse. Card refunds then take 3–5 working days to appear, PayPal is usually same-day.'],
        ['Can I exchange instead?', 'Yes — start the return and choose “Exchange”. We dispatch the replacement as soon as the return is scanned, so you are not waiting for the refund to clear first.']
      ]
    },
    {
      title: 'Payments & security', icon: 'lock', items: [
        ['Which payment methods do you take?', 'Visa, Mastercard, American Express, PayPal, Apple Pay and Google Pay, plus Nova Pay instalments on orders over $150.'],
        ['Is my card data safe?', 'Card details never touch our servers. Payments run through a PCI-DSS Level 1 processor with 3-D Secure on every transaction above $50.'],
        ['Why was my card declined?', 'Most declines come from a billing address mismatch or a bank fraud hold. Check the address on your card statement, or try a different method — no funds are captured on a failed attempt.'],
        ['Can I split the payment?', 'Nova Pay splits any order over $150 into four interest-free payments taken fortnightly, or 12 monthly payments at 9.9% APR.']
      ]
    },
    {
      title: 'Account & rewards', icon: 'award', items: [
        ['How do points work?', 'You earn 1 point per dollar spent, 50 for a verified review and 200 for a referral. Points convert to credit at 100 points = $1.'],
        ['Do points expire?', 'Twelve months after they land. We email you 30 days before any balance expires so nothing disappears quietly.'],
        ['What do the tiers do?', 'Silver, Gold and Platinum multiply the points you earn — 1×, 1.5× and 2×. Tier is recalculated on the first of every month from the last 12 months of spend.'],
        ['Can I delete my account?', 'Yes — Settings → Privacy → Delete account. Order records are anonymised rather than deleted, because tax law requires us to keep them.']
      ]
    },
    {
      title: 'Products & stock', icon: 'package', items: [
        ['Are your products genuine?', 'We buy direct from the brand or from authorised distribution. No grey imports, no parallel stock, and the manufacturer warranty applies in every region we ship to.'],
        ['How accurate are the “was” prices?', 'The strikethrough price is the lowest price we actually charged in the preceding 90 days on this site. Not a manufacturer suggestion, not a guess.'],
        ['Something is out of stock — now what?', 'Use “Notify me” on the product page. We email the moment it lands, and restock allocations are first-come, first-served among people who asked.'],
        ['Do you price match?', 'We do not match marketplaces. We do match authorised retailers in your country, and we will refund the difference if a product you bought drops in price within 14 days.']
      ]
    }
  ];

  async function faqPage() {
    const view = await staticPage(renderFaq);
    wireFaq(view);
  }

  function renderFaq() {
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'FAQ' }],
      eyebrow: 'Answers',
      title: 'Frequently asked questions',
      lead: 'The twenty questions our support team answers most, written out in full so you do not have to ask.',
      right: '<div class="searchbox" style="width:min(300px,100%)">' + I.icon('search', 'ic') +
        '<input id="faqQ" placeholder="Search questions…" aria-label="Search questions"></div>'
    }) +
      '<section class="section-sm" style="padding-top:0"><div class="container">' +
      '<div class="row mb-6" style="gap:8px;flex-wrap:wrap">' +
      FAQ_GROUPS.map((g, i) => '<a class="chip" href="#faqGroup' + i + '">' + I.icon(g.icon, '', 'width:14px;height:14px') + U.h(g.title) + '</a>').join('') +
      '</div>' +
      FAQ_GROUPS.map((g, gi) =>
        '<div class="mb-7" data-faqgroup id="faqGroup' + gi + '">' +
        '<div class="row mb-4" style="gap:12px">' + iconTile(g.icon, 40) + '<h3 style="font-size:20px">' + U.h(g.title) + '</h3></div>' +
        '<div class="col" style="gap:10px">' +
        g.items.map((it, ii) => faqItem(gi + '-' + ii, it[0], it[1])).join('') +
        '</div></div>').join('') +
      '<div id="faqEmpty" class="hidden">' + UI.empty({
        icon: 'search',
        title: 'No question matches that',
        text: 'Try a shorter phrase, or send it to us directly — we answer in minutes.',
        actions: '<a class="btn btn-primary" href="#/contact">Contact support</a>'
      }) + '</div>' +
      '</div></section>' + helpCta();
  }

  function faqItem(id, q, a) {
    return '<div class="card" style="overflow:hidden" data-faqitem="' + U.h((q + ' ' + a).toLowerCase()) + '">' +
      '<button class="faq-q" data-faqtoggle="' + id + '" aria-expanded="false" ' +
      'style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;text-align:left;font-weight:600;font-size:15px">' +
      '<span>' + U.h(q) + '</span>' +
      '<span class="chev" style="flex:none;color:var(--text-muted);transition:transform .2s var(--ease);display:inline-flex">' +
      I.icon('chevronDown', '', 'width:18px;height:18px') + '</span></button>' +
      '<div class="faq-a hidden" data-faqbody="' + id + '">' +
      '<div class="muted" style="padding:0 20px 20px;font-size:14px;line-height:1.7">' + U.h(a) + '</div></div></div>';
  }

  function wireFaq(view) {
    view.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-faqtoggle]');
      if (!btn) return;
      const id = btn.dataset.faqtoggle;
      const body = U.qs('[data-faqbody="' + id + '"]', view);
      if (!body) return;
      const open = body.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', open);
      const chev = btn.querySelector('.chev');
      if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
    });

    U.qs('#faqQ', view).addEventListener('input', U.debounce((e) => {
      const term = e.target.value.trim().toLowerCase();
      let any = false;
      U.qsa('[data-faqitem]', view).forEach(item => {
        const ok = !term || item.dataset.faqitem.indexOf(term) >= 0;
        item.classList.toggle('hidden', !ok);
        if (ok) any = true;
        if (ok && term) {
          const body = item.querySelector('.faq-a');
          if (body) { body.classList.remove('hidden'); const chev = item.querySelector('.chev'); if (chev) chev.style.transform = 'rotate(180deg)'; }
        } else if (!term) {
          const body = item.querySelector('.faq-a');
          if (body) { body.classList.add('hidden'); const chev = item.querySelector('.chev'); if (chev) chev.style.transform = ''; }
        }
      });
      U.qsa('[data-faqgroup]', view).forEach(g => {
        const visible = U.qsa('[data-faqitem]', g).filter(i => !i.classList.contains('hidden')).length;
        g.classList.toggle('hidden', !visible);
      });
      U.qs('#faqEmpty', view).classList.toggle('hidden', any);
    }, 160));
  }

  /* ---------- Shipping ---------- */
  async function shippingPage() {
    await staticPage(renderShipping);
  }

  function renderShipping() {
    const methods = [
      { name: 'Standard', price: 'Free over $50 · otherwise $5.90', eta: '3–5 working days', track: 'Full tracking', note: 'Our default. Carbon-offset on every parcel.' },
      { name: 'Express', price: '$12.90', eta: '1–2 working days', track: 'Full tracking + SMS', note: 'Order before 14:00 PT for next-day dispatch.' },
      { name: 'Next day', price: '$19.90', eta: 'Next working day', track: 'Signature on delivery', note: 'Available in 14 metro areas, Mon–Fri only.' },
      { name: 'International', price: 'From $16.90', eta: '5–12 working days', track: 'Full tracking + duties prepaid', note: 'Delivered duty paid — nothing to pay on arrival.' },
      { name: 'Click & collect', price: 'Free', eta: 'Same day in selected cities', track: 'Ready-in-2-hours alert', note: 'Pick up from a partner store near you.' }
    ];
    const regions = [
      { name: 'Americas', items: [['United States', '2–5 days', 'Free over $50'], ['Canada', '4–7 days', 'From $14.90'], ['Mexico', '6–10 days', 'From $18.90'], ['Brazil', '8–14 days', 'From $24.90']] },
      { name: 'Europe', items: [['United Kingdom', '4–6 days', 'From $12.90'], ['Germany', '4–7 days', 'From $12.90'], ['France', '4–7 days', 'From $13.90'], ['Spain & Portugal', '5–8 days', 'From $14.90']] },
      { name: 'Asia-Pacific', items: [['Japan', '5–8 days', 'From $16.90'], ['Australia', '6–10 days', 'From $18.90'], ['Singapore', '5–8 days', 'From $15.90'], ['New Zealand', '7–11 days', 'From $21.90']] }
    ];

    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Shipping' }],
      eyebrow: 'Delivery',
      title: 'Shipping, start to finish',
      lead: 'Five ways to get your order, 42 countries, and a delivery date you can actually plan around. Every estimate below is measured from dispatch, working days.',
      right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/returns">Returns policy</a>' +
        '<a class="btn btn-primary" href="#/shop">Start shopping</a></div>'
    }) +
      '<section class="section-sm" style="padding-top:8px"><div class="container">' +

      /* Methods table */
      '<div class="card" style="padding:clamp(18px,3vw,28px);overflow:auto">' +
      '<h3 style="font-size:20px">Compare the services</h3>' +
      '<table class="table mt-4"><thead><tr><th>Service</th><th>Cost</th><th>Transit</th><th>Tracking</th><th>Good to know</th></tr></thead><tbody>' +
      methods.map(m => '<tr><td><b>' + U.h(m.name) + '</b></td><td>' + U.h(m.price) + '</td><td>' + U.h(m.eta) + '</td><td>' + U.h(m.track) +
        '</td><td class="muted" style="font-size:13px">' + U.h(m.note) + '</td></tr>').join('') +
      '</tbody></table></div>' +

      /* Timeline */
      '<div class="grid grid-2 mt-7" style="gap:var(--s-7);align-items:start">' +
      '<div><div class="eyebrow"><span class="dot"></span>What happens next</div>' +
      '<h3 class="mt-3" style="font-size:24px">From click to doorstep</h3>' +
      '<div class="timeline mt-5">' +
      [['Order placed', 'We pre-authorise your card and reserve stock across our warehouses.'],
      ['Picked & packed', 'Usually within four working hours. You get an email with the contents list.'],
      ['Handed to carrier', 'Tracking goes live. This is when the transit clock starts.'],
      ['In transit', 'Scan events appear on your order page as they happen, not in batches.'],
      ['Delivered', 'Photo confirmation for signature services, safe-place note otherwise.']]
        .map((m, i) => '<div class="tl' + (i < 2 ? ' done' : '') + '"><div class="rail"><span class="dot"></span><span class="bar"></span></div>' +
          '<div class="c"><div class="t">' + U.h(m[0]) + '</div><div class="d">' + U.h(m[1]) + '</div></div></div>').join('') +
      '</div></div>' +
      '<div class="col gap-4">' +
      infoCard('clock', 'Cut-off times', 'Orders placed before 14:00 PT on a working day are dispatched the same day. Weekend orders leave on Monday, except Sunday metro slots.') +
      infoCard('globe', 'Duties and taxes', 'International orders ship delivered-duty-paid. The price you see at checkout is the final price — no surprise invoice from the courier.') +
      infoCard('mapPin', 'Address changes', 'Editable until dispatch from your account. After that the carrier can redirect within the same country for a small fee.') +
      infoCard('package', 'Bulky items', 'Furniture and anything over 30kg ship on a two-person service with a booked four-hour window. We call first, we never leave it on the kerb.') +
      '</div></div>' +

      /* Regions */
      '<div class="mt-8">' +
      UI.sectionHeader({ eyebrow: 'Where we ship', title: 'Countries and transit times', lead: 'A representative sample — the full list of 42 countries is shown at checkout once you enter your address.' }) +
      '<div class="grid grid-3 reveal-stagger">' +
      regions.map(r => '<div class="card" style="padding:20px"><h4 style="font-size:16px">' + U.h(r.name) + '</h4>' +
        '<table class="table mt-3" style="font-size:13px"><tbody>' +
        r.items.map(it => '<tr><td>' + U.h(it[0]) + '</td><td style="text-align:right;color:var(--text-muted)">' + U.h(it[1]) +
          '</td><td style="text-align:right;font-weight:600">' + U.h(it[2]) + '</td></tr>').join('') +
        '</tbody></table></div>').join('') +
      '</div></div>' +

      '<div class="flash mt-7">' +
      '<div class="row-between" style="flex-wrap:wrap;gap:16px;align-items:center">' +
      '<div><h4>Free shipping, no mental arithmetic</h4>' +
      '<p class="muted mt-2" style="font-size:14px;max-width:52ch">Standard delivery is free on every order over $50, in every country we serve. Under that it is a flat $5.90, and we tell you how much more you need to spend before you reach checkout.</p></div>' +
      '<a class="btn btn-primary btn-lg" href="#/shop">Shop now ' + I.icon('arrowRight') + '</a></div>' +
      '</div>' +
      '</div></section>' + helpCta();
  }

  /* ---------- Returns ---------- */
  async function returnsPage() {
    await staticPage(renderReturns);
  }

  function renderReturns() {
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Returns' }],
      eyebrow: '30 days, no interrogation',
      title: 'Returns & refunds',
      lead: 'Changed your mind, wrong size, or it simply is not what you hoped — the process is the same and it costs you nothing.',
      right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/shipping">Shipping info</a>' +
        '<a class="btn btn-primary" href="#/account/orders">Start a return</a></div>'
    }) +
      '<section class="section-sm" style="padding-top:8px"><div class="container">' +

      '<div class="grid grid-2" style="gap:var(--s-7);align-items:start">' +
      '<div><div class="eyebrow"><span class="dot"></span>The process</div>' +
      '<h3 class="mt-3" style="font-size:24px">Five steps, about six days</h3>' +
      '<div class="timeline mt-5">' +
      [['Start it online', 'Open the order, pick the items, tell us why. One minute, no phone call.'],
      ['Print the label', 'Free prepaid label by email. No printer? Show the QR code at any drop-off point.'],
      ['Send it back', 'Drop it anywhere in the carrier network. Keep the receipt until it is scanned.'],
      ['We check it', 'Two working days at the warehouse. We only look for what you told us about.'],
      ['Refund released', 'Issued the same day it clears. Cards take 3–5 more days to show it.']]
        .map((m, i) => '<div class="tl done"><div class="rail"><span class="dot"></span><span class="bar"></span></div>' +
          '<div class="c"><div class="soft" style="font-size:11px;font-weight:700;letter-spacing:.1em">STEP ' + (i + 1) + '</div>' +
          '<div class="t">' + U.h(m[0]) + '</div><div class="d">' + U.h(m[1]) + '</div></div></div>').join('') +
      '</div></div>' +

      '<div class="col gap-4">' +
      infoCard('clock', 'Thirty days, from delivery', 'Not from purchase, not from dispatch. The clock starts the day the parcel reaches you, and we count calendar days.') +
      infoCard('package', 'Condition we need', 'Unused and complete, with the original packaging. The outer shipping box is not required — reuse anything that protects it.') +
      infoCard('refresh', 'Exchanges ship first', 'Choose an exchange and we dispatch the replacement as soon as your return is scanned, before the refund clears.') +
      infoCard('credit', 'Refund to the original method', 'Card refunds go back to the same card, PayPal to the same account. Store credit is available if you prefer, with a 5% bonus.') +
      '</div></div>' +

      '<div class="grid grid-2 mt-8" style="gap:var(--s-6);align-items:start">' +
      '<div class="card" style="padding:clamp(18px,3vw,26px)">' +
      '<h4>Returnable & not</h4>' +
      '<table class="table mt-3"><tbody>' +
      [['Everything in the catalogue', '30 days', 'up'],
      ['Personalised or engraved items', 'Not returnable', 'down'],
      ['Underwear & swimwear', 'Not returnable if opened', 'down'],
      ['Faulty on arrival', '60 days, full refund', 'up'],
      ['Digital licences', 'Not returnable once redeemed', 'down']]
        .map(r => '<tr><td>' + U.h(r[0]) + '</td><td style="text-align:right;font-weight:600" class="' + r[2] + '">' + U.h(r[1]) + '</td></tr>').join('') +
      '</tbody></table>' +
      '<p class="muted mt-4" style="font-size:13px">Faulty items are always covered — statutory rights sit alongside this policy and never reduce it.</p>' +
      '</div>' +
      '<div class="card" style="padding:clamp(18px,3vw,26px)">' +
      '<h4>Refund timing</h4>' +
      '<table class="table mt-3"><tbody>' +
      [['Store credit', 'Instant'], ['PayPal', 'Same working day'], ['Credit & debit card', '3–5 working days'],
      ['Nova Pay instalments', 'Schedule cancelled, paid instalments refunded'], ['Bank transfer', '2–3 working days']]
        .map(r => '<tr><td>' + U.h(r[0]) + '</td><td style="text-align:right;font-weight:600">' + U.h(r[1]) + '</td></tr>').join('') +
      '</tbody></table>' +
      '<p class="muted mt-4" style="font-size:13px">If a refund has not appeared after seven working days, message us and we will chase it with the bank on your behalf.</p>' +
      '</div></div>' +
      '</div></section>' + helpCta();
  }

  /* ---------- Legal ---------- */
  const LEGAL_TABS = [
    {
      id: 'privacy', label: 'Privacy', updated: '12 September 2026',
      intro: 'We collect the minimum needed to ship your order and improve the store. Nothing here is sold, and nothing here is shared with advertisers.',
      sections: [
        ['What we collect', 'Your name, delivery and billing addresses, email, phone number and order history. If you contact us we keep that correspondence. If you browse while signed out we keep only an anonymous session identifier.'],
        ['Why we collect it', 'To fulfil orders, handle returns, prevent fraud, meet tax obligations and — only with your consent — send you marketing email. Each purpose has a lawful basis recorded in our processing register.'],
        ['Payment data', 'Card details are captured by our payment processor and never reach NOVA systems. We store only the card brand, last four digits and expiry so you can recognise the card later.'],
        ['Your rights', 'You can request a copy of your data, correct it, delete it, or restrict how we use it. Use Settings → Privacy, or email privacy@nova.example. We respond within 30 days and never charge for it.'],
        ['Retention', 'Order records are kept for seven years because tax law requires it. Marketing consent is kept until you withdraw it. Server logs are rotated after 90 days.']
      ]
    },
    {
      id: 'terms', label: 'Terms', updated: '12 September 2026',
      intro: 'The agreement between you and NOVA when you place an order. Plain language where possible; the binding bits are still binding.',
      sections: [
        ['The contract', 'Your order is an offer to buy. The contract forms when we send the dispatch confirmation — not when you receive the automatic order acknowledgement. If we cannot fulfil it we cancel and refund in full.'],
        ['Pricing', 'Prices include applicable taxes unless stated otherwise and exclude delivery, which is shown separately before you pay. If a pricing error is obvious and unmistakable we may cancel the order and refund rather than honour it.'],
        ['Availability', 'Stock levels are live but not guaranteed. If an item sells out between your order and our pick, we refund that line immediately and ship the rest unless you tell us otherwise.'],
        ['Liability', 'We are responsible for losses caused by our breach of these terms or by our negligence. We are not responsible for indirect losses, loss of profit, or anything arising from misuse of a product. Nothing here limits your statutory rights.'],
        ['Governing law', 'These terms are governed by the laws of the State of Oregon. Nothing prevents you from bringing a claim in your country of residence where local consumer law gives you that right.']
      ]
    },
    {
      id: 'cookies', label: 'Cookies', updated: '12 September 2026',
      intro: 'Four categories, all explained below. Strictly necessary cookies are the only ones you cannot switch off — the site genuinely stops working without them.',
      sections: [
        ['Strictly necessary', 'Session, basket, security and load balancing. No consent required, no profiling, retained for the length of your session or up to 30 days.'],
        ['Preferences', 'Remember your currency, language, theme and recently viewed products. Stored locally, never sent to a third party.'],
        ['Analytics', 'Aggregated page views, search terms with no results, and checkout drop-off points. IP addresses are truncated before storage and reports are never at an individual level.'],
        ['Marketing', 'Only if you opt in. Used to measure whether an email campaign led to a purchase, and to stop showing you an offer you have already used.'],
        ['Managing them', 'Settings → Privacy → Cookies lets you change categories at any time. Your browser can also block cookies entirely, though checkout will not work with strictly necessary cookies disabled.']
      ]
    }
  ];

  async function legalPage(ctx) {
    const view = await staticPage(() => renderLegal(ctx));
    wireLegal(view);
  }

  function renderLegal(ctx) {
    const initial = (ctx && ctx.query && ctx.query.tab) || 'privacy';
    const active = LEGAL_TABS.find(t => t.id === initial) || LEGAL_TABS[0];
    return pageHead({
      crumbs: [{ label: 'Home', href: '#/' }, { label: 'Legal' }],
      eyebrow: 'Last updated ' + active.updated,
      title: 'Legal & policies',
      lead: 'Three documents, one page. Switch between the privacy policy, the terms of sale and the cookie notice below.',
      right: '<div class="row" style="gap:8px"><a class="btn btn-secondary" href="#/contact">Ask a question</a></div>'
    }) +
      '<section class="section-sm" style="padding-top:0"><div class="container">' +
      '<div class="row-between mb-5" style="flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" id="legalTabs">' +
      LEGAL_TABS.map(t => '<button data-ltab="' + t.id + '" class="' + (t.id === active.id ? 'active' : '') + '">' + U.h(t.label) + '</button>').join('') +
      '</div>' +
      '<span class="soft" style="font-size:13px">Version ' + U.h(active.updated) + '</span></div>' +
      '<div id="legalPanel">' + legalPanel(active) + '</div>' +
      '</div></section>' + helpCta();
  }

  function legalPanel(tab) {
    return '<div class="grid" style="grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:var(--s-7);align-items:start">' +
      '<aside class="card" style="padding:18px;position:sticky;top:calc(var(--nav-h) + 16px)">' +
      '<div class="soft" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700">On this page</div>' +
      '<div class="col gap-2 mt-3">' +
      tab.sections.map((s, i) => '<a class="muted" style="font-size:13px" href="#legal-' + tab.id + '-' + i + '">' + U.h(s[0]) + '</a>').join('') +
      '</div>' +
      '<hr class="my-4">' +
      '<p class="soft" style="font-size:12px;line-height:1.6">Written in consultation with our counsel and reviewed twice a year. Previous versions available on request.</p>' +
      '</aside>' +
      '<div>' +
      '<h2 style="font-size:clamp(24px,3vw,34px)">' + U.h(tab.label) + ' policy</h2>' +
      '<p class="muted mt-3" style="font-size:16px;line-height:1.7;max-width:70ch">' + U.h(tab.intro) + '</p>' +
      '<div class="col gap-6 mt-7">' +
      tab.sections.map((s, i) => '<section id="legal-' + tab.id + '-' + i + '" style="scroll-margin-top:96px">' +
        '<h3 style="font-size:19px">' + U.h(s[0]) + '</h3>' +
        '<p class="muted mt-3" style="line-height:1.75;max-width:74ch">' + U.h(s[1]) + '</p></section>').join('') +
      '</div></div></div>';
  }

  function wireLegal(view) {
    U.qs('#legalTabs', view).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ltab]');
      if (!btn) return;
      const tab = LEGAL_TABS.find(t => t.id === btn.dataset.ltab);
      if (!tab) return;
      U.qsa('#legalTabs button', view).forEach(b => b.classList.toggle('active', b === btn));
      U.qs('#legalPanel', view).innerHTML = legalPanel(tab);
      const stamp = U.qs('.page-head .eyebrow', view);
      if (stamp) stamp.innerHTML = '<span class="dot"></span>Last updated ' + U.h(tab.updated);
    });
  }

  /* ============================================================
     8. 404
     ============================================================ */
  async function notFoundPage(ctx) {
    const view = U.qs('#view');
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:380px"></div></div>';
    await U.sleep(300);
    view.innerHTML = render404(ctx);
    const input = U.qs('#nfSearch', view);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const v = input.value.trim();
        if (v) window.location.hash = '#/search?q=' + encodeURIComponent(v);
      });
    }
    finish(view);
  }

  function render404(ctx) {
    const missed = (ctx && ctx.path) ? ctx.path : '';
    const cats = D.categories.slice(0, 6);
    const picks = D.products.slice().sort((a, b) => b.rating * Math.log(b.reviews + 10) - a.rating * Math.log(a.reviews + 10)).slice(0, 4);

    const art =
      '<svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:360px;height:auto" aria-hidden="true">' +
      '<ellipse cx="178" cy="196" rx="128" ry="13" fill="var(--surface-3)"/>' +
      '<rect x="96" y="66" width="164" height="112" rx="20" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<path d="M96 100h164" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<path d="M96 100l82 56 82-56" stroke="var(--border-strong)" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="118" cy="83" r="4.5" fill="var(--border-strong)"/>' +
      '<circle cx="134" cy="83" r="4.5" fill="var(--border-strong)"/>' +
      '<path d="M150 83h86" stroke="var(--border-strong)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="246" cy="52" r="26" fill="var(--bg)" stroke="var(--accent-400)" stroke-width="3"/>' +
      '<path d="M266 72l16 16" stroke="var(--accent-400)" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M232 42l-9 9M244 30l4 10" stroke="var(--accent-300)" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M62 140c-14 6-22 18-22 32" stroke="var(--accent-300)" stroke-width="2.5" stroke-dasharray="5 7" stroke-linecap="round"/>' +
      '<path d="M300 138c16 8 24 20 24 34" stroke="var(--accent-300)" stroke-width="2.5" stroke-dasharray="5 7" stroke-linecap="round"/>' +
      '</svg>';

    return '<section class="section"><div class="container">' +
      '<div class="text-center" style="max-width:760px;margin-inline:auto">' +
      '<div style="display:flex;justify-content:center;margin-bottom:8px">' + art + '</div>' +
      '<h1 style="font-size:clamp(72px,14vw,168px);line-height:.9;letter-spacing:-.06em;' +
      'background:var(--aurora);-webkit-background-clip:text;background-clip:text;color:transparent">404</h1>' +
      '<h2 class="mt-3" style="font-size:clamp(20px,2.6vw,30px)">This page took a wrong turn</h2>' +
      '<p class="muted mt-4" style="max-width:52ch;margin-inline:auto">' +
      (missed ? 'We could not find <span class="mono">' + U.h(missed) + '</span>. ' : '') +
      'It may have moved, been renamed, or never existed in the first place. Try a search — or start from one of the departments below.</p>' +
      '<div class="searchbox input-lg mt-6" style="max-width:520px;margin-inline:auto">' + I.icon('search', 'ic') +
      '<input id="nfSearch" placeholder="Search for anything…" aria-label="Search" style="font-size:16px"></div>' +
      '<div class="row" style="justify-content:center;gap:10px;margin-top:24px;flex-wrap:wrap">' +
      '<a class="btn btn-primary btn-lg" href="#/">' + I.icon('home') + 'Back home</a>' +
      '<a class="btn btn-secondary btn-lg" href="#/shop">' + I.icon('grid') + 'Go to the shop</a>' +
      '<a class="btn btn-ghost btn-lg" href="#/contact">Report a broken link</a></div>' +
      '</div>' +

      '<div class="mt-8"><div class="row-between mb-4" style="flex-wrap:wrap;gap:10px">' +
      '<h3 style="font-size:18px">Popular departments</h3>' +
      '<a class="btn btn-sm btn-ghost" href="#/shop">See all ' + I.icon('arrowRight') + '</a></div>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      cats.map(c => '<a class="chip" href="#/shop?cat=' + c.id + '">' + I.icon(c.icon, '', 'width:15px;height:15px') + U.h(c.name) + '</a>').join('') +
      '</div></div>' +

      '<div class="mt-8">' +
      UI.sectionHeader({ eyebrow: 'While you are here', title: 'Most loved right now', action: '<a class="btn btn-secondary" href="#/shop">Browse everything ' + I.icon('arrowRight') + '</a>' }) +
      '<div class="prod-grid cols-4 reveal-stagger">' + picks.map(p => UI.productCard(p)).join('') + '</div>' +
      '</div>' +
      '</div></section>';
  }

  /* ============================================================
     Routes
     ============================================================ */
  R.register('/brands', brandsPage);
  R.register('/brand/:id', brandPage);
  R.register('/deals', dealsPage);
  R.register('/new-arrivals', newArrivalsPage);
  R.register('/compare', comparePage);
  R.register('/search', searchPage);
  R.register('/about', aboutPage);
  R.register('/contact', contactPage);
  R.register('/faq', faqPage);
  R.register('/shipping', shippingPage);
  R.register('/returns', returnsPage);
  R.register('/legal', legalPage);
  R.notFound(notFoundPage);
})();
