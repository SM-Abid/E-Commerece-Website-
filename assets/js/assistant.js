/* ============================================================
   NOVA — ShopAI assistant + floating compare bar
   Rule-based intent engine over the real catalogue.
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, I = NOVA.ICONS, UI = NOVA.UI, img = NOVA.img;

  const AI_CSS = [
    '.ai-fab{position:fixed;right:20px;bottom:20px;z-index:var(--z-drawer);display:inline-flex;align-items:center;gap:9px;height:52px;padding:0 20px 0 16px;border-radius:999px;border:1px solid var(--border);background:var(--glass-strong);backdrop-filter:blur(18px) saturate(180%);box-shadow:var(--shadow-xl);font-weight:600;font-size:14px;color:var(--text);transition:transform .22s var(--ease),box-shadow .22s var(--ease)}',
    '.ai-fab:hover{transform:translateY(-2px);box-shadow:0 24px 50px -18px rgba(0,0,0,.45)}',
    '.ai-fab:active{transform:translateY(0) scale(.98)}',
    '.ai-fab .glow{width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:var(--aurora);box-shadow:0 0 0 0 rgba(109,94,248,.5);animation:aiPulse 2.6s var(--ease) infinite}',
    '.ai-fab .glow svg{width:15px;height:15px}',
    '@keyframes aiPulse{0%{box-shadow:0 0 0 0 rgba(109,94,248,.45)}70%{box-shadow:0 0 0 12px rgba(109,94,248,0)}100%{box-shadow:0 0 0 0 rgba(109,94,248,0)}}',
    '.ai-fab.hidden{transform:translateY(140%);opacity:0;pointer-events:none}',
    '@media(max-width:720px){.ai-fab{right:14px;bottom:calc(var(--bottom-nav-h) + 12px);height:48px;padding:0 16px 0 13px;font-size:13px}}',
    '@media(max-width:420px){.ai-fab span.lbl{display:none}.ai-fab{width:48px;padding:0;justify-content:center}}',

    '.ai-panel{position:fixed;right:20px;bottom:20px;z-index:calc(var(--z-drawer) + 2);width:min(400px,calc(100vw - 28px));height:min(600px,calc(100dvh - 40px));display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-xl);overflow:hidden;transform:translateY(24px) scale(.97);opacity:0;pointer-events:none;transition:transform .3s var(--ease),opacity .22s var(--ease)}',
    '.ai-panel.open{transform:none;opacity:1;pointer-events:auto}',
    '.ai-head{display:flex;align-items:center;gap:12px;padding:14px 14px 12px;border-bottom:1px solid var(--border);background:var(--surface-2)}',
    '.ai-head .av{width:36px;height:36px;border-radius:11px;background:var(--aurora);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none}',
    '.ai-head .av svg{width:18px;height:18px}',
    '.ai-head .who{min-width:0;flex:1}',
    '.ai-head .who b{display:block;font-size:14px;line-height:1.2}',
    '.ai-head .who span{font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;gap:5px}',
    '.ai-head .who span i{width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block}',
    '.ai-body{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}',
    '.ai-msg{display:flex;gap:9px;max-width:100%;animation:fadeUp .3s var(--ease) both}',
    '.ai-msg.me{flex-direction:row-reverse}',
    '.ai-msg .bub{padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.55;background:var(--surface-2);border:1px solid var(--border);border-top-left-radius:5px;max-width:88%}',
    '.ai-msg.me .bub{background:var(--text);color:var(--bg);border-color:transparent;border-radius:16px;border-top-right-radius:5px;max-width:82%}',
    '.ai-msg .bub b{font-weight:700}',
    '.ai-msg .bub .sub{display:block;margin-top:6px;font-size:12.5px;color:var(--text-muted)}',
    '.ai-msg.me .bub .sub{color:rgba(255,255,255,.6)}',
    '.ai-cards{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px;scroll-snap-type:x mandatory}',
    '.ai-cards::-webkit-scrollbar{height:6px}',
    '.ai-cards .pcard{flex:0 0 168px;scroll-snap-align:start}',
    '.ai-cards .pcard .pcard-media{aspect-ratio:4/5}',
    '.ai-cards .pcard .pcard-name{font-size:13px}',
    '.ai-mini{display:flex;gap:10px;padding:9px;border:1px solid var(--border);border-radius:14px;background:var(--surface-2);align-items:center}',
    '.ai-mini img{width:44px;height:44px;border-radius:10px;object-fit:cover;flex:none}',
    '.ai-mini .m{flex:1;min-width:0}',
    '.ai-mini .m .n{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ai-mini .m .p{font-size:12px;color:var(--text-muted)}',
    '.ai-typing{display:inline-flex;gap:4px;padding:13px 15px}',
    '.ai-typing i{width:6px;height:6px;border-radius:50%;background:var(--text-soft);animation:aiDot 1.1s infinite}',
    '.ai-typing i:nth-child(2){animation-delay:.16s}.ai-typing i:nth-child(3){animation-delay:.32s}',
    '@keyframes aiDot{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-4px);opacity:1}}',
    '.ai-chips{display:flex;gap:7px;flex-wrap:wrap;padding:0 16px 12px}',
    '.ai-chips button{font-size:12px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-muted);transition:all .18s var(--ease)}',
    '.ai-chips button:hover{background:var(--accent-50);border-color:var(--accent-200);color:var(--accent-700)}',
    '[data-theme="dark"] .ai-chips button:hover{background:rgba(139,123,255,.14);border-color:rgba(139,123,255,.35);color:var(--accent-200)}',
    '.ai-compose{display:flex;gap:8px;align-items:center;padding:12px;border-top:1px solid var(--border);background:var(--surface-2)}',
    '.ai-compose input{flex:1;height:40px;border-radius:12px;border:1px solid var(--border);background:var(--surface);padding:0 14px;font-size:14px;outline:none;transition:border-color .18s var(--ease),box-shadow .18s var(--ease)}',
    '.ai-compose input:focus{border-color:var(--accent-400);box-shadow:0 0 0 3px var(--accent-50)}',
    '.ai-send{width:40px;height:40px;border-radius:12px;background:var(--accent-500);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none;transition:filter .18s var(--ease),transform .18s var(--ease)}',
    '.ai-send:hover{filter:brightness(1.06)}',
    '.ai-send:disabled{opacity:.45;cursor:not-allowed}',
    '.ai-send svg{width:18px;height:18px}',
    '@media(max-width:720px){.ai-panel{right:8px;left:8px;bottom:8px;width:auto;height:min(72dvh,620px)}}',

    /* Compare bar */
    '.cmp-bar{position:fixed;left:20px;bottom:20px;z-index:calc(var(--z-drawer) + 1);display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:16px;background:var(--glass-strong);backdrop-filter:blur(18px) saturate(180%);border:1px solid var(--border);box-shadow:var(--shadow-xl);max-width:min(460px,calc(100vw - 180px));transform:translateY(140%);opacity:0;transition:transform .3s var(--ease),opacity .22s var(--ease)}',
    '.cmp-bar.open{transform:none;opacity:1}',
    '.cmp-bar .thumbs{display:flex}',
    '.cmp-bar .thumbs img{width:38px;height:38px;border-radius:10px;object-fit:cover;border:2px solid var(--surface);margin-left:-10px;box-shadow:0 2px 8px rgba(0,0,0,.15)}',
    '.cmp-bar .thumbs img:first-child{margin-left:0}',
    '.cmp-bar .txt{flex:1;min-width:0}',
    '.cmp-bar .txt b{display:block;font-size:13px}',
    '.cmp-bar .txt span{font-size:11.5px;color:var(--text-muted)}',
    '.cmp-bar .btn{height:34px;padding:0 14px;font-size:13px}',
    '@media(max-width:720px){.cmp-bar{left:8px;right:8px;bottom:calc(var(--bottom-nav-h) + 8px);max-width:none}}'
  ].join('\n');

  function injectCSS() {
    if (U.qs('#nova-ai-css')) return;
    const st = document.createElement('style');
    st.id = 'nova-ai-css';
    st.textContent = AI_CSS;
    document.head.appendChild(st);
  }

  /* ============================================================
     Intent parsing
     ============================================================ */
  const SYN = [
    { key: 'laptop', cat: 'electronics', sub: 'laptop', words: ['laptop', 'notebook', 'macbook', 'ultrabook', 'chromebook'] },
    { key: 'phone', cat: 'electronics', sub: 'phone', words: ['phone', 'iphone', 'smartphone', 'android', 'mobile'] },
    { key: 'camera', cat: 'electronics', sub: 'camera', words: ['camera', 'vlog', 'photography', 'mirrorless', 'dslr'] },
    { key: 'tv', cat: 'electronics', sub: 'appliance', words: ['tv', 'television', 'oled', 'monitor', 'display', 'screen'] },
    { key: 'audio', cat: 'audio', words: ['headphone', 'headset', 'earbud', 'earphone', 'speaker', 'audio', 'sound', 'anc', 'podcast', 'music'] },
    { key: 'watch', cat: 'watches', words: ['watch', 'smartwatch', 'timepiece', 'chronograph'] },
    { key: 'shoe', cat: 'shoes', words: ['shoe', 'sneaker', 'trainer', 'runner', 'running', 'boot', 'heel', 'loafer', 'flat'] },
    { key: 'bag', cat: 'bags', words: ['bag', 'backpack', 'tote', 'duffle', 'wallet', 'luggage', 'purse'] },
    { key: 'beauty', cat: 'beauty', words: ['perfume', 'fragrance', 'cologne', 'skincare', 'serum', 'makeup', 'beauty', 'lipstick', 'moisturiser', 'moisturizer'] },
    { key: 'home', cat: 'home', words: ['sofa', 'couch', 'lamp', 'chair', 'table', 'duvet', 'bedding', 'decor', 'furniture', 'home', 'vase', 'shelf', 'shelving', 'kitchen'] },
    { key: 'fashion', cat: 'fashion', words: ['shirt', 'jacket', 'hoodie', 'dress', 'jeans', 'fashion', 'clothing', 'apparel', 'sweater', 'coat', 'tee'] },
    { key: 'gaming', cat: 'gaming', words: ['gaming', 'gamer', 'console', 'controller', 'keyboard', 'mouse', 'gpu', 'esports', 'mechanical'] },
    { key: 'sports', cat: 'sports', words: ['sport', 'fitness', 'yoga', 'training', 'tennis', 'basketball', 'gym', 'workout', 'cycling'] },
    { key: 'accessories', cat: 'accessories', words: ['accessory', 'accessories', 'sunglass', 'sunglasses', 'belt', 'cap', 'hat', 'scarf'] }
  ];

  function num(s) { return parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0; }

  function parse(q) {
    const s = ' ' + String(q).toLowerCase().replace(/[^a-z0-9$,\s-]/g, ' ') + ' ';
    const out = { raw: q, min: 0, max: 0, cat: null, sub: null, brand: null, attrs: [], gift: null, sort: null, compare: false, tokens: [] };

    let m;
    if ((m = s.match(/\$\s*([\d,]+)\s*(?:-|–|to|through)\s*\$?\s*([\d,]+)/))) { out.min = num(m[1]); out.max = num(m[2]); }
    if ((m = s.match(/(?:under|below|beneath|less than|cheaper than|max(?:imum)?|up ?to|within|budget of|budget)\s*(?:usd)?\s*\$?\s*([\d,]+)/))) { out.max = out.max || num(m[1]); }
    if ((m = s.match(/(?:over|above|more than|at least|starting (?:at|from)|from)\s*\$?\s*([\d,]+)/))) { out.min = out.min || num(m[1]); }
    if (!out.max && (m = s.match(/\$\s*([\d,]{2,6})\b/))) { out.max = num(m[1]); }

    /* brand */
    (D.brands || []).forEach(b => {
      if (new RegExp('\\b' + b.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '\\b').test(s.replace(/[^a-z0-9\s]/g, ''))) out.brand = b.name;
    });

    /* category / sub */
    let best = null, bestScore = 0;
    SYN.forEach(g => {
      let sc = 0;
      g.words.forEach(w => { if (s.indexOf(' ' + w) >= 0 || s.indexOf(w + ' ') >= 0) sc += w.length; });
      if (sc > bestScore) { bestScore = sc; best = g; }
    });
    if (best) { out.cat = best.cat; out.sub = best.sub || null; out.key = best.key; }

    /* attributes ("best battery life", "waterproof", "lightweight") */
    const ATTR = ['battery', 'battery life', 'noise cancellation', 'waterproof', 'water resistance', 'lightweight', 'portable',
      'comfort', 'durable', 'fast charging', 'wireless', 'storage', 'memory', 'display', 'brightness', 'camera',
      'sound quality', 'bass', 'cushioning', 'breathable', 'cheap', 'affordable', 'premium', 'quiet'];
    ATTR.forEach(a => { if (s.indexOf(a) >= 0) out.attrs.push(a); });

    /* gift */
    const GIFT = {
      girlfriend: 'her', wife: 'her', mom: 'her', mother: 'her', sister: 'her', daughter: 'her', her: 'her',
      boyfriend: 'him', husband: 'him', dad: 'him', father: 'him', brother: 'him', son: 'him', him: 'him'
    };
    Object.keys(GIFT).forEach(k => { if (new RegExp('\\b' + k + '\\b').test(s)) out.gift = GIFT[k]; });
    if (!out.gift && /\b(gift|present|birthday|anniversary|christmas|valentine)\b/.test(s)) out.gift = 'any';

    if (/\b(compare|versus|vs\.?|difference between|which is better)\b/.test(s)) out.compare = true;
    if (/\b(cheapest|most affordable|budget pick|lowest price)\b/.test(s)) out.sort = 'price-asc';
    else if (/\b(best rated|highest rated|top rated|best reviewed|highest review)\b/.test(s)) out.sort = 'rating';
    else if (/\b(newest|latest|just released|new arrival)\b/.test(s)) out.sort = 'new';
    else if (/\b(most popular|best selling|bestseller|trending)\b/.test(s)) out.sort = 'popular';

    out.tokens = s.trim().split(/\s+/).filter(w => w.length > 2);
    return out;
  }

  function scoreProduct(p, it) {
    let sc = 0;
    if (it.cat && p.cat === it.cat) sc += 6;
    if (it.sub && (p.sub === it.sub || p.cat === it.sub)) sc += 4;
    if (it.brand && p.brand === it.brand) sc += 8;
    if (it.max && p.price > it.max) return -1;
    if (it.min && p.price < it.min) return -1;
    if (it.max && p.price <= it.max) sc += 2;
    const hay = (p.name + ' ' + p.brand + ' ' + p.catName + ' ' + (p.tags || []).join(' ') + ' ' + p.desc).toLowerCase();
    it.tokens.forEach(t => { if (hay.indexOf(t) >= 0 && !STOP[t]) sc += 2; });
    it.attrs.forEach(a => {
      const blob = (JSON.stringify(p.specs || {}) + ' ' + (p.features || []).map(f => f.t + ' ' + f.d).join(' ') + ' ' + p.desc).toLowerCase();
      if (blob.indexOf(a) >= 0) sc += 3;
    });
    if (p.stock <= 0) sc -= 5;
    return sc;
  }
  const STOP = { the: 1, and: 1, for: 1, with: 1, that: 1, this: 1, best: 1, good: 1, want: 1, need: 1, buy: 1, show: 1, me: 1, find: 1, get: 1, under: 1, cheapest: 1, please: 1, some: 1, any: 1, can: 1, you: 1, are: 1, what: 1, should: 1, gift: 1 };

  function rank(list, it) {
    let out = list.map(p => ({ p, s: scoreProduct(p, it) })).filter(x => x.s > 0);
    if (!out.length) out = list.map(p => ({ p, s: 0.1 }));
    out.sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s;
      return (b.p.rating * Math.log(b.p.reviews + 10)) - (a.p.rating * Math.log(a.p.reviews + 10));
    });
    let arr = out.map(x => x.p);
    if (it.sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (it.sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (it.sort === 'rating') arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (it.sort === 'new') arr.sort((a, b) => a.ageDays - b.ageDays);
    else if (it.sort === 'popular') arr.sort((a, b) => b.sold - a.sold);
    else if (it.attrs.length) {
      arr.sort((a, b) => (b.rating * 10 + b.reviews / 500) - (a.rating * 10 + a.reviews / 500));
    }
    return arr;
  }

  const GIFT_CATS = { her: ['beauty', 'bags', 'watches', 'fashion', 'accessories'], him: ['watches', 'audio', 'gaming', 'accessories', 'bags'], any: ['beauty', 'watches', 'audio', 'bags', 'home'] };

  /* ============================================================
     Reply builders
     ============================================================ */
  function findByName(q) {
    const s = q.toLowerCase();
    return D.products.map(p => {
      const words = (p.name + ' ' + p.brand).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
      const hit = words.filter(w => s.indexOf(w) >= 0 && !STOP[w]).length;
      return { p, hit };
    }).filter(x => x.hit >= 2).sort((a, b) => b.hit - a.hit).map(x => x.p);
  }

  function label(it) {
    if (it.key === 'laptop') return 'laptops';
    if (it.brand && it.key) return it.brand + ' ' + it.key + ' picks';
    if (it.brand) return it.brand + ' products';
    if (it.key) return it.key + ' picks';
    return 'matches';
  }

  function answer(q) {
    const it = parse(q);
    const money = (v) => S.money(v);

    /* ---- Compare ---- */
    if (it.compare) {
      let picked = findByName(q).slice(0, 2);
      if (picked.length < 2 && S.state.compare.length >= 2) picked = S.state.compare.slice(0, 2).map(id => D.byId(id)).filter(Boolean);
      if (picked.length < 2) {
        const pool = it.cat ? D.products.filter(p => p.cat === it.cat) : D.products;
        picked = rank(pool, it).slice(0, 2);
      }
      if (picked.length >= 2) return compareReply(picked, it);
    }

    /* ---- Gift ---- */
    if (it.gift) {
      const cats = GIFT_CATS[it.gift] || GIFT_CATS.any;
      let pool = D.products.filter(p => cats.indexOf(p.cat) >= 0);
      if (it.max) pool = pool.filter(p => p.price <= it.max);
      else pool = pool.filter(p => p.price >= 45 && p.price <= 520);
      const picks = rank(pool, { tokens: [], attrs: [], cat: null, sub: null, brand: null }).slice(0, 6);
      const who = it.gift === 'her' ? 'her' : it.gift === 'him' ? 'him' : 'them';
      return {
        text: 'Here are six gifts I\'d shortlist for <b>' + who + '</b>' + (it.max ? ' under <b>' + money(it.max) + '</b>' : ' in the sweet spot under $520') + ' — all highly rated and in stock.',
        products: picks,
        chips: ['Under $100', 'Something more luxurious', 'Gift for him', 'Gift for her']
      };
    }

    /* ---- Greeting / help ---- */
    if (!it.tokens.length || /\b(hi|hello|hey|help|what can you do)\b/.test(' ' + q.toLowerCase() + ' ')) {
      return {
        text: 'I\'m <b>ShopAI</b>. Tell me what you\'re after — a budget, a category, a brand or a use case — and I\'ll narrow ' + D.products.length + ' products down to the few worth your money.',
        chips: ['Find me a gaming laptop under $1,500', 'Best wireless headphones for battery life', 'Gift for my girlfriend under $200', 'Compare iPhone 17 Pro and Galaxy S25']
      };
    }

    let pool = D.products.slice();
    if (it.cat) {
      const inCat = pool.filter(p => p.cat === it.cat || (it.sub && p.sub === it.sub));
      if (inCat.length) pool = inCat;
    }
    if (it.brand) {
      const inB = pool.filter(p => p.brand === it.brand);
      if (inB.length) pool = inB;
    }

    const results = rank(pool, it).slice(0, 6);
    if (!results.length) {
      return {
        text: 'Nothing matched <b>\"' + U.h(q) + '\"</b> exactly. Here are the closest things people buy instead — or tell me a budget and I\'ll refine it.',
        products: D.products.filter(p => p.rating >= 4.6).slice(0, 4),
        chips: ['Under $100', 'Best rated of all time', 'New arrivals']
      };
    }

    const bits = [];
    const lbl = label(it);
    if (it.brand) bits.push('<b>' + U.h(it.brand) + '</b>');
    if (it.key && lbl.indexOf(it.key) < 0) bits.push('<b>' + U.h(it.key) + '</b>');
    if (it.max) bits.push('under <b>' + money(it.max) + '</b>');
    if (it.min) bits.push('above <b>' + money(it.min) + '</b>');
    if (it.attrs.length) bits.push('strong on <b>' + U.h(it.attrs[0]) + '</b>');

    const top = results[0];
    const why = it.attrs.length
      ? 'I ranked these by how well they deliver on ' + U.h(it.attrs[0]) + ', then by real customer rating.'
      : 'I ranked these by rating, review volume' + (it.max ? ' and how close they sit to your budget' : '') + '.';

    return {
      text: 'Here are ' + results.length + ' ' + label(it) + (bits.length ? ' ' + bits.join(', ') : '') + '. ' + why +
        (top ? '<span class="sub">Best overall: <b>' + U.h(top.name) + '</b> — ' + money(top.price) + ', ' + top.rating.toFixed(1) + '★ from ' + top.reviews.toLocaleString() + ' reviews.</span>' : ''),
      products: results,
      chips: [
        it.max ? 'Under ' + money(Math.round(it.max / 2)) : 'Cheapest option',
        'Similar but higher rated',
        'Show me accessories for it',
        'What\'s new this week'
      ]
    };
  }

  function compareReply(pair, it) {
    const [a, b] = pair;
    const rows = [
      ['Price', () => S.money(a.price) + (a.was ? ' <s style="opacity:.5">' + S.money(a.was) + '</s>' : ''),
        () => S.money(b.price) + (b.was ? ' <s style="opacity:.5">' + S.money(b.was) + '</s>' : '')],
      ['Rating', () => a.rating.toFixed(1) + '★ (' + a.reviews.toLocaleString() + ')', () => b.rating.toFixed(1) + '★ (' + b.reviews.toLocaleString() + ')'],
      ['Brand', () => a.brand, () => b.brand],
      ['Category', () => a.catName, () => b.catName]
    ];
    const keys = [];
    [a.specs, b.specs].forEach(sp => Object.keys(sp || {}).forEach(k => { if (keys.indexOf(k) < 0) keys.push(k); }));
    keys.slice(0, 4).forEach(k => rows.push([k, () => (a.specs || {})[k] || '—', () => (b.specs || {})[k] || '—']));
    rows.push(['Warranty', () => a.warranty || '—', () => b.warranty || '—']);
    rows.push(['Availability', () => a.stock > 0 ? 'In stock — ' + a.stock + ' left' : 'Out of stock', () => b.stock > 0 ? 'In stock — ' + b.stock + ' left' : 'Out of stock']);

    const cheap = a.price < b.price ? a : b;
    const rated = a.rating >= b.rating ? a : b;

    const html =
      '<div class="ai-mini" style="margin-top:10px">' +
      '<img src="' + img(a.imgs[0], 120, 120) + '" alt=""><div class="m"><div class="n">' + U.h(a.name) + '</div><div class="p">' + S.money(a.price) + ' · ' + a.rating.toFixed(1) + '★</div></div>' +
      '<button class="btn btn-primary btn-sm" data-add="' + a.id + '">Add</button></div>' +
      '<div class="ai-mini">' +
      '<img src="' + img(b.imgs[0], 120, 120) + '" alt=""><div class="m"><div class="n">' + U.h(b.name) + '</div><div class="p">' + S.money(b.price) + ' · ' + b.rating.toFixed(1) + '★</div></div>' +
      '<button class="btn btn-primary btn-sm" data-add="' + b.id + '">Add</button></div>' +
      '<div style="overflow-x:auto;margin-top:10px;border:1px solid var(--border);border-radius:14px">' +
      '<table class="table" style="min-width:340px;font-size:12.5px;margin:0">' +
      '<thead><tr><th></th><th>' + U.h(a.brand) + '</th><th>' + U.h(b.brand) + '</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td style="color:var(--text-muted)">' + U.h(r[0]) + '</td><td>' + r[1]() + '</td><td>' + r[2]() + '</td></tr>').join('') +
      '</tbody></table></div>' +
      '<div class="sub" style="display:block;margin-top:10px;font-size:12.5px;color:var(--text-muted)">' +
      '<b>' + U.h(cheap.name) + '</b> is ' + S.money(Math.abs(a.price - b.price)) + ' cheaper; <b>' + U.h(rated.name) + '</b> is rated higher. Both ship free over $50.</div>';

    return {
      text: 'Quick comparison of <b>' + U.h(a.name) + '</b> and <b>' + U.h(b.name) + ':</b>' + html,
      chips: ['Which is better value?', 'Cheaper alternative', 'Add both to cart']
    };
  }

  /* ============================================================
     Widget
     ============================================================ */
  const QUICK = [
    'Find me a gaming laptop under $1,500',
    'Show me wireless headphones with the best battery life',
    'What should I buy for my girlfriend?',
    'Compare iPhone 17 Pro Max and Galaxy S25 Ultra'
  ];

  const ShopAI = {
    el: null, body: null, open: false, busy: false, greeted: false,
    build() {
      injectCSS();
      const fab = document.createElement('button');
      fab.className = 'ai-fab';
      fab.id = 'aiFab';
      fab.setAttribute('aria-label', 'Ask ShopAI');
      fab.innerHTML = '<span class="glow">' + I.icon('spark') + '</span><span class="lbl">Ask ShopAI</span>';
      document.body.appendChild(fab);

      const panel = document.createElement('section');
      panel.className = 'ai-panel';
      panel.id = 'aiPanel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'ShopAI assistant');
      panel.innerHTML =
        '<header class="ai-head">' +
        '<span class="av">' + I.icon('spark') + '</span>' +
        '<span class="who"><b>ShopAI</b><span><i></i>Online · knows all ' + D.products.length + ' products</span></span>' +
        '<button class="iconbtn" data-ai-close aria-label="Close">' + I.icon('close') + '</button>' +
        '</header>' +
        '<div class="ai-body" id="aiBody"></div>' +
        '<div class="ai-chips" id="aiChips"></div>' +
        '<form class="ai-compose" id="aiForm">' +
        '<input id="aiInput" placeholder="Ask about anything…" autocomplete="off" aria-label="Message ShopAI">' +
        '<button class="ai-send" type="submit" aria-label="Send">' + I.icon('arrowRight') + '</button>' +
        '</form>';
      document.body.appendChild(panel);
      this.el = panel; this.body = U.qs('#aiBody');

      fab.addEventListener('click', () => this.toggle());
      panel.addEventListener('click', (e) => {
        if (e.target.closest('[data-ai-close]')) { this.toggle(false); return; }
        const chip = e.target.closest('[data-ai-chip]');
        if (chip) { this.send(chip.dataset.aiChip); }
      });
      U.qs('#aiForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = U.qs('#aiInput').value.trim();
        if (!v) return;
        U.qs('#aiInput').value = '';
        this.send(v);
      });
      this.greet();
    },

    greet() {
      this.push('me', 'Hi — I need help choosing.');
      this.push('ai', 'Hey! I\'m <b>ShopAI</b>, your shopping assistant. Describe what you need in plain language — budget, brand, who it\'s for — and I\'ll pull the best options from the catalogue. You can add anything straight to your cart from here.');
      this.chips(QUICK);
      this.greeted = true;
    },

    toggle(force) {
      const on = force == null ? !this.open : force;
      this.open = on;
      this.el.classList.toggle('open', on);
      U.qs('#aiFab').classList.toggle('hidden', on);
      if (on) setTimeout(() => { const i = U.qs('#aiInput'); i && i.focus(); }, 260);
      else UI.hideBackdrop && UI.hideBackdrop();
    },

    push(who, html) {
      const d = document.createElement('div');
      d.className = 'ai-msg ' + (who === 'me' ? 'me' : '');
      d.innerHTML = '<div class="bub">' + html + '</div>';
      this.body.appendChild(d);
      this.body.scrollTop = this.body.scrollHeight;
      return d;
    },

    cards(list) {
      const d = document.createElement('div');
      d.className = 'ai-msg';
      d.innerHTML = '<div class="bub" style="padding:8px;border-radius:16px;width:100%;max-width:100%"><div class="ai-cards">' +
        list.map(p => UI.productCard(p)).join('') + '</div></div>';
      this.body.appendChild(d);
      this.body.scrollTop = this.body.scrollHeight;
      UI.observeReveals(d);
      return d;
    },

    thinking() {
      const d = document.createElement('div');
      d.className = 'ai-msg';
      d.innerHTML = '<div class="bub ai-typing" style="background:var(--surface-2)"><i></i><i></i><i></i></div>';
      this.body.appendChild(d);
      this.body.scrollTop = this.body.scrollHeight;
      return d;
    },

    chips(list) {
      const c = U.qs('#aiChips');
      c.innerHTML = list.map(t => '<button data-ai-chip="' + U.h(t) + '">' + U.h(t) + '</button>').join('');
    },

    async send(q) {
      if (this.busy) return;
      this.busy = true;
      U.qs('#aiChips').innerHTML = '';
      this.push('me', U.h(q));
      const t = this.thinking();
      const delay = 420 + Math.min(700, q.length * 12);
      await U.sleep(delay);
      t.remove();
      let res;
      try { res = answer(q); } catch (e) { res = { text: 'Sorry — I couldn\'t process that. Try naming a category and a budget, e.g. <b>“running shoes under $150”</b>.' }; }
      this.push('ai', res.text || '');
      if (res.products && res.products.length) this.cards(res.products);
      this.chips(res.chips || QUICK.slice(0, 3));
      this.busy = false;
    }
  };

  /* ============================================================
     Floating compare bar
     ============================================================ */
  function compareBar() {
    let bar = U.qs('#cmpBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'cmp-bar';
      bar.id = 'cmpBar';
      document.body.appendChild(bar);
      bar.addEventListener('click', (e) => {
        if (e.target.closest('[data-cmp-go]')) { NOVA.Router.go('/compare'); return; }
        if (e.target.closest('[data-cmp-clear]')) { S.set({ compare: [] }); syncCompare(); UI.toast({ title: 'Compare cleared' }); return; }
      });
    }
    return bar;
  }
  function syncCompare() {
    const bar = compareBar();
    const ids = S.state.compare || [];
    const ps = ids.map(i => D.byId(i)).filter(Boolean);
    if (ps.length < 2) { bar.classList.remove('open'); return; }
    bar.innerHTML =
      '<div class="thumbs">' + ps.map(p => '<img src="' + img(p.imgs[0], 120, 120) + '" alt="">').join('') + '</div>' +
      '<div class="txt"><b>' + ps.length + ' products selected</b><span>Tap to compare side by side</span></div>' +
      '<button class="btn btn-primary" data-cmp-go>Compare</button>' +
      '<button class="iconbtn" data-cmp-clear aria-label="Clear">' + I.icon('close') + '</button>';
    bar.classList.add('open');
  }
  NOVA.syncCompare = syncCompare;

  /* ============================================================
     Boot
     ============================================================ */
  function init() {
    ShopAI.build();
    S.on('compare', syncCompare);
    syncCompare();
    /* Keep the assistant out of the merchant back-office */
    const syncAdmin = () => {
      const isAdmin = NOVA.Router.path.indexOf('/admin') === 0;
      const fab = U.qs('#aiFab'), panel = U.qs('#aiPanel');
      if (!fab) return;
      fab.style.display = isAdmin ? 'none' : '';
      if (isAdmin && panel.classList.contains('open')) ShopAI.toggle(false);
    };
    window.addEventListener('hashchange', syncAdmin);
    syncAdmin();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  NOVA.ShopAI = ShopAI;
})();
