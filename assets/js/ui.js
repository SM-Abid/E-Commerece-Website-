/* ============================================================
   NOVA — Shared UI components
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, img = NOVA.img;

  /* ---------------- Toasts ---------------- */
  let toastStack = null;
  function ensureStack() {
    if (toastStack) return toastStack;
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
    return toastStack;
  }
  function toast(opts) {
    if (typeof opts === 'string') opts = { title: opts };
    const stack = ensureStack();
    const el = document.createElement('div');
    el.className = 'toast ' + (opts.type || 'success');
    const icon = opts.type === 'error' ? 'alert' : opts.type === 'warn' ? 'info' : 'check';
    el.innerHTML = I.icon(icon, 'ic') +
      '<div class="body"><div class="title">' + U.h(opts.title || '') + '</div>' +
      (opts.desc ? '<div class="desc">' + U.h(opts.desc) + '</div>' : '') + '</div>' +
      '<button class="x" aria-label="Dismiss">' + I.icon('close', '') + '</button>';
    const remove = () => {
      el.style.animation = 'fadeUp .2s var(--ease) reverse both';
      setTimeout(() => el.remove(), 180);
    };
    el.querySelector('.x').style.cssText = 'width:18px;height:18px;background:none';
    el.querySelector('.x').addEventListener('click', remove);
    stack.appendChild(el);
    setTimeout(remove, opts.duration || 3600);
    return el;
  }

  /* ---------------- Modal ---------------- */
  let activeModal = null;
  function modal(opts) {
    closeModal(true);
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true" aria-label="' + U.h(opts.title || 'Dialog') + '" style="' + (opts.width ? 'width:min(' + opts.width + 'px,100%)' : '') + '">' +
      (opts.title ? '<div class="modal-head"><h4>' + U.h(opts.title) + '</h4><button class="iconbtn" data-close aria-label="Close">' + I.icon('close') + '</button></div>' : '') +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '') +
      '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('open'));
    const back = document.createElement('div');
    back.className = 'backdrop';
    document.body.appendChild(back);
    requestAnimationFrame(() => back.classList.add('open'));
    back.addEventListener('click', () => closeModal());
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-close]')) closeModal();
    });
    activeModal = { wrap, back, onClose: opts.onClose };
    document.body.style.overflow = 'hidden';
    if (opts.onMount) opts.onMount(wrap.querySelector('.modal-body'), wrap);
    return activeModal;
  }
  function closeModal(immediate) {
    if (!activeModal) return;
    const { wrap, back, onClose } = activeModal;
    activeModal = null;
    wrap.classList.remove('open'); back.classList.remove('open');
    document.body.style.overflow = '';
    const done = () => { wrap.remove(); back.remove(); if (onClose) onClose(); };
    if (immediate) done(); else setTimeout(done, 260);
  }

  /* ---------------- Shared backdrop for drawers ---------------- */
  let sharedBack = null;
  function backdrop(onClick) {
    if (!sharedBack) {
      sharedBack = document.createElement('div');
      sharedBack.className = 'backdrop';
      document.body.appendChild(sharedBack);
    }
    sharedBack.onclick = () => { hideBackdrop(); if (onClick) onClick(); };
    requestAnimationFrame(() => sharedBack.classList.add('open'));
    return sharedBack;
  }
  function hideBackdrop() { if (sharedBack) sharedBack.classList.remove('open'); }

  /* ---------------- Product card ---------------- */
  function badgeHtml(p) {
    if (!p.badge) return '';
    const map = { new: 'badge-new', best: 'badge-best', limited: 'badge-limited', hot: 'badge-hot' };
    const label = { new: 'New', best: 'Best Seller', limited: 'Limited', hot: 'Hot' }[p.badge];
    return '<span class="badge ' + (map[p.badge] || '') + '">' + label + '</span>';
  }
  function priceHtml(p) {
    let out = '<div class="pcard-price">';
    out += '<span class="now">' + S.money(p.price) + '</span>';
    if (p.was) {
      out += '<span class="was">' + S.money(p.was) + '</span>';
      out += '<span class="off">-' + p.off + '%</span>';
    }
    return out + '</div>';
  }
  function productCard(p, opts) {
    opts = opts || {};
    const wished = S.inWishlist(p.id);
    const main = p.imgs[0], alt = p.imgs[1] || p.imgs[0];
    const lowStock = p.stock <= 10;
    return '' +
      '<article class="pcard" data-product="' + p.id + '">' +
      '<div class="pcard-media">' +
      '<img src="' + img(main, 500, 625) + '" srcset="' + NOVA.srcset(main, 500) + '" alt="' + U.h(p.name) + '" loading="lazy" decoding="async" width="500" height="625">' +
      '<img class="pcard-img-alt" src="' + img(alt, 500, 625) + '" alt="" loading="lazy" decoding="async">' +
      '<div class="pcard-badges"><div class="left">' + badgeHtml(p) +
      (lowStock ? '<span class="badge badge-hot" style="background:#FF3B5C;color:#fff;border:0">Only ' + p.stock + ' left</span>' : '') +
      '</div><div class="right">' +
      '<button class="iconbtn pcard-wish' + (wished ? ' active' : '') + '" data-wish="' + p.id + '" aria-label="Wishlist" aria-pressed="' + wished + '" style="width:34px;height:34px">' + I.icon('heart', '') + '</button>' +
      '</div></div>' +
      '<div class="pcard-actions">' +
      '<button class="btn btn-dark btn-sm" data-quick="' + p.id + '">' + I.icon('eye', '') + 'Quick view</button>' +
      '<button class="btn btn-primary btn-sm" data-add="' + p.id + '">' + I.icon('cart', '') + 'Add</button>' +
      '</div>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
      '<h3 class="pcard-name"><a href="#/product/' + p.id + '">' + U.h(p.name) + '</a></h3>' +
      '<div class="pcard-rating">' + I.stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + p.reviews.toLocaleString() + ')</span></div>' +
      priceHtml(p) +
      '<div class="pcard-colors">' + p.colors.slice(0, 5).map(c => '<span style="background:' + c.hex + '" title="' + U.h(c.name) + '"></span>').join('') + '</div>' +
      '</div>' +
      '</article>';
  }

  function skeletonCard() {
    return '<div class="pcard"><div class="pcard-media skeleton" style="border-radius:var(--r-4)"></div>' +
      '<div class="pcard-body"><div class="skeleton sk-line" style="width:40%"></div>' +
      '<div class="skeleton sk-line" style="width:85%"></div><div class="skeleton sk-line" style="width:60%"></div>' +
      '<div class="skeleton sk-line" style="width:45%;height:18px;margin-top:6px"></div></div></div>';
  }
  function skeletonGrid(n) {
    return '<div class="prod-grid cols-4">' + new Array(n || 8).fill(skeletonCard()).join('') + '</div>';
  }

  /* ---------------- Section header ---------------- */
  function sectionHeader(o) {
    return '<div class="section-title reveal">' +
      '<div>' +
      (o.eyebrow ? '<div class="eyebrow"><span class="dot"></span>' + U.h(o.eyebrow) + '</div>' : '') +
      '<h2>' + U.h(o.title) + '</h2>' +
      (o.lead ? '<div class="lead">' + U.h(o.lead) + '</div>' : '') +
      '</div>' +
      (o.action || '') +
      '</div>';
  }

  /* ---------------- Empty state ---------------- */
  function empty(o) {
    return '<div class="empty">' +
      '<div class="art">' + I.icon(o.icon || 'package', '', 'width:52px;height:52px') + '</div>' +
      '<h3>' + U.h(o.title) + '</h3>' +
      '<p>' + U.h(o.text || '') + '</p>' +
      '<div class="actions">' + (o.actions || '') + '</div>' +
      '</div>';
  }

  /* ---------------- Rating block ---------------- */
  function ratingBlock(p) {
    return '<span class="row" style="gap:6px">' + I.stars(p.rating) +
      '<span class="muted" style="font-size:13px">' + p.rating.toFixed(1) + ' · <a href="#/product/' + p.id + '#reviews">' + p.reviews.toLocaleString() + ' reviews</a></span></span>';
  }

  /* ---------------- Quick view ---------------- */
  function quickView(id) {
    const p = D.byId(id);
    if (!p) return;
    modal({
      title: 'Quick view',
      width: 820,
      body: '<div class="qv-grid">' +
        '<div class="qv-media"><img src="' + img(p.imgs[0], 700, 700) + '" alt="' + U.h(p.name) + '"></div>' +
        '<div class="col">' +
        '<div class="pcard-brand">' + U.h(p.brand) + '</div>' +
        '<h3>' + U.h(p.name) + '</h3>' +
        ratingBlock(p) +
        '<div class="mt-3">' + priceHtml(p) + '</div>' +
        '<p class="muted mt-3" style="font-size:14px">' + U.h(p.desc.slice(0, 180)) + '…</p>' +
        '<div class="mt-4"><div style="font-size:13px;font-weight:600;margin-bottom:8px">Color</div><div class="swatch-row">' +
        p.colors.map((c, i) => '<button class="swatch' + (i === 0 ? ' active' : '') + '" data-qcolor="' + U.h(c.name) + '" title="' + U.h(c.name) + '"><span class="dot" style="background:' + c.hex + '"></span></button>').join('') +
        '</div></div>' +
        (p.sizes ? '<div class="mt-4"><div style="font-size:13px;font-weight:600;margin-bottom:8px">Size</div><div class="size-row">' +
          p.sizes.map((s, i) => '<button class="size-btn' + (i === 0 ? ' active' : '') + '" data-qsize="' + U.h(s) + '">' + U.h(s) + '</button>').join('') + '</div></div>' : '') +
        '<div class="buy-row">' +
        '<button class="btn btn-primary" data-add="' + p.id + '" data-close>' + I.icon('cart') + 'Add to Cart</button>' +
        '<button class="btn btn-secondary btn-icon" data-wish="' + p.id + '" aria-label="Wishlist">' + I.icon('heart') + '</button>' +
        '</div>' +
        '<a class="btn btn-ghost btn-block mt-2" href="#/product/' + p.id + '" data-close>View full details</a>' +
        '</div></div>',
      onMount: (body) => {
        let color = p.colors[0].name, size = p.sizes ? p.sizes[0] : null;
        body.addEventListener('click', (e) => {
          const c = e.target.closest('[data-qcolor]');
          if (c) { color = c.dataset.qcolor; body.querySelectorAll('.swatch').forEach(s => s.classList.remove('active')); c.classList.add('active'); }
          const s2 = e.target.closest('[data-qsize]');
          if (s2) { size = s2.dataset.qsize; body.querySelectorAll('.size-btn').forEach(s => s.classList.remove('active')); s2.classList.add('active'); }
          const add = e.target.closest('[data-add]');
          if (add) { addToCart(p.id, 1, { color, size }); closeModal(); }
        });
      }
    });
  }

  /* ---------------- Add to cart (with feedback) ---------------- */
  function addToCart(id, qty, opts) {
    const p = D.byId(id);
    if (!p) return;
    if (p.stock <= 0) { toast({ type: 'warn', title: 'Out of stock', desc: p.name }); return; }
    S.addToCart(id, qty, opts);
    toast({ type: 'success', title: 'Added to cart', desc: p.name });
    const badge = document.querySelector('[data-cart-count]');
    if (badge) { const b = badge.closest('.iconbtn'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    NOVA.Cart && NOVA.Cart.open && NOVA.Cart.open(true);
  }

  /* ---------------- Reveal on scroll ---------------- */
  let io = null;
  function observeReveals(root) {
    if (!('IntersectionObserver' in window)) {
      U.qsa('.reveal, .reveal-stagger', root || document).forEach(el => el.classList.add('in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    U.qsa('.reveal, .reveal-stagger', root || document).forEach(el => {
      if (el.classList.contains('in')) return;
      io.observe(el);
    });
    /* Safety: if anything is still hidden after 2.4s (e.g. user stops mid-page or screenshot capture),
       reveal it so no section appears empty. */
    setTimeout(() => {
      U.qsa('.reveal:not(.in), .reveal-stagger:not(.in)', root || document).forEach(el => el.classList.add('in'));
    }, 2400);
  }

  /* ---------------- Carousel arrows ---------------- */
  function wireCarousel(root) {
    U.qsa('[data-carousel]', root || document).forEach(btn => {
      btn.addEventListener('click', () => {
        const sel = btn.dataset.carousel;
        const track = (root || document).querySelector(sel);
        if (!track) return;
        const dir = btn.dataset.dir === 'prev' ? -1 : 1;
        track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: 'smooth' });
      });
    });
  }

  /* ---------------- Global delegated interactions ---------------- */
  function delegate(root) {
    root = root || document;
    root.addEventListener('click', (e) => {
      const wish = e.target.closest('[data-wish]');
      if (wish) {
        e.preventDefault(); e.stopPropagation();
        const id = wish.dataset.wish;
        const added = S.toggleWishlist(id);
        U.qsa('[data-wish="' + id + '"]').forEach(b => {
          b.classList.toggle('active', added);
          b.setAttribute('aria-pressed', added);
          b.style.animation = 'none'; void b.offsetWidth; b.style.animation = 'heartPop .35s var(--ease)';
        });
        const p = D.byId(id);
        toast({ type: 'success', title: added ? 'Saved to wishlist' : 'Removed from wishlist', desc: p ? p.name : '' });
        return;
      }
      const add = e.target.closest('[data-add]');
      if (add) {
        e.preventDefault(); e.stopPropagation();
        const p = D.byId(add.dataset.add);
        addToCart(add.dataset.add, 1, { color: p ? p.colors[0].name : null, size: p && p.sizes ? p.sizes[0] : null });
        return;
      }
      const q = e.target.closest('[data-quick]');
      if (q) { e.preventDefault(); e.stopPropagation(); quickView(q.dataset.quick); return; }
      const cmp = e.target.closest('[data-compare]');
      if (cmp) {
        e.preventDefault(); e.stopPropagation();
        const added = S.toggleCompare(cmp.dataset.compare);
        toast({ type: 'success', title: added ? 'Added to compare' : 'Removed from compare' });
        NOVA.syncCompare && NOVA.syncCompare();
        return;
      }
    });
  }

  NOVA.UI = {
    toast, modal, closeModal, backdrop, hideBackdrop,
    productCard, skeletonCard, skeletonGrid, sectionHeader, empty, ratingBlock,
    badgeHtml, priceHtml, quickView, addToCart, observeReveals, wireCarousel, delegate
  };
})();
