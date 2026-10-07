/* ============================================================
   NOVA — App shell: chrome, nav, footer, search, cart drawer,
           notifications panel, router bootstrap
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img;
  const t = (k) => S.t(k);

  /* ---------------- Announcement rotator ---------------- */
  const ANNOUNCEMENTS = [
    'Free shipping on orders over $50',
    'New season collection is here',
    '10% off your first order — code NOVA10',
    'Limited-time deals up to 40% off'
  ];
  function renderAnnounce() {
    const el = U.qs('#announce');
    el.innerHTML = '<div class="announce-rotator">' + ANNOUNCEMENTS.map((a, i) =>
      '<span class="ar-item' + (i === 0 ? ' on' : '') + '">' + U.h(a) + '</span>').join('') + '</div>';
    let i = 0;
    setInterval(() => {
      const items = U.qsa('.ar-item', el);
      if (!items.length) return;
      items[i].classList.remove('on');
      i = (i + 1) % items.length;
      items[i].classList.add('on');
    }, 3600);
  }

  /* ---------------- Navbar ---------------- */
  const NAV = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/shop', label: 'Shop', key: 'shop' },
    { href: '/shop?cat=all', label: 'Categories', key: 'categories' },
    { href: '/new-arrivals', label: 'New Arrivals', key: 'newArrivals' },
    { href: '/deals', label: 'Deals', key: 'deals' },
    { href: '/brands', label: 'Brands', key: 'brands' },
    { href: '/about', label: 'About', key: 'about' }
  ];
  function renderNav() {
    const nav = U.qs('#navbar');
    nav.innerHTML =
      '<div class="container navbar-inner">' +
      '<button class="iconbtn only-mobile" id="mmenuBtn" aria-label="Open menu">' + I.icon('menu') + '</button>' +
      '<a class="brand" href="#/" aria-label="Nova home"><span class="mark"></span>NOVA</a>' +
      '<nav class="navlinks" aria-label="Main">' +
      NAV.map(n => '<a href="#' + n.href + '" data-nav="' + n.href + '">' + U.h(t(n.key)) + '</a>').join('') +
      '</nav>' +
      '<button class="nav-search" id="navSearch" aria-label="Search">' +
      I.icon('search', 'ic') + '<span>Search products…</span><kbd class="sr-only">/</kbd></button>' +
      '<div class="nav-actions">' +
      '<button class="iconbtn only-mobile" id="mSearch" aria-label="Search">' + I.icon('search') + '</button>' +
      '<button class="iconbtn" id="wishBtn" data-tip="Wishlist" aria-label="Wishlist" style="position:relative">' +
      I.icon('heart') + '<span class="count" data-wish-count style="display:none">0</span></button>' +
      '<button class="iconbtn" id="notifBtn" data-tip="Notifications" aria-label="Notifications" style="position:relative">' +
      I.icon('bell') + '<span class="count" data-notif-count style="display:none">0</span></button>' +
      '<button class="iconbtn" id="cartBtn" aria-label="Cart" style="position:relative">' +
      I.icon('cart') + '<span class="count" data-cart-count style="display:none">0</span></button>' +
      '<button class="iconbtn" id="themeBtn" data-tip="Theme" aria-label="Toggle theme">' + I.icon(S.effectiveTheme() === 'dark' ? 'sun' : 'moon') + '</button>' +
      '<a class="iconbtn" id="acctBtn" href="#/account" data-tip="Account" aria-label="Account">' + I.icon('user') + '</a>' +
      '</div>' +
      '</div>';
    U.qs('#navSearch').addEventListener('click', () => NOVA.Search.open());
    U.qs('#mSearch').addEventListener('click', () => NOVA.Search.open());
    U.qs('#cartBtn').addEventListener('click', () => NOVA.Cart.open());
    U.qs('#wishBtn').addEventListener('click', () => NOVA.Router.go('/wishlist'));
    U.qs('#notifBtn').addEventListener('click', () => NOVA.Notif.open());
    U.qs('#themeBtn').addEventListener('click', () => {
      S.toggleTheme();
      U.qs('#themeBtn').innerHTML = I.icon(S.effectiveTheme() === 'dark' ? 'sun' : 'moon');
      UI.toast({ title: S.effectiveTheme() === 'dark' ? 'Dark mode on' : 'Light mode on' });
    });
    U.qs('#mmenuBtn').addEventListener('click', () => NOVA.MobileMenu.open());
    syncCounts();
  }
  function setActiveNav(path) {
    U.qsa('[data-nav]').forEach(a => {
      const href = a.dataset.nav;
      const active = href === '/' ? path === '/' : path.indexOf(href) === 0;
      a.classList.toggle('active', active);
    });
    U.qsa('.bnav a').forEach(a => {
      const href = a.dataset.nav;
      const active = href === '/' ? path === '/' : path.indexOf(href) === 0;
      a.classList.toggle('active', active);
    });
  }
  function syncCounts() {
    const c = S.cartCount();
    const cb = U.qs('[data-cart-count]');
    if (cb) { cb.textContent = c; cb.style.display = c ? '' : 'none'; }
    const w = S.state.wishlist.length;
    const wb = U.qs('[data-wish-count]');
    if (wb) { wb.textContent = w; wb.style.display = w ? '' : 'none'; }
    const n = S.unreadCount();
    const nb = U.qs('[data-notif-count]');
    if (nb) { nb.textContent = n; nb.style.display = n ? '' : 'none'; }
  }
  NOVA.syncCounts = syncCounts;

  /* ---------------- Mobile menu ---------------- */
  const MobileMenu = {
    open() {
      const el = U.qs('#mmenu');
      el.innerHTML =
        '<div class="mmenu-head"><a class="brand" href="#/"><span class="mark"></span>NOVA</a>' +
        '<button class="iconbtn" data-close aria-label="Close">' + I.icon('close') + '</button></div>' +
        '<nav>' + NAV.map(n => '<a href="#' + n.href + '">' + U.h(t(n.key)) + '</a>').join('') +
        '<a href="#/account">Account</a><a href="#/wishlist">Wishlist</a><a href="#/compare">Compare</a>' +
        '<a href="#/admin">Admin</a></nav>' +
        '<div style="margin-top:auto;padding:16px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-secondary btn-sm" data-mm-theme>' + I.icon(S.effectiveTheme() === 'dark' ? 'sun' : 'moon') + 'Theme</button>' +
        '<a class="btn btn-secondary btn-sm" href="#/shop">Shop all</a></div>';
      el.classList.add('open');
      UI.backdrop(() => MobileMenu.close());
      el.querySelector('[data-close]').onclick = () => MobileMenu.close();
      el.querySelectorAll('a').forEach(a => a.onclick = () => MobileMenu.close());
      el.querySelector('[data-mm-theme]').onclick = () => {
        S.toggleTheme(); renderNav(); MobileMenu.close();
      };
    },
    close() { U.qs('#mmenu').classList.remove('open'); UI.hideBackdrop(); }
  };
  NOVA.MobileMenu = MobileMenu;

  /* ---------------- Bottom nav ---------------- */
  function renderBottomNav() {
    const el = U.qs('#bnav');
    el.innerHTML = '<div class="bnav-inner">' +
      '<a href="#/" data-nav="/">' + I.icon('home', 'ic') + '<span>Home</span></a>' +
      '<a href="#/shop" data-nav="/shop">' + I.icon('grid', 'ic') + '<span>Shop</span></a>' +
      '<a href="#/deals" data-nav="/deals">' + I.icon('flame', 'ic') + '<span>Deals</span></a>' +
      '<a href="#/wishlist" data-nav="/wishlist">' + I.icon('heart', 'ic') + '<span>Saved</span></a>' +
      '<a href="#/account" data-nav="/account">' + I.icon('user', 'ic') + '<span>Account</span></a>' +
      '</div>';
  }

  /* ---------------- Footer ---------------- */
  function renderFooter() {
    const cols = [
      { h: 'SHOP', links: [['New Arrivals', '/new-arrivals'], ['Best Sellers', '/shop?sort=popular'], ['Deals', '/deals'], ['Categories', '/shop'], ['Brands', '/brands']] },
      { h: 'CUSTOMER SERVICE', links: [['Contact Us', '/contact'], ['Shipping', '/shipping'], ['Returns', '/returns'], ['FAQ', '/faq'], ['Track Order', '/account/orders']] },
      { h: 'ABOUT', links: [['About Us', '/about'], ['Careers', '/about'], ['Press', '/about'], ['Sustainability', '/about']] },
      { h: 'LEGAL', links: [['Privacy Policy', '/legal'], ['Terms', '/legal'], ['Cookie Policy', '/legal']] }
    ];
    const socials = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['x', 'X']];
    U.qs('#footer').innerHTML =
      '<div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' +
      '<a class="brand" href="#/"><span class="mark"></span>NOVA</a>' +
      '<p class="desc">A considered marketplace for objects that earn their place. Curated, tested and delivered fast — backed by a 30-day return promise.</p>' +
      '<form class="news" id="newsForm">' +
      '<input class="input" type="email" placeholder="Enter your email" aria-label="Email" required>' +
      '<button class="btn btn-primary" type="submit">Subscribe</button></form>' +
      '<div class="soft" style="font-size:12px;margin-top:10px">Get 10% off your first order. No spam, unsubscribe anytime.</div>' +
      '<div class="socials">' + socials.map(s =>
        '<a class="iconbtn" href="#/" aria-label="' + s[1] + '" data-social>' + I.icon(s[0]) + '</a>').join('') + '</div>' +
      '</div>' +
      cols.map(c => '<div><h5>' + c.h + '</h5><ul>' +
        c.links.map(l => '<li><a href="#' + l[1] + '">' + l[0] + '</a></li>').join('') + '</ul></div>').join('') +
      '</div>' +
      '<div class="legal">' +
      '<div>© ' + new Date().getFullYear() + ' NOVA Commerce Inc. All rights reserved.</div>' +
      '<div class="row">' +
      '<span class="row" style="gap:6px">' + I.icon('shield', '', 'width:16px;height:16px') + ' Secure checkout</span>' +
      '<span class="row" style="gap:6px">' + I.icon('truck', '', 'width:16px;height:16px') + ' Free shipping over $50</span>' +
      '<span class="row" style="gap:6px">' + I.icon('refresh', '', 'width:16px;height:16px') + ' 30-day returns</span>' +
      '</div>' +
      '<div class="row"><button class="btn btn-sm btn-ghost" id="footCurrency">' + I.icon('globe') + ' ' + S.state.currency + '</button>' +
      '<button class="btn btn-sm btn-ghost" id="footLang">' + (S.state.lang === 'zh' ? '中文' : S.state.lang === 'es' ? 'Español' : 'English') + '</button>' +
      '<a class="btn btn-sm btn-ghost" href="#/admin">Admin</a></div>' +
      '</div></div>';
    U.qs('#newsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.classList.add('loading');
      btn.innerHTML = '<span class="spinner"></span>';
      setTimeout(() => {
        UI.toast({ title: 'You\'re subscribed', desc: 'Code NOVA10 is on its way' });
        e.target.reset(); btn.classList.remove('loading'); btn.textContent = 'Subscribe';
      }, 900);
    });
    U.qs('#footCurrency').addEventListener('click', () => currencyMenu());
    U.qs('#footLang').addEventListener('click', () => langMenu());
  }
  function currencyMenu() {
    const opts = Object.keys(NOVA.CURRENCIES).map(c =>
      '<button class="btn btn-ghost btn-block" style="justify-content:flex-start" data-cur="' + c + '">' +
      NOVA.CURRENCIES[c].symbol + ' &nbsp; ' + c + ' — ' + NOVA.CURRENCIES[c].name + '</button>').join('');
    UI.modal({
      title: 'Currency', width: 380,
      body: '<div class="col gap-2">' + opts + '</div>',
      onMount: (b) => b.addEventListener('click', (e) => {
        const c = e.target.closest('[data-cur]'); if (!c) return;
        S.set({ currency: c.dataset.cur }); UI.closeModal();
        UI.toast({ title: 'Currency set to ' + c.dataset.cur });
        NOVA.Router.resolve();
      })
    });
  }
  function langMenu() {
    const opts = [['en', 'English'], ['zh', '中文'], ['es', 'Español']].map(l =>
      '<button class="btn btn-ghost btn-block" style="justify-content:flex-start" data-lang="' + l[0] + '">' + l[1] + '</button>').join('');
    UI.modal({
      title: 'Language', width: 380,
      body: '<div class="col gap-2">' + opts + '</div>',
      onMount: (b) => b.addEventListener('click', (e) => {
        const c = e.target.closest('[data-lang]'); if (!c) return;
        S.set({ lang: c.dataset.lang }); UI.closeModal();
        UI.toast({ title: 'Language updated' });
        NOVA.Router.resolve();
      })
    });
  }

  /* ---------------- Search overlay ---------------- */
  const Search = {
    el: null, input: null, lastQuery: '',
    trending: ['wireless headphones', 'gaming laptop', 'running shoes', 'smart watch', 'perfume', 'sofa', 'mechanical keyboard', 'backpack'],
    open(term) {
      const el = U.qs('#searchOverlay');
      this.el = el;
      el.classList.add('open');
      this.render(term || '');
      setTimeout(() => { const i = U.qs('#searchInput'); if (i) { i.focus(); if (term) i.value = term; } }, 80);
      document.addEventListener('keydown', this._esc);
    },
    _esc: null,
    close() {
      U.qs('#searchOverlay').classList.remove('open');
      document.removeEventListener('keydown', this._esc);
    },
    render(q) {
      const el = this.el;
      const history = S.state.searchHistory.slice(0, 6);
      let body = '';
      if (!q) {
        body =
          (history.length ? '<div class="search-group-title">Recent searches</div><div class="search-suggest">' +
            history.map(h => '<button class="sr-item" data-q="' + U.h(h) + '">' + I.icon('clock', '', 'width:16px;height:16px') + '<span class="t">' + U.h(h) + '</span></button>').join('') +
            '<button class="sr-item text-center" data-clear-history style="justify-content:center;color:var(--text-muted);font-size:13px">Clear recent searches</button></div>' : '') +
          '<div class="search-group-title">Trending now</div><div class="search-suggest">' +
          this.trending.map(h => '<button class="sr-item" data-q="' + U.h(h) + '">' + I.icon('trend', '', 'width:16px;height:16px') + '<span class="t">' + U.h(h) + '</span></button>').join('') + '</div>' +
          '<div class="search-group-title">Browse categories</div><div class="row" style="gap:8px;flex-wrap:wrap;padding:6px 10px">' +
          D.categories.slice(0, 8).map(c => '<a class="chip" href="#/shop?cat=' + c.id + '" data-close-search>' + U.h(c.name) + '</a>').join('') + '</div>' +
          '<div class="search-group-title">Popular brands</div><div class="row" style="gap:8px;flex-wrap:wrap;padding:6px 10px">' +
          D.brands.slice(0, 8).map(b => '<a class="chip" href="#/brand/' + b.id + '" data-close-search>' + U.h(b.name) + '</a>').join('') + '</div>';
      } else {
        const r = D.search(q);
        const total = r.products.length;
        const didYouMean = total < 3 ? D.suggest(q) : null;
        body =
          (didYouMean ? '<div style="padding:6px 10px 10px;font-size:13px" >Did you mean <button class="btn btn-sm btn-ghost" style="height:26px;padding:0 10px;color:var(--accent-500)" data-q="' + U.h(didYouMean) + '"><b>' + U.h(didYouMean) + '</b></button>?</div>' : '') +
          (r.brands.length ? '<div class="search-group-title">Brands</div><div class="search-suggest">' +
            r.brands.slice(0, 3).map(b => '<a class="sr-item" href="#/brand/' + b.id + '" data-close-search><span class="row" style="gap:10px">' + I.icon('store', '', 'width:16px;height:16px') + '<span class="t">' + U.h(b.name) + '</span></span><span class="s">' + b.products + ' products</span></a>').join('') + '</div>' : '') +
          (r.categories.length ? '<div class="search-group-title">Categories</div><div class="search-suggest">' +
            r.categories.slice(0, 3).map(c => '<a class="sr-item" href="#/shop?cat=' + c.id + '" data-close-search><span class="row" style="gap:10px">' + I.icon(c.icon, '', 'width:16px;height:16px') + '<span class="t">' + U.h(c.name) + '</span></span><span class="s">' + c.count + ' products</span></a>').join('') + '</div>' : '') +
          '<div class="search-group-title">' + total + ' products</div>' +
          '<div class="search-suggest">' + r.products.slice(0, 8).map(p =>
            '<a class="sr-item" href="#/product/' + p.id + '" data-close-search>' +
            '<img src="' + img(p.imgs[0], 120, 120) + '" alt="" loading="lazy">' +
            '<span style="flex:1;min-width:0"><span class="t">' + U.h(p.name) + '</span><span class="s">' + U.h(p.brand) + '</span></span>' +
            '<span style="font-weight:700">' + S.money(p.price) + '</span></a>').join('') + '</div>' +
          (total > 8 ? '<a class="btn btn-secondary btn-block mt-3" href="#/search?q=' + encodeURIComponent(q) + '" data-close-search>See all ' + total + ' results</a>' : '') +
          (total === 0 ? UI.empty({ icon: 'search', title: 'No results for “' + q + '”', text: 'Check spelling, try a more general term, or browse categories instead.', actions: '<a class="btn btn-primary" href="#/shop">Browse all products</a>' }) : '');
      }
      el.querySelector('.sp-body').innerHTML = body;
    },
    init() {
      const el = U.qs('#searchOverlay');
      el.innerHTML =
        '<div class="search-panel" role="dialog" aria-label="Search">' +
        '<div class="sp-head">' + I.icon('search', 'ic') +
        '<input id="searchInput" class="input" style="border:0;background:transparent;height:36px;padding:0" placeholder="Search products, brands, categories…" autocomplete="off">' +
        '<button class="iconbtn" data-sclose aria-label="Close">' + I.icon('close') + '</button></div>' +
        '<div class="sp-body"></div>' +
        '</div>';
      el.addEventListener('click', (e) => {
        if (e.target === el) this.close();
        if (e.target.closest('[data-sclose]')) this.close();
        const q = e.target.closest('[data-q]');
        if (q) { U.qs('#searchInput').value = q.dataset.q; this.render(q.dataset.q); }
        if (e.target.closest('[data-close-search]')) this.close();
        if (e.target.closest('[data-clear-history]')) { S.set({ searchHistory: [] }); this.render(''); }
      });
      this._esc = (e) => { if (e.key === 'Escape') this.close(); };
      const inp = U.qs('#searchInput');
      inp.addEventListener('input', U.debounce((e) => this.render(e.target.value.trim()), 180));
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const v = inp.value.trim(); if (!v) return;
          S.set({ searchHistory: [v].concat(S.state.searchHistory.filter(x => x !== v)).slice(0, 8) });
          this.close(); NOVA.Router.go('/search?q=' + encodeURIComponent(v));
        }
      });
    }
  };
  NOVA.Search = Search;

  /* ---------------- Cart drawer ---------------- */
  const Cart = {
    open(silent) {
      const el = U.qs('#cartDrawer');
      el.classList.add('open');
      UI.backdrop(() => Cart.close());
      this.render();
      if (silent) clearTimeout(this._t), this._t = setTimeout(() => { }, 0);
    },
    close() { U.qs('#cartDrawer').classList.remove('open'); UI.hideBackdrop(); },
    render() {
      const el = U.qs('#cartDrawer');
      const items = S.state.cart;
      const sub = items.reduce((s, i) => { const p = D.byId(i.productId); return s + (p ? p.price * i.qty : 0); }, 0);
      const threshold = 50;
      const pct = Math.min(100, (sub / threshold) * 100);
      const away = Math.max(0, threshold - sub);
      const ship = sub === 0 ? 0 : (sub >= threshold ? 0 : 8.99);
      const coupon = S.state.coupon;
      let disc = 0;
      if (coupon) {
        const c = D.coupons.find(x => x.code === coupon);
        if (c) disc = c.flat ? c.flat : sub * (c.off || 0);
        if (coupon === 'SHIPFREE') disc = 0;
      }
      const tax = (sub - disc) * 0.0825;
      const total = sub - disc + ship + tax;

      let body;
      if (!items.length) {
        body = UI.empty({
          icon: 'cart', title: 'Your cart is empty',
          text: 'Looks like you haven’t added anything yet. Explore this week’s arrivals.',
          actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a><button class="btn btn-secondary" data-closecart>Continue browsing</button>'
        });
      } else {
        body = items.map((i, idx) => {
          const p = D.byId(i.productId); if (!p) return '';
          return '<div class="cart-line">' +
            '<a class="thumb" href="#/product/' + p.id + '" data-closecart><img src="' + img(p.imgs[0], 160, 160) + '" alt="" loading="lazy"></a>' +
            '<div class="meta">' +
            '<a class="name" href="#/product/' + p.id + '" data-closecart>' + U.h(p.name) + '</a>' +
            '<div class="variant">' + U.h(i.color || p.colors[0].name) + (i.size ? ' · ' + U.h(i.size) : '') + '</div>' +
            '<div class="row" style="margin-top:8px;gap:8px">' +
            '<span class="qty" style="height:34px"><button data-q="-1" data-idx="' + idx + '" aria-label="Decrease">' + I.icon('minus', '', 'width:14px;height:14px') + '</button>' +
            '<span class="v">' + i.qty + '</span>' +
            '<button data-q="1" data-idx="' + idx + '" aria-label="Increase">' + I.icon('plus', '', 'width:14px;height:14px') + '</button></span>' +
            '<span class="price" style="margin-left:auto">' + S.money(p.price * i.qty) + '</span>' +
            '</div>' +
            '<div class="line-actions"><button data-save="' + idx + '">Save for later</button><button data-rm="' + idx + '">Remove</button></div>' +
            '</div></div>';
        }).join('') +
          (S.state.savedLater.length ? '<div class="mt-5"><div class="eyebrow mb-2">Saved for later</div>' +
            S.state.savedLater.map((sl, idx) => {
              const p = D.byId(sl.productId); if (!p) return '';
              return '<div class="cart-line" style="opacity:.85"><div class="thumb"><img src="' + img(p.imgs[0], 160, 160) + '" alt=""></div>' +
                '<div class="meta"><div class="name">' + U.h(p.name) + '</div><div class="variant">' + U.h(sl.color || '') + '</div>' +
                '<div class="line-actions"><button data-move="' + idx + '">Move to cart</button><button data-rmsave="' + idx + '">Remove</button></div></div>' +
                '<div class="price">' + S.money(p.price) + '</div></div>';
            }).join('') + '</div>' : '');
      }

      const foot = items.length ?
        '<div class="ship-progress">' +
        '<div class="t">' + (sub >= threshold ? '🎉 You’ve unlocked FREE shipping' : 'You’re ' + S.money(away) + ' away from FREE SHIPPING') + '</div>' +
        '<div class="progress' + (sub >= threshold ? ' success' : '') + '"><div class="bar" style="width:' + pct + '%"></div></div></div>' +
        '<div class="row" style="gap:8px;margin-bottom:10px">' +
        '<input class="input" style="height:38px" placeholder="Coupon code" value="' + U.h(S.state.coupon || '') + '" id="couponInput">' +
        '<button class="btn btn-secondary" style="height:38px" id="applyCoupon">Apply</button></div>' +
        (coupon ? '<div class="row-between mb-2" style="font-size:13px"><span class="muted">Coupon ' + U.h(coupon) + '</span><button class="btn btn-sm btn-ghost" id="rmCoupon">Remove</button></div>' : '') +
        '<div class="summary-row"><span class="muted">Subtotal</span><span>' + S.money(sub) + '</span></div>' +
        '<div class="summary-row"><span class="muted">Shipping</span><span>' + (ship === 0 ? '<span class="free">FREE</span>' : S.money(ship)) + '</span></div>' +
        '<div class="summary-row"><span class="muted">Tax (est.)</span><span>' + S.money(tax) + '</span></div>' +
        (disc > 0 ? '<div class="summary-row"><span class="muted">Discount</span><span style="color:var(--success)">−' + S.money(disc) + '</span></div>' : '') +
        '<div class="summary-row total"><span>Total</span><span>' + S.money(total) + '</span></div>' +
        '<div class="col gap-2 mt-3">' +
        '<button class="btn btn-primary btn-lg btn-block" id="goCheckout">' + I.icon('lock') + 'Checkout</button>' +
        '<button class="btn btn-ghost btn-block" data-closecart>Continue Shopping</button></div>' +
        '<div class="row" style="justify-content:center;gap:14px;margin-top:12px;font-size:11px;color:var(--text-soft)">' +
        '<span class="row" style="gap:5px">' + I.icon('shield', '', 'width:14px;height:14px') + 'Secure</span>' +
        '<span class="row" style="gap:5px">' + I.icon('refresh', '', 'width:14px;height:14px') + '30-day returns</span>' +
        '<span class="row" style="gap:5px">' + I.icon('truck', '', 'width:14px;height:14px') + 'Fast delivery</span></div>' : '';

      el.innerHTML =
        '<div class="drawer-head"><h4 style="display:flex;align-items:center;gap:8px">' + I.icon('cart') + 'Your cart' +
        (items.length ? '<span class="badge badge-dark">' + S.cartCount() + '</span>' : '') + '</h4>' +
        '<button class="iconbtn" data-closecart aria-label="Close">' + I.icon('close') + '</button></div>' +
        '<div class="drawer-body">' + body + '</div>' +
        (foot ? '<div class="drawer-foot">' + foot + '</div>' : '');

      el.onclick = (e) => {
        if (e.target.closest('[data-closecart]')) { Cart.close(); return; }
        const qb = e.target.closest('[data-q]');
        if (qb) { const i = +qb.dataset.idx; S.updateQty(i, S.state.cart[i].qty + (+qb.dataset.q)); return; }
        const rm = e.target.closest('[data-rm]');
        if (rm) { const p = D.byId(S.state.cart[+rm.dataset.rm].productId); S.removeFromCart(+rm.dataset.rm); UI.toast({ title: 'Removed', desc: p ? p.name : '' }); return; }
        const sv = e.target.closest('[data-save]');
        if (sv) {
          const idx = +sv.dataset.save;
          const it = S.state.cart[idx]; if (!it) return;
          S.set({ savedLater: S.state.savedLater.concat([it]), cart: S.state.cart.filter((_, k) => k !== idx) });
          S.emit('cart'); UI.toast({ title: 'Saved for later' }); return;
        }
        const mv = e.target.closest('[data-move]');
        if (mv) {
          const idx = +mv.dataset.move; const it = S.state.savedLater[idx]; if (!it) return;
          S.set({ cart: S.state.cart.concat([it]), savedLater: S.state.savedLater.filter((_, k) => k !== idx) });
          S.emit('cart'); UI.toast({ title: 'Moved to cart' }); return;
        }
        const rs = e.target.closest('[data-rmsave]');
        if (rs) { S.set({ savedLater: S.state.savedLater.filter((_, k) => k !== +rs.dataset.rmsave) }); return; }
        if (e.target.closest('#applyCoupon')) {
          const code = (U.qs('#couponInput').value || '').trim().toUpperCase();
          const c = D.coupons.find(x => x.code === code);
          if (!c) { UI.toast({ type: 'error', title: 'Invalid code', desc: 'Try NOVA10, FLASH20 or SHIPFREE' }); return; }
          if (c.min && sub < c.min) { UI.toast({ type: 'warn', title: 'Minimum not met', desc: 'Spend ' + S.money(c.min) + ' to use this code' }); return; }
          S.set({ coupon: code }); UI.toast({ title: 'Coupon applied', desc: c.label }); return;
        }
        if (e.target.closest('#rmCoupon')) { S.set({ coupon: null }); return; }
        if (e.target.closest('#goCheckout')) { Cart.close(); NOVA.Router.go('/checkout'); return; }
      };
    }
  };
  NOVA.Cart = Cart;

  /* ---------------- Notifications panel ---------------- */
  const Notif = {
    open() {
      const el = U.qs('#notifDrawer');
      el.innerHTML =
        '<div class="drawer-head"><h4 style="display:flex;align-items:center;gap:8px">' + I.icon('bell') + 'Notifications' +
        (S.unreadCount() ? '<span class="badge badge-new">' + S.unreadCount() + '</span>' : '') + '</h4>' +
        '<button class="row" style="gap:8px"><button class="btn btn-sm btn-ghost" id="markAll">Mark all read</button>' +
        '<button class="iconbtn" data-closen aria-label="Close">' + I.icon('close') + '</button></button></div>' +
        '<div class="drawer-body">' + this.body() + '</div>';
      el.classList.add('open');
      UI.backdrop(() => Notif.close());
      el.onclick = (e) => {
        if (e.target.closest('[data-closen]')) { Notif.close(); return; }
        if (e.target.closest('#markAll')) { S.markAllRead(); Notif.open(); return; }
        const it = e.target.closest('[data-nread]');
        if (it) { S.markNotifRead(it.dataset.nread); Notif.open(); }
      };
    },
    close() { U.qs('#notifDrawer').classList.remove('open'); UI.hideBackdrop(); },
    body() {
      const list = S.state.notifications;
      if (!list.length) return UI.empty({ icon: 'bell', title: 'Nothing here yet', text: 'Order updates, price drops and restocks will show up here.' });
      return list.map(n =>
        '<div class="notif-item' + (n.read ? '' : ' unread') + '" data-nread="' + n.id + '">' +
        '<div class="ic">' + I.icon(n.icon || 'bell', '', 'width:18px;height:18px') + '</div>' +
        '<div style="flex:1"><div class="t">' + U.h(n.title) + '</div><div class="d">' + U.h(n.body) + '</div>' +
        '<div class="w">' + U.timeAgo(n.at) + '</div></div>' +
        (n.read ? '' : '<span class="badge badge-new">New</span>') + '</div>').join('');
    }
  };
  NOVA.Notif = Notif;

  /* ---------------- Global subscriptions ---------------- */
  function wireStore() {
    S.on('cart', () => { syncCounts(); if (U.qs('#cartDrawer').classList.contains('open')) Cart.render(); });
    S.on('wishlist', () => syncCounts());
    S.on('notif', () => syncCounts());
    S.on('theme', () => { const b = U.qs('#themeBtn'); if (b) b.innerHTML = I.icon(S.effectiveTheme() === 'dark' ? 'sun' : 'moon'); });
  }

  /* ---------------- Scroll effects ---------------- */
  function wireScroll() {
    const nav = U.qs('#navbar');
    const onScroll = U.throttle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
      U.qsa('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        el.style.transform = 'translate3d(0,' + ((window.innerHeight - r.top) * speed * 0.08).toFixed(2) + 'px,0)';
      });
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Keyboard shortcuts ---------------- */
  function wireKeys() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === '/') { e.preventDefault(); Search.open(); }
      if (e.key === 'Escape') { UI.closeModal(); }
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    const th = U.store.get('theme', S.state.theme);
    S.setTheme(th || null, true);
    renderAnnounce();
    renderNav();
    renderBottomNav();
    renderFooter();
    Search.init();
    wireStore();
    wireScroll();
    wireKeys();
    UI.delegate(document);
    NOVA.emitRoute = (ctx) => setActiveNav(ctx.path);
    NOVA.Router.start();
    /* Seed gentle notifications over time */
    setTimeout(() => {
      if (!S.state.notifications.length) S.set({ notifications: D.notifications });
    }, 0);
    /* Simulated engagement nudge */
    setTimeout(() => {
      if (S.unreadCount() === 0) {
        S.pushNotif({ type: 'promo', icon: 'spark', title: 'Your cart is waiting', body: 'Items in your cart are reserved for 24 hours.' });
      }
    }, 9000);
  }

  NOVA.App = { boot, syncCounts, setActiveNav, renderNav, renderFooter, ANNOUNCEMENTS };
  document.addEventListener('DOMContentLoaded', boot);
})();
