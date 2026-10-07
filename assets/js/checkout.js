/* ============================================================
   NOVA — Cart page, multi-step checkout & order confirmation
   Routes: #/cart, #/checkout, #/checkout/confirm/:orderId
   ------------------------------------------------------------
   Pure classic script. Everything is rendered into #view.
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  if (!NOVA.ICONS && window.ICONS) NOVA.ICONS = window.ICONS;
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, UI = NOVA.UI, I = NOVA.ICONS, img = NOVA.img;
  const Router = NOVA.Router;

  /* ---------------------------------------------------------
     Constants
     --------------------------------------------------------- */
  const TAX_RATE = 0.0825;
  const FREE_SHIP_AT = 50;
  const BASE_SHIP = 8.99;
  const GIFT_FEE = 4.99;

  const STEPS = [
    { n: 1, key: 'cart', label: 'Cart' },
    { n: 2, key: 'info', label: 'Information' },
    { n: 3, key: 'ship', label: 'Shipping' },
    { n: 4, key: 'pay', label: 'Payment' },
    { n: 5, key: 'done', label: 'Confirmation' }
  ];

  const SHIP_METHODS = [
    { id: 'standard', name: 'Standard', price: 0, days: 4, window: '3–5 business days', icon: 'truck', note: 'Tracked, signature not required' },
    { id: 'express', name: 'Express', price: 14.99, days: 2, window: '1–2 business days', icon: 'bolt', note: 'Priority handling in our warehouse' },
    { id: 'nextday', name: 'Next day', price: 24.99, days: 1, window: 'Order before 2:00pm', icon: 'package', note: 'Delivered tomorrow, guaranteed' }
  ];

  const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Singapore'];

  const PAY_METHODS = [
    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex', icon: 'credit', badge: null },
    { id: 'paypal', label: 'PayPal', sub: 'Pay with your PayPal balance', icon: 'wallet', badge: 'PP' },
    { id: 'apple', label: 'Apple Pay', sub: 'Touch ID or Face ID', icon: 'phone', badge: '' },
    { id: 'google', label: 'Google Pay', sub: 'One-tap, no card details', icon: 'globe', badge: 'G Pay' },
    { id: 'nova', label: 'Nova Pay', sub: '4 interest-free payments', icon: 'spark', badge: 'Nova' }
  ];

  /* ---------------------------------------------------------
     Flow state (module scoped)
     --------------------------------------------------------- */
  const flow = {
    step: 1,
    maxStep: 1,
    shipId: 'standard',
    note: '',
    gift: false,
    pay: 'card',
    sameBilling: true,
    saveAddress: false,
    summaryOpen: true,
    card: { num: '', name: '', exp: '', cvc: '' },
    order: null,
    placing: false
  };

  /* Which page currently owns #view — guards delegated handlers */
  let mode = '';

  const blankInfo = () => ({
    name: (D.customer && D.customer.name) || '',
    email: (D.customer && D.customer.email) || '',
    phone: (D.customer && D.customer.phone) || '',
    address: '', city: '', state: '', zip: '', country: 'United States'
  });
  flow.info = blankInfo();

  /* ---------------------------------------------------------
     Styles (injected once — keeps markup lean, no new files)
     --------------------------------------------------------- */
  const CSS_ID = 'nova-checkout-css';
  function ensureStyles() {
    if (document.getElementById(CSS_ID)) return;
    const st = document.createElement('style');
    st.id = CSS_ID;
    st.textContent = [
      '.co-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-5);padding:clamp(18px,2.4vw,28px);box-shadow:var(--shadow-xs)}',
      '.co-panel + .co-panel{margin-top:var(--s-3)}',
      '.co-pane{transition:opacity .22s var(--ease),transform .22s var(--ease)}',
      '.co-pane.co-out{opacity:0;transform:translateY(8px)}',
      '.co-pane.co-in{animation:fadeUp .32s var(--ease) both}',
      '.co-head{display:flex;align-items:center;gap:10px;margin-bottom:var(--s-2)}',
      '.co-head .num{width:28px;height:28px;border-radius:50%;background:var(--surface-2);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text-muted);flex:none}',
      '.co-head h3{font-size:19px;letter-spacing:-.02em}',
      '.co-sub{color:var(--text-muted);font-size:13px;margin-bottom:var(--s-5)}',
      '.co-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}',
      '.co-span{grid-column:1 / -1}',
      '@media (max-width:620px){.co-grid{grid-template-columns:1fr}.co-span{grid-column:auto}}',
      '.co-field{display:flex;flex-direction:column;gap:6px;min-width:0}',
      '.co-label{font-size:12px;font-weight:600;letter-spacing:.01em;color:var(--text-muted)}',
      '.co-field.err .input{border-color:var(--danger);background:rgba(239,68,68,.04)}',
      '.co-field.err .input:focus{box-shadow:0 0 0 4px rgba(239,68,68,.14)}',
      '.co-err{display:flex;align-items:center;gap:5px;color:var(--danger);font-size:12px;animation:fadeIn .18s var(--ease) both}',
      '.co-err svg{width:13px;height:13px;flex:none}',
      '.co-actions{display:flex;align-items:center;gap:10px;margin-top:var(--s-6);flex-wrap:wrap}',
      '.co-actions .spacer{flex:1}',
      '.co-back{font-size:13px;color:var(--text-muted);display:inline-flex;align-items:center;gap:6px}',
      '.co-back:hover{color:var(--text)}',
      '.co-back svg{width:15px;height:15px}',
      '.co-saved{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-bottom:var(--s-5)}',
      '.co-addr{text-align:left;border:1px solid var(--border);border-radius:var(--r-4);padding:14px;background:var(--surface);transition:border-color var(--d-2),background-color var(--d-2),box-shadow var(--d-2)}',
      '.co-addr:hover{border-color:var(--border-strong);box-shadow:var(--shadow-xs)}',
      '.co-addr.active{border-color:var(--accent-500);background:rgba(109,94,248,.05)}',
      '.co-addr .l{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}',
      '.co-addr .l svg{width:14px;height:14px;color:var(--accent-500)}',
      '.co-addr .v{font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.45}',
      '.ship-opts{display:flex;flex-direction:column;gap:10px}',
      '.ship-opt{display:flex;align-items:center;gap:14px;padding:16px;border:1px solid var(--border);border-radius:var(--r-4);background:var(--surface);cursor:pointer;transition:border-color var(--d-2),background-color var(--d-2),box-shadow var(--d-2)}',
      '.ship-opt:hover{border-color:var(--border-strong)}',
      '.ship-opt.active{border-color:var(--accent-500);background:rgba(109,94,248,.045);box-shadow:0 0 0 1px rgba(109,94,248,.35)}',
      '.ship-opt .ic{width:38px;height:38px;border-radius:12px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--text-muted)}',
      '.ship-opt.active .ic{background:var(--accent-500);color:#fff}',
      '.ship-opt .ic svg{width:19px;height:19px}',
      '.ship-opt .tx{flex:1;min-width:0}',
      '.ship-opt .nm{font-size:14px;font-weight:600}',
      '.ship-opt .dt{font-size:12px;color:var(--text-muted);margin-top:2px}',
      '.ship-opt .pr{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;flex:none}',
      '.ship-opt .pr.free{color:var(--success)}',
      '.pay-list{display:flex;flex-direction:column;gap:10px}',
      '.pay-method .pm{width:38px;height:26px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:var(--surface-2);border:1px solid var(--border);flex:none;font-size:10px;font-weight:800;letter-spacing:.04em;color:var(--text-muted)}',
      '.pay-method .pm svg{width:19px;height:19px}',
      '.pay-method .tx{display:flex;flex-direction:column;min-width:0}',
      '.pay-method .rd{margin-left:auto;flex:none}',
      '.co-cardform{margin-top:14px;padding:18px;border-radius:var(--r-4);border:1px solid var(--border);background:var(--surface-2);animation:fadeUp .28s var(--ease) both}',
      '.co-brand{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:var(--surface);border:1px solid var(--border);font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}',
      '.co-brand svg{width:15px;height:15px}',
      '.co-secure{display:flex;align-items:center;gap:8px;margin-top:var(--s-5);padding:12px 14px;border-radius:var(--r-3);background:var(--surface-2);font-size:12px;color:var(--text-muted)}',
      '.co-secure svg{width:16px;height:16px;color:var(--success);flex:none}',
      '.co-mini{display:flex;align-items:center;gap:10px;padding:9px 0}',
      '.co-mini img{width:44px;height:44px;border-radius:10px;object-fit:cover;border:1px solid var(--border);background:var(--surface-2);flex:none}',
      '.co-mini .m{flex:1;min-width:0}',
      '.co-mini .n{font-size:13px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.co-mini .v{font-size:11px;color:var(--text-soft);margin-top:2px}',
      '.co-mini .p{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}',
      '.co-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;font-size:13px;font-weight:600;padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:6px}',
      '.co-toggle svg{width:15px;height:15px;color:var(--text-muted);transition:transform var(--d-2)}',
      '.co-toggle.open svg{transform:rotate(180deg)}',
      '.co-toggle .cnt{color:var(--text-soft);font-weight:500}',
      '.co-trust{display:flex;flex-direction:column;gap:9px;margin-top:var(--s-5);padding-top:var(--s-4);border-top:1px solid var(--border)}',
      '.co-trust .it{display:flex;gap:9px;align-items:flex-start;font-size:12px;color:var(--text-muted)}',
      '.co-trust .it svg{width:15px;height:15px;color:var(--accent-500);flex:none;margin-top:1px}',
      '.co-check{width:92px;height:92px;margin:0 auto}',
      '.co-check circle{fill:none;stroke:var(--success);stroke-width:3;stroke-dasharray:176;stroke-dashoffset:176;animation:coStroke .55s var(--ease-out) forwards}',
      '.co-check path{fill:none;stroke:var(--success);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:60;stroke-dashoffset:60;animation:coStroke .38s .34s var(--ease-out) forwards}',
      '@keyframes coStroke{to{stroke-dashoffset:0}}',
      '.co-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(16,185,129,.35);animation:pulseDot 1.8s var(--ease) 2}',
      '.co-done{position:relative;width:92px;height:92px;margin:0 auto var(--s-4)}',
      '.co-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:var(--s-5)}',
      '.co-meta .box{border:1px solid var(--border);border-radius:var(--r-4);padding:14px;background:var(--surface);min-width:0}',
      '.co-meta .k{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--text-soft);font-weight:700;display:flex;align-items:center;gap:6px}',
      '.co-meta .k svg{width:13px;height:13px}',
      '.co-meta .v{font-size:14px;margin-top:6px;line-height:1.5;overflow-wrap:anywhere}',
      '.co-oid{font-family:var(--font-mono);font-weight:700;letter-spacing:.06em;font-size:15px}',
      '.co-eta{display:flex;align-items:center;gap:14px;padding:16px;border-radius:var(--r-4);border:1px dashed var(--accent-400);background:rgba(109,94,248,.05);margin-top:var(--s-5)}',
      '.co-eta .ic{width:40px;height:40px;border-radius:12px;background:var(--surface);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--accent-500)}',
      '.co-eta .ic svg{width:20px;height:20px}',
      '.co-eta .d{font-size:16px;font-weight:700;letter-spacing:-.01em}',
      '.co-eta .s{font-size:12px;color:var(--text-muted)}',
      '.co-points{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:var(--r-full);background:linear-gradient(135deg,rgba(139,123,255,.14),rgba(79,227,192,.14));border:1px solid var(--border);font-size:13px;font-weight:600;margin-top:var(--s-4)}',
      '.co-points svg{width:16px;height:16px;color:var(--accent-500)}',
      '.co-cart-head{display:flex;align-items:center;justify-content:space-between;gap:var(--s-3);flex-wrap:wrap;margin-bottom:var(--s-2)}',
      '.co-cart-head h3{font-size:17px}',
      '.co-line{border-bottom:1px solid var(--border)}',
      '.co-line:last-child{border-bottom:0}',
      '.cart-line .price .unit{display:block;font-size:12px;font-weight:500;color:var(--text-soft);margin-top:2px}',
      '.cart-page .cart-line{padding:20px 0}',
      '.co-later{margin-top:var(--s-7)}',
      '.co-coupon{display:flex;gap:8px;margin-top:var(--s-4)}',
      '.co-coupon .input{flex:1;min-width:0;text-transform:uppercase;letter-spacing:.04em}',
      '.co-coupon .btn{flex:none}',
      '@media (max-width:560px){.co-actions .btn{flex:1}.co-actions .spacer{display:none}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---------------------------------------------------------
     Money / cart helpers
     --------------------------------------------------------- */
  function cartLines() {
    return S.state.cart.map((it, idx) => ({ idx, it, p: D.byId(it.productId) })).filter(x => x.p);
  }

  function shipMethod() {
    return SHIP_METHODS.find(m => m.id === flow.shipId) || SHIP_METHODS[0];
  }

  function coupon() {
    const code = S.state.coupon;
    if (!code) return null;
    return D.coupons.find(c => c.code === code) || null;
  }

  function totals(opts) {
    opts = opts || {};
    const lines = cartLines();
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.it.qty, 0);
    const count = lines.reduce((s, l) => s + l.it.qty, 0);
    const c = coupon();
    let discount = 0;
    if (c) {
      if (c.flat) discount = Math.min(c.flat, subtotal);
      else if (c.off) discount = subtotal * c.off;
    }
    discount = Math.round(discount * 100) / 100;
    const freeShip = subtotal >= FREE_SHIP_AT || (c && c.freeShip);
    const method = shipMethod();
    const shipping = opts.ignoreMethod || freeShip ? 0 : method.price;
    const gift = flow.gift ? GIFT_FEE : 0;
    const tax = Math.max(0, Math.round((subtotal - discount) * TAX_RATE * 100) / 100);
    const total = Math.max(0, subtotal - discount + shipping + gift + tax);
    return { lines, count, subtotal, discount, freeShip, shipping, method, gift, tax, total, coupon: c };
  }

  function etaDate(days) {
    return U.formatDate(new Date(Date.now() + days * 86400000), { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function summaryRows(t, opts) {
    opts = opts || {};
    const rows = [];
    rows.push(row(S.t('subtotal'), S.money(t.subtotal), opts.count ? '<span class="soft" style="font-weight:500"> · ' + t.count + ' item' + (t.count === 1 ? '' : 's') + '</span>' : ''));
    if (t.discount > 0) rows.push(row(S.t('discount'), '−' + S.money(t.discount), '', 'color:var(--success);font-weight:600'));
    rows.push(row(S.t('shipping'), t.shipping === 0 ? '<span class="free">' + S.t('free') + '</span>' : S.money(t.shipping)));
    if (t.gift > 0) rows.push(row('Gift wrap', S.money(t.gift)));
    rows.push(row(S.t('tax') + ' (8.25%)', S.money(t.tax)));
    return rows.join('');
  }
  function row(label, value, extra, vstyle) {
    return '<div class="summary-row"><span class="muted">' + label + (extra || '') + '</span>' +
      '<span class="tabular"' + (vstyle ? ' style="' + vstyle + '"' : '') + '>' + value + '</span></div>';
  }

  function trustBlock() {
    return '<div class="co-trust">' +
      '<div class="it">' + I.icon('shield') + '<span><b>Secure payment</b> — 256-bit TLS encryption, we never store your full card number.</span></div>' +
      '<div class="it">' + I.icon('refresh') + '<span><b>30-day returns</b> — free return label on every order, no questions asked.</span></div>' +
      '<div class="it">' + I.icon('truck') + '<span><b>Fast delivery</b> — dispatched within 4 hours from our Portland warehouse.</span></div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Coupon
     --------------------------------------------------------- */
  function applyCoupon(code) {
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) { UI.toast({ type: 'warn', title: 'Enter a code', desc: 'Try NOVA10, FLASH20, SHIPFREE or GOLD50' }); return false; }
    const c = D.coupons.find(x => x.code === clean);
    if (!c) { UI.toast({ type: 'error', title: 'Invalid code', desc: '“' + clean + '” is not a valid promo code' }); return false; }
    const t = totals({ ignoreMethod: true });
    if (c.min && t.subtotal < c.min) {
      UI.toast({ type: 'warn', title: 'Minimum not met', desc: 'Spend ' + S.money(c.min) + ' to use ' + clean });
      return false;
    }
    S.set({ coupon: clean });
    UI.toast({ type: 'success', title: 'Coupon applied', desc: c.label });
    return true;
  }
  function removeCoupon() {
    S.set({ coupon: null });
    UI.toast({ title: 'Coupon removed' });
  }

  function couponBlock() {
    const c = coupon();
    if (c) {
      return '<div class="coupon-card mt-4">' +
        '<span class="row" style="gap:10px">' + I.icon('tag', '', 'width:18px;height:18px;color:var(--accent-500)') +
        '<span><span class="code">' + U.h(c.code) + '</span>' +
        '<span class="muted" style="display:block;font-size:12px">' + U.h(c.label) + '</span></span></span>' +
        '<button class="btn btn-sm btn-ghost" data-coupon-remove>' + S.t('remove') + '</button></div>';
    }
    return '<div class="co-coupon">' +
      '<input class="input" id="couponInput" placeholder="Promo code" aria-label="Promo code" value="" autocomplete="off" spellcheck="false">' +
      '<button class="btn btn-secondary" data-coupon-apply>Apply</button></div>' +
      '<div class="soft mt-2" style="font-size:12px">Try <b>NOVA10</b>, <b>FLASH20</b>, <b>SHIPFREE</b> or <b>GOLD50</b></div>';
  }

  /* =========================================================
     PAGE 1 — CART
     ========================================================= */
  async function cartRoute() {
    ensureStyles();
    mode = 'cart';
    const view = U.qs('#view');
    view.innerHTML = '<div class="container section"><div class="checkout-layout">' +
      '<div class="skeleton sk-block" style="height:420px"></div>' +
      '<div class="skeleton sk-block" style="height:320px"></div></div></div>';
    await U.sleep(240);
    renderCart(view);
    UI.observeReveals(view);
  }

  function renderCart(view) {
    const t = totals({ ignoreMethod: true });
    view.innerHTML = cartShell(t);
    paintCart(view);
    wireCart(view);
    wireShared(view, () => renderCart(view));
  }

  function cartShell(t) {
    const empty = !t.lines.length;
    return '' +
      '<div class="page-head"><div class="container">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/shop">Shop</a><span class="sep">/</span><span>' + U.h(S.t('cart')) + '</span></div>' +
      '<div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:12px">' +
      '<div><h1>Your cart</h1>' +
      '<p class="muted mt-2" id="cartLead">' + (empty ? 'Nothing here yet.' : t.count + ' item' + (t.count === 1 ? '' : 's') + ' · ' + S.money(t.subtotal) + ' subtotal') + '</p></div>' +
      (empty ? '' : '<a class="btn btn-ghost btn-sm" href="#/shop">' + I.icon('arrowLeft', '', 'width:16px;height:16px') + 'Continue shopping</a>') +
      '</div></div></div>' +
      (empty ? cartEmptyHtml() :
        '<div class="container cart-page" style="padding-bottom:96px">' +
        '<div class="checkout-layout">' +
        '<div><div id="cartLeft">' + cartLeftHtml(t) + '</div>' +
        '<div class="co-later" id="cartLater">' + savedLaterHtml() + '</div></div>' +
        '<aside id="cartSummary">' + cartSummaryHtml(t) + '</aside>' +
        '</div></div>');
  }

  function cartEmptyHtml() {
    const recs = D.products.slice()
      .sort((a, b) => (b.rating * Math.log10(b.reviews + 10)) - (a.rating * Math.log10(a.reviews + 10)))
      .slice(0, 8);
    return '<div class="container" style="padding-bottom:96px">' +
      '<div class="card" style="padding:8px">' + UI.empty({
        icon: 'cart',
        title: 'Your cart is empty',
        text: 'Looks like you haven’t added anything yet. Here are a few things our customers love this week.',
        actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a><a class="btn btn-secondary" href="#/deals">Browse deals</a>'
      }) + '</div>' +
      '<section class="section-sm">' +
      '<div class="row-between mb-4"><div><div class="eyebrow"><span class="dot"></span>Top rated</div><h3 style="margin-top:6px">Popular right now</h3></div>' +
      '<div class="carousel-nav">' +
      '<button class="btn btn-secondary" data-carousel="#cartRecs" data-dir="prev" aria-label="Previous">' + I.icon('chevronLeft') + '</button>' +
      '<button class="btn btn-secondary" data-carousel="#cartRecs" data-dir="next" aria-label="Next">' + I.icon('chevronRight') + '</button></div></div>' +
      '<div class="carousel" id="cartRecs">' + recs.map(p => '<div>' + UI.productCard(p) + '</div>').join('') + '</div>' +
      '</section></div>';
  }

  function cartLeftHtml(t) {
    const away = Math.max(0, FREE_SHIP_AT - t.subtotal);
    const pct = Math.min(100, (t.subtotal / FREE_SHIP_AT) * 100);
    const unlocked = t.subtotal >= FREE_SHIP_AT;
    return '' +
      '<div class="ship-progress">' +
      '<div class="row-between" style="gap:8px">' +
      '<span class="t">' + (unlocked
        ? I.icon('check', '', 'width:15px;height:15px;color:var(--success);display:inline-block;vertical-align:-2px') + ' You’ve unlocked FREE shipping'
        : 'You’re <b>' + S.money(away) + '</b> away from FREE SHIPPING') + '</span>' +
      '<span class="soft" style="font-size:12px">' + S.money(Math.min(t.subtotal, FREE_SHIP_AT)) + ' / ' + S.money(FREE_SHIP_AT) + '</span>' +
      '</div>' +
      '<div class="progress' + (unlocked ? ' success' : '') + '"><div class="bar" style="width:' + pct.toFixed(1) + '%"></div></div>' +
      '<div class="soft mt-2" style="font-size:12px">' + (unlocked
        ? 'Standard delivery is on us. Express options are available at checkout.'
        : 'Standard shipping is ' + S.money(BASE_SHIP) + ' — spend ' + S.money(away) + ' more and it’s free.') + '</div>' +
      '</div>' +
      '<div class="co-cart-head"><h3>' + t.count + ' item' + (t.count === 1 ? '' : 's') + ' in your cart</h3>' +
      '<span class="soft" style="font-size:12px">Prices include all applicable discounts</span></div>' +
      '<div class="card" style="padding:0 clamp(14px,2vw,22px)">' +
      t.lines.map(l => cartLineHtml(l)).join('') +
      '</div>';
  }

  function cartLineHtml(l) {
    const p = l.p, it = l.it;
    const lineTotal = p.price * it.qty;
    const variant = [it.color || (p.colors[0] && p.colors[0].name), it.size].filter(Boolean).join(' · ');
    const low = p.stock <= 10;
    return '<div class="cart-line co-line" data-line="' + l.idx + '">' +
      '<a class="thumb" href="#/product/' + p.id + '" aria-label="' + U.h(p.name) + '"><img src="' + img(p.imgs[0], 200, 200) + '" alt="" loading="lazy"></a>' +
      '<div class="meta">' +
      '<div class="pcard-brand" style="font-size:11px">' + U.h(p.brand) + '</div>' +
      '<a class="name" href="#/product/' + p.id + '">' + U.h(p.name) + '</a>' +
      '<div class="variant">' + U.h(variant) + '</div>' +
      (low ? '<div class="mt-1" style="font-size:12px;color:var(--warning);font-weight:600">Only ' + p.stock + ' left in stock</div>' : '') +
      '<div class="line-actions">' +
      '<button data-save="' + l.idx + '">' + S.t('saveLater') + '</button>' +
      '<button data-rm="' + l.idx + '">' + S.t('remove') + '</button>' +
      '<button data-wishmove="' + l.idx + '">Move to wishlist</button>' +
      '</div></div>' +
      '<div class="col" style="align-items:flex-end;gap:10px;flex:0 0 auto">' +
      '<div class="price tabular">' + S.money(lineTotal) + '<span class="unit">' + S.money(p.price) + ' each</span></div>' +
      '<span class="qty" style="height:38px">' +
      '<button data-q="-1" data-idx="' + l.idx + '" aria-label="Decrease quantity"' + (it.qty <= 1 ? ' style="opacity:.4"' : '') + '>' + I.icon('minus', '', 'width:14px;height:14px') + '</button>' +
      '<span class="v">' + it.qty + '</span>' +
      '<button data-q="1" data-idx="' + l.idx + '" aria-label="Increase quantity"' + (it.qty >= p.stock ? ' disabled style="opacity:.4"' : '') + '>' + I.icon('plus', '', 'width:14px;height:14px') + '</button>' +
      '</span></div></div>';
  }

  function savedLaterHtml() {
    const list = S.state.savedLater || [];
    if (!list.length) return '';
    return '<div class="eyebrow mb-3"><span class="dot"></span>Saved for later (' + list.length + ')</div>' +
      '<div class="card" style="padding:0 clamp(14px,2vw,22px)">' +
      list.map((it, idx) => {
        const p = D.byId(it.productId);
        if (!p) return '';
        const variant = [it.color, it.size].filter(Boolean).join(' · ');
        return '<div class="cart-line co-line" style="opacity:.92">' +
          '<a class="thumb" href="#/product/' + p.id + '"><img src="' + img(p.imgs[0], 200, 200) + '" alt="" loading="lazy"></a>' +
          '<div class="meta"><div class="name">' + U.h(p.name) + '</div>' +
          '<div class="variant">' + U.h(variant) + '</div>' +
          '<div class="line-actions"><button data-move="' + idx + '">' + S.t('moveToCart') + '</button>' +
          '<button data-rmsave="' + idx + '">' + S.t('remove') + '</button></div></div>' +
          '<div class="price tabular">' + S.money(p.price) + '<span class="unit">each</span></div></div>';
      }).join('') + '</div>';
  }

  function cartSummaryHtml(t) {
    return '<div class="order-summary">' +
      '<h4 style="font-size:16px">Order summary</h4>' +
      '<div class="soft mt-1" style="font-size:12px">Shipping and taxes calculated at checkout</div>' +
      couponBlock() +
      '<div class="mt-5">' + summaryRows(t, { count: true }) +
      '<div class="summary-row total"><span>' + S.t('total') + '</span><span class="tabular">' + S.money(t.total) + '</span></div></div>' +
      '<div class="col gap-2 mt-5">' +
      '<button class="btn btn-primary btn-lg btn-block" data-gocheckout>' + I.icon('lock') + S.t('checkout') + '</button>' +
      '<a class="btn btn-ghost btn-block" href="#/shop">' + S.t('continueShopping') + '</a></div>' +
      trustBlock() +
      '</div>';
  }

  function paintCart(view) {
    const t = totals({ ignoreMethod: true });
    const lead = U.qs('#cartLead');
    if (lead) lead.textContent = t.count + ' item' + (t.count === 1 ? '' : 's') + ' · ' + S.money(t.subtotal) + ' subtotal';
    const left = U.qs('#cartLeft'); if (left) left.innerHTML = cartLeftHtml(t);
    const later = U.qs('#cartLater'); if (later) later.innerHTML = savedLaterHtml();
    const sum = U.qs('#cartSummary'); if (sum) sum.innerHTML = cartSummaryHtml(t);
  }

  function wireCart(view) {
    if (view._coCartWired) return;
    view._coCartWired = true;
    view.addEventListener('click', (e) => {
      const q = e.target.closest('[data-q]');
      if (q) {
        const i = +q.dataset.idx;
        const cur = S.state.cart[i];
        if (!cur) return;
        const next = cur.qty + (+q.dataset.q);
        if (next <= 0) return;
        const p = D.byId(cur.productId);
        if (p && next > p.stock) { UI.toast({ type: 'warn', title: 'Stock limit', desc: 'Only ' + p.stock + ' available' }); return; }
        S.updateQty(i, next);
        UI.toast({ title: 'Quantity updated', desc: p ? p.name + ' × ' + next : '' });
        paintCart(view);
        return;
      }
      const rm = e.target.closest('[data-rm]');
      if (rm) {
        const p = D.byId((S.state.cart[+rm.dataset.rm] || {}).productId);
        S.removeFromCart(+rm.dataset.rm);
        UI.toast({ title: 'Removed from cart', desc: p ? p.name : '' });
        if (!S.state.cart.length) renderCart(view); else paintCart(view);
        return;
      }
      const sv = e.target.closest('[data-save]');
      if (sv) {
        const idx = +sv.dataset.save, it = S.state.cart[idx];
        if (!it) return;
        S.set({ savedLater: (S.state.savedLater || []).concat([it]), cart: S.state.cart.filter((_, k) => k !== idx) });
        S.emit('cart');
        UI.toast({ title: 'Saved for later', desc: (D.byId(it.productId) || {}).name });
        if (!S.state.cart.length) renderCart(view); else paintCart(view);
        return;
      }
      const mv = e.target.closest('[data-move]');
      if (mv) {
        const idx = +mv.dataset.move, it = (S.state.savedLater || [])[idx];
        if (!it) return;
        S.set({ cart: S.state.cart.concat([it]), savedLater: S.state.savedLater.filter((_, k) => k !== idx) });
        S.emit('cart');
        UI.toast({ type: 'success', title: 'Moved to cart', desc: (D.byId(it.productId) || {}).name });
        if (!S.state.cart.length) renderCart(view); else paintCart(view);
        return;
      }
      const rs = e.target.closest('[data-rmsave]');
      if (rs) {
        S.set({ savedLater: S.state.savedLater.filter((_, k) => k !== +rs.dataset.rmsave) });
        UI.toast({ title: 'Removed from saved items' });
        paintCart(view);
        return;
      }
      const wm = e.target.closest('[data-wishmove]');
      if (wm) {
        const idx = +wm.dataset.wishmove, it = S.state.cart[idx];
        if (!it) return;
        const p = D.byId(it.productId);
        if (!S.inWishlist(it.productId)) S.toggleWishlist(it.productId);
        S.removeFromCart(idx);
        UI.toast({ type: 'success', title: 'Moved to wishlist', desc: p ? p.name : '' });
        if (!S.state.cart.length) renderCart(view); else paintCart(view);
        return;
      }
      if (e.target.closest('[data-gocheckout]')) { Router.go('/checkout'); return; }
    });
    UI.wireCarousel(view);
  }

  /* Shared coupon input wiring (cart + checkout) */
  function wireShared(view, repaint) {
    if (view._coSharedWired) return;
    view._coSharedWired = true;
    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-coupon-apply]')) {
        const input = U.qs('#couponInput', view);
        if (applyCoupon(input ? input.value : '')) repaint();
        return;
      }
      if (e.target.closest('[data-coupon-remove]')) { removeCoupon(); repaint(); return; }
    });
    view.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'couponInput') {
        e.preventDefault();
        if (applyCoupon(e.target.value)) repaint();
      }
    });
  }

  /* =========================================================
     PAGE 2 — CHECKOUT
     ========================================================= */
  async function checkoutRoute() {
    ensureStyles();
    const view = U.qs('#view');
    if (flow.step === 5 && flow.order) { renderCheckout(view, false); return; }
    if (!S.state.cart.length) {
      view.innerHTML = '<div class="container section"><div class="card" style="padding:8px">' + UI.empty({
        icon: 'cart',
        title: 'Your cart is empty',
        text: 'Add something you love and we’ll walk you through checkout in four quick steps.',
        actions: '<a class="btn btn-primary" href="#/shop">Start shopping</a><a class="btn btn-secondary" href="#/cart">View cart</a>'
      }) + '</div></div>';
      UI.observeReveals(view);
      return;
    }
    view.innerHTML = '<div class="container section"><div class="checkout-layout">' +
      '<div class="skeleton sk-block" style="height:360px"></div>' +
      '<div class="skeleton sk-block" style="height:280px"></div></div></div>';
    await U.sleep(280);
    renderCheckout(view, true);
  }

  function renderCheckout(view, animate) {
    view.innerHTML = checkoutShell();
    const pane = U.qs('#coPane', view);
    if (animate && pane) pane.classList.add('co-in');
    UI.wireCarousel(view);
    wireCheckout(view);
    syncSticky(view);
    UI.observeReveals(view);
  }

  function checkoutShell() {
    return '' +
      '<div class="page-head"><div class="container">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/cart">' + U.h(S.t('cart')) + '</a><span class="sep">/</span><span>Checkout</span></div>' +
      '<div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:12px">' +
      '<div><h1>Checkout</h1><p class="muted mt-2">Four short steps. Your cart is reserved for the next 24 hours.</p></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/cart">' + I.icon('cart', '', 'width:16px;height:16px') + 'Back to cart</a>' +
      '</div></div></div>' +
      '<div class="container" style="padding-bottom:104px">' +
      '<div id="coSteps">' + stepsHtml() + '</div>' +
      '<div class="checkout-layout">' +
      '<div id="coPane" class="co-pane">' + paneHtml() + '</div>' +
      '<aside id="coSummary">' + coSummaryHtml() + '</aside>' +
      '</div></div>' +
      '<div class="sticky-cta" id="coSticky"></div>';
  }

  function stepsHtml() {
    let out = '<div class="checkout-steps">';
    STEPS.forEach((s, i) => {
      const done = flow.step > s.n;
      const active = flow.step === s.n;
      const reachable = s.n < flow.step && flow.step < 5;
      const tag = reachable ? 'button' : 'span';
      out += '<' + tag + (reachable ? ' data-gostep="' + s.n + '"' : '') + ' class="step' + (done ? ' done' : '') + (active ? ' active' : '') + '"' +
        (reachable ? ' aria-label="Back to ' + U.h(s.label) + '"' : '') + '>' +
        '<span class="bullet">' + (done ? I.icon('check', '', 'width:13px;height:13px') : s.n) + '</span>' +
        '<span>' + U.h(s.label) + '</span></' + tag + '>';
      if (i < STEPS.length - 1) out += '<span class="line"></span>';
    });
    return out + '</div>';
  }

  function paneHtml() {
    switch (flow.step) {
      case 1: return stepCartHtml();
      case 2: return stepInfoHtml();
      case 3: return stepShipHtml();
      case 4: return stepPayHtml();
      case 5: return stepDoneHtml();
      default: return '';
    }
  }

  /* ---------- Step 1 ---------- */
  function stepCartHtml() {
    const t = totals({ ignoreMethod: true });
    return '<div class="co-panel">' +
      '<div class="co-head"><span class="num">1</span><h3>Review your items</h3></div>' +
      '<p class="co-sub">Everything looks good? You can still adjust quantities before we ask for your details.</p>' +
      '<div>' + t.lines.map(l => miniRow(l)).join('') + '</div>' +
      '<div class="co-actions">' +
      '<a class="co-back" href="#/cart">' + I.icon('chevronLeft') + 'Edit cart</a>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-lg" data-next="2">' + 'Continue to information' + I.icon('arrowRight', '', 'width:17px;height:17px') + '</button>' +
      '</div></div>';
  }

  function miniRow(l, readonly) {
    const p = l.p, it = l.it;
    const variant = [it.color || (p.colors[0] && p.colors[0].name), it.size].filter(Boolean).join(' · ');
    return '<div class="co-mini">' +
      '<img src="' + img(p.imgs[0], 120, 120) + '" alt="" loading="lazy">' +
      '<div class="m"><div class="n">' + U.h(p.name) + '</div>' +
      '<div class="v">' + U.h(variant) + ' · ' + S.money(p.price) + '</div>' +
      (readonly ? '' :
        '<span class="qty" style="height:30px;margin-top:6px">' +
        '<button data-q="-1" data-idx="' + l.idx + '" aria-label="Decrease">' + I.icon('minus', '', 'width:12px;height:12px') + '</button>' +
        '<span class="v" style="min-width:26px;font-size:13px">' + it.qty + '</span>' +
        '<button data-q="1" data-idx="' + l.idx + '" aria-label="Increase"' + (it.qty >= p.stock ? ' disabled style="opacity:.4"' : '') + '>' + I.icon('plus', '', 'width:12px;height:12px') + '</button>' +
        '</span>') +
      '</div>' +
      '<div class="p tabular">' + S.money(p.price * it.qty) + '</div></div>';
  }

  /* ---------- Step 2 ---------- */
  function stepInfoHtml() {
    const f = flow.info;
    const addrs = D.addresses || [];
    return '<div class="co-panel">' +
      '<div class="co-head"><span class="num">2</span><h3>Contact &amp; delivery address</h3></div>' +
      '<p class="co-sub">We’ll send your confirmation and tracking updates to these details.</p>' +
      (addrs.length ? '<div class="eyebrow mb-2"><span class="dot"></span>Use a saved address</div><div class="co-saved">' +
        addrs.map(a => '<button class="co-addr' + (flow._addr === a.id ? ' active' : '') + '" data-addr="' + a.id + '">' +
          '<span class="l">' + I.icon('mapPin') + U.h(a.label) + '</span>' +
          '<span class="v">' + U.h(a.name) + '<br>' + U.h(a.line1) + '<br>' + U.h(a.city + ', ' + a.state + ' ' + a.zip) + '</span></button>').join('') +
        '</div>' : '') +
      '<div class="co-grid">' +
      field('name', 'Full name', 'Alex Mercer', { ac: 'name' }) +
      field('email', 'Email address', 'you@example.com', { type: 'email', im: 'email', ac: 'email' }) +
      field('phone', 'Phone number', '+1 (503) 555-0147', { type: 'tel', im: 'tel', ac: 'tel' }) +
      field('address', 'Street address', '221B Alder Street', { span: true, ac: 'address-line1' }) +
      field('city', 'City', 'Portland', { ac: 'address-level2' }) +
      field('state', 'State / Region', 'OR', { ac: 'address-level1' }) +
      field('zip', 'Postal code', '97204', { im: 'text', ac: 'postal-code' }) +
      countryField() +
      '</div>' +
      '<label class="checkbox mt-5"><input type="checkbox" data-flag="saveAddress"' + (flow.saveAddress ? ' checked' : '') + '><span class="box"></span>' +
      '<span>Save this address for later</span></label>' +
      '<div class="co-actions">' +
      '<button class="co-back" data-gostep="1">' + I.icon('chevronLeft') + 'Back to cart</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-lg" data-next="3">Continue to shipping' + I.icon('arrowRight', '', 'width:17px;height:17px') + '</button>' +
      '</div></div>';
  }

  function field(key, label, ph, o) {
    o = o || {};
    return '<div class="co-field' + (o.span ? ' co-span' : '') + '" data-wrap="' + key + '">' +
      '<label class="co-label" for="co_' + key + '">' + U.h(label) + '</label>' +
      '<input class="input" id="co_' + key + '" data-field="' + key + '" type="' + (o.type || 'text') + '"' +
      (o.im ? ' inputmode="' + o.im + '"' : '') + ' autocomplete="' + (o.ac || 'off') + '"' +
      ' placeholder="' + U.h(ph || '') + '" value="' + U.h(flow.info[key] || '') + '" spellcheck="false">' +
      '<div class="co-err" data-err="' + key + '" hidden></div></div>';
  }

  function countryField() {
    return '<div class="co-field" data-wrap="country">' +
      '<label class="co-label" for="co_country">Country</label>' +
      '<select class="input" id="co_country" data-field="country" autocomplete="country-name">' +
      COUNTRIES.map(c => '<option value="' + U.h(c) + '"' + (flow.info.country === c ? ' selected' : '') + '>' + U.h(c) + '</option>').join('') +
      '</select><div class="co-err" data-err="country" hidden></div></div>';
  }

  const VALIDATORS = {
    name: v => !v.trim() ? 'Full name is required' : (v.trim().length < 3 ? 'Please enter your full name' : ''),
    email: v => !v.trim() ? 'Email is required' : (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v.trim()) ? 'Enter a valid email address' : ''),
    phone: v => !v.trim() ? 'Phone number is required' : (v.replace(/\D/g, '').length < 7 ? 'Enter a valid phone number' : ''),
    address: v => !v.trim() ? 'Street address is required' : (v.trim().length < 4 ? 'Enter a complete street address' : ''),
    city: v => !v.trim() ? 'City is required' : '',
    state: v => !v.trim() ? 'State / region is required' : '',
    zip: v => !v.trim() ? 'Postal code is required' : (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v.trim()) ? 'Enter a valid postal code' : ''),
    country: v => !v ? 'Select a country' : ''
  };

  function setErr(view, key, msg) {
    const wrap = U.qs('[data-wrap="' + key + '"]', view);
    const tip = U.qs('[data-err="' + key + '"]', view);
    if (!wrap || !tip) return;
    const input = U.qs('.input', wrap);
    if (msg) {
      wrap.classList.add('err');
      if (input) input.setAttribute('aria-invalid', 'true');
      tip.hidden = false;
      tip.innerHTML = I.icon('alert', '', 'width:13px;height:13px') + '<span>' + U.h(msg) + '</span>';
    } else {
      wrap.classList.remove('err');
      if (input) input.removeAttribute('aria-invalid');
      tip.hidden = true;
      tip.innerHTML = '';
    }
  }

  function validateInfo(view, only) {
    const keys = only ? [only] : Object.keys(VALIDATORS);
    let first = null;
    keys.forEach(k => {
      const msg = VALIDATORS[k](flow.info[k] || '');
      setErr(view, k, msg);
      if (msg && !first) first = k;
    });
    return first;
  }

  /* ---------- Step 3 ---------- */
  function stepShipHtml() {
    const t = totals();
    return '<div class="co-panel">' +
      '<div class="co-head"><span class="num">3</span><h3>Delivery method</h3></div>' +
      '<p class="co-sub">Shipping to <b>' + U.h(flow.info.city || 'your address') + (flow.info.state ? ', ' + U.h(flow.info.state) : '') + '</b> · ' + U.h(flow.info.country || 'United States') + '</p>' +
      '<div class="ship-opts">' + SHIP_METHODS.map(m => {
        const free = t.freeShip && m.price === 0;
        const isFree = t.freeShip;
        const price = isFree ? 0 : m.price;
        const eta = etaDate(m.days);
        return '<label class="ship-opt' + (flow.shipId === m.id ? ' active' : '') + '" data-ship="' + m.id + '">' +
          '<span class="radio" style="flex:none"><input type="radio" name="shipM" value="' + m.id + '"' + (flow.shipId === m.id ? ' checked' : '') + '><span class="dot"></span></span>' +
          '<span class="ic">' + I.icon(m.icon) + '</span>' +
          '<span class="tx"><span class="nm">' + U.h(m.name) + '</span>' +
          '<span class="dt">' + U.h(eta) + ' · ' + U.h(m.window) + '</span></span>' +
          '<span class="pr' + (price === 0 ? ' free' : '') + '">' + (price === 0 ? 'FREE' : S.money(price)) + '</span>' +
          '</label>';
      }).join('') + '</div>' +
      '<div class="soft mt-3" style="font-size:12px">' + U.h(shipMethod().note) + '</div>' +
      '<div class="co-field mt-6"><label class="co-label" for="coNote">Delivery instructions <span class="soft" style="font-weight:500">(optional)</span></label>' +
      '<textarea class="input" id="coNote" data-field-note rows="3" placeholder="Leave with the concierge, gate code 4412…" style="min-height:84px">' + U.h(flow.note) + '</textarea></div>' +
      '<label class="checkbox mt-5"><input type="checkbox" data-flag="gift"' + (flow.gift ? ' checked' : '') + '><span class="box"></span>' +
      '<span class="row" style="gap:8px">' + I.icon('gift', '', 'width:16px;height:16px') + 'Add gift wrapping — ' + S.money(GIFT_FEE) + '</span></label>' +
      '<div class="co-actions">' +
      '<button class="co-back" data-gostep="2">' + I.icon('chevronLeft') + 'Back</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-lg" data-next="4">Continue to payment' + I.icon('arrowRight', '', 'width:17px;height:17px') + '</button>' +
      '</div></div>';
  }

  /* ---------- Step 4 ---------- */
  function stepPayHtml() {
    const t = totals();
    const total = t.total;
    return '<div class="co-panel">' +
      '<div class="co-head"><span class="num">4</span><h3>Payment</h3></div>' +
      '<p class="co-sub">All transactions are encrypted and processed securely.</p>' +
      '<div class="pay-list">' + PAY_METHODS.map(m => {
        const sub = m.id === 'nova' ? '4 × ' + S.money(total / 4) + ', no interest' : m.sub;
        return '<label class="pay-method' + (flow.pay === m.id ? ' active' : '') + '" data-pay="' + m.id + '">' +
          '<span class="radio" style="flex:none"><input type="radio" name="payM" value="' + m.id + '"' + (flow.pay === m.id ? ' checked' : '') + '><span class="dot"></span></span>' +
          '<span class="pm">' + (m.badge ? U.h(m.badge) : I.icon(m.icon, '')) + '</span>' +
          '<span class="tx"><span class="label">' + U.h(m.label) + '</span><span class="sub">' + U.h(sub) + '</span></span>' +
          '<span class="rd">' + cardBrandBadge(m.id === 'card' ? flow.card.num : '') + '</span>' +
          '</label>';
      }).join('') + '</div>' +
      (flow.pay === 'card' ? cardFormHtml() : '') +
      '<label class="checkbox mt-5"><input type="checkbox" data-flag="sameBilling"' + (flow.sameBilling ? ' checked' : '') + '><span class="box"></span>' +
      '<span>Billing address is the same as my delivery address</span></label>' +
      '<div class="co-secure">' + I.icon('lock') + '<span>Your card details are tokenised — Nova never sees or stores the full number. 3-D Secure protects this order.</span></div>' +
      '<div class="co-actions">' +
      '<button class="co-back" data-gostep="3">' + I.icon('chevronLeft') + 'Back</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-primary btn-lg" data-place>' + I.icon('lock') + 'Pay ' + S.money(total) + '</button>' +
      '</div></div>';
  }

  function cardFormHtml() {
    const c = flow.card;
    const brand = cardBrand(c.num);
    const cvcLen = brand === 'amex' ? 4 : 3;
    return '<div class="co-cardform">' +
      '<div class="row-between mb-4"><span style="font-size:13px;font-weight:600">Card details</span>' + cardBrandBadge(c.num) + '</div>' +
      '<div class="co-grid">' +
      '<div class="co-field co-span" data-wrap="cnum">' +
      '<label class="co-label" for="co_cnum">Card number</label>' +
      '<input class="input" id="co_cnum" data-card="num" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" value="' + U.h(c.num) + '" maxlength="' + (brand === 'amex' ? 19 : 19) + '">' +
      '<div class="co-err" data-err="cnum" hidden></div></div>' +
      '<div class="co-field co-span" data-wrap="cname">' +
      '<label class="co-label" for="co_cname">Name on card</label>' +
      '<input class="input" id="co_cname" data-card="name" autocomplete="cc-name" placeholder="ALEX MERCER" value="' + U.h(c.name) + '">' +
      '<div class="co-err" data-err="cname" hidden></div></div>' +
      '<div class="co-field" data-wrap="cexp">' +
      '<label class="co-label" for="co_cexp">Expiry (MM/YY)</label>' +
      '<input class="input" id="co_cexp" data-card="exp" inputmode="numeric" autocomplete="cc-exp" placeholder="09/28" value="' + U.h(c.exp) + '" maxlength="5">' +
      '<div class="co-err" data-err="cexp" hidden></div></div>' +
      '<div class="co-field" data-wrap="ccvc">' +
      '<label class="co-label" for="co_ccvc">Security code</label>' +
      '<input class="input" id="co_ccvc" data-card="cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="' + (cvcLen === 4 ? '1234' : '123') + '" value="' + U.h(c.cvc) + '" maxlength="' + cvcLen + '">' +
      '<div class="co-err" data-err="ccvc" hidden></div></div>' +
      '</div></div>';
  }

  function cardBrand(num) {
    const v = String(num || '').replace(/\D/g, '');
    if (/^4/.test(v)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(v)) return 'mastercard';
    if (/^3[47]/.test(v)) return 'amex';
    if (/^6/.test(v)) return 'discover';
    return '';
  }
  const BRAND_LABEL = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC', '': '' };
  function cardBrandBadge(num) {
    const b = cardBrand(num);
    if (!b) return '';
    const color = { visa: '#1A1F71', mastercard: '#EB6C1F', amex: '#2E77BC', discover: '#E08A00' }[b];
    return '<span class="co-brand" style="color:' + color + '">' + I.icon('credit', '', 'width:14px;height:14px') + BRAND_LABEL[b] + '</span>';
  }

  function formatCard(v) {
    const d = String(v || '').replace(/\D/g, '').slice(0, 16);
    if (cardBrand(d) === 'amex') {
      return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
    }
    return d.replace(/(.{4})/g, '$1 ').trim();
  }
  function luhn(v) {
    const d = String(v || '').replace(/\D/g, '');
    if (d.length < 13) return false;
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = +d[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function cardErrors() {
    const c = flow.card;
    const e = {};
    const digits = c.num.replace(/\D/g, '');
    const brand = cardBrand(c.num);
    if (!digits) e.cnum = 'Card number is required';
    else if (digits.length < (brand === 'amex' ? 15 : 16)) e.cnum = 'Enter the full card number';
    else if (!luhn(digits)) e.cnum = 'That card number looks invalid';
    if (!c.name.trim()) e.cname = 'Name on card is required';
    const m = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(c.exp.trim());
    if (!c.exp.trim()) e.cexp = 'Expiry is required';
    else if (!m) e.cexp = 'Use MM/YY format';
    else {
      const mm = +m[1], yy = 2000 + (+m[2]);
      if (mm < 1 || mm > 12) e.cexp = 'Invalid month';
      else {
        const now = new Date();
        if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) e.cexp = 'This card has expired';
      }
    }
    const need = brand === 'amex' ? 4 : 3;
    if (!c.cvc.trim()) e.ccvc = 'Security code is required';
    else if (!new RegExp('^\\d{' + need + '}$').test(c.cvc.trim())) e.ccvc = need + ' digits required';
    return e;
  }
  function setCardErr(view, key, msg) {
    const wrap = U.qs('[data-wrap="' + key + '"]', view);
    const tip = U.qs('[data-err="' + key + '"]', view);
    if (!wrap || !tip) return;
    const input = U.qs('.input', wrap);
    if (msg) {
      wrap.classList.add('err');
      if (input) input.setAttribute('aria-invalid', 'true');
      tip.hidden = false;
      tip.innerHTML = I.icon('alert', '', 'width:13px;height:13px') + '<span>' + U.h(msg) + '</span>';
    } else {
      wrap.classList.remove('err');
      if (input) input.removeAttribute('aria-invalid');
      tip.hidden = true; tip.innerHTML = '';
    }
  }

  /* ---------- Step 5 ---------- */
  function stepDoneHtml() {
    if (!flow.order) return '';
    return '<div class="co-panel">' + confirmBody(flow.order) + '</div>';
  }

  function confirmBody(o) {
    const eta = U.formatDate(o.eta, { weekday: 'long', month: 'short', day: 'numeric' });
    return '' +
      '<div class="text-center" style="padding:8px 0 var(--s-2)">' +
      '<div class="co-done"><div class="co-ring"></div>' +
      '<svg class="co-check" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28"/><path d="M18 31.5l8.5 8.5L43 23"/></svg></div>' +
      '<h3 style="font-size:24px">Thank you, ' + U.h((o.customer || '').split(' ')[0] || 'friend') + '!</h3>' +
      '<p class="muted mt-2" style="max-width:46ch;margin-inline:auto">Your order is confirmed. A receipt is on its way to <b>' + U.h(o.email) + '</b> and you can track every step from your account.</p>' +
      '<div class="row" style="justify-content:center;gap:8px;margin-top:var(--s-4);flex-wrap:wrap">' +
      '<span class="badge badge-dark mono" style="font-size:12px">' + U.h(o.id) + '</span>' +
      '<button class="btn btn-secondary btn-sm" data-copy="' + U.h(o.id) + '">' + I.icon('copy', '', 'width:15px;height:15px') + 'Copy</button>' +
      '</div>' +
      '<div class="co-points">' + I.icon('award') + '+' + Math.round(o.total) + ' reward points added to your balance</div>' +
      '</div>' +
      '<div class="co-eta">' +
      '<span class="ic">' + I.icon('truck') + '</span>' +
      '<div><div class="d">Arriving ' + U.h(eta) + '</div>' +
      '<div class="s">' + U.h(o.shipLabel || 'Standard delivery') + ' · ' + U.h(o.address) + '</div></div>' +
      '</div>' +
      '<div class="co-meta">' +
      '<div class="box"><div class="k">' + I.icon('package') + 'Items</div><div class="v">' +
      o.items.map(it => {
        const p = D.byId(it.productId);
        return '<div style="display:flex;justify-content:space-between;gap:10px">' +
          '<span>' + U.h(p ? p.name : it.productId) + ' <span class="soft">×' + it.qty + '</span></span>' +
          '<span class="tabular">' + S.money(it.price * it.qty) + '</span></div>';
      }).join('') + '</div></div>' +
      '<div class="box"><div class="k">' + I.icon('mapPin') + 'Delivery address</div><div class="v">' + U.h(o.address) + '</div></div>' +
      '<div class="box"><div class="k">' + I.icon('credit') + 'Payment</div><div class="v">' + U.h(o.payLabel) + '</div></div>' +
      '</div>' +
      '<div class="mt-6">' +
      '<div class="summary-row"><span class="muted">' + S.t('subtotal') + '</span><span class="tabular">' + S.money(o.subtotal) + '</span></div>' +
      (o.discount > 0 ? '<div class="summary-row"><span class="muted">' + S.t('discount') + ' ' + (o.coupon ? '(' + U.h(o.coupon) + ')' : '') + '</span><span class="tabular" style="color:var(--success)">−' + S.money(o.discount) + '</span></div>' : '') +
      '<div class="summary-row"><span class="muted">' + S.t('shipping') + '</span><span class="tabular">' + (o.shipping === 0 ? '<span class="free">FREE</span>' : S.money(o.shipping)) + '</span></div>' +
      (o.gift > 0 ? '<div class="summary-row"><span class="muted">Gift wrap</span><span class="tabular">' + S.money(o.gift) + '</span></div>' : '') +
      '<div class="summary-row"><span class="muted">' + S.t('tax') + ' (8.25%)</span><span class="tabular">' + S.money(o.tax) + '</span></div>' +
      '<div class="summary-row total"><span>' + S.t('total') + '</span><span class="tabular">' + S.money(o.total) + '</span></div>' +
      '</div>' +
      (o.note ? '<div class="co-secure mt-5">' + I.icon('info') + '<span><b>Delivery note:</b> ' + U.h(o.note) + '</span></div>' : '') +
      '<div class="co-actions" style="justify-content:center">' +
      '<a class="btn btn-primary btn-lg" href="#/account/orders">' + I.icon('truck') + 'Track order</a>' +
      '<a class="btn btn-secondary btn-lg" href="#/shop">' + S.t('continueShopping') + '</a>' +
      '</div>';
  }

  /* ---------- Right rail ---------- */
  function coSummaryHtml() {
    const t = totals();
    const open = flow.summaryOpen;
    return '<div class="order-summary">' +
      '<button class="co-toggle' + (open ? ' open' : '') + '" data-sumtoggle aria-expanded="' + open + '">' +
      '<span>Order summary <span class="cnt">(' + t.count + ')</span></span>' +
      '<span class="row" style="gap:6px">' + S.money(t.total) + I.icon('chevronDown', '', 'width:15px;height:15px') + '</span></button>' +
      (open ? '<div class="mt-3">' + t.lines.map(l => miniRow(l, true)).join('') + '</div>' : '') +
      '<div class="mt-3">' + summaryRows(t) +
      '<div class="summary-row total"><span>' + S.t('total') + '</span><span class="tabular">' + S.money(t.total) + '</span></div></div>' +
      (flow.step === 1 || flow.step === 2 || flow.step === 3 || flow.step === 4 ? couponBlock() : '') +
      '<div class="co-trust" style="margin-top:var(--s-4)">' +
      '<div class="it">' + I.icon('shield') + '<span>Encrypted checkout</span></div>' +
      '<div class="it">' + I.icon('refresh') + '<span>Free 30-day returns</span></div>' +
      '</div></div>';
  }

  function syncSticky(view) {
    const bar = U.qs('#coSticky', view);
    if (!bar) return;
    if (flow.step === 5) { bar.innerHTML = ''; bar.style.display = 'none'; return; }
    bar.style.display = '';
    const t = totals();
    const label = flow.step === 4 ? 'Pay ' + S.money(t.total) : 'Continue';
    bar.innerHTML = '<div class="meta"><div class="p">' + S.money(t.total) + '</div>' + t.count + ' item' + (t.count === 1 ? '' : 's') + ' · incl. tax</div>' +
      '<button class="btn btn-primary" data-stickygo>' + label + '</button>';
  }

  /* ---------- Wiring ---------- */
  function wireCheckout(view) {
    if (view._coWired) { view._coWired(); }
    const onClick = (e) => checkoutClick(e, view);
    const onInput = (e) => checkoutInput(e, view);
    const onChange = (e) => checkoutChange(e, view);
    view.addEventListener('click', onClick);
    view.addEventListener('input', onInput);
    view.addEventListener('change', onChange);
    view._coWired = () => {
      view.removeEventListener('click', onClick);
      view.removeEventListener('input', onInput);
      view.removeEventListener('change', onChange);
    };
  }

  function checkoutClick(e, view) {
    const g = e.target.closest('[data-gostep]');
    if (g) { goStep(+g.dataset.gostep, view); return; }

    const nx = e.target.closest('[data-next]');
    if (nx) {
      const target = +nx.dataset.next;
      if (target === 3 && validateInfo(view)) {
        UI.toast({ type: 'error', title: 'Check your details', desc: 'Some fields need attention before we continue' });
        const bad = U.qs('.co-field.err .input', view);
        if (bad) bad.focus();
        return;
      }
      goStep(target, view, nx);
      return;
    }

    const st = e.target.closest('[data-stickygo]');
    if (st) {
      if (flow.step === 4) { doPlace(view, st); return; }
      const btn = U.qs('[data-next]', view);
      if (btn) btn.click();
      return;
    }

    const pl = e.target.closest('[data-place]');
    if (pl) { doPlace(view, pl); return; }

    const tg = e.target.closest('[data-sumtoggle]');
    if (tg) {
      flow.summaryOpen = !flow.summaryOpen;
      U.qs('#coSummary', view).innerHTML = coSummaryHtml();
      return;
    }

    const cp = e.target.closest('[data-copy]');
    if (cp) { copyText(cp.dataset.copy); return; }

    const sv = e.target.closest('[data-addr]');
    if (sv) {
      const a = D.addresses.find(x => x.id === sv.dataset.addr);
      if (a) {
        flow.info = Object.assign({}, flow.info, {
          name: a.name || flow.info.name, address: a.line1, city: a.city,
          state: a.state, zip: a.zip, country: a.country || 'United States', phone: a.phone || flow.info.phone
        });
        flow._addr = a.id;
        U.qs('#coPane', view).innerHTML = stepInfoHtml();
        UI.toast({ type: 'success', title: 'Address filled', desc: a.label + ' · ' + a.line1 });
      }
      return;
    }

    const shp = e.target.closest('[data-ship]');
    if (shp) {
      e.preventDefault();
      flow.shipId = shp.dataset.ship;
      U.qsa('.ship-opt', view).forEach(el => el.classList.toggle('active', el.dataset.ship === flow.shipId));
      U.qsa('input[name="shipM"]', view).forEach(el => { el.checked = el.value === flow.shipId; });
      U.qs('#coSummary', view).innerHTML = coSummaryHtml();
      syncSticky(view);
      UI.toast({ title: shipMethod().name + ' selected', desc: 'Arriving ' + etaDate(shipMethod().days) });
      return;
    }

    const q = e.target.closest('[data-q]');
    if (q) {
      const i = +q.dataset.idx;
      const cur = S.state.cart[i];
      if (!cur) return;
      const next = cur.qty + (+q.dataset.q);
      if (next <= 0) { S.removeFromCart(i); }
      else {
        const p = D.byId(cur.productId);
        if (p && next > p.stock) { UI.toast({ type: 'warn', title: 'Stock limit', desc: 'Only ' + p.stock + ' available' }); return; }
        S.updateQty(i, next);
      }
      if (!S.state.cart.length) { Router.go('/cart'); return; }
      U.qs('#coPane', view).innerHTML = paneHtml();
      U.qs('#coSummary', view).innerHTML = coSummaryHtml();
      syncSticky(view);
      return;
    }

    if (e.target.closest('[data-coupon-apply]')) {
      const input = U.qs('#couponInput', view);
      if (applyCoupon(input ? input.value : '')) {
        U.qs('#coSummary', view).innerHTML = coSummaryHtml();
        syncSticky(view);
      }
      return;
    }
    if (e.target.closest('[data-coupon-remove]')) {
      removeCoupon();
      U.qs('#coSummary', view).innerHTML = coSummaryHtml();
      syncSticky(view);
      return;
    }
  }

  function checkoutInput(e, view) {
    const f = e.target.closest('[data-field]');
    if (f) {
      flow.info[f.dataset.field] = f.value;
      if (VALIDATORS[f.dataset.field]) setErr(view, f.dataset.field, VALIDATORS[f.dataset.field](f.value));
      return;
    }
    const note = e.target.closest('[data-field-note]');
    if (note) { flow.note = note.value; return; }
    const c = e.target.closest('[data-card]');
    if (c) {
      const key = c.dataset.card;
      if (key === 'num') {
        const pos = c.selectionStart;
        const before = c.value;
        c.value = formatCard(c.value);
        flow.card.num = c.value;
        if (pos && c.value.length !== before.length) {
          const diff = c.value.length - before.length;
          try { c.setSelectionRange(pos + diff, pos + diff); } catch (err) { }
        }
        const b = cardBrand(c.value);
        const badge = U.qs('.pay-method.active .rd', view);
        if (badge) badge.innerHTML = cardBrandBadge(c.value);
        const cvc = U.qs('[data-card="cvc"]', view);
        if (cvc) { cvc.maxLength = b === 'amex' ? 4 : 3; cvc.placeholder = b === 'amex' ? '1234' : '123'; }
        if (flow.card.num) setCardErr(view, 'cnum', '');
      } else if (key === 'exp') {
        let v = c.value.replace(/\D/g, '').slice(0, 4);
        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
        c.value = v; flow.card.exp = v;
        if (v.length >= 5) setCardErr(view, 'cexp', '');
      } else {
        flow.card[key] = c.value.replace(/[^\d]/g, '');
        c.value = flow.card[key];
        if (key === 'cvc') setCardErr(view, 'ccvc', '');
        if (key === 'name') setCardErr(view, 'cname', '');
      }
      return;
    }
  }

  function checkoutChange(e, view) {
    const flag = e.target.closest('[data-flag]');
    if (flag) {
      flow[flag.dataset.flag] = flag.checked;
      if (flag.dataset.flag === 'gift') {
        U.qs('#coSummary', view).innerHTML = coSummaryHtml();
        syncSticky(view);
        UI.toast({ title: flag.checked ? 'Gift wrapping added' : 'Gift wrapping removed', desc: flag.checked ? S.money(GIFT_FEE) : '' });
      }
      return;
    }
    if (e.target.name === 'payM') {
      flow.pay = e.target.value;
      U.qsa('.pay-method', view).forEach(el => el.classList.toggle('active', el.dataset.pay === flow.pay));
      U.qs('#coPane', view).innerHTML = paneHtml();
      return;
    }
    if (e.target.name === 'shipM') {
      flow.shipId = e.target.value;
      U.qsa('.ship-opt', view).forEach(el => el.classList.toggle('active', el.dataset.ship === flow.shipId));
      U.qs('#coSummary', view).innerHTML = coSummaryHtml();
      syncSticky(view);
    }
  }

  async function goStep(n, view, btn) {
    if (n === flow.step) return;
    if (btn) busy(btn, true);
    flow.step = n;
    if (n > flow.maxStep) flow.maxStep = n;
    const pane = U.qs('#coPane', view);
    if (pane) pane.classList.add('co-out');
    await U.sleep(btn ? 300 : 240);
    U.qs('#coSteps', view).innerHTML = stepsHtml();
    const np = U.qs('#coPane', view);
    np.classList.remove('co-out');
    np.classList.add('co-in');
    np.innerHTML = paneHtml();
    U.qs('#coSummary', view).innerHTML = coSummaryHtml();
    syncSticky(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (btn) busy(btn, false);
  }

  function busy(btn, on) {
    if (!btn) return;
    if (on) {
      if (!btn._html) btn._html = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';
    } else {
      btn.disabled = false;
      if (btn._html) { btn.innerHTML = btn._html; btn._html = null; }
    }
  }

  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => UI.toast({ title: 'Order number copied', desc: text }));
        return;
      }
    } catch (err) { }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
      UI.toast({ title: 'Order number copied', desc: text });
    } catch (err) { UI.toast({ type: 'warn', title: 'Copy failed', desc: text }); }
  }

  /* ---------- Place order ---------- */
  async function doPlace(view, btn) {
    if (flow.placing) return;
    if (flow.pay === 'card') {
      const errs = cardErrors();
      const keys = Object.keys(errs);
      keys.forEach(k => setCardErr(view, k, errs[k]));
      if (keys.length) {
        UI.toast({ type: 'error', title: 'Check card details', desc: errs[keys[0]] });
        const bad = U.qs('.co-cardform .co-field.err .input', view);
        if (bad) bad.focus();
        return;
      }
    }
    flow.placing = true;
    busy(btn, true);
    await U.sleep(1400);

    const t = totals();
    const items = t.lines.map(l => ({
      productId: l.p.id, qty: l.it.qty, price: l.p.price,
      color: l.it.color || (l.p.colors[0] && l.p.colors[0].name) || null,
      size: l.it.size || null
    }));
    const info = flow.info;
    const addr = [info.address, info.city, info.state + ' ' + info.zip, info.country].filter(Boolean).join(', ');
    const method = shipMethod();
    const pay = PAY_METHODS.find(m => m.id === flow.pay) || PAY_METHODS[0];
    let payLabel = pay.label;
    if (flow.pay === 'card') {
      const b = cardBrand(flow.card.num);
      const last4 = flow.card.num.replace(/\D/g, '').slice(-4);
      payLabel = (BRAND_LABEL[b] || 'Card') + ' •••• ' + last4;
    } else if (flow.pay === 'paypal') payLabel = 'PayPal · ' + (info.email || '');
    else if (flow.pay === 'nova') payLabel = 'Nova Pay · 4 × ' + S.money(t.total / 4);

    const order = {
      id: 'NV-' + (10000 + Math.floor(Math.random() * 89999)),
      date: Date.now(),
      status: 'Processing',
      items: items,
      subtotal: t.subtotal,
      shipping: t.shipping,
      gift: t.gift,
      tax: t.tax,
      discount: t.discount,
      coupon: t.coupon ? t.coupon.code : null,
      total: t.total,
      address: addr,
      email: info.email,
      phone: info.phone,
      customer: info.name,
      note: flow.note,
      payMethod: flow.pay,
      payLabel: payLabel,
      shipLabel: method.name + ' · ' + method.window,
      eta: new Date(Date.now() + method.days * 86400000).getTime()
    };

    flow.order = order;
    flow.placing = false;
    busy(btn, false);

    const ids = items.map(i => i.productId);
    S.addPoints(Math.round(order.total), 'Order ' + order.id + ' · ' + ids.length + ' item' + (ids.length === 1 ? '' : 's'));
    S.pushNotif({
      type: 'order', icon: 'package',
      title: 'Order ' + order.id + ' confirmed',
      body: 'Arriving ' + U.formatDate(order.eta, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + S.money(order.total)
    });
    if (flow.saveAddress) {
      S.set({
        addresses: (S.state.addresses || []).concat([{
          id: U.uid('a'), label: 'Checkout address', name: info.name, line1: info.address,
          city: info.city, state: info.state, zip: info.zip, country: info.country, phone: info.phone, isDefault: false
        }])
      });
    }
    S.set({
      cart: [],
      coupon: null,
      purchases: Array.from(new Set(ids.concat(S.state.purchases || []))),
      orders: [order].concat(S.state.orders || [])
    });
    S.emit('cart');
    try { D.orders.unshift(order); } catch (err) { }

    flow.step = 5;
    flow.maxStep = 5;
    renderCheckout(view, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    UI.toast({ type: 'success', title: 'Order placed', desc: order.id + ' · ' + S.money(order.total) });
  }

  /* =========================================================
     PAGE 3 — ORDER CONFIRMATION (deep link)
     ========================================================= */
  function findOrder(id) {
    const want = String(id || '').toUpperCase();
    const mine = (S.state.orders || []).find(o => String(o.id).toUpperCase() === want);
    if (mine) return mine;
    const fromData = (D.orders || []).find(o => String(o.id).toUpperCase() === want);
    if (fromData) return fromData;
    if (flow.order && String(flow.order.id).toUpperCase() === want) return flow.order;
    return flow.order || (S.state.orders || [])[0] || (D.orders || [])[0] || null;
  }

  async function confirmRoute(ctx) {
    ensureStyles();
    const view = U.qs('#view');
    const id = (ctx.params && ctx.params.orderId) || (ctx.query && ctx.query.id) || '';
    view.innerHTML = '<div class="container section"><div class="skeleton sk-block" style="height:420px"></div></div>';
    await U.sleep(280);
    const order = findOrder(id);
    if (!order) {
      view.innerHTML = '<div class="container section"><div class="card" style="padding:8px">' + UI.empty({
        icon: 'package',
        title: 'No order found',
        text: 'We couldn’t find that order reference. Check your orders page for the full history.',
        actions: '<a class="btn btn-primary" href="#/account/orders">View my orders</a><a class="btn btn-secondary" href="#/shop">Continue shopping</a>'
      }) + '</div></div>';
      UI.observeReveals(view);
      return;
    }
    if (!order.email) order.email = (D.customer && D.customer.email) || flow.info.email || 'your inbox';
    view.innerHTML = '' +
      '<div class="page-head"><div class="container">' +
      '<div class="crumbs"><a href="#/">Home</a><span class="sep">/</span><a href="#/account/orders">Orders</a><span class="sep">/</span><span>' + U.h(order.id) + '</span></div>' +
      '<div class="row-between" style="align-items:flex-end;flex-wrap:wrap;gap:12px">' +
      '<div><h1>Order confirmed</h1><p class="muted mt-2">Placed ' + U.h(U.formatDate(order.date)) + ' · ' + U.h(order.status) + '</p></div>' +
      '<span class="status-pill status-processing">' + U.h(order.status) + '</span>' +
      '</div></div></div>' +
      '<div class="container" style="padding-bottom:96px"><div class="co-panel" style="max-width:920px;margin-inline:auto">' +
      confirmBody(order) + '</div></div>';
    view.addEventListener('click', (e) => {
      const cp = e.target.closest('[data-copy]');
      if (cp) copyText(cp.dataset.copy);
    });
    UI.observeReveals(view);
  }

  /* =========================================================
     Routes
     ========================================================= */
  NOVA.Router.register('/cart', cartRoute);
  NOVA.Router.register('/checkout', checkoutRoute);
  NOVA.Router.register('/checkout/confirm', confirmRoute);
  NOVA.Router.register('/checkout/confirm/:orderId', confirmRoute);
})();
