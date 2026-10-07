/* ============================================================
   NOVA — Product detail page
   ============================================================ */
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img;

  let gallery = { idx: 0, slides: [] };

  async function product(ctx) {
    const view = U.qs('#view');
    const p = D.byId(ctx.params.id);
    if (!p) {
      view.innerHTML = '<div class="container section">' + UI.empty({
        icon: 'alert', title: 'Product not found',
        text: 'This product may have been removed or the link is out of date.',
        actions: '<a class="btn btn-primary" href="#/shop">Browse all products</a>'
      }) + '</div>';
      return;
    }
    S.markViewed(p.id);
    view.innerHTML = '<div class="container section"><div class="pdp">' +
      '<div class="skeleton sk-block" style="height:560px"></div>' +
      '<div><div class="skeleton sk-line" style="width:30%;height:20px"></div>' +
      '<div class="skeleton sk-line mt-3" style="width:80%;height:34px"></div>' +
      '<div class="skeleton sk-line mt-3" style="width:50%;height:28px"></div>' +
      '<div class="skeleton sk-block mt-4" style="height:220px"></div></div>' +
      '</div></div>';
    await U.sleep(360);
    gallery = { idx: 0, slides: p.imgs.concat([]) };
    view.innerHTML = render(p);
    UI.observeReveals(view);
    UI.wireCarousel(view);
    wire(p, view);
    if (location.hash.indexOf('#reviews') > 0) {
      setTimeout(() => { const el = U.qs('#reviews'); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
    }
  }

  /* ---------------- Render ---------------- */
  function render(p) {
    const reviews = D.reviewsFor(p);
    const bd = breakdown(p, reviews);
    const related = D.related(p, 8);
    const bundle = D.boughtTogether(p).slice(0, 2);
    const viewed = S.state.recentlyViewed.filter(id => id !== p.id).slice(0, 6).map(id => D.byId(id)).filter(Boolean);
    const inStock = p.stock > 0;
    const wish = S.inWishlist(p.id);
    const eta = new Date(Date.now() + p.shipDays * 86400000);
    const etaEnd = new Date(Date.now() + (p.shipDays + 2) * 86400000);

    return '' +
      '<div class="breadcrumb-bar"><div class="container" style="padding-block:12px">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span>' +
      '<a href="#/shop">Shop</a><span class="sep">/</span>' +
      '<a href="#/shop?cat=' + p.cat + '">' + U.h(p.catName) + '</a><span class="sep">/</span>' +
      '<span>' + U.h(p.name) + '</span></div></div></div>' +

      '<div class="container" style="padding-block:32px 64px">' +
      '<div class="pdp">' +

      /* ---------- Gallery ---------- */
      '<div class="gallery">' +
      '<div class="gallery-main" id="galMain">' +
      '<div class="track" id="galTrack">' +
      p.imgs.map((im, i) => '<div class="slide"><img src="' + img(im, 900, 900) + '" srcset="' + NOVA.srcset(im, 700) + '" alt="' + U.h(p.name) + ' — image ' + (i + 1) + '" loading="' + (i ? 'lazy' : 'eager') + '" data-zoom="' + im + '"></div>').join('') +
      '</div>' +
      '<div class="gallery-tools">' +
      '<button class="iconbtn" id="galFull" data-tip="Fullscreen" aria-label="Fullscreen">' + I.icon('expand') + '</button>' +
      '<button class="iconbtn" id="galZoom" data-tip="Zoom" aria-label="Zoom">' + I.icon('zoom') + '</button>' +
      '</div>' +
      '<div class="gallery-arrows">' +
      '<button class="iconbtn" data-gal="prev" aria-label="Previous image">' + I.icon('chevronLeft') + '</button>' +
      '<button class="iconbtn" data-gal="next" aria-label="Next image">' + I.icon('chevronRight') + '</button></div>' +
      '<div class="gallery-dots" id="galDots">' + p.imgs.map((_, i) => '<span class="' + (i === 0 ? 'on' : '') + '"></span>').join('') + '</div>' +
      '</div>' +
      '<div class="gallery-thumbs" id="galThumbs">' +
      p.imgs.map((im, i) => '<button class="' + (i === 0 ? 'active' : '') + '" data-go="' + i + '" aria-label="Image ' + (i + 1) + '"><img src="' + img(im, 160, 160) + '" alt="" loading="lazy"></button>').join('') +
      '<button data-video aria-label="Watch video"><img src="' + img(p.imgs[0], 160, 160) + '" alt=""><span class="play">' + I.icon('play') + '</span></button>' +
      '</div>' +
      '</div>' +

      /* ---------- Info ---------- */
      '<div class="pdp-info">' +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      '<a class="badge badge-glass" href="#/brand/' + p.brandId + '">' + U.h(p.brand) + '</a>' +
      UI.badgeHtml(p) +
      (p.off ? '<span class="badge badge-sale">Save ' + S.money(p.was - p.price) + '</span>' : '') +
      '</div>' +
      '<h1 class="mt-3">' + U.h(p.name) + '</h1>' +
      '<div class="row mt-3" style="gap:14px;flex-wrap:wrap">' + UI.ratingBlock(p) +
      '<span class="soft" style="font-size:13px">' + p.sold.toLocaleString() + ' sold</span>' +
      '<button class="btn btn-sm btn-ghost" data-goto="#reviews">Read reviews</button></div>' +

      '<div class="pdp-price">' +
      '<span class="now">' + S.money(p.price) + '</span>' +
      (p.was ? '<span class="was">' + S.money(p.was) + '</span><span class="off">-' + p.off + '%</span>' : '') +
      '</div>' +
      '<div class="pdp-install">or 4 interest-free payments of ' + S.money(p.price / 4) + ' with <b>Nova Pay</b> ' +
      '<span class="dot-sep"></span> <button class="btn btn-sm btn-ghost" style="height:22px;padding:0 6px" data-morepay>See options</button></div>' +

      '<div class="divider" style="margin:22px 0"></div>' +

      /* Color */
      '<div class="input-group"><label>Color: <b id="colorLabel">' + U.h(p.colors[0].name) + '</b></label>' +
      '<div class="swatch-row" id="colorRow">' + p.colors.map((c, i) =>
        '<button class="swatch' + (i === 0 ? ' active' : '') + '" data-color="' + U.h(c.name) + '" title="' + U.h(c.name) + '" aria-label="' + U.h(c.name) + '"><span class="dot" style="background:' + c.hex + '"></span></button>').join('') +
      '</div></div>' +

      /* Size */
      (p.sizes ? '<div class="input-group mt-4"><label class="row-between">Size: <b id="sizeLabel">' + U.h(p.sizes[0]) + '</b>' +
        '<button class="btn btn-sm btn-ghost" data-sizeguide>Size guide</button></label>' +
        '<div class="size-row" id="sizeRow">' + p.sizes.map((s, i) =>
          '<button class="size-btn' + (i === 0 ? ' active' : '') + '" data-size="' + U.h(s) + '">' + U.h(s) + '</button>').join('') + '</div></div>' : '') +

      /* Qty + stock */
      '<div class="row mt-5" style="gap:14px;flex-wrap:wrap">' +
      '<div class="qty" id="qtyBox"><button data-qty="-1" aria-label="Decrease">' + I.icon('minus') + '</button>' +
      '<span class="v" id="qtyVal">1</span><button data-qty="1" aria-label="Increase">' + I.icon('plus') + '</button></div>' +
      '<div>' +
      (inStock
        ? (p.stock <= 10
          ? '<span class="badge" style="background:rgba(239,68,68,.12);color:#B91C1C;border:0">Only ' + p.stock + ' left in stock</span>'
          : '<span class="badge badge-sale">' + I.icon('check', '', 'width:12px;height:12px') + ' In stock</span>')
        : '<span class="badge badge-hot">Out of stock</span>') +
      '<div class="soft" style="font-size:12px;margin-top:6px">' +
      (inStock ? 'Order within <b id="cutoff">3h 24m</b> for delivery by ' + U.formatDate(eta, { month: 'short', day: 'numeric' }) + '–' + U.formatDate(etaEnd, { month: 'short', day: 'numeric' })
        : 'Restock expected in 2–3 weeks') +
      '</div></div></div>' +

      /* Buy row */
      '<div class="buy-row">' +
      (inStock
        ? '<button class="btn btn-primary btn-lg" id="addBtn">' + I.icon('cart') + 'Add to Cart</button>' +
        '<button class="btn btn-secondary btn-lg" id="notifyBtn">' + I.icon('bell') + 'Notify Me</button>'
        : '<button class="btn btn-secondary btn-lg" id="notifyBtn" style="flex:1">' + I.icon('bell') + 'Notify Me When Available</button>') +
      '</div>' +
      (inStock ? '<button class="btn btn-dark btn-lg btn-block mt-2" id="buyNow">' + I.icon('bolt') + 'Buy Now</button>' : '') +
      '<div class="row mt-2" style="gap:8px">' +
      '<button class="btn btn-secondary" style="flex:1" id="wishBtnP">' + I.icon('heart') + (wish ? 'Saved' : 'Wishlist') + '</button>' +
      '<button class="btn btn-secondary btn-icon" id="shareBtn" data-tip="Share" aria-label="Share">' + I.icon('share') + '</button>' +
      '<button class="btn btn-secondary btn-icon" id="cmpBtn" data-tip="Compare" aria-label="Compare">' + I.icon('scale') + '</button>' +
      '<button class="btn btn-secondary btn-icon" id="alertBtn" data-tip="Price drop alert" aria-label="Price drop alert">' + I.icon('tag') + '</button>' +
      '</div>' +

      /* Trust */
      '<div class="trust-list">' +
      trustItem('truck', 'Free 2-day delivery', 'On orders over $50. Ships from Portland, OR.') +
      trustItem('refresh', 'Free 30-day returns', 'No questions asked. Print a label in one click.') +
      trustItem('shield', p.warranty + ' warranty', 'Covered against manufacturing defects.') +
      trustItem('lock', 'Secure checkout', 'Encrypted payment. Buyer protection included.') +
      '</div>' +

      '</div></div>' +

      /* ---------- Bundle ---------- */
      (bundle.length ? '<section class="section-block" id="bundle">' +
        '<h3>Frequently bought together</h3>' +
        '<div class="card" style="padding:20px">' +
        '<div class="row" style="gap:16px;flex-wrap:wrap;align-items:center">' +
        [p].concat(bundle).map((x, i) =>
          '<div class="row" style="gap:12px;align-items:center">' + (i ? '<span class="soft">' + I.icon('plus', '', 'width:16px;height:16px') + '</span>' : '') +
          '<img src="' + img(x.imgs[0], 140, 140) + '" alt="" style="width:82px;height:82px;border-radius:12px;object-fit:cover">' +
          '<div style="max-width:180px"><div style="font-size:13px;font-weight:500;line-height:1.3">' + U.h(x.name) + '</div>' +
          '<div style="font-weight:700;margin-top:4px">' + S.money(x.price) + '</div></div></div>').join('') +
        '<div style="margin-left:auto;text-align:right">' +
        '<div class="soft" style="font-size:12px">Bundle total</div>' +
        '<div style="font-size:22px;font-weight:800">' + S.money([p].concat(bundle).reduce((s, x) => s + x.price, 0) * 0.92) + '</div>' +
        '<div class="soft" style="font-size:12px;text-decoration:line-through">' + S.money([p].concat(bundle).reduce((s, x) => s + x.price, 0)) + '</div>' +
        '<button class="btn btn-primary mt-2" id="addBundle">Add all 3 to cart</button>' +
        '</div></div></div></section>' : '') +

      /* ---------- Details ---------- */
      '<section class="section-block">' +
      '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:22px" id="detailTabs">' +
      ['Description', 'Specifications', 'Features', "What's Included", 'Shipping', 'Returns'].map((x, i) =>
        '<button class="chip' + (i === 0 ? ' active' : '') + '" data-tab="' + U.slug(x) + '">' + x + '</button>').join('') +
      '</div>' +
      '<div id="detailBody">' + tabDescription(p) + '</div>' +
      '</section>' +

      /* ---------- Reviews ---------- */
      '<section class="section-block" id="reviews">' +
      '<h3>Customer Reviews</h3>' +
      '<div class="review-summary mt-5">' +
      '<div class="rating-big"><div class="n">' + p.rating.toFixed(1) + '</div><div class="stars">' + I.stars(p.rating) + '</div>' +
      '<div class="soft" style="font-size:13px">' + p.reviews.toLocaleString() + ' verified reviews</div>' +
      '<button class="btn btn-primary mt-3" id="writeReview">' + I.icon('edit') + 'Write a review</button></div>' +
      '<div class="breakdown">' + bd.map(b =>
        '<div class="row"><span class="s">' + b.s + '★</span><span class="progress"><span class="bar" style="width:' + b.pct + '%"></span></span><span class="p">' + b.pct + '%</span></div>').join('') +
      '<div class="soft" style="font-size:12px;margin-top:8px">92% of reviewers would recommend this product to a friend.</div>' +
      '</div></div>' +
      '<div class="row-between mt-6"><div class="tabs" id="revSort">' +
      '<button class="active" data-rs="helpful">Most helpful</button>' +
      '<button data-rs="newest">Newest</button>' +
      '<button data-rs="high">Highest rated</button>' +
      '<button data-rs="low">Lowest rated</button></div>' +
      '<label class="checkbox"><input type="checkbox" id="revMedia"><span class="box"></span>With photos</label></div>' +
      '<div id="reviewList" class="mt-4">' + reviewList(p, reviews, 'helpful', false) + '</div>' +
      '<button class="btn btn-secondary btn-block mt-4" id="moreReviews">Load more reviews</button>' +
      '</section>' +

      /* ---------- Q&A ---------- */
      '<section class="section-block">' +
      '<div class="row-between"><h3>Questions &amp; Answers</h3>' +
      '<button class="btn btn-secondary btn-sm" id="askBtn">Ask a question</button></div>' +
      '<div class="mt-4">' + D.qa.map(q =>
        '<div class="qa"><div class="q"><span class="k">Q</span>' + U.h(q.q) + '</div>' +
        '<div class="a"><span class="k">A</span><span>' + U.h(q.a) + '</span></div>' +
        '<div class="soft" style="font-size:12px;margin-top:6px">' + U.h(q.who) + ' · ' + q.when + ' days ago</div></div>').join('') +
      '</div></section>' +

      /* ---------- Recently viewed ---------- */
      (viewed.length ? '<section class="section-block">' +
        '<div class="row-between mb-4"><h3>Recently viewed</h3>' +
        '<div class="carousel-nav"><button class="iconbtn" data-carousel="#rvTrack" data-dir="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
        '<button class="iconbtn" data-carousel="#rvTrack" data-dir="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div></div>' +
        '<div class="carousel" id="rvTrack">' + viewed.map(x => '<div>' + UI.productCard(x) + '</div>').join('') + '</div>' +
        '</section>' : '') +

      /* ---------- Related ---------- */
      '<section class="section-block">' +
      '<div class="row-between mb-4"><h3>You may also like</h3>' +
      '<a class="btn btn-secondary btn-sm" href="#/shop?cat=' + p.cat + '">View all ' + U.h(p.catName) + '</a></div>' +
      '<div class="prod-grid cols-4">' + related.map(x => UI.productCard(x)).join('') + '</div>' +
      '</section>' +

      '</div>' +

      /* ---------- Sticky mobile CTA ---------- */
      '<div class="sticky-cta" id="stickyCta">' +
      '<div class="meta"><div class="p">' + S.money(p.price) + '</div>' + (inStock ? 'In stock · ships in ' + p.shipDays + ' days' : 'Out of stock') + '</div>' +
      (inStock ? '<button class="btn btn-primary" data-add="' + p.id + '">' + I.icon('cart') + 'Add</button>' : '<button class="btn btn-secondary" id="notifyBtn2">Notify me</button>') +
      '</div>';
  }

  function trustItem(icon, title, text) {
    return '<div class="item">' + I.icon(icon) + '<span><b>' + U.h(title) + '</b> — <span class="muted">' + U.h(text) + '</span></span></div>';
  }

  function breakdown(p, reviews) {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => counts[r.stars]++);
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map(s => ({ s: s, pct: Math.round((counts[s] / total) * 100) }));
  }

  function reviewList(p, reviews, sort, mediaOnly) {
    let list = reviews.slice();
    if (mediaOnly) list = list.filter(r => r.media && r.media.length);
    if (sort === 'newest') list.sort((a, b) => b.when - a.when);
    else if (sort === 'high') list.sort((a, b) => b.stars - a.stars);
    else if (sort === 'low') list.sort((a, b) => a.stars - b.stars);
    else list.sort((a, b) => b.helpful - a.helpful);
    return list.map(r =>
      '<div class="review">' +
      '<div class="avatar">' + U.h(r.who[0]) + '</div>' +
      '<div style="flex:1">' +
      '<div class="row-between"><div><div class="who">' + U.h(r.who) + (r.verified ? ' <span class="verified">' + I.icon('check', '', 'width:12px;height:12px;display:inline;vertical-align:-2px') + ' Verified</span>' : '') + '</div>' +
      '<div class="row" style="gap:8px;margin-top:2px">' + I.stars(r.stars) + '<span class="when">' + U.formatDate(r.when) + '</span>' +
      '<span class="when">· ' + U.h(r.variant) + '</span></div></div>' +
      '<b style="font-size:14px">' + U.h(r.title) + '</b></div>' +
      '<div class="body">' + U.h(r.body) + '</div>' +
      (r.media && r.media.length ? '<div class="media">' + r.media.map(m => '<img src="' + img(m, 200, 200) + '" alt="Review photo" loading="lazy">').join('') + '</div>' : '') +
      '<div class="actions">' +
      '<button data-helpful="' + r.id + '">' + I.icon('help', '', 'width:14px;height:14px') + 'Helpful (' + r.helpful + ')</button>' +
      '<button>Report</button></div>' +
      '</div></div>').join('');
  }

  /* ---------------- Tabs ---------------- */
  function tabDescription(p) {
    return '<div class="grid grid-2" style="gap:var(--s-7);align-items:start">' +
      '<div><p style="line-height:1.75;font-size:15px">' + U.h(p.desc) + '</p>' +
      '<p class="muted mt-3" style="line-height:1.75;font-size:15px">Every piece in the ' + U.h(p.brand) + ' range is tested in our studio before it reaches the store. We measure, disassemble and abuse-test each product for at least six weeks — then publish what we find, good or bad. If it does not clear the bar, it does not ship.</p>' +
      '<div class="row mt-4" style="gap:10px;flex-wrap:wrap">' +
      '<span class="badge badge-glass">' + I.icon('award', '', 'width:12px;height:12px') + ' Editor tested</span>' +
      '<span class="badge badge-glass">' + I.icon('shield', '', 'width:12px;height:12px') + ' ' + U.h(p.warranty) + ' warranty</span>' +
      '<span class="badge badge-glass">' + I.icon('drop', '', 'width:12px;height:12px') + ' ' + U.h(p.material) + '</span>' +
      '</div></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><img src="' + img(p.imgs[1] || p.imgs[0], 800, 700) + '" alt="" loading="lazy" style="width:100%;aspect-ratio:8/7;object-fit:cover"></div>' +
      '</div>';
  }
  function tabSpecs(p) {
    return '<div class="grid grid-2" style="gap:var(--s-7)">' +
      '<table class="spec-table">' + Object.keys(p.specs).map(k =>
        '<tr><td>' + U.h(k) + '</td><td><b>' + U.h(p.specs[k]) + '</b></td></tr>').join('') + '</table>' +
      '<div>' +
      '<div class="card" style="padding:18px"><div class="eyebrow">Materials &amp; care</div>' +
      '<div class="mt-2" style="font-size:14px">' + U.h(p.material) + '</div>' +
      '<div class="muted mt-2" style="font-size:13px">Wipe with a soft, dry cloth. Avoid solvents and prolonged direct sunlight.</div></div>' +
      '<div class="card mt-3" style="padding:18px"><div class="eyebrow">Warranty</div>' +
      '<div class="mt-2" style="font-size:14px">' + U.h(p.warranty) + ' limited warranty against manufacturing defects.</div></div>' +
      '<div class="card mt-3" style="padding:18px"><div class="eyebrow">Model</div>' +
      '<div class="mt-2 mono" style="font-size:13px">SKU ' + U.h(p.id.toUpperCase()) + '-' + U.h(p.brandId.slice(0, 3).toUpperCase()) + '</div></div>' +
      '</div></div>';
  }
  function tabFeatures(p) {
    return '<div class="features-grid">' + p.features.map(f =>
      '<div class="feature-item">' + I.icon(f.icon) + '<div><b>' + U.h(f.t) + '</b><span>' + U.h(f.d) + '</span></div></div>').join('') +
      '</div>';
  }
  function tabIncluded(p) {
    return '<ul class="included-list">' + p.included.map(x =>
      '<li>' + I.icon('check', '', 'width:16px;height:16px') + U.h(x) + '</li>').join('') + '</ul>';
  }
  function tabShipping(p) {
    return '<div class="grid grid-3" style="gap:var(--s-5)">' +
      ['Standard', 'Express', 'Next day'].map((m, i) =>
        '<div class="card" style="padding:18px"><div class="row-between"><b>' + m + '</b>' +
        '<span class="badge' + (i === 0 && p.freeShip ? ' badge-sale' : '') + '">' + (i === 0 ? (p.freeShip ? 'Free' : S.money(8.99)) : i === 1 ? S.money(14.99) : S.money(24.99)) + '</span></div>' +
        '<div class="muted mt-2" style="font-size:13px">' + (i === 0 ? p.shipDays + '–' + (p.shipDays + 2) + ' business days' : i === 1 ? '1–2 business days' : 'Order before 2pm, delivered tomorrow') + '</div></div>').join('') +
      '</div>' +
      '<div class="card mt-4" style="padding:18px"><b>Where we ship</b>' +
      '<p class="muted mt-2" style="font-size:14px">We ship to 48 countries. Duties and taxes are calculated at checkout — no surprise invoices on delivery. Free returns from the US, UK, EU, Canada and Australia.</p>' +
      '<div class="row mt-3" style="gap:8px;flex-wrap:wrap">' +
      ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Singapore'].map(c =>
        '<span class="chip" style="font-size:12px">' + c + '</span>').join('') + '</div></div>';
  }
  function tabReturns(p) {
    return '<div class="grid grid-2" style="gap:var(--s-6)">' +
      '<div class="card" style="padding:20px"><b>Free 30-day returns</b>' +
      '<p class="muted mt-2" style="font-size:14px;line-height:1.7">Changed your mind? Return any unused item in its original packaging within 30 days for a full refund. Print a prepaid label from your account — no need to contact support.</p></div>' +
      '<div class="card" style="padding:20px"><b>How it works</b>' +
      '<ol style="margin:12px 0 0;padding-left:18px;font-size:14px;line-height:1.9" class="muted">' +
      '<li>Open the order in your account and choose Return</li><li>Print the prepaid label</li>' +
      '<li>Drop it at any carrier point</li><li>Refund lands in 3–5 business days</li></ol></div>' +
      '</div>';
  }

  /* ---------------- Wiring ---------------- */
  function wire(p, view) {
    let color = p.colors[0].name;
    let size = p.sizes ? p.sizes[0] : null;
    let qty = 1;

    /* Gallery */
    const track = U.qs('#galTrack');
    const dots = U.qsa('#galDots span');
    const thumbs = U.qsa('#galThumbs button[data-go]');
    function goSlide(i) {
      gallery.idx = U.clamp(i, 0, p.imgs.length - 1);
      track.style.transform = 'translateX(' + (-gallery.idx * 100) + '%)';
      dots.forEach((d, k) => d.classList.toggle('on', k === gallery.idx));
      thumbs.forEach((t, k) => t.classList.toggle('active', k === gallery.idx));
    }
    view.addEventListener('click', (e) => {
      const g = e.target.closest('[data-gal]');
      if (g) { goSlide(gallery.idx + (g.dataset.gal === 'next' ? 1 : -1)); return; }
      const t = e.target.closest('[data-go]');
      if (t) { goSlide(+t.dataset.go); return; }
      if (e.target.closest('#galFull') || e.target.closest('#galZoom')) { openFullscreen(p, gallery.idx); return; }
      if (e.target.closest('[data-video]')) { videoModal(p); return; }
    });
    /* swipe */
    let sx = 0, sy = 0, swiping = false;
    const main = U.qs('#galMain');
    main.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; }, { passive: true });
    main.addEventListener('touchend', (e) => {
      if (!swiping) return; swiping = false;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) goSlide(gallery.idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    /* hover zoom */
    const zoomables = U.qsa('#galTrack img');
    zoomables.forEach(z => {
      z.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 1000) return;
        const r = z.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
        z.style.transformOrigin = x + '% ' + y + '%';
        z.style.transform = 'scale(1.9)';
      });
      z.addEventListener('mouseleave', () => { z.style.transform = ''; });
    });

    /* Variants */
    view.addEventListener('click', (e) => {
      const c = e.target.closest('#colorRow [data-color]');
      if (c) {
        color = c.dataset.color;
        U.qsa('#colorRow .swatch').forEach(s => s.classList.remove('active'));
        c.classList.add('active');
        U.qs('#colorLabel').textContent = color;
        return;
      }
      const s = e.target.closest('#sizeRow [data-size]');
      if (s) {
        size = s.dataset.size;
        U.qsa('#sizeRow .size-btn').forEach(b => b.classList.remove('active'));
        s.classList.add('active');
        U.qs('#sizeLabel').textContent = size;
        return;
      }
      const q = e.target.closest('[data-qty]');
      if (q) {
        qty = U.clamp(qty + (+q.dataset.qty), 1, Math.min(10, p.stock || 10));
        U.qs('#qtyVal').textContent = qty;
        return;
      }
      if (e.target.closest('#addBtn')) { UI.addToCart(p.id, qty, { color, size }); return; }
      if (e.target.closest('#buyNow')) {
        UI.addToCart(p.id, qty, { color, size });
        setTimeout(() => NOVA.Router.go('/checkout'), 400);
        return;
      }
      if (e.target.closest('#wishBtnP')) {
        const added = S.toggleWishlist(p.id);
        U.qs('#wishBtnP').innerHTML = I.icon('heart') + (added ? 'Saved' : 'Wishlist');
        if (added) S.addPoints(5, 'Added to wishlist');
        return;
      }
      if (e.target.closest('#cmpBtn')) {
        const added = S.toggleCompare(p.id);
        UI.toast({ title: added ? 'Added to compare' : 'Removed from compare', desc: 'Compare up to 4 products' });
        return;
      }
      if (e.target.closest('#shareBtn')) { shareModal(p); return; }
      if (e.target.closest('#alertBtn')) { priceAlert(p); return; }
      if (e.target.closest('#notifyBtn') || e.target.closest('#notifyBtn2')) { stockAlert(p); return; }
      if (e.target.closest('#addBundle')) {
        D.boughtTogether(p).slice(0, 2).forEach(x => UI.addToCart(x.id, 1, {}));
        UI.addToCart(p.id, 1, { color, size });
        return;
      }
      if (e.target.closest('#writeReview')) { reviewModal(p); return; }
      if (e.target.closest('#askBtn')) { askModal(p); return; }
      if (e.target.closest('#moreReviews')) {
        const btn = e.target.closest('#moreReviews');
        btn.innerHTML = '<span class="spinner"></span>';
        setTimeout(() => {
          const more = D.reviewsFor(p).concat(D.reviewsFor(p).map(r => Object.assign({}, r, { id: r.id + 'b', who: r.who })));
          U.qs('#reviewList').innerHTML = reviewList(p, more, 'helpful', false);
          btn.textContent = 'All reviews loaded';
          btn.disabled = true;
        }, 500);
        return;
      }
      const rs = e.target.closest('#revSort button');
      if (rs) {
        U.qsa('#revSort button').forEach(b => b.classList.remove('active'));
        rs.classList.add('active');
        U.qs('#reviewList').innerHTML = reviewList(p, D.reviewsFor(p), rs.dataset.rs, U.qs('#revMedia').checked);
        return;
      }
      const h = e.target.closest('[data-helpful]');
      if (h) {
        const btn = h;
        btn.innerHTML = I.icon('check', '', 'width:14px;height:14px') + 'Marked helpful';
        btn.disabled = true;
        UI.toast({ title: 'Thanks for the feedback' });
        return;
      }
      const tab = e.target.closest('[data-tab]');
      if (tab) {
        U.qsa('#detailTabs .chip').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const map = { description: tabDescription, specifications: tabSpecs, features: tabFeatures, 'what-s-included': tabIncluded, shipping: tabShipping, returns: tabReturns };
        const fn = map[tab.dataset.tab] || tabDescription;
        U.qs('#detailBody').innerHTML = fn(p);
        return;
      }
      if (e.target.closest('[data-goto]')) {
        const sel = e.target.closest('[data-goto]').dataset.goto;
        const el = U.qs(sel); el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (e.target.closest('[data-sizeguide]')) { sizeGuide(p); return; }
      if (e.target.closest('[data-morepay]')) { payOptions(p); return; }
    });

    view.addEventListener('change', (e) => {
      if (e.target.id === 'revMedia') {
        const active = U.qs('#revSort button.active');
        U.qs('#reviewList').innerHTML = reviewList(p, D.reviewsFor(p), active ? active.dataset.rs : 'helpful', e.target.checked);
      }
    });

    /* Delivery countdown */
    const cutoff = U.qs('#cutoff');
    if (cutoff) {
      let left = 3 * 3600 + 24 * 60;
      const iv = setInterval(() => {
        left -= 1;
        if (left <= 0 || !document.body.contains(cutoff)) { clearInterval(iv); return; }
        cutoff.textContent = Math.floor(left / 3600) + 'h ' + Math.floor((left % 3600) / 60) + 'm ' + (left % 60) + 's';
      }, 1000);
    }
  }

  /* ---------------- Modals ---------------- */
  function openFullscreen(p, idx) {
    let i = idx;
    UI.modal({
      title: p.name, width: 1100,
      body: '<div style="position:relative;background:var(--surface-2);border-radius:16px;overflow:hidden">' +
        '<img id="fsImg" src="' + img(p.imgs[i], 1600, 1600) + '" alt="" style="width:100%;max-height:78vh;object-fit:contain">' +
        '<div class="gallery-arrows"><button class="iconbtn" data-fs="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
        '<button class="iconbtn" data-fs="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div></div>' +
        '<div class="row mt-3" style="gap:8px;justify-content:center">' + p.imgs.map((im, k) =>
          '<button class="iconbtn" style="width:56px;height:56px;border-radius:12px;padding:0;overflow:hidden" data-fsgo="' + k + '"><img src="' + img(im, 120, 120) + '" alt=""></button>').join('') + '</div>',
      onMount: (body) => {
        body.addEventListener('click', (e) => {
          const f = e.target.closest('[data-fs]');
          if (f) { i = (i + (f.dataset.fs === 'next' ? 1 : -1) + p.imgs.length) % p.imgs.length; U.qs('#fsImg').src = img(p.imgs[i], 1600, 1600); }
          const g = e.target.closest('[data-fsgo]');
          if (g) { i = +g.dataset.fsgo; U.qs('#fsImg').src = img(p.imgs[i], 1600, 1600); }
        });
      }
    });
  }

  function videoModal(p) {
    UI.modal({
      title: p.name + ' — product film', width: 900,
      body: '<div style="aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden;position:relative">' +
        '<img src="' + img(p.imgs[0], 1200, 675) + '" alt="" style="width:100%;height:100%;object-fit:cover;opacity:.55">' +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;gap:12px">' +
        '<div style="width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,.95);color:#111;display:flex;align-items:center;justify-content:center">' + I.icon('play', '', 'width:30px;height:30px') + '</div>' +
        '<div style="font-weight:600">60-second product tour</div>' +
        '<div style="font-size:13px;opacity:.75">Shot in studio · 4K</div></div></div>' +
        '<div class="row mt-3" style="gap:8px;flex-wrap:wrap">' +
        ['00:00 — Overview', '00:14 — Build & materials', '00:31 — In use', '00:48 — What’s in the box'].map(c =>
          '<span class="chip" style="font-size:12px">' + c + '</span>').join('') + '</div>'
    });
  }

  function shareModal(p) {
    const url = location.origin + location.pathname + '#/product/' + p.id;
    UI.modal({
      title: 'Share', width: 460,
      body: '<div class="row" style="gap:10px;flex-wrap:wrap">' +
        ['Copy link', 'WhatsApp', 'X', 'Facebook', 'Email', 'Pinterest'].map(s =>
          '<button class="btn btn-secondary" data-sh="' + U.h(s) + '">' + I.icon(s === 'Copy link' ? 'copy' : s === 'WhatsApp' ? 'chat' : s === 'X' ? 'x' : s === 'Email' ? 'mail' : 'share', '', 'width:16px;height:16px') + U.h(s) + '</button>').join('') +
        '</div>' +
        '<div class="input-group mt-4"><label>Product link</label>' +
        '<div class="row" style="gap:8px"><input class="input mono" id="shareUrl" value="' + U.h(url) + '" readonly>' +
        '<button class="btn btn-primary" id="copyBtn">' + I.icon('copy') + 'Copy</button></div></div>' +
        '<div class="row mt-4" style="gap:10px"><img src="' + img(p.imgs[0], 200, 200) + '" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover">' +
        '<div><b style="font-size:14px">' + U.h(p.name) + '</b><div class="muted" style="font-size:13px">' + S.money(p.price) + '</div></div></div>',
      onMount: (body) => {
        body.addEventListener('click', (e) => {
          if (e.target.closest('#copyBtn')) {
            const inp = U.qs('#shareUrl'); inp.select();
            try { document.execCommand('copy'); } catch (err) { }
            const b = e.target.closest('#copyBtn');
            b.innerHTML = I.icon('check') + 'Copied';
            b.style.animation = 'heartPop .3s var(--ease)';
            setTimeout(() => { b.innerHTML = I.icon('copy') + 'Copy'; }, 1600);
            UI.toast({ title: 'Link copied' });
          }
          const sh = e.target.closest('[data-sh]');
          if (sh) UI.toast({ title: 'Shared via ' + sh.dataset.sh });
        });
      }
    });
  }

  function priceAlert(p) {
    const on = S.state.priceAlerts.includes(p.id);
    UI.modal({
      title: 'Price drop alert', width: 440,
      body: '<div class="row" style="gap:14px"><img src="' + img(p.imgs[0], 160, 160) + '" alt="" style="width:72px;height:72px;border-radius:10px;object-fit:cover">' +
        '<div><b>' + U.h(p.name) + '</b><div class="muted" style="font-size:13px">Currently ' + S.money(p.price) + '</div></div></div>' +
        '<p class="muted mt-4" style="font-size:14px">We will email you the moment this product drops below your target price. No spam, one email per price change.</p>' +
        '<div class="input-group mt-4"><label>Notify me when price is under</label>' +
        '<input class="input" type="number" id="targetPrice" value="' + Math.round(p.price * 0.9) + '" min="1"></div>' +
        '<button class="btn ' + (on ? 'btn-secondary' : 'btn-primary') + ' btn-block mt-4" id="toggleAlert">' +
        (on ? 'Disable alert' : 'Enable alert') + '</button>',
      onMount: (body) => {
        body.addEventListener('click', (e) => {
          if (e.target.closest('#toggleAlert')) {
            const has = S.state.priceAlerts.includes(p.id);
            const arr = has ? S.state.priceAlerts.filter(x => x !== p.id) : S.state.priceAlerts.concat([p.id]);
            S.set({ priceAlerts: arr });
            UI.closeModal();
            UI.toast({ title: has ? 'Alert disabled' : 'Alert enabled', desc: has ? '' : 'We will email you at ' + S.state.userEmail || 'your registered address' });
            if (!has) S.pushNotif({ type: 'price', icon: 'tag', title: 'Price alert set', body: 'We will watch ' + p.name + ' for you.' });
          }
        });
      }
    });
  }

  function stockAlert(p) {
    UI.modal({
      title: 'Back in stock', width: 440,
      body: '<div class="row" style="gap:14px"><img src="' + img(p.imgs[0], 160, 160) + '" alt="" style="width:72px;height:72px;border-radius:10px;object-fit:cover">' +
        '<div><b>' + U.h(p.name) + '</b><div class="muted" style="font-size:13px">Expected restock in 2–3 weeks</div></div></div>' +
        '<div class="input-group mt-4"><label>Email address</label>' +
        '<input class="input" type="email" id="stockEmail" placeholder="you@example.com" value="' + U.h(D.customer.email) + '"></div>' +
        '<div class="input-group mt-3"><label>Or get a text instead (optional)</label>' +
        '<input class="input" type="tel" id="stockPhone" placeholder="+1 (555) 000-0000"></div>' +
        '<button class="btn btn-primary btn-block mt-4" id="doStock">Notify me when available</button>',
      onMount: (body) => {
        body.addEventListener('click', (e) => {
          if (e.target.closest('#doStock')) {
            const em = U.qs('#stockEmail').value.trim();
            if (!em || em.indexOf('@') < 0) { UI.toast({ type: 'error', title: 'Enter a valid email' }); return; }
            S.set({ stockAlerts: S.state.stockAlerts.concat([p.id]) });
            UI.closeModal();
            UI.toast({ title: 'You are on the list', desc: 'We will email ' + em + ' the moment it lands' });
            S.pushNotif({ type: 'stock', icon: 'package', title: 'Back-in-stock alert set', body: p.name });
          }
        });
      }
    });
  }

  function reviewModal(p) {
    let stars = 5;
    UI.modal({
      title: 'Write a review', width: 560,
      body: '<div class="row" style="gap:14px"><img src="' + img(p.imgs[0], 160, 160) + '" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover">' +
        '<div><b>' + U.h(p.name) + '</b><div class="muted" style="font-size:13px">' + U.h(p.brand) + '</div></div></div>' +
        '<div class="input-group mt-4"><label>Overall rating</label>' +
        '<div id="starPick" class="row" style="gap:4px;font-size:0;cursor:pointer">' +
        [1, 2, 3, 4, 5].map(i => '<button data-star="' + i + '" style="width:34px;height:34px;color:#F5A623">' + I.icon('star', '', 'width:30px;height:30px') + '</button>').join('') +
        '</div></div>' +
        '<div class="input-group mt-3"><label>Headline</label><input class="input" id="rvTitle" placeholder="Sum it up in a few words"></div>' +
        '<div class="input-group mt-3"><label>Your review</label><textarea class="input" id="rvBody" placeholder="What did you like or dislike? How did you use it?"></textarea></div>' +
        '<div class="input-group mt-3"><label>Add photos (up to 3)</label>' +
        '<div class="row" style="gap:8px">' + [0, 1, 2].map(i =>
          '<label style="width:72px;height:72px;border-radius:10px;border:1px dashed var(--border-strong);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-soft)">' +
          I.icon('plus') + '<input type="file" accept="image/*" hidden></label>').join('') + '</div></div>' +
        '<label class="checkbox mt-3"><input type="checkbox" id="rvVerify" checked><span class="box"></span>I purchased this product</label>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" id="rvSubmit">Post review</button>',
      onMount: (body, wrap) => {
        const paint = () => U.qsa('#starPick button').forEach(b => {
          const on = +b.dataset.star <= stars;
          b.innerHTML = I.icon('star', '', 'width:30px;height:30px');
          b.style.color = on ? '#F5A623' : 'var(--surface-3)';
        });
        paint();
        body.addEventListener('click', (e) => {
          const s = e.target.closest('[data-star]');
          if (s) { stars = +s.dataset.star; paint(); }
          if (e.target.closest('#rvSubmit')) {
            const title = U.qs('#rvTitle').value.trim() || 'Verified review';
            const text = U.qs('#rvBody').value.trim();
            if (!text) { UI.toast({ type: 'error', title: 'Add a few words first' }); return; }
            const btn = e.target.closest('#rvSubmit');
            btn.innerHTML = '<span class="spinner"></span> Posting';
            setTimeout(() => {
              UI.closeModal();
              UI.toast({ title: 'Review posted', desc: 'Thanks — 50 points added to your account' });
              S.addPoints(50, 'Review on ' + p.name);
            }, 800);
          }
        });
      }
    });
  }

  function askModal(p) {
    UI.modal({
      title: 'Ask a question', width: 480,
      body: '<p class="muted" style="font-size:14px">Ask the community and the ' + U.h(p.brand) + ' team. Answers are usually posted within a few hours.</p>' +
        '<div class="input-group mt-4"><label>Your question</label><textarea class="input" id="qText" placeholder="e.g. Does it fit a 16-inch laptop?"></textarea></div>' +
        '<label class="checkbox mt-3"><input type="checkbox" checked><span class="box"></span>Email me when someone answers</label>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" id="qSubmit">Post question</button>',
      onMount: (body) => {
        body.addEventListener('click', (e) => {
          if (e.target.closest('#qSubmit')) {
            const v = U.qs('#qText').value.trim();
            if (!v) { UI.toast({ type: 'error', title: 'Write a question first' }); return; }
            UI.closeModal();
            UI.toast({ title: 'Question posted', desc: 'We will notify you when it is answered' });
          }
        });
      }
    });
  }

  function sizeGuide(p) {
    UI.modal({
      title: 'Size guide', width: 560,
      body: '<table class="table"><thead><tr><th>Size</th><th>Chest (cm)</th><th>Waist (cm)</th><th>Hip (cm)</th></tr></thead><tbody>' +
        [['XS', '86–90', '70–74', '88–92'], ['S', '90–96', '74–80', '92–98'], ['M', '96–102', '80–86', '98–104'],
        ['L', '102–108', '86–92', '104–110'], ['XL', '108–114', '92–98', '110–116'], ['XXL', '114–120', '98–104', '116–122']]
          .map(r => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>').join('') +
        '</tbody></table>' +
        '<p class="muted mt-3" style="font-size:13px">Measurements are taken flat, in centimetres, from the actual garment. If you are between sizes we recommend sizing up for a relaxed fit.</p>'
    });
  }

  function payOptions(p) {
    UI.modal({
      title: 'Payment options', width: 520,
      body: '<div class="col gap-3">' +
        '<div class="card" style="padding:16px"><div class="row-between"><b>Nova Pay — 4 payments</b><span class="badge badge-glass">0% APR</span></div>' +
        '<div class="muted mt-2" style="font-size:13px">Four payments of ' + S.money(p.price / 4) + ', taken every two weeks. No interest, no fees when you pay on time.</div></div>' +
        '<div class="card" style="padding:16px"><div class="row-between"><b>Nova Pay — 12 months</b><span class="badge badge-glass">9.9% APR</span></div>' +
        '<div class="muted mt-2" style="font-size:13px">Around ' + S.money((p.price * 1.055) / 12) + ' per month over 12 months. Total ' + S.money(p.price * 1.055) + '.</div></div>' +
        '<div class="card" style="padding:16px"><div class="row-between"><b>Pay in 30 days</b><span class="badge badge-glass">No cost</span></div>' +
        '<div class="muted mt-2" style="font-size:13px">Take it home now, pay nothing for 30 days. Available on orders under $1,500.</div></div>' +
        '</div>'
    });
  }

  NOVA.Router.register('/product/:id', product);
})();
