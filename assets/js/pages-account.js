/* ============================================================
   NOVA — Account Center & Wishlist
   Routes: #/account, #/account/orders, #/account/wishlist,
           #/wishlist, #/account/addresses, #/account/payments,
           #/account/rewards, #/account/notifications,
           #/account/settings
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  'use strict';

  const U = NOVA.U;
  const S = NOVA.Store;
  const D = NOVA.Data;
  const UI = NOVA.UI;
  const img = NOVA.img;
  if (!NOVA.ICONS && window.ICONS) NOVA.ICONS = window.ICONS;
  const I = NOVA.ICONS;

  /* ---------------------------------------------------------
     Constants / tiny helpers
     --------------------------------------------------------- */
  const TIERS = [
    { name: 'Bronze', min: 0, perk: 'Member pricing · Birthday points' },
    { name: 'Silver', min: 1000, perk: '1.25× points · Early access to drops' },
    { name: 'Gold', min: 2000, perk: '1.5× points · Free express shipping' },
    { name: 'Platinum', min: 5000, perk: '2× points · Dedicated concierge' }
  ];

  const STATUS_FLOW = ['Processing', 'Shipped', 'Out for delivery', 'Delivered'];
  const STATUS_CLASS = {
    'Processing': 'status-processing',
    'Shipped': 'status-shipped',
    'Out for delivery': 'status-delivery',
    'Delivered': 'status-delivered',
    'Cancelled': 'status-cancelled'
  };
  const ORDER_TABS = ['All', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];

  const REDEEMS = [
    { id: 'r10', title: '$10 off your next order', cost: 1000, code: 'GOLD10', note: 'Applied automatically at checkout.' },
    { id: 'r25', title: '$25 off orders over $150', cost: 2200, code: 'GOLD25', note: 'One redemption per account.' },
    { id: 'rship', title: 'Free express shipping', cost: 500, code: 'SHIPFREE', note: 'Valid on your next two orders.' }
  ];

  const DEFAULT_EMAIL_PREFS = { orders: true, promos: true, priceDrop: true, restock: true };
  const DEFAULT_PRIVACY = { personalize: true, analytics: false };

  const NAV = [
    { path: '/account', key: 'overview', icon: 'grid' },
    { path: '/account/orders', key: 'orders', icon: 'package' },
    { path: '/account/wishlist', key: 'wishlist', icon: 'heart' },
    { path: '/account/addresses', key: 'addresses', icon: 'mapPin' },
    { path: '/account/payments', key: 'paymentMethods', icon: 'credit' },
    { path: '/account/rewards', key: 'rewards', icon: 'award' },
    { path: '/account/notifications', key: 'notifications', icon: 'bell' },
    { path: '/account/settings', key: 'settings', icon: 'settings' }
  ];

  const num = (n) => Number(n || 0).toLocaleString('en-US');
  const pad2 = (n) => String(n).padStart(2, '0');
  const viewEl = () => U.qs('#view') || document.body;
  const statusClass = (s) => STATUS_CLASS[s] || 'status-processing';

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function tierOf(points) {
    let t = TIERS[0];
    TIERS.forEach(x => { if (points >= x.min) t = x; });
    return t;
  }
  function nextTier(points) {
    return TIERS.find(t => t.min > points) || null;
  }
  function profile() {
    const base = D.customer || { name: 'Guest', email: '', phone: '', avatar: '1524594152303-aabd1fc54bc9' };
    return Object.assign({}, base, S.state.user || {});
  }

  /* ---------------------------------------------------------
     Seed account data into the store once
     --------------------------------------------------------- */
  let seeded = false;
  function seed() {
    if (seeded) return;
    seeded = true;
    if (S.state.acctSeeded) return;
    const patch = { acctSeeded: true };
    const st = S.state;
    if (!st.addresses || !st.addresses.length) patch.addresses = D.addresses.map(a => Object.assign({}, a));
    if (!st.payments || !st.payments.length) patch.payments = D.payments.map(a => Object.assign({}, a));
    if (!st.orders || !st.orders.length) {
      patch.orders = D.orders.map(o => Object.assign({}, o, { items: o.items.map(i => Object.assign({}, i)) }));
    }
    if (!st.notifications || !st.notifications.length) patch.notifications = D.notifications.map(n => Object.assign({}, n));
    if (!st.wishlist || !st.wishlist.length) {
      patch.wishlist = [8, 15, 19, 26, 36, 45].map(i => D.products[i] && D.products[i].id).filter(Boolean);
    }
    if (!st.recentlyViewed || !st.recentlyViewed.length) {
      patch.recentlyViewed = [0, 7, 10, 15, 20, 25, 30, 45].map(i => D.products[i] && D.products[i].id).filter(Boolean);
    }
    S.set(patch);
  }

  const orders = () => (S.state.orders && S.state.orders.length) ? S.state.orders : D.orders;
  const notifs = () => (S.state.notifications && S.state.notifications.length) ? S.state.notifications : (D.notifications || []);
  const addresses = () => S.state.addresses || [];
  const payments = () => S.state.payments || [];
  const emailPrefs = () => Object.assign({}, DEFAULT_EMAIL_PREFS, S.state.emailPrefs || {});
  const privacyPrefs = () => Object.assign({}, DEFAULT_PRIVACY, S.state.privacyPrefs || {});
  const findOrder = (id) => orders().find(o => o.id === id);

  /* ---------------------------------------------------------
     Shell: page head, sidebar profile card, nav
     --------------------------------------------------------- */
  function headHtml(title, crumb, opts) {
    opts = opts || {};
    return `<div class="page-head">
      <div class="crumbs">
        <a href="#/">${U.h(S.t('home'))}</a><span class="sep">/</span>
        <a href="#/account">${U.h(S.t('account'))}</a>
        ${crumb ? `<span class="sep">/</span><span>${U.h(crumb)}</span>` : ''}
      </div>
      <div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:var(--s-4)">
        <div>
          <h1>${U.h(title)}</h1>
          ${opts.lead ? `<p class="muted mt-2" style="max-width:60ch;font-size:15px">${U.h(opts.lead)}</p>` : ''}
        </div>
        ${opts.action || ''}
      </div>
    </div>`;
  }

  function navCount(path) {
    if (path === '/account/orders') return orders().length;
    if (path === '/account/wishlist') return (S.state.wishlist || []).length;
    if (path === '/account/notifications') return S.unreadCount();
    return 0;
  }

  function navInner(active) {
    const items = NAV.map(n => {
      const c = navCount(n.path);
      return `<a href="#${n.path}"${active === n.path ? ' class="active" aria-current="page"' : ''}>${I.icon(n.icon)}<span>${U.h(S.t(n.key))}</span>${c ? `<span class="count-badge">${c}</span>` : ''}</a>`;
    }).join('');
    return `${items}
      <div class="divider" style="margin:8px 4px"></div>
      <a href="#/" data-act="logout">${I.icon('logout')}<span>Log out</span></a>`;
  }

  function profileInner() {
    const c = profile();
    const tier = tierOf(S.state.points);
    return `<div class="card" style="padding:18px">
      <div class="row" style="gap:14px;align-items:flex-start">
        <img src="${img(c.avatar, 120, 120)}" alt="" width="52" height="52" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex:none;border:1px solid var(--border)">
        <div style="min-width:0;flex:1">
          <div style="font-weight:700;letter-spacing:-.01em;line-height:1.25">${U.h(c.name)}</div>
          <div class="muted" style="font-size:12.5px;word-break:break-all">${U.h(c.email)}</div>
          <div class="mt-2"><span class="badge" style="background:linear-gradient(135deg,#F59E0B,#FF6F61);color:#fff;border:0">${I.icon('crown', '', 'style="width:12px;height:12px"')}${U.h(tier.name)} member</span></div>
        </div>
      </div>
      <div class="divider" style="margin:16px 0"></div>
      <div class="row-between">
        <div>
          <div class="soft" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em">Points</div>
          <div style="font-weight:800;letter-spacing:-.02em">${num(S.state.points)}</div>
        </div>
        <a class="btn btn-secondary btn-sm" href="#/account/rewards">${I.icon('gift')}Rewards</a>
      </div>
    </div>`;
  }

  function sideHtml(active) {
    return `<div class="col" style="gap:var(--s-4)">
      <div id="acct-profile">${profileInner()}</div>
      <nav class="acct-nav" id="acct-nav" aria-label="Account sections">${navInner(active)}</nav>
    </div>`;
  }

  function shellHtml(active, head, body) {
    return `<section class="section-sm"><div class="container">
      ${head}
      <div class="acct-layout">
        ${sideHtml(active)}
        <div id="acct-body">${body}</div>
      </div>
    </div></section>`;
  }

  /* ---------------------------------------------------------
     Skeletons
     --------------------------------------------------------- */
  const skLine = (w, h) => `<div class="skeleton sk-line" style="width:${w};${h ? 'height:' + h + 'px' : ''}"></div>`;
  const skBlock = (h) => `<div class="skeleton sk-block" style="height:${h}px"></div>`;

  const SKELETONS = {
    overview: () => `<div class="grid grid-4">${new Array(4).fill(skBlock(112)).join('')}</div>
      <div class="mt-7">${skLine('180px', 18)}<div class="mt-4 col" style="gap:var(--s-3)">${new Array(3).fill(skBlock(150)).join('')}</div></div>`,
    orders: () => `${skLine('220px', 18)}<div class="mt-4 col" style="gap:var(--s-3)">${new Array(4).fill(skBlock(168)).join('')}</div>`,
    wishlist: () => `<div class="row-between">${skLine('140px', 14)}<div class="row" style="gap:8px">${skBlock(38).replace('height:38px', 'height:38px;width:180px')}${skBlock(38).replace('height:38px', 'height:38px;width:220px')}</div></div>
      <div class="mt-5">${UI.skeletonGrid(6)}</div>`,
    addresses: () => `<div class="grid grid-2">${new Array(2).fill(skBlock(196)).join('')}</div>`,
    payments: () => `<div class="col" style="gap:var(--s-3)">${new Array(3).fill(skBlock(86)).join('')}</div>`,
    rewards: () => `${skBlock(190)}<div class="mt-6 grid grid-4">${new Array(4).fill(skBlock(124)).join('')}</div><div class="mt-6 grid grid-2">${new Array(2).fill(skBlock(210)).join('')}</div>`,
    notifications: () => `<div class="col" style="gap:2px">${new Array(5).fill(skBlock(74)).join('')}</div>`,
    settings: () => `<div class="col" style="gap:var(--s-4)">${new Array(4).fill(skBlock(220)).join('')}</div>`
  };

  /* ---------------------------------------------------------
     Mount / paint
     --------------------------------------------------------- */
  let activePath = '/account';
  let renderBody = null;
  let renderHead = null;

  function paint(view, html) {
    const body = U.qs('#acct-body', view);
    if (body) body.innerHTML = html;
    const nav = U.qs('#acct-nav', view);
    if (nav) nav.innerHTML = navInner(activePath);
    const prof = U.qs('#acct-profile', view);
    if (prof) prof.innerHTML = profileInner();
    UI.observeReveals(view);
    UI.wireCarousel(view);
  }

  function repaint() {
    if (!renderBody) return;
    paint(viewEl(), renderBody());
  }

  /* Full shell re-render (used when i18n / currency affects the page head too) */
  function rerenderShell() {
    if (!renderBody || !renderHead) return;
    const view = viewEl();
    view.innerHTML = shellHtml(activePath, renderHead(), renderBody());
    UI.observeReveals(view);
    UI.wireCarousel(view);
  }

  async function page(path, headFn, bodyFn, skelKey) {
    seed();
    bindView();
    activePath = path;
    renderBody = bodyFn;
    renderHead = headFn;
    const view = viewEl();
    view.innerHTML = shellHtml(path, headFn(), (SKELETONS[skelKey] || SKELETONS.settings)());
    await U.sleep(340 + Math.round(Math.random() * 170));
    paint(view, bodyFn());
  }

  /* ---------------------------------------------------------
     Shared fragments
     --------------------------------------------------------- */
  function thumbRow(o, max) {
    max = max || 3;
    const items = (o.items || []).slice(0, max);
    const extra = (o.items || []).length - items.length;
    return `<div class="items">${items.map(it => {
      const p = D.byId(it.productId);
      if (!p) return '';
      return `<img src="${img(p.imgs[0], 120, 120)}" alt="${U.h(p.name)}" loading="lazy" decoding="async" width="56" height="56">`;
    }).join('')}${extra > 0 ? `<span class="soft" style="width:56px;height:56px;border-radius:var(--r-2);background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">+${extra}</span>` : ''}</div>`;
  }

  function orderCardHtml(o) {
    const count = (o.items || []).reduce((n, i) => n + (i.qty || 1), 0);
    return `<article class="order-card">
      <div class="row-between" style="flex-wrap:wrap;gap:var(--s-2)">
        <div>
          <div style="font-weight:700;letter-spacing:-.01em">${U.h(o.id)}</div>
          <div class="soft" style="font-size:12px">Placed ${U.h(U.formatDate(o.date))}<span class="dot-sep"></span>${count} item${count === 1 ? '' : 's'}</div>
        </div>
        <span class="status-pill ${statusClass(o.status)}">${U.h(o.status)}</span>
      </div>
      ${thumbRow(o)}
      <div class="row-between" style="flex-wrap:wrap;gap:var(--s-3)">
        <div>
          <div class="soft" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em">Total</div>
          <div style="font-weight:800;letter-spacing:-.02em">${S.money(o.total || 0)}</div>
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${o.status === 'Cancelled' ? '' : `<button class="btn btn-secondary btn-sm" data-track="${U.h(o.id)}">${I.icon('truck')}Track Order</button>`}
          <button class="btn btn-ghost btn-sm" data-details="${U.h(o.id)}">${I.icon('eye')}View Details</button>
        </div>
      </div>
    </article>`;
  }

  function carouselNav(id) {
    return `<div class="carousel-nav">
      <button class="btn btn-secondary" data-carousel="#${id}" data-dir="prev" aria-label="Scroll left">${I.icon('chevronLeft')}</button>
      <button class="btn btn-secondary" data-carousel="#${id}" data-dir="next" aria-label="Scroll right">${I.icon('chevronRight')}</button>
    </div>`;
  }

  function statCard(label, value, delta, up) {
    return `<div class="stat-card">
      <div class="l">${U.h(label)}</div>
      <div class="v">${U.h(value)}</div>
      ${delta ? `<div class="d ${up === false ? 'down' : 'up'}">${U.h(delta)}</div>` : ''}
    </div>`;
  }

  /* =========================================================
     1. Overview
     ========================================================= */
  function overviewBody() {
    const c = profile();
    const all = orders();
    const spent = all.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0);
    const recent = all.slice(0, 3);
    const wish = (S.state.wishlist || []).map(id => D.byId(id)).filter(Boolean);
    const viewed = (S.state.recentlyViewed || []).map(id => D.byId(id)).filter(Boolean).slice(0, 4);
    const base = wish[0] || viewed[0] || D.products[0];
    const recs = D.related(base, 4);
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const tier = tierOf(S.state.points);
    const next = nextTier(S.state.points);

    let out = `<div class="card" style="padding:clamp(20px,3vw,28px);background:var(--surface-2)">
      <div class="row-between" style="align-items:flex-start;flex-wrap:wrap;gap:var(--s-4)">
        <div style="min-width:0">
          <div class="eyebrow"><span class="dot"></span>${U.h(tier.name)} member</div>
          <h3 class="mt-2" style="font-size:clamp(22px,2.6vw,30px)">${U.h(greet)}, ${U.h(c.name.split(' ')[0])}</h3>
          <p class="muted mt-2" style="font-size:14px;max-width:52ch">${all.length ? `You have ${all.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} order(s) on the way and ${num(S.state.points)} points to spend.` : 'Start exploring — your orders, wishlist and rewards will appear here.'}</p>
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <a class="btn btn-primary" href="#/shop">${I.icon('spark')}Discover new arrivals</a>
          <a class="btn btn-secondary" href="#/account/orders">${I.icon('package')}My orders</a>
        </div>
      </div>
    </div>`;

    out += `<div class="grid grid-4 mt-6">
      ${statCard('Total spent', S.money(spent), '+18% vs. last quarter', true)}
      ${statCard('Orders', String(all.length), all.length ? `${all.filter(o => o.status === 'Delivered').length} delivered` : 'No orders yet', true)}
      ${statCard('Reward points', num(S.state.points), next ? `${num(next.min - S.state.points)} to ${next.name}` : 'Top tier reached', true)}
      ${statCard('Saved items', String(wish.length), wish.length ? `${wish.filter(p => p.was).length} on sale` : 'Nothing saved yet', true)}
    </div>`;

    /* Recent orders */
    out += `<div class="mt-8">${UI.sectionHeader({
      eyebrow: 'Activity',
      title: 'Recent orders',
      lead: 'Your latest purchases and where they are right now.',
      action: `<a class="btn btn-ghost btn-sm" href="#/account/orders">View all${I.icon('arrowRight')}</a>`
    })}`;
    out += recent.length
      ? `<div class="col " style="gap:var(--s-3)">${recent.map(orderCardHtml).join('')}</div>`
      : UI.empty({ icon: 'package', title: 'No orders yet', text: 'When you place an order it will show up here with live tracking.', actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a>' });
    out += `</div>`;

    /* Wishlist preview */
    out += `<div class="mt-8">${UI.sectionHeader({
      eyebrow: 'Saved',
      title: 'From your wishlist',
      lead: 'Pieces you saved, with live pricing and stock.',
      action: `<div class="row" style="gap:8px">${carouselNav('ov-wl-track')}<a class="btn btn-ghost btn-sm" href="#/account/wishlist">All ${wish.length}</a></div>`
    })}`;
    out += wish.length
      ? `<div class="carousel" id="ov-wl-track">${wish.map(p => UI.productCard(p)).join('')}</div>`
      : UI.empty({ icon: 'heart', title: 'Your wishlist is empty', text: 'Tap the heart on any product to keep it here for later.', actions: '<a class="btn btn-primary" href="#/shop">Browse the catalog</a>' });
    out += `</div>`;

    /* Recently viewed */
    if (viewed.length) {
      out += `<div class="mt-8">${UI.sectionHeader({ eyebrow: 'History', title: 'Recently viewed', lead: 'Pick up where you left off.' })}
        <div class="prod-grid cols-4 ">${viewed.map(p => UI.productCard(p)).join('')}</div></div>`;
    }

    /* Recommended */
    out += `<div class="mt-8">${UI.sectionHeader({ eyebrow: 'For you', title: 'Recommended', lead: 'Chosen from what you have saved and browsed.' })}
      <div class="prod-grid cols-4 ">${recs.map(p => UI.productCard(p)).join('')}</div></div>`;

    return out;
  }

  function overviewRoute() {
    return page('/account', () => headHtml(S.t('overview'), '', {
      lead: 'Everything about your NOVA account — orders, saved items, rewards and preferences.'
    }), overviewBody, 'overview');
  }

  /* =========================================================
     2. Orders
     ========================================================= */
  let orderFilter = 'All';

  function ordersBody() {
    const all = orders();
    const list = orderFilter === 'All' ? all : all.filter(o => o.status === orderFilter);
    const tabs = `<div class="tabs" role="tablist" style="max-width:100%;overflow-x:auto">${ORDER_TABS.map(s => {
      const n = s === 'All' ? all.length : all.filter(o => o.status === s).length;
      return `<button role="tab" data-otab="${U.h(s)}" class="${orderFilter === s ? 'active' : ''}" aria-selected="${orderFilter === s}">${U.h(s)} ${n}</button>`;
    }).join('')}</div>`;

    if (!list.length) {
      return `${tabs}<div class="mt-6">${UI.empty({
        icon: 'package',
        title: 'No ' + (orderFilter === 'All' ? '' : orderFilter.toLowerCase() + ' ') + 'orders',
        text: orderFilter === 'All' ? 'Your order history will appear here once you make a purchase.' : 'Nothing here right now. Switch the filter to see your other orders.',
        actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a><button class="btn btn-secondary" data-otab="All">Show all orders</button>'
      })}</div>`;
    }

    return `${tabs}<div class="col  mt-5" style="gap:var(--s-3)">${list.map(orderCardHtml).join('')}</div>`;
  }

  function ordersRoute() {
    return page('/account/orders', () => headHtml('My orders', S.t('orders'), {
      lead: 'Track shipments, review what you bought and download invoices.'
    }), ordersBody, 'orders');
  }

  function trackingNo(o) {
    return '1Z' + String(o.id).replace(/\D/g, '') + 'US';
  }

  function trackModal(id) {
    const o = findOrder(id);
    if (!o) return;
    const idx = STATUS_FLOW.indexOf(o.status);
    const base = new Date(o.date).getTime();
    const steps = STATUS_FLOW.map((s, i) => {
      const done = i <= idx;
      const at = new Date(base + i * 86400000 + (i ? 7 * 3600000 : 0));
      const last = i === STATUS_FLOW.length - 1;
      const note = i === 0 ? 'We received your order and payment'
        : i === 1 ? 'Handed to the carrier'
          : i === 2 ? 'Out with the courier for delivery'
            : 'Delivered — thanks for shopping NOVA';
      return `<div class="tl${done ? ' done' : ''}">
        <div class="rail"><span class="dot"></span><span class="bar"${last ? ' style="background:transparent"' : ''}></span></div>
        <div class="c">
          <div class="t">${U.h(s)}</div>
          <div class="d">${done ? U.h(U.formatDate(at)) + ' · ' + U.h(note) : 'Estimated ' + U.h(U.formatDate(at))}</div>
        </div>
      </div>`;
    }).join('');

    UI.modal({
      title: 'Track ' + o.id,
      width: 560,
      body: `<div class="col" style="gap:var(--s-4)">
        <div class="card card-flat" style="padding:14px 16px">
          <div class="row-between" style="flex-wrap:wrap;gap:var(--s-2)">
            <div>
              <div class="soft" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em">Tracking number</div>
              <div class="mono" style="font-weight:600">${U.h(trackingNo(o))}</div>
            </div>
            <div style="text-align:right">
              <div class="soft" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em">Estimated delivery</div>
              <div style="font-weight:700">${U.h(U.formatDate(o.eta))}</div>
            </div>
          </div>
        </div>
        <div class="timeline">${steps}</div>
        <div class="muted" style="font-size:13px">${I.icon('mapPin', '', 'style="width:14px;height:14px;vertical-align:-2px"')} Delivering to ${U.h(o.address)}</div>
      </div>`,
      footer: `<button class="btn btn-secondary" data-close>Close</button>
        <button class="btn btn-primary" data-details="${U.h(o.id)}">${I.icon('eye')}View Details</button>`
    });
  }

  function detailsModal(id) {
    const o = findOrder(id);
    if (!o) return;
    const lines = (o.items || []).map(it => {
      const p = D.byId(it.productId);
      if (!p) return '';
      return `<div class="cart-line" style="padding:12px 0">
        <div class="thumb"><img src="${img(p.imgs[0], 160, 160)}" alt="${U.h(p.name)}" loading="lazy"></div>
        <div class="meta">
          <a class="name" href="#/product/${U.h(p.id)}">${U.h(p.name)}</a>
          <div class="variant">${U.h([it.color, it.size].filter(Boolean).join(' · ') || p.brand)}</div>
          <div class="variant">Qty ${it.qty} × ${S.money(it.price)}</div>
        </div>
        <div class="price">${S.money(it.price * it.qty)}</div>
      </div>`;
    }).join('');

    const row = (k, v, cls) => `<div class="summary-row${cls ? ' ' + cls : ''}"><span class="muted">${U.h(k)}</span><span${cls ? ' style="font-weight:800;letter-spacing:-.02em"' : ''}>${U.h(v)}</span></div>`;

    UI.modal({
      title: 'Order ' + o.id,
      width: 640,
      body: `<div class="col" style="gap:var(--s-5)">
        <div class="row-between" style="flex-wrap:wrap;gap:var(--s-2)">
          <div class="soft" style="font-size:13px">Placed ${U.h(U.formatDate(o.date))}<span class="dot-sep"></span>${o.items.length} item(s)</div>
          <span class="status-pill ${statusClass(o.status)}">${U.h(o.status)}</span>
        </div>
        <div>${lines}</div>
        <div class="card card-flat" style="padding:14px 16px">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em" class="soft">Shipping address</div>
          <div style="font-size:14px;margin-top:4px">${U.h(o.address)}</div>
        </div>
        <div>
          ${row('Subtotal', S.money(o.subtotal || 0))}
          ${row('Shipping', (o.shipping || 0) === 0 ? 'FREE' : S.money(o.shipping))}
          ${row('Tax', S.money(o.tax || 0))}
          ${(o.discount ? row('Discount', '-' + S.money(o.discount)) : '')}
          ${row('Total', S.money(o.total || 0), 'total')}
        </div>
      </div>`,
      footer: `<button class="btn btn-secondary" data-close>Close</button>
        <button class="btn btn-primary" data-act="invoice" data-id="${U.h(o.id)}">${I.icon('download')}Download invoice</button>`
    });
  }

  /* =========================================================
     3. Wishlist
     ========================================================= */
  let wlSort = 'date';
  let wlFilter = 'all';

  function wlItems() {
    let list = (S.state.wishlist || []).map(id => D.byId(id)).filter(Boolean);
    if (wlFilter === 'instock') list = list.filter(p => p.stock > 0);
    if (wlFilter === 'sale') list = list.filter(p => !!p.was);
    if (wlSort === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
    else if (wlSort === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
    else if (wlSort === 'rating') list = list.slice().sort((a, b) => b.rating - a.rating);
    return list;
  }

  function wlCard(p) {
    const inStock = p.stock > 0;
    const low = inStock && p.stock <= 10;
    const stockHtml = inStock
      ? `<span style="color:var(--success)">● ${low ? 'Only ' + p.stock + ' left' : 'In stock'}</span>`
      : `<span style="color:var(--danger)">● Out of stock</span>`;
    return `<article class="card pcard">
      <div class="pcard-media">
        <a href="#/product/${U.h(p.id)}"><img src="${img(p.imgs[0], 500, 625)}" alt="${U.h(p.name)}" loading="lazy" decoding="async"></a>
        <div class="pcard-badges">
          <div class="left">${UI.badgeHtml(p)}${p.was ? '<span class="badge badge-sale">-' + p.off + '%</span>' : ''}</div>
          <div class="right">
            <button class="iconbtn pcard-wish active" data-wish="${U.h(p.id)}" aria-label="Remove from wishlist" aria-pressed="true" style="width:34px;height:34px">${I.icon('heart', '', 'style="width:18px;height:18px"')}</button>
          </div>
        </div>
      </div>
      <div style="padding:14px;display:flex;flex-direction:column;gap:6px">
        <div class="pcard-brand">${U.h(p.brand)}</div>
        <h3 class="pcard-name"><a href="#/product/${U.h(p.id)}">${U.h(p.name)}</a></h3>
        <div class="pcard-rating">${I.stars(p.rating)}<span>${p.rating.toFixed(1)} (${num(p.reviews)})</span></div>
        ${UI.priceHtml(p)}
        <div style="font-size:12px">${stockHtml}</div>
        <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" style="flex:1;min-width:120px" ${inStock ? `data-add="${U.h(p.id)}"` : 'disabled'}>${I.icon('cart')}Add to Cart</button>
          <button class="btn btn-secondary btn-sm" data-wl-remove="${U.h(p.id)}">${I.icon('trash')}Remove</button>
        </div>
      </div>
    </article>`;
  }

  function wishlistBody() {
    const total = (S.state.wishlist || []).length;
    const list = wlItems();
    const toolbar = `<div class="row-between" style="flex-wrap:wrap;gap:var(--s-3)">
      <div class="tabs" style="max-width:100%;overflow-x:auto">
        <button data-wl-filter="all" class="${wlFilter === 'all' ? 'active' : ''}">All ${total}</button>
        <button data-wl-filter="instock" class="${wlFilter === 'instock' ? 'active' : ''}">In stock</button>
        <button data-wl-filter="sale" class="${wlFilter === 'sale' ? 'active' : ''}">On sale</button>
      </div>
      <div class="row" style="gap:8px">
        <label class="sr-only" for="wl-sort">Sort wishlist</label>
        <select class="input" id="wl-sort" data-sort style="width:auto;height:38px;border-radius:var(--r-full);font-size:13px;padding-inline:14px">
          <option value="date"${wlSort === 'date' ? ' selected' : ''}>Date added</option>
          <option value="price-asc"${wlSort === 'price-asc' ? ' selected' : ''}>Price: low to high</option>
          <option value="price-desc"${wlSort === 'price-desc' ? ' selected' : ''}>Price: high to low</option>
          <option value="rating"${wlSort === 'rating' ? ' selected' : ''}>Rating</option>
        </select>
      </div>
    </div>`;

    if (!total) {
      return UI.empty({
        icon: 'heart',
        title: 'Your wishlist is empty',
        text: 'Save the things you love and they will wait here with live pricing and stock alerts.',
        actions: '<a class="btn btn-primary" href="#/shop">Browse the catalog</a><a class="btn btn-secondary" href="#/deals">See today’s deals</a>'
      });
    }

    return `${toolbar}
      <div class="soft mt-3" style="font-size:13px">${list.length} of ${total} item${total === 1 ? '' : 's'}${wlFilter === 'all' ? '' : ' matching this filter'}</div>
      <div class="wl-grid mt-4 ">${list.map(wlCard).join('')}</div>`;
  }

  function wishlistRoute() {
    return page('/account/wishlist', () => headHtml(S.t('wishlist'), S.t('wishlist'), {
      lead: 'Everything you have saved, with live stock and price updates.'
    }), wishlistBody, 'wishlist');
  }

  /* =========================================================
     4. Address book
     ========================================================= */
  function addressCard(a) {
    return `<article class="card" style="padding:18px">
      <div class="row-between" style="align-items:flex-start;gap:var(--s-3)">
        <div class="row" style="gap:10px">
          <span class="badge ${a.isDefault ? 'badge-new' : ''}">${U.h(a.label || 'Address')}</span>
          ${a.isDefault ? '<span class="badge">Default</span>' : ''}
        </div>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-addr-edit="${U.h(a.id)}">${I.icon('edit')}Edit</button>
          <button class="btn btn-ghost btn-sm" data-addr-del="${U.h(a.id)}">${I.icon('trash')}Delete</button>
        </div>
      </div>
      <div class="mt-3" style="font-weight:600">${U.h(a.name)}</div>
      <div class="muted" style="font-size:14px">${U.h(a.line1)}</div>
      <div class="muted" style="font-size:14px">${U.h([a.city, a.state, a.zip].filter(Boolean).join(', '))}</div>
      <div class="muted" style="font-size:14px">${U.h(a.country || '')}</div>
      <div class="muted" style="font-size:14px">${U.h(a.phone || '')}</div>
      <div class="mt-4">${a.isDefault
        ? '<span class="chip" style="color:var(--success);border-color:var(--success)">' + I.icon('check', '', 'style="width:14px;height:14px"') + 'Default address</span>'
        : `<button class="btn btn-secondary btn-sm" data-addr-default="${U.h(a.id)}">${I.icon('check')}Set as default</button>`}</div>
    </article>`;
  }

  function addressesBody() {
    const list = addresses();
    if (!list.length) {
      return UI.empty({
        icon: 'mapPin',
        title: 'No addresses saved',
        text: 'Add a shipping address to check out faster and track deliveries more accurately.',
        actions: '<button class="btn btn-primary" data-addr-add>' + I.icon('plus') + 'Add address</button>'
      });
    }
    return `<div class="grid grid-2 ">${list.map(addressCard).join('')}</div>`;
  }

  function addressesRoute() {
    return page('/account/addresses', () => headHtml('Address book', S.t('addresses'), {
      lead: 'Manage where your orders ship and who receives them.',
      action: `<button class="btn btn-primary" data-addr-add>${I.icon('plus')}Add address</button>`
    }), addressesBody, 'addresses');
  }

  function addressModal(existing) {
    const a = existing || { label: 'Home', name: '', phone: '', line1: '', city: '', state: '', zip: '', country: 'United States', isDefault: false };
    const f = (id, label, val, type) => `<div class="input-group"><label for="${id}">${U.h(label)}</label>
      <input class="input" id="${id}" name="${id}" type="${type || 'text'}" value="${U.h(val == null ? '' : val)}" autocomplete="off"></div>`;
    UI.modal({
      title: existing ? 'Edit address' : 'Add address',
      width: 620,
      body: `<form class="col" style="gap:var(--s-4)" id="addr-form">
        <div class="input-group">
          <label>Label</label>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            ${['Home', 'Office', 'Other'].map(l => `<label class="radio"><input type="radio" name="label" value="${l}"${a.label === l ? ' checked' : ''}><span class="dot"></span>${l}</label>`).join('')}
          </div>
        </div>
        <div class="input-row">${f('a-name', 'Full name', a.name)}${f('a-phone', 'Phone', a.phone, 'tel')}</div>
        ${f('a-line1', 'Address line 1', a.line1)}
        <div class="input-row">${f('a-city', 'City', a.city)}${f('a-state', 'State', a.state)}</div>
        <div class="input-row">${f('a-zip', 'Postal code', a.zip)}${f('a-country', 'Country', a.country)}</div>
        <label class="checkbox"><input type="checkbox" id="a-default"${a.isDefault ? ' checked' : ''}><span class="box"></span>Set as default address</label>
        <div class="soft" style="font-size:12px">${I.icon('info', '', 'style="width:14px;height:14px;vertical-align:-2px"')} This demo never sends your details anywhere — everything stays in your browser.</div>
      </form>`,
      footer: `<button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" data-act="addr-save" data-id="${existing ? U.h(existing.id) : ''}">${I.icon('check')}Save address</button>`,
      onMount: (body, wrap) => {
        U.qs('[data-act="addr-save"]', wrap).addEventListener('click', () => {
          const val = (id) => { const el = U.qs('#' + id, body); return el ? el.value.trim() : ''; };
          const labelEl = U.qs('input[name="label"]:checked', body);
          const data = {
            label: labelEl ? labelEl.value : 'Home',
            name: val('a-name'),
            phone: val('a-phone'),
            line1: val('a-line1'),
            city: val('a-city'),
            state: val('a-state'),
            zip: val('a-zip'),
            country: val('a-country') || 'United States',
            isDefault: (U.qs('#a-default', body) || {}).checked || false
          };
          if (!data.name || !data.line1 || !data.city || !data.zip) {
            UI.toast({ type: 'error', title: 'Missing details', desc: 'Name, address, city and postal code are required.' });
            return;
          }
          let list = addresses().map(x => Object.assign({}, x));
          if (existing) {
            list = list.map(x => x.id === existing.id ? Object.assign({}, x, data) : (data.isDefault ? Object.assign({}, x, { isDefault: false }) : x));
          } else {
            data.id = U.uid('a');
            if (data.isDefault) list = list.map(x => Object.assign({}, x, { isDefault: false }));
            if (!list.length) data.isDefault = true;
            list.push(data);
          }
          if (!list.some(x => x.isDefault)) list[0].isDefault = true;
          S.set({ addresses: list });
          UI.closeModal();
          UI.toast({ type: 'success', title: existing ? 'Address updated' : 'Address added', desc: data.label + ' · ' + data.line1 });
          repaint();
        });
      }
    });
  }

  /* =========================================================
     5. Payment methods
     ========================================================= */
  const PAY_TYPES = [
    { id: 'card', label: 'Card', sub: 'Visa, Mastercard, Amex', icon: 'credit' },
    { id: 'paypal', label: 'PayPal', sub: 'Pay with your PayPal balance', icon: 'wallet' },
    { id: 'apple', label: 'Apple Pay', sub: 'Touch ID or Face ID', icon: 'phone' },
    { id: 'google', label: 'Google Pay', sub: 'One-tap checkout', icon: 'bolt' }
  ];

  function payIcon(p) {
    if (p.type === 'paypal') return I.icon('wallet', '', 'style="width:20px;height:20px"');
    if (p.type === 'apple') return I.icon('phone', '', 'style="width:20px;height:20px"');
    if (p.type === 'google') return I.icon('bolt', '', 'style="width:20px;height:20px"');
    return I.icon('credit', '', 'style="width:20px;height:20px"');
  }
  function payTitle(p) {
    if (p.type === 'paypal') return 'PayPal';
    if (p.type === 'apple') return 'Apple Pay';
    if (p.type === 'google') return 'Google Pay';
    return (p.brand || 'Card') + ' •••• ' + (p.last4 || '');
  }
  function paySub(p) {
    if (p.type === 'paypal') return p.email || '';
    if (p.type === 'apple' || p.type === 'google') return 'Linked to this device';
    return 'Expires ' + (p.exp || '—');
  }

  function paymentRow(p) {
    return `<div class="card" style="padding:16px 18px">
      <div class="row-between" style="gap:var(--s-3);flex-wrap:wrap">
        <div class="row" style="gap:12px;min-width:0">
          <span class="ic" style="width:44px;height:32px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;flex:none">${payIcon(p)}</span>
          <div style="min-width:0">
            <div style="font-weight:600;font-size:14px">${U.h(payTitle(p))}</div>
            <div class="muted" style="font-size:13px">${U.h(paySub(p))}</div>
          </div>
          ${p.isDefault ? '<span class="badge badge-new">Default</span>' : ''}
        </div>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          ${p.isDefault ? '' : `<button class="btn btn-ghost btn-sm" data-pay-default="${U.h(p.id)}">${I.icon('check')}Set default</button>`}
          <button class="btn btn-ghost btn-sm" data-pay-del="${U.h(p.id)}">${I.icon('trash')}Remove</button>
        </div>
      </div>
    </div>`;
  }

  function paymentsBody() {
    const list = payments();
    if (!list.length) {
      return UI.empty({
        icon: 'credit',
        title: 'No payment methods',
        text: 'Add a card or wallet to check out in a single tap.',
        actions: '<button class="btn btn-primary" data-pay-add>' + I.icon('plus') + 'Add payment method</button>'
      });
    }
    return `<div class="col " style="gap:var(--s-3)">${list.map(paymentRow).join('')}</div>
      <div class="soft mt-4" style="font-size:12.5px">${I.icon('shield', '', 'style="width:14px;height:14px;vertical-align:-2px"')} Demo store — no card details are ever transmitted or stored on a server.</div>`;
  }

  function paymentsRoute() {
    return page('/account/payments', () => headHtml('Payment methods', S.t('paymentMethods'), {
      lead: 'Cards and wallets you can use at checkout.',
      action: `<button class="btn btn-primary" data-pay-add>${I.icon('plus')}Add payment method</button>`
    }), paymentsBody, 'payments');
  }

  function cardBrand(n) {
    const v = String(n || '').replace(/\D/g, '');
    if (/^4/.test(v)) return 'Visa';
    if (/^5[1-5]/.test(v)) return 'Mastercard';
    if (/^3[47]/.test(v)) return 'Amex';
    if (/^6/.test(v)) return 'Discover';
    return 'Card';
  }

  function paymentModal() {
    UI.modal({
      title: 'Add payment method',
      width: 560,
      body: `<form class="col" style="gap:var(--s-4)" id="pay-form">
        <div class="input-group">
          <label>Type</label>
          <div class="col" style="gap:8px">
            ${PAY_TYPES.map((t, i) => `<label class="pay-method${i === 0 ? ' active' : ''}" data-pay-type="${t.id}">
              <span class="ic" style="width:34px;display:flex;align-items:center;justify-content:center">${I.icon(t.icon, '', 'style="width:20px;height:20px"')}</span>
              <span><span class="label">${U.h(t.label)}</span><br><span class="sub">${U.h(t.sub)}</span></span>
              <span class="radio-dot radio"><input type="radio" name="ptype" value="${t.id}"${i === 0 ? ' checked' : ''}><span class="dot"></span></span>
            </label>`).join('')}
          </div>
        </div>
        <div id="pay-card-fields" class="col" style="gap:var(--s-4)">
          <div class="input-group"><label for="p-num">Card number</label>
            <input class="input" id="p-num" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="off"></div>
          <div class="input-row">
            <div class="input-group"><label for="p-exp">Expiry</label><input class="input" id="p-exp" placeholder="MM/YY" autocomplete="off"></div>
            <div class="input-group"><label for="p-cvc">CVC</label><input class="input" id="p-cvc" placeholder="123" autocomplete="off"></div>
          </div>
        </div>
        <div id="pay-email-fields" class="input-group hidden"><label for="p-email">PayPal email</label>
          <input class="input" id="p-email" type="email" placeholder="you@example.com" autocomplete="off"></div>
        <div class="soft" style="font-size:12px">${I.icon('lock', '', 'style="width:14px;height:14px;vertical-align:-2px"')} Simulated only — nothing leaves your browser.</div>
      </form>`,
      footer: `<button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" data-act="pay-save">${I.icon('check')}Save method</button>`,
      onMount: (body, wrap) => {
        const cardFields = U.qs('#pay-card-fields', body);
        const emailFields = U.qs('#pay-email-fields', body);
        const sync = () => {
          const t = (U.qs('input[name="ptype"]:checked', body) || {}).value || 'card';
          U.qsa('[data-pay-type]', body).forEach(el => el.classList.toggle('active', el.dataset.payType === t));
          cardFields.classList.toggle('hidden', t !== 'card');
          emailFields.classList.toggle('hidden', t !== 'paypal');
        };
        body.addEventListener('change', sync);
        sync();
        U.qs('[data-act="pay-save"]', wrap).addEventListener('click', () => {
          const t = (U.qs('input[name="ptype"]:checked', body) || {}).value || 'card';
          const list = payments().map(x => Object.assign({}, x));
          let entry;
          if (t === 'card') {
            const n = (U.qs('#p-num', body).value || '').trim();
            const exp = (U.qs('#p-exp', body).value || '').trim();
            const cvc = (U.qs('#p-cvc', body).value || '').trim();
            if (n.replace(/\D/g, '').length < 12) { UI.toast({ type: 'error', title: 'Check card number', desc: 'Enter at least 12 digits.' }); return; }
            if (!/^\d{2}\/\d{2}$/.test(exp)) { UI.toast({ type: 'error', title: 'Check expiry', desc: 'Use the MM/YY format.' }); return; }
            if (cvc.replace(/\D/g, '').length < 3) { UI.toast({ type: 'error', title: 'Check CVC', desc: 'The security code is 3–4 digits.' }); return; }
            entry = { id: U.uid('pm'), type: 'card', brand: cardBrand(n), last4: n.replace(/\D/g, '').slice(-4), exp: exp, isDefault: !list.length };
          } else if (t === 'paypal') {
            const email = (U.qs('#p-email', body).value || '').trim();
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { UI.toast({ type: 'error', title: 'Check email', desc: 'Enter a valid PayPal email address.' }); return; }
            entry = { id: U.uid('pm'), type: 'paypal', email: email, isDefault: !list.length };
          } else {
            entry = { id: U.uid('pm'), type: t, isDefault: !list.length };
          }
          if (entry.isDefault) list.forEach(x => x.isDefault = false);
          list.push(entry);
          S.set({ payments: list });
          UI.closeModal();
          UI.toast({ type: 'success', title: 'Payment method added', desc: payTitle(entry) });
          repaint();
        });
      }
    });
  }

  /* =========================================================
     6. Rewards
     ========================================================= */
  const EARN = [
    { icon: 'chart', t: 'Purchase', d: 'Earn 1 point for every $1 spent', v: '1 pt / $1' },
    { icon: 'star', t: 'Write a review', d: 'Reviews with a photo earn double', v: '+50' },
    { icon: 'users', t: 'Refer a friend', d: 'They get 10% off, you get points', v: '+500' },
    { icon: 'gift', t: 'Birthday bonus', d: 'Credited automatically each year', v: '+250' },
    { icon: 'bolt', t: 'Daily login', d: 'Once per day, every day', v: '+10' },
    { icon: 'percent', t: 'Promotions', d: 'Double-points weekends and events', v: 'Varies' }
  ];

  function rewardsBody() {
    const pts = S.state.points;
    const tier = tierOf(pts);
    const next = nextTier(pts);
    const span = next ? next.min - tier.min : 1;
    const pct = next ? U.clamp(Math.round(((pts - tier.min) / span) * 100), 2, 100) : 100;
    const checkedIn = S.state.dailyCheckin === todayKey();

    let out = `<div class="card" style="padding:clamp(20px,3vw,28px);background:var(--surface-2)">
      <div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:var(--s-5)">
        <div>
          <div class="eyebrow"><span class="dot"></span>${U.h(tier.name)} tier</div>
          <div class="mt-2" style="font-size:clamp(38px,6vw,58px);font-weight:800;letter-spacing:-.04em;line-height:1">${num(pts)} <span style="font-size:.38em;font-weight:600;letter-spacing:-.01em" class="muted">points</span></div>
          <div class="muted mt-2" style="font-size:14px">Worth about ${S.money(Math.floor(pts / 100))} in rewards credit.</div>
        </div>
        <div style="min-width:min(280px,100%);flex:1">
          <div class="row-between" style="font-size:13px">
            <span style="font-weight:600">${U.h(tier.name)}</span>
            <span class="muted">${next ? num(next.min - pts) + ' pts to ' + U.h(next.name) : 'Top tier unlocked'}</span>
          </div>
          <div class="progress mt-2"><div class="bar" style="width:${pct}%"></div></div>
          <div class="row-between mt-2 soft" style="font-size:12px">
            <span>${num(tier.min)}</span><span>${next ? num(next.min) : num(tier.min)}</span>
          </div>
        </div>
      </div>
    </div>`;

    /* Tiers */
    out += `<div class="mt-7">${UI.sectionHeader({ eyebrow: 'Membership', title: 'Tiers', lead: 'Move up by collecting points — your tier never expires once earned.' })}
      <div class="tiers ">${TIERS.map(t => {
      const isCur = t.name === tier.name;
      const locked = pts < t.min;
      return `<div class="tier ${isCur ? 'current' : ''}${locked ? ' locked' : ''}">
          <div class="row-between">
            <span class="row" style="gap:6px">${I.icon(t.name === 'Platinum' ? 'crown' : 'award', '', 'style="width:16px;height:16px"')}<span class="n">${U.h(t.name)}</span></span>
            ${isCur ? '<span class="badge badge-new">Current</span>' : (locked ? '<span class="badge">Locked</span>' : '<span class="badge" style="color:var(--success);border-color:var(--success)">Reached</span>')}
          </div>
          <div class="p">${num(t.min)}+ points</div>
          <div class="p" style="margin-top:8px">${U.h(t.perk)}</div>
        </div>`;
    }).join('')}</div></div>`;

    /* Earn */
    out += `<div class="mt-8">${UI.sectionHeader({ eyebrow: 'Ways to earn', title: 'Collect more points' })}
      <div class="earn-list ">${EARN.map(e => {
      const isDaily = e.t === 'Daily login';
      return `<div class="earn-item">
          <span class="ic">${I.icon(e.icon, '', 'style="width:18px;height:18px"')}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:14px">${U.h(e.t)}</div>
            <div class="muted" style="font-size:13px">${U.h(e.d)}</div>
          </div>
          <div class="row" style="gap:10px">
            <span class="badge">${U.h(e.v)}</span>
            ${isDaily ? `<button class="btn btn-sm ${checkedIn ? 'btn-secondary' : 'btn-primary'}" data-checkin="1" ${checkedIn ? 'disabled' : ''}>${checkedIn ? 'Collected' : 'Collect'}</button>` : ''}
          </div>
        </div>`;
    }).join('')}</div></div>`;

    /* Redeem */
    out += `<div class="mt-8">${UI.sectionHeader({ eyebrow: 'Redeem', title: 'Turn points into savings', lead: 'Rewards are applied automatically at checkout.' })}
      <div class="grid grid-3 ">${REDEEMS.map(r => {
      const ok = pts >= r.cost;
      return `<div class="card" style="padding:18px;display:flex;flex-direction:column;gap:8px">
          <div class="row-between"><span class="badge">${num(r.cost)} pts</span>${ok ? '<span class="badge" style="color:var(--success);border-color:var(--success)">Available</span>' : '<span class="badge">Not enough</span>'}</div>
          <div style="font-weight:700;font-size:15px">${U.h(r.title)}</div>
          <div class="muted" style="font-size:13px;flex:1">${U.h(r.note)}</div>
          <div class="coupon-card"><span class="code">${U.h(r.code)}</span><span class="soft" style="font-size:12px">Auto-applied</span></div>
          <button class="btn ${ok ? 'btn-primary' : 'btn-secondary'} btn-block mt-1" data-redeem="${U.h(r.id)}" ${ok ? '' : 'disabled'}>${ok ? 'Redeem' : num(r.cost - pts) + ' more pts'}</button>
        </div>`;
    }).join('')}</div></div>`;

    return out;
  }

  function rewardsRoute() {
    return page('/account/rewards', () => headHtml(S.t('rewards'), S.t('rewards'), {
      lead: 'Points, tiers and everything you can trade them for.'
    }), rewardsBody, 'rewards');
  }

  function redeem(id) {
    const r = REDEEMS.find(x => x.id === id);
    if (!r) return;
    if (S.state.points < r.cost) {
      UI.toast({ type: 'warn', title: 'Not enough points', desc: 'You need ' + num(r.cost - S.state.points) + ' more points.' });
      return;
    }
    S.set({ points: S.state.points - r.cost });
    const coupon = r.id === 'rship'
      ? { code: r.code, label: r.title, off: 0, min: 0, freeShip: true }
      : { code: r.code, label: r.title, off: 0, min: 0, flat: r.id === 'r10' ? 10 : 25 };
    S.set({ coupon: coupon });
    UI.toast({ type: 'success', title: 'Reward redeemed', desc: r.title + ' · code ' + r.code });
  }

  /* =========================================================
     7. Notifications
     ========================================================= */
  function notificationsBody() {
    const list = notifs().slice();
    const unread = list.filter(n => !n.read).length;
    if (!list.length) {
      return UI.empty({
        icon: 'bell',
        title: 'Nothing here yet',
        text: 'Order updates, price drops and restock alerts will land here.',
        actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a>'
      });
    }
    const head = `<div class="row-between" style="flex-wrap:wrap;gap:var(--s-3)">
      <div class="soft" style="font-size:13px">${unread ? num(unread) + ' unread of ' + list.length : 'All caught up'}</div>
      <button class="btn btn-secondary btn-sm" data-markall ${unread ? '' : 'disabled'}>${I.icon('check')}Mark all as read</button>
    </div>`;

    const items = list.map(n => `<div class="notif-item${n.read ? '' : ' unread'}" data-nid="${U.h(n.id)}" role="button" tabindex="0" style="cursor:pointer">
      <span class="ic">${I.icon(n.icon || 'bell', '', 'style="width:18px;height:18px"')}</span>
      <div style="flex:1;min-width:0">
        <div class="row-between" style="gap:var(--s-3);align-items:flex-start">
          <div class="t">${U.h(n.title)}</div>
          ${n.read ? '' : '<span style="width:8px;height:8px;border-radius:50%;background:var(--accent-500);flex:none;margin-top:6px"></span>'}
        </div>
        <div class="d">${U.h(n.body || '')}</div>
        <div class="w">${U.h(U.timeAgo(n.at))}</div>
      </div>
    </div>`).join('');

    return `${head}<div class="card mt-4" style="padding:6px 6px 0">${items}</div>`;
  }

  function notificationsRoute() {
    return page('/account/notifications', () => headHtml(S.t('notifications'), S.t('notifications'), {
      lead: 'Order updates, price drops, restocks and rewards — all in one place.'
    }), notificationsBody, 'notifications');
  }

  /* =========================================================
     8. Settings
     ========================================================= */
  function block(title, lead, inner) {
    return `<section class="card" style="padding:clamp(18px,2.4vw,24px)">
      <h4 style="font-size:17px">${U.h(title)}</h4>
      <p class="muted" style="font-size:13px;margin-top:2px">${U.h(lead)}</p>
      <div class="divider" style="margin:16px 0"></div>
      ${inner}
    </section>`;
  }

  function switchRow(id, group, label, sub, checked) {
    return `<div class="row-between" style="gap:var(--s-4);padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="min-width:0">
        <div style="font-size:14px;font-weight:500">${U.h(label)}</div>
        <div class="muted" style="font-size:13px">${U.h(sub)}</div>
      </div>
      <label class="checkbox"><input type="checkbox" data-${group}="${U.h(id)}"${checked ? ' checked' : ''}><span class="box"></span></label>
    </div>`;
  }

  function selectRow(id, label, options, value) {
    return `<div class="row-between" style="gap:var(--s-4);padding:12px 0;flex-wrap:wrap">
      <div style="min-width:0">
        <div style="font-size:14px;font-weight:500">${U.h(label)}</div>
      </div>
      <select class="input" data-${id} style="width:auto;min-width:160px;height:40px;border-radius:var(--r-full);font-size:13px;padding-inline:14px">
        ${options.map(o => `<option value="${U.h(o.v)}"${o.v === value ? ' selected' : ''}>${U.h(o.l)}</option>`).join('')}
      </select>
    </div>`;
  }

  function settingsBody() {
    const c = profile();
    const prefs = emailPrefs();
    const priv = privacyPrefs();
    const theme = S.theme() || 'system';
    const lang = S.state.lang || 'en';
    const cur = S.state.currency || 'USD';

    const f = (id, label, val, type) => `<div class="input-group"><label for="${id}">${U.h(label)}</label>
      <input class="input" id="${id}" type="${type || 'text'}" value="${U.h(val == null ? '' : val)}" autocomplete="off"></div>`;

    let out = block('Profile', 'Your name and contact details as they appear on orders.', `
      <div class="grid grid-2" style="gap:var(--s-3)">
        ${f('s-name', 'Full name', c.name)}
        ${f('s-phone', 'Phone', c.phone, 'tel')}
      </div>
      <div class="mt-3">${f('s-email', 'Email address', c.email, 'email')}</div>
      <div class="mt-4 row" style="gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" data-save="profile">${I.icon('check')}Save changes</button>
        <button class="btn btn-ghost" data-save="profile-cancel">Discard</button>
      </div>`);

    out += block('Email preferences', 'Choose what we are allowed to send you.', `
      ${switchRow('orders', 'pref', 'Order updates', 'Shipping confirmations, delivery alerts and receipts', prefs.orders)}
      ${switchRow('promos', 'pref', 'Promotions & newsletters', 'Campaigns, editor picks and seasonal sales', prefs.promos)}
      ${switchRow('priceDrop', 'pref', 'Price drop alerts', 'When something on your wishlist goes down in price', prefs.priceDrop)}
      ${switchRow('restock', 'pref', 'Back in stock alerts', 'When a saved item becomes available again', prefs.restock)}`);

    out += block('Password', 'Use at least 8 characters. You will stay signed in on this device.', `
      <div class="grid grid-3" style="gap:var(--s-3)">
        ${f('s-cur', 'Current password', '', 'password')}
        ${f('s-new', 'New password', '', 'password')}
        ${f('s-conf', 'Confirm password', '', 'password')}
      </div>
      <div class="mt-4"><button class="btn btn-primary" data-save="password">${I.icon('lock')}Update password</button></div>`);

    out += block('Appearance', 'Pick how NOVA looks on this device.', `
      <div class="tabs" style="max-width:100%;overflow-x:auto">
        <button data-theme-set="light" class="${theme === 'light' ? 'active' : ''}">${I.icon('sun', '', 'style="width:16px;height:16px"')}Light</button>
        <button data-theme-set="dark" class="${theme === 'dark' ? 'active' : ''}">${I.icon('moon', '', 'style="width:16px;height:16px"')}Dark</button>
        <button data-theme-set="system" class="${theme === 'system' ? 'active' : ''}">${I.icon('laptop', '', 'style="width:16px;height:16px"')}System</button>
      </div>
      <div class="soft mt-3" style="font-size:12.5px">System follows your operating system setting.</div>`);

    out += block('Language & currency', 'Prices and interface text update immediately.', `
      ${selectRow('lang', 'Language', [{ v: 'en', l: 'English' }, { v: 'zh', l: '中文' }, { v: 'es', l: 'Español' }], lang)}
      ${selectRow('currency', 'Currency', Object.keys(NOVA.CURRENCIES).map(k => ({ v: k, l: k + ' — ' + NOVA.CURRENCIES[k].name })), cur)}`);

    out += block('Privacy', 'Control how your data shapes your experience.', `
      ${switchRow('personalize', 'priv', 'Personalised recommendations', 'Use browsing and purchase history to tailor suggestions', priv.personalize)}
      ${switchRow('analytics', 'priv', 'Cookie analytics', 'Anonymous usage analytics to help us improve the store', priv.analytics)}`);

    out += `<section class="card" style="padding:clamp(18px,2.4vw,24px);border-color:var(--danger)">
      <div class="row" style="gap:8px;color:var(--danger)">${I.icon('alert', '', 'style="width:18px;height:18px"')}<h4 style="font-size:17px;color:var(--danger)">Danger zone</h4></div>
      <p class="muted" style="font-size:13px;margin-top:2px">These actions affect your account. Both ask for confirmation first.</p>
      <div class="divider" style="margin:16px 0"></div>
      <div class="grid grid-2" style="gap:var(--s-3)">
        <div class="card card-flat" style="padding:16px">
          <div style="font-weight:600;font-size:14px">Log out</div>
          <div class="muted" style="font-size:13px;margin-top:2px">Sign out of this device. Your saved items stay put.</div>
          <button class="btn btn-secondary btn-sm mt-3" data-act="logout">${I.icon('logout')}Log out</button>
        </div>
        <div class="card card-flat" style="padding:16px;border-color:var(--danger)">
          <div style="font-weight:600;font-size:14px;color:var(--danger)">Delete account</div>
          <div class="muted" style="font-size:13px;margin-top:2px">Removes your profile, addresses and order history.</div>
          <button class="btn btn-danger btn-sm mt-3" data-act="delete-account">${I.icon('trash')}Delete account</button>
        </div>
      </div>
    </section>`;

    return `<div class="col" style="gap:var(--s-4)">${out}</div>`;
  }

  function settingsRoute() {
    return page('/account/settings', () => headHtml(S.t('settings'), S.t('settings'), {
      lead: 'Profile, notifications, appearance and account controls.'
    }), settingsBody, 'settings');
  }

  /* ---------------------------------------------------------
     Confirmation dialogs
     --------------------------------------------------------- */
  function confirmDialog(o) {
    UI.modal({
      title: o.title,
      width: 460,
      body: `<div class="row" style="gap:14px;align-items:flex-start">
        <span class="ic" style="width:40px;height:40px;border-radius:12px;flex:none;display:flex;align-items:center;justify-content:center;background:${o.danger ? 'rgba(239,68,68,.12)' : 'var(--surface-2)'};color:${o.danger ? 'var(--danger)' : 'var(--text-muted)'}">${I.icon(o.icon || 'alert', '', 'style="width:20px;height:20px"')}</span>
        <div>
          <div style="font-weight:600">${U.h(o.heading)}</div>
          <div class="muted" style="font-size:14px;margin-top:4px">${U.h(o.text)}</div>
        </div>
      </div>`,
      footer: `<button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn ${o.danger ? 'btn-danger' : 'btn-primary'}" data-act="confirm-yes">${U.h(o.confirmLabel || 'Confirm')}</button>`,
      onMount: (body, wrap) => {
        U.qs('[data-act="confirm-yes"]', wrap).addEventListener('click', () => {
          UI.closeModal();
          o.onConfirm();
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Event wiring (single delegated listener on #view)
     --------------------------------------------------------- */
  let bound = false;
  /* Delegated on document so actions inside modals (appended to <body>) work too */
  function bindView() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const n = e.target.closest && e.target.closest('[data-nid]');
    if (!n) return;
    e.preventDefault();
    n.click();
  }

  function onClick(e) {
    const t = e.target;
    const hit = (sel) => t.closest(sel);

    /* --- orders --- */
    const tab = hit('[data-otab]');
    if (tab) { orderFilter = tab.dataset.otab; repaint(); return; }
    const track = hit('[data-track]');
    if (track) { e.preventDefault(); trackModal(track.dataset.track); return; }
    const det = hit('[data-details]');
    if (det) { e.preventDefault(); UI.closeModal(); detailsModal(det.dataset.details); return; }
    const inv = hit('[data-act="invoice"]');
    if (inv) { UI.toast({ type: 'success', title: 'Invoice ready', desc: 'Order ' + inv.dataset.id + ' — PDF sent to your inbox.' }); return; }

    /* --- wishlist --- */
    const rm = hit('[data-wl-remove]');
    if (rm) {
      e.preventDefault();
      const id = rm.dataset.wlRemove;
      S.toggleWishlist(id);
      UI.toast({ type: 'success', title: 'Removed from wishlist', desc: (D.byId(id) || {}).name || '' });
      repaint();
      return;
    }
    const wf = hit('[data-wl-filter]');
    if (wf) { wlFilter = wf.dataset.wlFilter; repaint(); return; }

    /* --- addresses --- */
    if (hit('[data-addr-add]')) { addressModal(null); return; }
    const ae = hit('[data-addr-edit]');
    if (ae) { addressModal(addresses().find(a => a.id === ae.dataset.addrEdit)); return; }
    const ad = hit('[data-addr-del]');
    if (ad) {
      const a = addresses().find(x => x.id === ad.dataset.addrDel);
      if (!a) return;
      confirmDialog({
        title: 'Delete address', icon: 'trash', danger: true,
        heading: 'Delete ' + (a.label || 'address') + '?',
        text: (a.line1 || '') + ' will be removed from your address book. This cannot be undone.',
        confirmLabel: 'Delete',
        onConfirm: () => {
          const list = addresses().filter(x => x.id !== a.id).map(x => Object.assign({}, x));
          if (a.isDefault && list.length) list[0].isDefault = true;
          S.set({ addresses: list });
          UI.toast({ type: 'success', title: 'Address deleted', desc: a.line1 });
          repaint();
        }
      });
      return;
    }
    const adf = hit('[data-addr-default]');
    if (adf) {
      const list = addresses().map(x => Object.assign({}, x, { isDefault: x.id === adf.dataset.addrDefault }));
      S.set({ addresses: list });
      UI.toast({ type: 'success', title: 'Default address updated' });
      repaint();
      return;
    }

    /* --- payments --- */
    if (hit('[data-pay-add]')) { paymentModal(); return; }
    const pd = hit('[data-pay-default]');
    if (pd) {
      const list = payments().map(x => Object.assign({}, x, { isDefault: x.id === pd.dataset.payDefault }));
      S.set({ payments: list });
      UI.toast({ type: 'success', title: 'Default payment updated' });
      repaint();
      return;
    }
    const prm = hit('[data-pay-del]');
    if (prm) {
      const p = payments().find(x => x.id === prm.dataset.payDel);
      if (!p) return;
      confirmDialog({
        title: 'Remove payment method', icon: 'credit', danger: true,
        heading: 'Remove ' + payTitle(p) + '?',
        text: 'The method will be removed from this account. Any active subscription will need a new method.',
        confirmLabel: 'Remove',
        onConfirm: () => {
          const list = payments().filter(x => x.id !== p.id).map(x => Object.assign({}, x));
          if (p.isDefault && list.length) list[0].isDefault = true;
          S.set({ payments: list });
          UI.toast({ type: 'success', title: 'Payment method removed', desc: payTitle(p) });
          repaint();
        }
      });
      return;
    }

    /* --- rewards --- */
    const ci = hit('[data-checkin]');
    if (ci) {
      S.addPoints(10, 'Daily login reward');
      S.set({ dailyCheckin: todayKey() });
      UI.toast({ type: 'success', title: '+10 points', desc: 'Daily login bonus collected. Come back tomorrow.' });
      repaint();
      return;
    }
    const rd = hit('[data-redeem]');
    if (rd) { redeem(rd.dataset.redeem); repaint(); return; }

    /* --- notifications --- */
    const ni = hit('[data-nid]');
    if (ni) {
      const id = ni.dataset.nid;
      const n = notifs().find(x => x.id === id);
      if (n && !n.read) {
        S.markNotifRead(id);
        repaint();
      }
      return;
    }
    if (hit('[data-markall]')) {
      S.markAllRead();
      UI.toast({ type: 'success', title: 'All notifications marked as read' });
      repaint();
      return;
    }

    /* --- settings --- */
    const ts = hit('[data-theme-set]');
    if (ts) {
      const v = ts.dataset.themeSet;
      S.setTheme(v === 'system' ? null : v);
      U.qsa('[data-theme-set]', viewEl()).forEach(b => b.classList.toggle('active', b.dataset.themeSet === (S.theme() || 'system')));
      UI.toast({ type: 'success', title: 'Appearance updated', desc: v === 'system' ? 'Following your system setting' : v.charAt(0).toUpperCase() + v.slice(1) + ' theme' });
      return;
    }
    const sv = hit('[data-save]');
    if (sv) {
      const what = sv.dataset.save;
      if (what === 'profile') { saveProfile(); return; }
      if (what === 'profile-cancel') { repaint(); return; }
      if (what === 'password') { savePassword(); return; }
    }

    /* --- danger zone --- */
    if (hit('[data-act="logout"]')) {
      e.preventDefault();
      confirmDialog({
        title: 'Log out', icon: 'logout',
        heading: 'Log out of NOVA?',
        text: 'You will need to sign in again to check out. Your cart and wishlist stay saved on this device.',
        confirmLabel: 'Log out',
        onConfirm: () => { UI.toast({ type: 'success', title: 'Signed out', desc: 'See you soon — you can sign back in any time.' }); }
      });
      return;
    }
    if (hit('[data-act="delete-account"]')) {
      confirmDialog({
        title: 'Delete account', icon: 'alert', danger: true,
        heading: 'Permanently delete your account?',
        text: 'Your profile, addresses, payment methods and order history would be erased.',
        confirmLabel: 'Request deletion',
        onConfirm: () => {
          UI.toast({ type: 'warn', title: 'Deletion request received', desc: 'Demo store — your account has been left untouched.' });
        }
      });
    }
  }

  function repaintNavOnly() {
    const view = viewEl();
    const nav = U.qs('#acct-nav', view);
    if (nav) nav.innerHTML = navInner(activePath);
    const prof = U.qs('#acct-profile', view);
    if (prof) prof.innerHTML = profileInner();
  }

  function onChange(e) {
    const t = e.target;

    if (t.matches('[data-sort]')) { wlSort = t.value; repaint(); return; }

    if (t.matches('[data-lang]')) {
      S.set({ lang: t.value });
      UI.toast({ type: 'success', title: 'Language updated', desc: t.options[t.selectedIndex].text });
      rerenderShell();
      return;
    }
    if (t.matches('[data-currency]')) {
      S.set({ currency: t.value });
      UI.toast({ type: 'success', title: 'Currency updated', desc: 'Prices now shown in ' + t.value });
      rerenderShell();
      return;
    }
    if (t.matches('[data-pref]')) {
      const prefs = emailPrefs();
      prefs[t.dataset.pref] = t.checked;
      S.set({ emailPrefs: prefs });
      UI.toast({ type: 'success', title: 'Email preferences saved' });
      return;
    }
    if (t.matches('[data-priv]')) {
      const p = privacyPrefs();
      p[t.dataset.priv] = t.checked;
      S.set({ privacyPrefs: p });
      UI.toast({ type: 'success', title: 'Privacy settings saved' });
    }
  }

  function saveProfile() {
    const view = viewEl();
    const name = (U.qs('#s-name', view) || {}).value || '';
    const email = (U.qs('#s-email', view) || {}).value || '';
    const phone = (U.qs('#s-phone', view) || {}).value || '';
    if (!name.trim()) { UI.toast({ type: 'error', title: 'Name required', desc: 'Enter the name that appears on your orders.' }); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { UI.toast({ type: 'error', title: 'Check your email', desc: 'That address does not look valid.' }); return; }
    const next = Object.assign({}, profile(), { name: name.trim(), email: email.trim(), phone: phone.trim() });
    S.set({ user: next });
    UI.toast({ type: 'success', title: 'Profile saved', desc: 'Your details have been updated.' });
    repaintNavOnly();
  }

  function savePassword() {
    const view = viewEl();
    const cur = (U.qs('#s-cur', view) || {}).value || '';
    const npw = (U.qs('#s-new', view) || {}).value || '';
    const cf = (U.qs('#s-conf', view) || {}).value || '';
    if (!cur) { UI.toast({ type: 'error', title: 'Current password required', desc: 'Enter the password you use today.' }); return; }
    if (npw.length < 8) { UI.toast({ type: 'error', title: 'Too short', desc: 'New passwords need at least 8 characters.' }); return; }
    if (npw === cur) { UI.toast({ type: 'error', title: 'Use a new password', desc: 'The new password must differ from the current one.' }); return; }
    if (npw !== cf) { UI.toast({ type: 'error', title: 'Passwords do not match', desc: 'Re-enter the new password in both fields.' }); return; }
    U.qs('#s-cur', view).value = '';
    U.qs('#s-new', view).value = '';
    U.qs('#s-conf', view).value = '';
    UI.toast({ type: 'success', title: 'Password updated', desc: 'Your new password is active on this device.' });
  }

  /* ---------------------------------------------------------
     Routes
     --------------------------------------------------------- */
  NOVA.Router.register('/account', overviewRoute);
  NOVA.Router.register('/account/orders', ordersRoute);
  NOVA.Router.register('/account/wishlist', wishlistRoute);
  NOVA.Router.register('/wishlist', wishlistRoute);
  NOVA.Router.register('/account/addresses', addressesRoute);
  NOVA.Router.register('/account/payments', paymentsRoute);
  NOVA.Router.register('/account/rewards', rewardsRoute);
  NOVA.Router.register('/account/notifications', notificationsRoute);
  NOVA.Router.register('/account/settings', settingsRoute);
})();
