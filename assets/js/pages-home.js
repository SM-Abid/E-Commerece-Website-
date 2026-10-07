/* ============================================================
   NOVA — Homepage
   ============================================================ */
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img;

  async function home(ctx) {
    const view = U.qs('#view');
    view.innerHTML =
      '<div class="hero">' +
      '<div class="container">' +
      '<div class="hero-grid">' +
      '<div class="skeleton sk-block" style="height:420px"></div>' +
      '<div class="skeleton sk-block" style="height:420px"></div>' +
      '</div></div></div>' +
      '<div class="container section"><div class="skeleton sk-block" style="height:280px"></div></div>';
    await U.sleep(340);
    view.innerHTML = renderHome();
    UI.observeReveals(view);
    UI.wireCarousel(view);
    startCountdown(view);
    startHeroParallax(view);
  }

  function renderHome() {
    const featured = D.products.filter(p => p.rating >= 4.6).slice(0, 8);
    const newest = D.products.slice().sort((a, b) => a.ageDays - b.ageDays).slice(0, 8);
    const deals = D.products.filter(p => p.off >= 20).slice(0, 8);
    const recs = recommend();

    return '' +
      /* ---------- HERO ---------- */
      '<section class="hero">' +
      '<div class="container">' +
      '<div class="hero-grid">' +
      '<div style="position:relative;z-index:2">' +
      '<div class="eyebrow"><span class="dot"></span>New season · 2026 collection</div>' +
      '<h1 class="mt-3">SHOP <span class="grad">THE FUTURE</span></h1>' +
      '<p class="lead">Discover products designed for the way you live. Curated from 400+ brands, tested by our studio, delivered in two days.</p>' +
      '<div class="ctas">' +
      '<a class="btn btn-primary btn-lg" href="#/shop">Explore Collection ' + I.icon('arrowRight') + '</a>' +
      '<a class="btn btn-secondary btn-lg" href="#/new-arrivals">Shop New Arrivals</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div class="stat"><div class="v">4.8/5</div><div class="l">128k verified reviews</div></div>' +
      '<div class="stat"><div class="v">2-day</div><div class="l">Free delivery</div></div>' +
      '<div class="stat"><div class="v">30-day</div><div class="l">Free returns</div></div>' +
      '<div class="stat"><div class="v">400+</div><div class="l">Curated brands</div></div>' +
      '</div>' +
      '</div>' +
      '<div class="hero-stage" data-parallax="0.4">' +
      '<img src="' + img('1505740420928-5e560c06d30e', 1000, 1000) + '" alt="Premium wireless headphones" width="1000" height="1000" decoding="async">' +
      '<div class="hero-float f1">' +
      '<span class="thumb"><img src="' + img('1542291026-7eec264c27ff', 120, 120) + '" alt=""></span>' +
      '<span><span class="label">Trending now</span><span class="val">Nike Pegasus 42</span></span></div>' +
      '<div class="hero-float f2">' +
      '<span class="thumb"><img src="' + img('1546868871-7041f2a55e12', 120, 120) + '" alt=""></span>' +
      '<span><span class="label">Just dropped</span><span class="val">Watch Ultra 3</span></span></div>' +
      '<div class="hero-float f3" style="flex-direction:column;align-items:flex-start;gap:2px">' +
      '<span class="label">Flash sale ends in</span><span class="val" id="heroMiniCount">05:42:18</span></div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</section>' +

      /* ---------- BRAND MARQUEE ---------- */
      '<section class="section-sm" style="border-top:1px solid var(--border);border-bottom:1px solid var(--border)">' +
      '<div class="container">' +
      '<div class="text-center soft mb-4" style="font-size:12px;letter-spacing:.12em;text-transform:uppercase">Trusted by the world’s best makers</div>' +
      '<div class="marquee"><div class="marquee-track">' +
      D.brands.concat(D.brands).map(b => '<span class="item">' + U.h(b.name) + '</span>').join('') +
      '</div></div></div></section>' +

      /* ---------- CATEGORIES ---------- */
      '<section class="section"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Browse', title: 'Shop by category',
        lead: 'Eleven departments, each curated by people who actually use the products.',
        action: '<a class="btn btn-secondary" href="#/shop">All categories ' + I.icon('arrowRight') + '</a>'
      }) +
      '<div class="cat-grid reveal-stagger">' +
      D.categories.map(c =>
        '<a class="ccard" href="#/shop?cat=' + c.id + '">' +
        '<img src="' + img(c.img, 520, 650) + '" alt="' + U.h(c.name) + '" loading="lazy" decoding="async">' +
        '<span class="ccard-body"><span><span class="name">' + U.h(c.name) + '</span>' +
        '<span class="count">' + c.count.toLocaleString() + ' products · ' + U.h(c.blurb) + '</span></span>' +
        '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>').join('') +
      '</div></div></section>' +

      /* ---------- FEATURED ---------- */
      '<section class="section" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Hand-picked', title: 'Featured this week',
        lead: 'What our editors are buying, gifting and recommending right now.',
        action: '<div class="carousel-nav"><button class="btn btn-secondary" data-carousel="#featTrack" data-dir="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
          '<button class="btn btn-secondary" data-carousel="#featTrack" data-dir="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div>'
      }) +
      '<div class="carousel reveal" id="featTrack">' +
      featured.map(p => '<div style="flex:0 0 clamp(240px,23%,300px)">' + UI.productCard(p) + '</div>').join('') +
      '</div></div></section>' +

      /* ---------- FLASH SALE ---------- */
      '<section class="section"><div class="container">' +
      '<div class="flash reveal">' +
      '<div class="flash-head">' +
      '<div>' +
      '<div class="eyebrow"><span class="dot"></span>Limited time only</div>' +
      '<h2 class="mt-2">FLASH <span class="hot">SALE</span></h2>' +
      '<p class="muted mt-2" style="max-width:48ch">Up to 40% off across audio, home and gaming. When the timer stops, the prices go back.</p>' +
      '</div>' +
      '<div class="col" style="align-items:flex-end;gap:10px">' +
      '<div class="soft" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">Ends in</div>' +
      '<div class="countdown" id="flashCount" role="timer" aria-live="off">' +
      '<span class="unit"><span class="n" data-d>05</span><span class="l">days</span></span><span class="sep">:</span>' +
      '<span class="unit"><span class="n" data-h>42</span><span class="l">hrs</span></span><span class="sep">:</span>' +
      '<span class="unit"><span class="n" data-m>18</span><span class="l">min</span></span><span class="sep">:</span>' +
      '<span class="unit"><span class="n" data-s>32</span><span class="l">sec</span></span>' +
      '</div></div>' +
      '</div>' +
      '<div class="carousel" id="flashTrack">' +
      deals.map((p, i) => flashCard(p, i)).join('') +
      '</div>' +
      '<div class="row" style="justify-content:center;margin-top:24px">' +
      '<a class="btn btn-primary btn-lg" href="#/deals">Shop all deals ' + I.icon('arrowRight') + '</a></div>' +
      '</div></div></section>' +

      /* ---------- RECOMMENDED ---------- */
      '<section class="section" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Personalised', title: 'Recommended for you',
        lead: recs.reason
      }) +
      recs.groups.map(g =>
        '<div class="mb-7">' +
        '<div class="row-between mb-3"><h4>' + U.h(g.title) + '</h4>' +
        '<div class="carousel-nav"><button class="iconbtn" data-carousel="#' + g.id + '" data-dir="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
        '<button class="iconbtn" data-carousel="#' + g.id + '" data-dir="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div></div>' +
        '<div class="carousel" id="' + g.id + '">' + g.items.map(p => '<div>' + UI.productCard(p) + '</div>').join('') + '</div>' +
        '</div>').join('') +
      '</div></section>' +

      /* ---------- EDITORIAL SPLIT ---------- */
      '<section class="section"><div class="container">' +
      '<div class="grid grid-2" style="gap:var(--s-6);align-items:stretch">' +
      '<a class="ccard" href="#/shop?cat=home" style="aspect-ratio:16/11">' +
      '<img src="' + img('1555041469-a586c61ea9bc', 1100, 760) + '" alt="Home collection" loading="lazy">' +
      '<span class="ccard-body"><span><span class="name">The Home Reset</span><span class="count">Furniture & lighting, up to 30% off</span></span>' +
      '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>' +
      '<a class="ccard" href="#/shop?cat=audio" style="aspect-ratio:16/11">' +
      '<img src="' + img('1560343090-f0409e92791a', 1100, 760) + '" alt="Audio collection" loading="lazy">' +
      '<span class="ccard-body"><span><span class="name">Sound, Reimagined</span><span class="count">Studio-grade audio for everywhere</span></span>' +
      '<span class="ccard-arrow">' + I.icon('arrowRight', '', 'width:16px;height:16px') + '</span></span></a>' +
      '</div></div></section>' +

      /* ---------- NEWEST ---------- */
      '<section class="section"><div class="container">' +
      UI.sectionHeader({
        eyebrow: 'Fresh in', title: 'Just landed',
        lead: 'The newest additions to the catalogue, updated daily.',
        action: '<a class="btn btn-secondary" href="#/new-arrivals">See all new ' + I.icon('arrowRight') + '</a>'
      }) +
      '<div class="prod-grid cols-4 reveal-stagger">' + newest.map(p => UI.productCard(p)).join('') + '</div>' +
      '</div></section>' +

      /* ---------- VALUE PROPS ---------- */
      '<section class="section-sm" style="border-top:1px solid var(--border)"><div class="container">' +
      '<div class="grid grid-4" style="gap:var(--s-5)">' +
      valueProp('truck', 'Free shipping over $50', 'Two-day delivery on thousands of items, free over $50.') +
      valueProp('refresh', '30-day free returns', 'Changed your mind? Return anything within 30 days.') +
      valueProp('shield', 'Secure checkout', 'PCI-DSS compliant, 3-D Secure, buyer protection.') +
      valueProp('chat', 'Real human support', 'Average first reply under 4 minutes, 7 days a week.') +
      '</div></div></section>' +

      /* ---------- TESTIMONIALS ---------- */
      '<section class="section" style="background:var(--bg-soft);border-block:1px solid var(--border)"><div class="container">' +
      UI.sectionHeader({ eyebrow: 'Social proof', title: '128,000 reviews and counting', lead: 'Verified buyers only — we never filter by sentiment.' }) +
      '<div class="grid grid-3 reveal-stagger">' +
      [['Amara O.', 'Portland, OR', 'Ordered a sofa on Sunday, it was in my living room on Tuesday. The quality is genuinely better than what I replaced.', 5],
      ['Daniel K.', 'Chicago, IL', 'The product pages actually tell you what you need to know. Specs, real photos, honest reviews. Rare.', 5],
      ['Priya S.', 'Austin, TX', 'Price dropped two days after I bought. They refunded the difference without me asking. That is how you earn loyalty.', 5]]
        .map(([who, where, body, st]) =>
          '<div class="card" style="padding:24px">' + I.stars(st) +
          '<p style="margin-top:12px;font-size:15px;line-height:1.6">' + U.h(body) + '</p>' +
          '<div class="row mt-4" style="gap:10px"><span class="badge badge-glass">' + U.h(who) + '</span><span class="soft" style="font-size:13px">' + U.h(where) + '</span></div>' +
          '</div>').join('') +
      '</div></div></section>' +

      /* ---------- CTA ---------- */
      '<section class="section"><div class="container">' +
      '<div class="deals-hero reveal text-center">' +
      '<div class="eyebrow" style="justify-content:center"><span class="dot"></span>Members save more</div>' +
      '<h2 class="mt-3">Join NOVA Rewards</h2>' +
      '<p class="muted mt-3" style="max-width:52ch;margin-inline:auto">Earn points on every order, review and referral — then trade them for real money off. Free to join, no tiers to unlock.</p>' +
      '<div class="row" style="justify-content:center;gap:10px;margin-top:24px;flex-wrap:wrap">' +
      '<a class="btn btn-primary btn-lg" href="#/account/rewards">See your rewards</a>' +
      '<a class="btn btn-secondary btn-lg" href="#/deals">Today’s deals</a></div>' +
      '</div></div></section>';
  }

  function valueProp(icon, title, text) {
    return '<div class="row" style="gap:14px;align-items:flex-start">' +
      '<span style="width:44px;height:44px;border-radius:12px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;flex:none;color:var(--accent-500)">' +
      I.icon(icon, '', 'width:22px;height:22px') + '</span>' +
      '<span><b style="display:block;font-size:14px">' + U.h(title) + '</b><span class="muted" style="font-size:13px">' + U.h(text) + '</span></span></div>';
  }

  function flashCard(p, i) {
    const claimed = 55 + Math.floor(U.rnd(i * 17) * 38);
    return '<div style="flex:0 0 clamp(220px,22%,280px)">' +
      '<div class="pcard">' +
      '<div class="pcard-media">' +
      '<img src="' + img(p.imgs[0], 500, 625) + '" alt="' + U.h(p.name) + '" loading="lazy">' +
      '<div class="pcard-badges"><div class="left">' +
      '<span class="badge" style="background:#FF3B5C;color:#fff;border:0">-' + p.off + '%</span>' +
      (p.badge ? UI.badgeHtml(p) : '') + '</div>' +
      '<div class="right"><button class="iconbtn pcard-wish' + (S.inWishlist(p.id) ? ' active' : '') + '" data-wish="' + p.id + '" style="width:34px;height:34px">' + I.icon('heart') + '</button></div></div>' +
      '<div class="pcard-actions"><button class="btn btn-primary btn-sm btn-block" data-add="' + p.id + '">' + I.icon('cart') + 'Add to cart</button></div>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<h3 class="pcard-name"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></h3>' +
      '<div style="margin-top:6px">' + UI.priceHtml(p) + '</div>' +
      '<div class="mt-2"><div class="row-between" style="font-size:11px;margin-bottom:4px">' +
      '<span class="stock-line"><span class="rem">' + claimed + '% claimed</span></span>' +
      '<span class="stock-line">Only <span class="rem">' + Math.max(1, p.stock) + '</span> left</span></div>' +
      '<div class="progress"><div class="bar" style="width:' + claimed + '%;background:#FF3B5C"></div></div></div>' +
      '</div></div></div>';
  }

  /* ---------- Recommendations engine (client-side) ---------- */
  function recommend() {
    const st = S.state;
    const groups = [];
    let reason = 'Based on what you have been browsing, saving and buying.';

    if (st.recentlyViewed.length) {
      const seed = D.byId(st.recentlyViewed[0]);
      if (seed) groups.push({
        id: 'recViewed', title: 'Because you viewed ' + seed.name.slice(0, 28),
        items: D.products.filter(x => x.id !== seed.id && (x.cat === seed.cat || x.brandId === seed.brandId)).slice(0, 8)
      });
    }
    if (st.wishlist.length) {
      const cats = st.wishlist.map(id => D.byId(id)).filter(Boolean).map(p => p.cat);
      groups.push({
        id: 'recWish', title: 'More like your wishlist',
        items: D.products.filter(p => cats.includes(p.cat) && !st.wishlist.includes(p.id)).slice(0, 8)
      });
    }
    if (st.purchases.length) {
      const brands = st.purchases.map(id => D.byId(id)).filter(Boolean).map(p => p.brandId);
      groups.push({
        id: 'recBuy', title: 'From brands you buy',
        items: D.products.filter(p => brands.includes(p.brandId)).slice(0, 8)
      });
    }
    if (!groups.length) {
      reason = 'Popular with shoppers in your area this week. Start browsing and this gets smarter.';
      groups.push({ id: 'recPop', title: 'Trending right now', items: D.products.slice().sort((a, b) => b.sold - a.sold).slice(0, 8) });
      groups.push({ id: 'recTop', title: 'Highest rated', items: D.products.slice().sort((a, b) => b.rating - a.rating).slice(0, 8) });
      groups.push({ id: 'recVal', title: 'Best value under $150', items: D.products.filter(p => p.price <= 150 && p.rating >= 4.4).slice(0, 8) });
    } else {
      groups.push({ id: 'recAlso', title: 'You might also like', items: D.products.slice().sort((a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews)).slice(0, 8) });
    }
    return { groups, reason };
  }

  /* ---------- Countdown ---------- */
  let cdTimer = null;
  function startCountdown(view) {
    clearInterval(cdTimer);
    const end = Date.now() + (5 * 86400 + 5 * 3600 + 42 * 60 + 18) * 1000;
    const tick = () => {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      const pad = n => String(n).padStart(2, '0');
      const el = U.qs('#flashCount');
      if (el) {
        el.querySelector('[data-d]').textContent = pad(d);
        el.querySelector('[data-h]').textContent = pad(h);
        el.querySelector('[data-m]').textContent = pad(m);
        el.querySelector('[data-s]').textContent = pad(s);
      }
      const mini = U.qs('#heroMiniCount');
      if (mini) mini.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    };
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  function startHeroParallax(view) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stage = U.qs('.hero-stage');
    if (!stage) return;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      U.qsa('.hero-float', stage).forEach((f, i) => {
        f.style.transform = 'translate3d(' + (x * (14 + i * 8)) + 'px,' + (y * (12 + i * 6)) + 'px,0)';
      });
    });
    stage.addEventListener('mouseleave', () => {
      U.qsa('.hero-float', stage).forEach(f => f.style.transform = '');
    });
  }

  NOVA.Router.register('/', home);
})();
