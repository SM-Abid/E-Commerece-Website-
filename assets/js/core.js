/* ============================================================
   NOVA — Core: utilities, state store, router, i18n, currency
   ============================================================ */
window.NOVA = window.NOVA || {};

/* ---------------- Utilities ---------------- */
const U = {
  qs: (s, r) => (r || document).querySelector(s),
  qsa: (s, r) => Array.from((r || document).querySelectorAll(s)),
  h(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  uid: (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9),
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  debounce(fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 220); }; },
  throttle(fn, ms) {
    let last = 0, timer;
    return function () {
      const now = Date.now(), a = arguments, c = this;
      if (now - last >= ms) { last = now; fn.apply(c, a); }
      else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn.apply(c, a); }, ms - (now - last)); }
    };
  },
  rnd: (seed) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); },
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),
  slug: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  formatDate(d, opts) {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString(undefined, opts || { year: 'numeric', month: 'short', day: 'numeric' });
  },
  timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return U.formatDate(d);
  },
  grav(i) {
    return 'https://images.unsplash.com/photo-' + i + '?auto=format&fit=crop&q=';
  },
  store: {
    get(k, d) { try { const v = localStorage.getItem('nova.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('nova.' + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem('nova.' + k); } catch (e) { } }
  }
};
NOVA.U = U;

/* ---------------- Currency ---------------- */
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  CNY: { symbol: '¥', rate: 7.24, name: 'Chinese Yuan' },
  JPY: { symbol: '¥', rate: 157, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', rate: 1.53, name: 'Australian Dollar' }
};
NOVA.CURRENCIES = CURRENCIES;

/* ---------------- i18n ---------------- */
const LANG = {
  en: {
    shop: 'Shop', categories: 'Categories', newArrivals: 'New Arrivals', deals: 'Deals', brands: 'Brands',
    about: 'About', home: 'Home', search: 'Search', wishlist: 'Wishlist', account: 'Account', cart: 'Cart',
    addToCart: 'Add to Cart', buyNow: 'Buy Now', quickView: 'Quick View', saveLater: 'Save for later',
    remove: 'Remove', moveToCart: 'Move to Cart', checkout: 'Checkout', continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal', shipping: 'Shipping', tax: 'Tax', discount: 'Discount', total: 'Total', free: 'FREE',
    new: 'New', bestSeller: 'Best Seller', limited: 'Limited', sale: 'Sale', outOfStock: 'Out of stock',
    onlyLeft: 'Only {n} left', reviews: 'reviews', rating: 'Rating', price: 'Price', brand: 'Brand',
    color: 'Color', size: 'Size', quantity: 'Quantity', inStock: 'In stock', addToWishlist: 'Add to wishlist',
    description: 'Description', specifications: 'Specifications', features: 'Features',
    whatsIncluded: "What's Included", shippingInfo: 'Shipping Information', returns: 'Returns',
    customerReviews: 'Customer Reviews', qa: 'Questions & Answers', related: 'Related Products',
    frequentlyBought: 'Frequently Bought Together', recentlyViewed: 'Recently Viewed',
    filter: 'Filter', sort: 'Sort', clearAll: 'Clear all', results: 'results',
    recommended: 'Recommended', popular: 'Most Popular', newest: 'Newest', priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low', topRated: 'Highest Rated', bigDiscount: 'Biggest Discount',
    overview: 'Overview', orders: 'Orders', addresses: 'Addresses', paymentMethods: 'Payment Methods',
    settings: 'Settings', rewards: 'Rewards', notifications: 'Notifications', compare: 'Compare',
    trackOrder: 'Track Order', viewDetails: 'View Details', writeReview: 'Write a Review',
    askShopAI: 'Ask ShopAI', notifyMe: 'Notify Me When Available', loading: 'Loading'
  },
  zh: {
    shop: '商城', categories: '分类', newArrivals: '新品', deals: '优惠', brands: '品牌',
    about: '关于', home: '首页', search: '搜索', wishlist: '收藏', account: '账户', cart: '购物车',
    addToCart: '加入购物车', buyNow: '立即购买', quickView: '快速查看', saveLater: '稍后再买',
    remove: '移除', moveToCart: '移入购物车', checkout: '去结算', continueShopping: '继续购物',
    subtotal: '小计', shipping: '运费', tax: '税费', discount: '折扣', total: '总计', free: '免运费',
    new: '新品', bestSeller: '热卖', limited: '限量', sale: '特价', outOfStock: '缺货',
    onlyLeft: '仅剩 {n} 件', reviews: '条评价', rating: '评分', price: '价格', brand: '品牌',
    color: '颜色', size: '尺码', quantity: '数量', inStock: '有货', addToWishlist: '加入收藏',
    description: '商品描述', specifications: '规格参数', features: '产品特点',
    whatsIncluded: '包装清单', shippingInfo: '配送信息', returns: '退换货',
    customerReviews: '用户评价', qa: '问答', related: '相关商品',
    frequentlyBought: '搭配推荐', recentlyViewed: '最近浏览',
    filter: '筛选', sort: '排序', clearAll: '清空', results: '个结果',
    recommended: '推荐', popular: '最热门', newest: '最新', priceLowHigh: '价格从低到高',
    priceHighLow: '价格从高到低', topRated: '评分最高', bigDiscount: '折扣最大',
    overview: '概览', orders: '订单', addresses: '地址', paymentMethods: '支付方式',
    settings: '设置', rewards: '积分', notifications: '通知', compare: '对比',
    trackOrder: '追踪订单', viewDetails: '查看详情', writeReview: '写评价',
    askShopAI: '问问 ShopAI', notifyMe: '到货提醒', loading: '加载中'
  },
  es: {
    shop: 'Tienda', categories: 'Categorías', newArrivals: 'Novedades', deals: 'Ofertas', brands: 'Marcas',
    about: 'Nosotros', home: 'Inicio', search: 'Buscar', wishlist: 'Favoritos', account: 'Cuenta', cart: 'Carrito',
    addToCart: 'Añadir al carrito', buyNow: 'Comprar ahora', quickView: 'Vista rápida', saveLater: 'Guardar',
    remove: 'Eliminar', moveToCart: 'Mover al carrito', checkout: 'Finalizar compra', continueShopping: 'Seguir comprando',
    subtotal: 'Subtotal', shipping: 'Envío', tax: 'Impuestos', discount: 'Descuento', total: 'Total', free: 'GRATIS',
    new: 'Nuevo', bestSeller: 'Más vendido', limited: 'Limitado', sale: 'Oferta', outOfStock: 'Agotado',
    onlyLeft: 'Solo quedan {n}', reviews: 'reseñas', rating: 'Valoración', price: 'Precio', brand: 'Marca',
    color: 'Color', size: 'Talla', quantity: 'Cantidad', inStock: 'En stock', addToWishlist: 'Añadir a favoritos',
    description: 'Descripción', specifications: 'Especificaciones', features: 'Características',
    whatsIncluded: 'Qué incluye', shippingInfo: 'Envío', returns: 'Devoluciones',
    customerReviews: 'Opiniones', qa: 'Preguntas', related: 'Relacionados',
    frequentlyBought: 'Comprados juntos', recentlyViewed: 'Vistos recientemente',
    filter: 'Filtrar', sort: 'Ordenar', clearAll: 'Limpiar', results: 'resultados',
    recommended: 'Recomendado', popular: 'Popular', newest: 'Más nuevo', priceLowHigh: 'Precio: menor a mayor',
    priceHighLow: 'Precio: mayor a menor', topRated: 'Mejor valorados', bigDiscount: 'Mayor descuento',
    overview: 'Resumen', orders: 'Pedidos', addresses: 'Direcciones', paymentMethods: 'Pagos',
    settings: 'Ajustes', rewards: 'Recompensas', notifications: 'Notificaciones', compare: 'Comparar',
    trackOrder: 'Seguir pedido', viewDetails: 'Ver detalle', writeReview: 'Escribir opinión',
    askShopAI: 'Pregunta a ShopAI', notifyMe: 'Avísame cuando haya stock', loading: 'Cargando'
  }
};
NOVA.LANG = LANG;

/* ---------------- Store ---------------- */
const Store = (function () {
  const listeners = {};
  const defaultState = {
    cart: [],                 // {id, productId, qty, color, size}
    savedLater: [],
    wishlist: [],             // product ids
    compare: [],              // product ids
    recentlyViewed: [],       // product ids
    notifications: [],        // generated
    orders: [],               // generated + new
    addresses: [],
    payments: [],
    priceAlerts: [],          // product ids
    stockAlerts: [],          // product ids
    searchHistory: [],
    points: 2450,
    tier: 'Gold',
    theme: null,              // null = system
    currency: 'USD',
    lang: 'en',
    user: null,               // {name, email, avatar}
    coupon: null,
    viewedCategories: [],
    purchases: [],            // product ids previously purchased
    dailyCheckin: null,
    newsletter: false
  };
  let state = Object.assign({}, defaultState);
  try {
    const saved = U.store.get('state', null);
    if (saved && typeof saved === 'object') state = Object.assign({}, defaultState, saved);
  } catch (e) { }

  function persist() {
    const { theme, currency, lang, ...rest } = state;
    U.store.set('state', rest);
  }
  function on(topic, fn) { (listeners[topic] = listeners[topic] || []).push(fn); return () => off(topic, fn); }
  function off(topic, fn) { listeners[topic] = (listeners[topic] || []).filter(f => f !== fn); }
  function emit(topic, payload) {
    (listeners[topic] || []).forEach(f => { try { f(payload); } catch (e) { console.error(e); } });
    (listeners['*'] || []).forEach(f => { try { f(topic, payload); } catch (e) { } });
  }
  function set(patch, topic) {
    state = Object.assign({}, state, patch);
    persist();
    emit(topic || 'change', state);
  }

  /* --- Money --- */
  function convert(usd) {
    const c = CURRENCIES[state.currency] || CURRENCIES.USD;
    return usd * c.rate;
  }
  function money(usd, opts) {
    const c = CURRENCIES[state.currency] || CURRENCIES.USD;
    let v = convert(usd);
    const decimals = (opts && opts.decimals != null) ? opts.decimals : (state.currency === 'JPY' ? 0 : 2);
    let s = v.toFixed(decimals);
    if (decimals === 2) s = s.replace(/\.00$/, '');
    return c.symbol + Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function t(key) {
    const dict = LANG[state.lang] || LANG.en;
    return dict[key] || LANG.en[key] || key;
  }
  function tf(key, vars) {
    let s = t(key);
    if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  /* --- Cart --- */
  function cartKey(item) { return [item.productId, item.color || '', item.size || ''].join('|'); }
  function addToCart(productId, qty, opts) {
    qty = qty || 1; opts = opts || {};
    const existing = state.cart.find(i => cartKey(i) === cartKey({ productId, color: opts.color, size: opts.size }));
    if (existing) existing.qty += qty;
    else state.cart.push({ productId, qty, color: opts.color || null, size: opts.size || null });
    emit('cart', state.cart); set({}, 'cart');
    return true;
  }
  function updateQty(index, qty) {
    if (!state.cart[index]) return;
    if (qty <= 0) return removeFromCart(index);
    state.cart[index].qty = qty;
    emit('cart', state.cart); set({}, 'cart');
  }
  function removeFromCart(index) {
    state.cart.splice(index, 1);
    emit('cart', state.cart); set({}, 'cart');
  }
  function cartCount() { return state.cart.reduce((n, i) => n + i.qty, 0); }

  /* --- Wishlist --- */
  function toggleWishlist(id) {
    const i = state.wishlist.indexOf(id);
    if (i >= 0) state.wishlist.splice(i, 1); else state.wishlist.push(id);
    emit('wishlist', state.wishlist); set({}, 'wishlist');
    return i < 0;
  }
  function inWishlist(id) { return state.wishlist.indexOf(id) >= 0; }

  /* --- Compare --- */
  function toggleCompare(id) {
    const i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 4) { state.compare.shift(); } state.compare.push(id); }
    emit('compare', state.compare); set({}, 'compare');
    return i < 0;
  }
  function inCompare(id) { return state.compare.indexOf(id) >= 0; }

  /* --- Recently viewed --- */
  function markViewed(id) {
    state.recentlyViewed = [id].concat(state.recentlyViewed.filter(x => x !== id)).slice(0, 12);
    set({}, 'recently');
  }

  /* --- Theme --- */
  function setTheme(th, silent) {
    state.theme = th;
    U.store.set('theme', th);
    if (th === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else if (th === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    if (!silent) { persist(); emit('theme', th); }
  }
  function theme() { return state.theme; }
  function effectiveTheme() {
    if (state.theme) return state.theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme(silent) { setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark', silent); }

  /* --- Notifications --- */
  function pushNotif(n) {
    state.notifications.unshift(Object.assign({
      id: U.uid('n'), read: false, at: Date.now()
    }, n));
    state.notifications = state.notifications.slice(0, 40);
    emit('notif', state.notifications); set({}, 'notif');
  }
  function unreadCount() { return state.notifications.filter(n => !n.read).length; }
  function markNotifRead(id) {
    const n = state.notifications.find(x => x.id === id);
    if (n) { n.read = true; emit('notif', state.notifications); set({}, 'notif'); }
  }
  function markAllRead() {
    state.notifications.forEach(n => n.read = true);
    emit('notif', state.notifications); set({}, 'notif');
  }

  /* --- Points --- */
  function addPoints(n, reason) {
    state.points += n;
    pushNotif({ type: 'promo', title: '+' + n + ' points', body: reason || 'Reward earned', icon: 'award' });
    emit('points', state.points); set({}, 'points');
  }

  return {
    get state() { return state; },
    on, off, emit, set, persist,
    money, convert, t, tf,
    addToCart, updateQty, removeFromCart, cartCount,
    toggleWishlist, inWishlist,
    toggleCompare, inCompare,
    markViewed,
    setTheme, theme, effectiveTheme, toggleTheme,
    pushNotif, unreadCount, markNotifRead, markAllRead,
    addPoints,
    DEFAULT_TIER: 'Gold'
  };
})();
NOVA.Store = Store;

/* ---------------- Router ---------------- */
const Router = (function () {
  const routes = [];
  let current = null;
  let notFoundHandler = null;

  function register(pattern, handler) { routes.push({ pattern, handler }); }
  function compile(pattern) {
    const keys = [];
    const rx = pattern.replace(/:[A-Za-z0-9_]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; });
    return { rx: new RegExp('^' + rx + '$'), keys };
  }
  function parseHash() {
    let h = location.hash.replace(/^#/, '');
    if (!h) h = '/';
    const qi = h.indexOf('?');
    let query = {}, path = h;
    if (qi >= 0) {
      path = h.slice(0, qi);
      new URLSearchParams(h.slice(qi + 1)).forEach((v, k) => query[k] = v);
    }
    return { path: path || '/', query };
  }
  function match(path) {
    for (const r of routes) {
      const c = r._c || (r._c = compile(r.pattern));
      const m = c.rx.exec(path);
      if (m) {
        const params = {};
        c.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
        return { handler: r.handler, params };
      }
    }
    return null;
  }
  async function resolve() {
    const { path, query } = parseHash();
    const found = match(path);
    const ctx = { path, query, params: found ? found.params : {} };
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
    NOVA.emitRoute && NOVA.emitRoute(ctx);
    const handler = found ? found.handler : notFoundHandler;
    if (!handler) return;
    current = ctx;
    await handler(ctx);
  }
  function go(path, replace) {
    if (replace) location.replace('#' + path);
    else location.hash = path;
  }
  function start() {
    window.addEventListener('hashchange', resolve);
    if (!location.hash) location.replace('#/');
    resolve();
  }
  return {
    register, start, go, resolve, notFound(h) { notFoundHandler = h; },
    get current() { return current; },
    get path() { return parseHash().path; }
  };
})();
NOVA.Router = Router;
