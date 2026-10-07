/* ============================================================
   NOVA — Admin Dashboard (merchant back-office)
   Classic script. No bundler, no modules, no external libs.
   Routes: #/admin  #/admin/products  #/admin/orders
           #/admin/customers  #/admin/analytics
           #/admin/promotions  #/admin/content
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  'use strict';

  const U = NOVA.U, S = NOVA.Store, D = NOVA.Data, UI = NOVA.UI, img = NOVA.img;
  const I = NOVA.ICONS || window.ICONS;   /* icons.js exposes window.ICONS */
  const h = U.h;

  /* ============================================================
     0. Admin-only style layer (kept in JS so no other file changes)
     ============================================================ */
  const ADMIN_CSS = [
    '.admin-side a svg{width:18px;height:18px;flex:none}',
    '.admin-side .side-foot{border-top:1px solid var(--border);margin-top:8px;padding-top:8px}',
    '@media (max-width:980px){.admin-side{position:static;display:flex;align-items:center;gap:4px;overflow-x:auto;padding:8px}.admin-side .sec,.admin-side .side-foot{display:none}.admin-side a{white-space:nowrap}}',
    '.ad-grid{display:grid;gap:var(--s-5)}',
    '.ad-grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.ad-grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
    '.ad-grid.cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}',
    '.ad-grid.kpis{grid-template-columns:repeat(auto-fit,minmax(212px,1fr))}',
    '.ad-grid.span-2{grid-column:1/-1}',
    '@media (max-width:1100px){.ad-grid.cols-4{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (max-width:980px){.ad-grid.cols-2,.ad-grid.cols-3,.ad-grid.span-2{grid-template-columns:1fr;grid-column:auto}}',
    '@media (max-width:620px){.ad-grid.cols-4{grid-template-columns:1fr}}',
    '.ad-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}',
    '.ad-scroll .table{min-width:880px}',
    '.ad-scroll.sm .table{min-width:720px}',
    '.chart-wrap{position:relative}',
    '.chart-wrap svg{width:100%;height:auto;display:block;font-family:var(--font-sans)}',
    '.chart-tip{position:absolute;left:0;top:0;transform:translate(-50%,-125%);background:var(--text);color:var(--bg);padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s var(--ease);z-index:4;box-shadow:var(--shadow-md);display:flex;gap:8px;align-items:baseline}',
    '.chart-tip.on{opacity:1}',
    '.chart-tip .tl{font-weight:500;opacity:.68}',
    '.chart-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-muted);margin-bottom:12px}',
    '.chart-legend i{width:10px;height:10px;border-radius:3px;display:inline-block;margin-right:6px;vertical-align:middle}',
    '.ad-ax{fill:var(--text-soft);font-size:11px;font-variant-numeric:tabular-nums}',
    '.ad-lb{fill:var(--text-muted);font-size:11.5px;font-weight:500}',
    '.ad-vl{fill:var(--text);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}',
    '.ad-gline{stroke:var(--border);stroke-width:1}',
    '.ad-track{fill:var(--surface-3)}',
    '.ad-hit{fill:transparent;cursor:crosshair}',
    '.ad-hit:hover{fill:rgba(109,94,248,.05)}',
    '.ad-cross{stroke:var(--border-strong);stroke-width:1;stroke-dasharray:3 3;opacity:0;transition:opacity .12s}',
    '.ad-dot{fill:var(--surface);stroke-width:2.5;opacity:0;transition:opacity .12s}',
    '.ad-lp{stroke:var(--surface);stroke-width:2}',
    '.ad-sub{font-size:13px;color:var(--text-muted);margin-top:2px}',
    '.ad-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:var(--s-4)}',
    '.ad-search{width:300px;max-width:100%}',
    '.ad-num{font-variant-numeric:tabular-nums}',
    '.ad-thumb{width:44px;height:44px;border-radius:10px;object-fit:cover;background:var(--surface-2);flex:none}',
    '.ad-ava{width:36px;height:36px;border-radius:50%;object-fit:cover;background:var(--surface-2);flex:none}',
    '.ad-cell{display:flex;align-items:center;gap:10px;min-width:200px}',
    '.ad-cell .t{font-weight:500;line-height:1.3}',
    '.ad-cell .s{font-size:12px;color:var(--text-soft)}',
    '.ad-iconbtn{width:32px;height:32px;border-radius:10px;border:1px solid var(--border);background:var(--surface);display:inline-flex;align-items:center;justify-content:center;color:var(--text-muted);transition:background .18s,color .18s,border-color .18s}',
    '.ad-iconbtn:hover{background:var(--surface-2);color:var(--text)}',
    '.ad-iconbtn svg{width:16px;height:16px}',
    '.ad-iconbtn.danger:hover{color:var(--danger);border-color:var(--danger)}',
    '.pager{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
    '.pager button{min-width:34px;height:34px;padding:0 9px;border-radius:9px;font-size:13px;font-weight:600;color:var(--text-muted);border:1px solid var(--border);background:var(--surface);font-variant-numeric:tabular-nums}',
    '.pager button:hover{background:var(--surface-2);color:var(--text)}',
    '.pager button.active{background:var(--text);color:var(--bg);border-color:transparent}',
    '.pager button:disabled{opacity:.4;cursor:not-allowed}',
    '.switch{width:42px;height:24px;border-radius:999px;background:var(--surface-3);border:1px solid var(--border);position:relative;flex:none;transition:background .18s var(--ease)}',
    '.switch i{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:var(--shadow-xs);transition:left .18s var(--ease)}',
    '.switch.on{background:var(--success);border-color:transparent}',
    '.switch.on i{left:20px}',
    '.stk{width:84px;height:34px;padding:0 10px;text-align:center;font-variant-numeric:tabular-nums}',
    '.ord-input{width:64px;height:34px;padding:0 10px;text-align:center;font-variant-numeric:tabular-nums}',
    '.coupon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:var(--s-4)}',
    '.banner-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--s-4)}',
    '.chip-row{display:flex;gap:8px;flex-wrap:wrap}',
    '.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4)}',
    '.form-grid .span-2{grid-column:1/-1}',
    '@media (max-width:560px){.form-grid{grid-template-columns:1fr}}',
    '.pick-list{max-height:290px;overflow:auto;border:1px solid var(--border);border-radius:var(--r-3);padding:6px}',
    '.pick-list label{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;font-size:14px;cursor:pointer}',
    '.pick-list label:hover{background:var(--surface-2)}',
    '.pick-list img{width:32px;height:32px;border-radius:8px;object-fit:cover;flex:none}',
    '.pick-list .pn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ad-mono{font-family:var(--font-mono)}',
    '.ad-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}',
    '.ad-row:last-child{border-bottom:0}',
    '.flash-card{border:1px solid var(--border);border-radius:var(--r-4);padding:14px;display:flex;gap:12px;align-items:center;background:var(--surface);flex-wrap:wrap}',
    '.flash-card .thumb{width:56px;height:56px;border-radius:12px;object-fit:cover;flex:none}',
    '.ann-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--r-3);background:var(--surface)}',
    '.ann-row .ic{width:32px;height:32px;border-radius:9px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;flex:none;color:var(--accent-500)}',
    '.ann-row .ic svg{width:17px;height:17px}',
    '.kpi .l{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.kpi .ic{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--surface-2);color:var(--accent-500);flex:none}',
    '.kpi .ic svg{width:16px;height:16px}',
    '.kpi .d{font-size:12px;margin-top:8px;display:flex;align-items:center;gap:6px;color:var(--text-soft)}',
    '.kpi .spark{height:40px;margin-top:10px}',
    '.ad-empty-pad{padding:22px 0}',
    '.banner-prev{aspect-ratio:16/9;border-radius:var(--r-3);overflow:hidden;background:var(--surface-2);position:relative}',
    '.banner-prev img{width:100%;height:100%;object-fit:cover}',
    '.banner-prev .ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.55))}',
    '.banner-prev .cap{position:absolute;left:14px;right:14px;bottom:12px;color:#fff}',
    '.cd{display:flex;gap:6px;align-items:center}',
    '.cd .u{min-width:52px;text-align:center;background:var(--surface-2);border:1px solid var(--border);border-radius:9px;padding:5px 4px}',
    '.cd .u .n{font-size:17px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.1}',
    '.cd .u .l{font-size:9px;color:var(--text-soft);text-transform:uppercase;letter-spacing:.1em}',
    '.cd .sep{font-weight:800;color:var(--text-soft)}',
    '.ad-pos{color:#0E9F6E;font-weight:600}',
    '.ad-neg{color:var(--danger);font-weight:600}'
  ].join('\n');

  function injectCSS() {
    if (U.qs('#nova-admin-css')) return;
    const st = document.createElement('style');
    st.id = 'nova-admin-css';
    st.textContent = ADMIN_CSS;
    document.head.appendChild(st);
  }

  /* ============================================================
     1. Numbers, helpers
     ============================================================ */
  const PALETTE = ['#6D5EF8', '#5DA9FF', '#4FE3C0', '#F59E0B', '#FF6F9C', '#10B981', '#8B7BFF', '#3B82F6'];
  let GID = 0;
  const r2 = (v) => Math.round(v * 100) / 100;
  const money = (v) => S.money(v);
  const bigMoney = (v) => (Math.abs(v) >= 10000 ? '$' + n2(v) : S.money(v));
  const n2 = (v) => Math.round(v).toLocaleString('en-US');

  function compact(v) {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(Math.round(v));
  }
  function fmtV(v, kind) {
    if (v == null || isNaN(v)) return '—';
    if (kind === 'money') return '$' + compact(v);
    if (kind === 'pct') return (Math.round(v * 100) / 100) + '%';
    if (kind === 'usd') return money(v);
    return n2(v);
  }
  function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
  function pctDelta(cur, prev) { return prev ? ((cur - prev) / prev) * 100 : 0; }

  function deltaHtml(pct, goodWhenDown, suffix) {
    const good = goodWhenDown ? pct < 0 : pct > 0;
    const cls = good ? 'ad-pos' : 'ad-neg';
    const arrow = pct > 0 ? '↑' : '↓';
    const v = Math.abs(pct);
    const txt = (suffix === 'pt' ? v.toFixed(2) + 'pt' : v.toFixed(1) + '%');
    return '<span class="' + cls + ' ad-num">' + arrow + ' ' + txt + '</span>';
  }

  /* ============================================================
     2. Deterministic time series (no Math.random)
     ============================================================ */
  const DAYS = 180;
  function series(seed, n, base, amp, trend) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = U.rnd(seed * 1.7 + i * 2.31) - 0.5;
      const b = U.rnd(seed * 5.13 + i * 0.77) - 0.5;
      const w = Math.sin((i / n) * Math.PI * 6 + seed) * 0.28;
      const wk = (i % 7 === 5 || i % 7 === 6) ? 1.16 : (i % 7 === 0 ? 0.93 : 1);
      const v = (base * (1 + trend * (i / n)) + a * amp + b * amp * 0.35 + w * amp) * wk;
      out.push(Math.max(base * 0.15, v));
    }
    return out;
  }

  const REV_RAW = series(11.3, DAYS, 8800, 2100, 0.42);
  const REV_SCALE = 284912 / sum(REV_RAW.slice(-30));
  const REV = REV_RAW.map(v => v * REV_SCALE);
  const ORD = series(29.7, DAYS, 33, 7, 0.34).map(v => Math.round(v));
  const SESS = series(53.1, DAYS, 1100, 210, 0.26).map(v => Math.round(v));
  const NEWC = series(71.9, DAYS, 22, 6, 0.36).map(v => Math.round(v));
  const RETC = series(97.3, DAYS, 30, 7, 0.22).map(v => Math.round(v));
  const REFD = series(131.7, DAYS, 1.32, 0.55, -0.08).map(v => U.clamp(v, 0.35, 2.9));
  const CONV = ORD.map((o, i) => Math.round((o / SESS[i]) * 10000) / 100);

  const DAY0 = (function () { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  function dayAt(i) { return new Date(DAY0.getTime() - (DAYS - 1 - i) * 86400000); }
  const LABELS = REV.map((_, i) => U.formatDate(dayAt(i), { month: 'short', day: 'numeric' }));

  function daysOf(range) { return range === '7d' ? 7 : range === '90d' ? 90 : 30; }
  function agg(range) {
    const n = daysOf(range);
    const curRev = REV.slice(-n), prvRev = REV.slice(-2 * n, -n);
    const curOrd = ORD.slice(-n), prvOrd = ORD.slice(-2 * n, -n);
    const curSess = SESS.slice(-n), prvSess = SESS.slice(-2 * n, -n);
    const curNew = NEWC.slice(-n), prvNew = NEWC.slice(-2 * n, -n);
    const curRef = REFD.slice(-n), prvRef = REFD.slice(-2 * n, -n);
    const rev = sum(curRev), ord = sum(curOrd), sess = sum(curSess);
    const conv = (ord / sess) * 100;
    const aov = rev / ord;
    const ref = sum(curRef) / curRef.length;
    const pRev = sum(prvRev), pOrd = sum(prvOrd), pSess = sum(prvSess);
    return {
      n: n, rev: rev, ord: ord, sess: sess, customers: sum(curNew), conv: conv, aov: aov, refund: ref,
      dRev: pctDelta(rev, pRev),
      dOrd: pctDelta(ord, pOrd),
      dCust: pctDelta(sum(curNew), sum(prvNew)),
      dConv: conv - ((pOrd / pSess) * 100),
      dAov: pctDelta(aov, pRev / pOrd),
      dRef: ref - (sum(prvRef) / prvRef.length)
    };
  }

  /* ============================================================
     3. Hand-written SVG charts
     ============================================================ */
  function smooth(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return 'M' + pts[0][0] + ',' + pts[0][1];
    let d = 'M' + r2(pts[0][0]) + ',' + r2(pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], mx = (a[0] + b[0]) / 2;
      d += ' C' + r2(mx) + ',' + r2(a[1]) + ' ' + r2(mx) + ',' + r2(b[1]) + ' ' + r2(b[0]) + ',' + r2(b[1]);
    }
    return d;
  }

  function tipAttrs(label, value) {
    return ' data-hit="1" data-l="' + h(label) + '" data-v="' + h(value) + '"';
  }

  /* --- area / line chart --- */
  function areaChart(o) {
    const ss = o.series.filter(s => s && s.values && s.values.length);
    if (!ss.length) return '';
    const n = ss[0].values.length;
    const labels = o.labels || [];
    const W = 760, H = o.h || 260;
    const pl = 56, pr = 16, pt = 16, pb = 30;
    const iw = W - pl - pr, ih = H - pt - pb;
    let mx = -Infinity, mn = Infinity;
    ss.forEach(s => { if (s.max == null) s.values.forEach(v => { if (v > mx) mx = v; if (v < mn) mn = v; }); });
    if (o.max != null) mx = o.max;
    const bot = o.min != null ? o.min : Math.max(0, mn - (mx - mn) * 0.45);
    const top = mx + (mx - bot) * 0.10 || 1;
    const X = (i) => pl + (n < 2 ? iw / 2 : (iw * i) / (n - 1));
    const Y = (v, s) => {
      const t = (s && s.max != null) ? s.max * 1.06 : top;
      const b = (s && s.min != null) ? s.min : bot;
      return pt + ih - ((v - b) / ((t - b) || 1)) * ih;
    };
    const baseY = pt + ih;
    let defs = '', paths = '', grid = '';

    const rowsN = 4;
    for (let k = 0; k <= rowsN; k++) {
      const v = bot + (top - bot) * (k / rowsN);
      const y = Y(v, null);
      grid += '<line class="ad-gline" x1="' + pl + '" y1="' + r2(y) + '" x2="' + (W - pr) + '" y2="' + r2(y) + '"/>' +
        '<text class="ad-ax" x="' + (pl - 9) + '" y="' + r2(y + 3.6) + '" text-anchor="end">' + h(fmtV(v, o.fmt)) + '</text>';
    }

    ss.forEach((s) => {
      const pts = s.values.map((v, i) => [X(i), Y(v, s)]);
      const d = smooth(pts);
      const gid = 'ag' + (++GID);
      defs += '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + s.color + '" stop-opacity="' + (s.op != null ? s.op : 0.30) + '"/>' +
        '<stop offset="100%" stop-color="' + s.color + '" stop-opacity="0"/></linearGradient>';
      if (s.fill !== false) {
        paths += '<path d="' + d + ' L' + r2(X(n - 1)) + ',' + baseY + ' L' + r2(X(0)) + ',' + baseY + ' Z" fill="url(#' + gid + ')"/>';
      }
      paths += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round"' + (s.dash ? ' stroke-dasharray="5 4"' : '') + '/>';
      paths += '<circle class="ad-lp" cx="' + r2(X(n - 1)) + '" cy="' + r2(Y(s.values[n - 1], s)) + '" r="3.6" fill="' + s.color + '"/>';
    });

    let xl = '';
    const step = Math.max(1, Math.ceil(n / (o.xticks || 7)));
    for (let i = 0; i < n; i += step) {
      xl += '<text class="ad-ax" x="' + r2(X(i)) + '" y="' + (H - 9) + '" text-anchor="middle">' + h(labels[i] || '') + '</text>';
    }

    let hits = '';
    const bw = n < 2 ? iw : iw / (n - 1);
    for (let i = 0; i < n; i++) {
      const cx = X(i);
      const x0 = Math.max(pl, cx - bw / 2);
      const w = Math.max(1, Math.min(bw, pl + iw - x0));
      const val = ss.map(s => (s.name ? s.name + ' ' : '') + fmtV(s.values[i], s.fmt || o.fmt || 'usd')).join('   ');
      hits += '<rect class="ad-hit"' + tipAttrs(labels[i] || ('Day ' + (i + 1)), val) +
        ' data-cx="' + r2(cx) + '" data-cy="' + r2(Y(ss[0].values[i], ss[0])) + '" x="' + r2(x0) + '" y="' + pt + '" width="' + r2(w) + '" height="' + ih + '"/>';
    }

    return '<div class="chart-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">' +
      '<defs>' + defs + '</defs>' + grid + paths +
      '<line class="ad-cross" x1="0" y1="' + pt + '" x2="0" y2="' + baseY + '"/>' +
      '<circle class="ad-dot" cx="0" cy="0" r="4.5" stroke="' + ss[0].color + '"/>' +
      xl + hits + '</svg><div class="chart-tip"><span class="tl"></span><b></b></div></div>';
  }

  /* --- vertical bar chart --- */
  function barChart(o) {
    const vals = o.values, labels = o.labels || [];
    const n = vals.length;
    if (!n) return '';
    const W = 760, H = o.h || 240;
    const pl = 56, pr = 16, pt = 16, pb = 30;
    const iw = W - pl - pr, ih = H - pt - pb;
    const mx = Math.max.apply(null, vals);
    const top = mx * 1.12 || 1;
    const Y = (v) => pt + ih - (v / top) * ih;
    const step = iw / n;
    const bw = Math.min(30, step * 0.62);
    let grid = '', bars = '', hits = '', xl = '';
    for (let k = 0; k <= 4; k++) {
      const v = (top * k) / 4, y = Y(v);
      grid += '<line class="ad-gline" x1="' + pl + '" y1="' + r2(y) + '" x2="' + (W - pr) + '" y2="' + r2(y) + '"/>' +
        '<text class="ad-ax" x="' + (pl - 9) + '" y="' + r2(y + 3.6) + '" text-anchor="end">' + h(fmtV(v, o.fmt)) + '</text>';
    }
    for (let i = 0; i < n; i++) {
      const cx = pl + step * i + step / 2;
      const y = Y(vals[i]);
      const hh = Math.max(2, pt + ih - y);
      bars += '<rect x="' + r2(cx - bw / 2) + '" y="' + r2(y) + '" width="' + r2(bw) + '" height="' + r2(hh) + '" rx="' + r2(Math.min(7, bw / 2)) + '" fill="' + (o.color || PALETTE[0]) + '" opacity="' + (0.72 + 0.28 * (vals[i] / (mx || 1))) + '"/>';
      hits += '<rect class="ad-hit"' + tipAttrs(labels[i] || '', fmtV(vals[i], o.fmt || 'usd')) + ' data-cx="' + r2(cx) + '" data-cy="' + r2(y) + '" x="' + r2(pl + step * i) + '" y="' + pt + '" width="' + r2(step) + '" height="' + ih + '"/>';
    }
    const tstep = Math.max(1, Math.ceil(n / (o.xticks || 8)));
    for (let i = 0; i < n; i += tstep) {
      xl += '<text class="ad-ax" x="' + r2(pl + step * i + step / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + h(labels[i] || '') + '</text>';
    }
    return '<div class="chart-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">' +
      grid + bars + '<line class="ad-cross" x1="0" y1="' + pt + '" x2="0" y2="' + (pt + ih) + '"/>' +
      '<circle class="ad-dot" cx="0" cy="0" r="4.5" stroke="' + (o.color || PALETTE[0]) + '"/>' +
      xl + hits + '</svg><div class="chart-tip"><span class="tl"></span><b></b></div></div>';
  }

  /* --- horizontal bar rows --- */
  function hbarChart(o) {
    const rows = o.rows || [];
    if (!rows.length) return '';
    const rh = o.rh || 34, W = 420;
    const H = rows.length * rh + 10;
    const mx = o.max || Math.max.apply(null, rows.map(r => r.value));
    const x0 = 104, bw = 168, valEnd = 330;
    let out = '';
    rows.forEach((r, i) => {
      const y = i * rh + 7;
      const w = Math.max(4, (r.value / (mx || 1)) * bw);
      out += '<text class="ad-lb" x="0" y="' + (y + 15) + '">' + h(r.label) + '</text>' +
        '<rect class="ad-track" x="' + x0 + '" y="' + y + '" width="' + bw + '" height="15" rx="7.5"/>' +
        '<rect x="' + x0 + '" y="' + y + '" width="' + r2(w) + '" height="15" rx="7.5" fill="' + r.color + '"/>' +
        '<text class="ad-vl" x="' + valEnd + '" y="' + (y + 15) + '" text-anchor="end">' + h(r.display) + '</text>' +
        (r.sub ? '<text class="ad-ax" x="' + W + '" y="' + (y + 15) + '" text-anchor="end">' + h(r.sub) + '</text>' : '');
    });
    return '<div class="chart-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">' + out + '</svg></div>';
  }

  /* --- donut --- */
  function donutChart(o) {
    const segs = o.segments || [];
    const total = sum(segs.map(s => s.value)) || 1;
    const size = 176, r = 62, sw = 23, c = 2 * Math.PI * r, cx = size / 2;
    let acc = 0, out = '';
    segs.forEach((s) => {
      const len = (s.value / total) * c;
      const shown = Math.max(0, len - 2.5);
      out += '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="' + sw +
        '" stroke-dasharray="' + r2(shown) + ' ' + r2(c - shown) + '" stroke-dashoffset="' + r2(-acc) +
        '" transform="rotate(-90 ' + cx + ' ' + cx + ')"' + tipAttrs(s.label, fmtV(s.value, o.fmt || 'usd') + ' · ' + Math.round((s.value / total) * 100) + '%') + ' data-cx="' + cx + '" data-cy="' + cx + '" style="cursor:pointer"><title>' + h(s.label) + '</title></circle>';
      acc += len;
    });
    return '<div class="chart-wrap"><svg viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMidYMid meet" role="img" style="max-width:190px;margin:0 auto">' +
      out +
      '<text x="' + cx + '" y="' + (cx - 1) + '" text-anchor="middle" style="font-size:21px;font-weight:800;fill:var(--text);font-family:var(--font-sans)">' + h(o.center || fmtV(total, o.fmt)) + '</text>' +
      '<text class="ad-ax" x="' + cx + '" y="' + (cx + 17) + '" text-anchor="middle">' + h(o.centerLabel || 'Total') + '</text>' +
      '</svg><div class="chart-tip"><span class="tl"></span><b></b></div></div>';
  }

  function donutBlock(o) {
    const total = sum(o.segments.map(s => s.value)) || 1;
    const legend = '<div class="col" style="gap:10px">' + o.segments.map(s =>
      '<div class="row" style="justify-content:space-between;gap:10px;font-size:13px">' +
      '<span class="row" style="gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:' + s.color + ';display:inline-block"></i>' + h(s.label) + '</span>' +
      '<span class="ad-num muted">' + h(fmtV(s.value, o.fmt)) + ' · ' + Math.round((s.value / total) * 100) + '%</span></div>').join('') + '</div>';
    return '<div class="row" style="gap:22px;align-items:center;flex-wrap:wrap">' +
      '<div style="flex:0 0 190px;max-width:100%">' + donutChart(o) + '</div>' +
      '<div style="flex:1;min-width:200px">' + legend + '</div></div>';
  }

  /* --- sparkline --- */
  function sparkline(values, color) {
    const n = values.length;
    if (n < 2) return '';
    const W = 200, H = 44, pad = 5;
    const mx = Math.max.apply(null, values), mn = Math.min.apply(null, values);
    const X = (i) => pad + (W - pad * 2) * (i / (n - 1));
    const Y = (v) => H - pad - ((v - mn) / ((mx - mn) || 1)) * (H - pad * 2);
    const pts = values.map((v, i) => [X(i), Y(v)]);
    const gid = 'sp' + (++GID);
    const d = smooth(pts);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:40px;display:block">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".32"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + r2(X(n - 1)) + ',' + H + ' L' + r2(X(0)) + ',' + H + ' Z" fill="url(#' + gid + ')"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }

  function legendHtml(items) {
    return '<div class="chart-legend">' + items.map(i => '<span><i style="background:' + i.color + '"></i>' + h(i.name) + '</span>').join('') + '</div>';
  }

  /* ============================================================
     4. Admin datasets (deterministic)
     ============================================================ */
  const FIRST = ['Amara', 'Daniel', 'Priya', 'Marcus', 'Elena', 'Tomás', 'Hannah', 'Yuki', 'Noor', 'Jonas', 'Sofia', 'Liam', 'Chloe', 'Ravi', 'Isla', 'Mateo', 'Freya', 'Omar', 'Nina', 'Theo', 'Aisha', 'Kai', 'Lena', 'Diego', 'Maya', 'Andre', 'Talia', 'Victor', 'Rosa', 'Felix', 'Ines', 'Bruno'];
  const LAST = ['Okafor', 'Keller', 'Sharma', 'Lindqvist', 'Vasquez', 'Reyes', 'Brooks', 'Tanaka', 'Ali', 'Weber', 'Moreau', 'Doyle', 'Fisher', 'Patel', 'Costa', 'Navarro', 'Holm', 'Haddad', 'Berg', 'Serrano', 'Diallo', 'Nakamura', 'Kowalski', 'Mendoza', 'Rossi', 'Olsen', 'Bauer', 'Silva', 'Ferrari', 'Larsen', 'Novak', 'Abadi'];
  const REGIONS = ['Portland, US', 'San Francisco, US', 'Austin, US', 'New York, US', 'Toronto, CA', 'London, UK', 'Berlin, DE', 'Lisbon, PT', 'Tokyo, JP', 'Sydney, AU', 'Amsterdam, NL', 'Oslo, NO', 'Milan, IT', 'Seoul, KR', 'Dublin, IE', 'Madrid, ES'];
  const AVATARS = ['1524594152303-aabd1fc54bc9', '1494790108377-be9c29b29330', '1500648767791-00dcc994a43e', '1507003211169-0a1dd7228f2d', '1534528741775-53994a69daeb', '1517841905240-472988babdf9', '1519345182560-3f2917c472ef', '1508214751196-bcfd4ca60f91', '1531427186611-ecfd6d936c79', '1547425260-76bcadfb4f2c', '1521119989659-a83eee488004', '1487412720507-e7ab37603c6f', '1492562080023-ab3db95bfbce', '1502378735452-bc7d866ef05b', '1573497019940-1c28c88b4f3e', '1527980965255-d3b416303d12'];
  const TIERS = [
    { name: 'Bronze', bg: 'rgba(180,101,74,.14)', fg: '#8C4B32' },
    { name: 'Silver', bg: 'rgba(139,148,163,.16)', fg: '#5B616E' },
    { name: 'Gold', bg: 'rgba(245,158,11,.16)', fg: '#B45309' },
    { name: 'Platinum', bg: 'rgba(109,94,248,.14)', fg: '#5945E6' }
  ];
  function tierOf(spend) { return spend > 4200 ? TIERS[3] : spend > 1500 ? TIERS[2] : spend > 480 ? TIERS[1] : TIERS[0]; }
  function tierBadge(t) {
    return '<span class="badge" style="background:' + t.bg + ';color:' + t.fg + ';border-color:transparent">' + h(t.name) + '</span>';
  }

  function mkCustomers(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const r1 = U.rnd(i * 3.71 + 1.13), r2 = U.rnd(i * 9.17 + 4.31), r3 = U.rnd(i * 5.53 + 2.97), r4 = U.rnd(i * 7.79 + 6.11), r5 = U.rnd(i * 2.11 + 8.3);
      const fn = FIRST[Math.floor(r1 * FIRST.length)], ln = LAST[Math.floor(r2 * LAST.length)];
      const orders = 1 + Math.floor(Math.pow(r3, 5) * 16);
      const spend = Math.round((45 + r4 * 620) * orders * 0.55 + orders * 46);
      const joined = Date.now() - Math.max(1, Math.floor(Math.pow(U.rnd(i * 3.11 + 0.71), 2.3) * 920)) * 86400000;
      const tags = [];
      if (spend > 3000) tags.push('VIP');
      if (r5 > 0.72) tags.push('Newsletter');
      if (orders > 14) tags.push('Repeat buyer');
      if (r1 > 0.86) tags.push('At risk');
      if (Date.now() - joined < 45 * 86400000) tags.push('New');
      out.push({
        id: 'c' + (1001 + i),
        name: fn + ' ' + ln,
        email: U.slug(fn + '.' + ln) + '@example.com',
        avatar: AVATARS[i % AVATARS.length],
        region: REGIONS[Math.floor(r5 * REGIONS.length)],
        orders: orders,
        spend: spend,
        joined: joined,
        tier: tierOf(spend),
        tags: tags.length ? tags : ['Shopper'],
        phone: '+1 (' + (200 + Math.floor(r3 * 700)) + ') 555-0' + (100 + (i % 899))
      });
    }
    return out;
  }
  const CUSTOMERS = mkCustomers(240);
  const TOTAL_CUSTOMERS = 9612;   /* store-wide account count */

  const SHIP_STATES = ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];
  const PAY_STATES = ['Paid', 'Pending', 'Refunded', 'Failed'];

  function mkOrders() {
    const out = [];
    (D.orders || []).forEach((o, i) => {
      const c = CUSTOMERS[Math.floor(U.rnd(i * 6.3 + 2.1) * CUSTOMERS.length)];
      const items = (o.items || []).map(it => {
        const p = D.byId(it.productId);
        return { productId: it.productId, name: p ? p.name : 'Product', img: p ? p.imgs[0] : AVATARS[0], price: it.price, qty: it.qty };
      });
      if (!items.length) return;
      out.push(mkOrderObj('NV-' + (10240 + i * 17), o.date || Date.now(), c, items, o.status || 'Delivered', o.address || '221B Alder Street, Portland, OR 97204', o.shipping, o.tax, o.discount));
    });
    for (let i = 0; i < 48; i++) {
      const c = CUSTOMERS[Math.floor(U.rnd(i * 4.73 + 3.11) * CUSTOMERS.length)];
      const ageDays = Math.floor(U.rnd(i * 2.31 + 1.77) * 78);
      const at = Date.now() - ageDays * 86400000 - Math.floor(U.rnd(i * 1.9) * 86400000);
      const items = [];
      const cnt = 1 + Math.floor(U.rnd(i * 8.11) * 3);
      for (let j = 0; j < cnt; j++) {
        const p = D.products[Math.floor(U.rnd(i * 13.7 + j * 5.31) * D.products.length)];
        if (!p || items.some(x => x.productId === p.id)) continue;
        items.push({ productId: p.id, name: p.name, img: p.imgs[0], price: p.price, qty: 1 + Math.floor(U.rnd(i + j * 3.9) * 2) });
      }
      if (!items.length) continue;
      const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
      const discount = U.rnd(i * 3.31) > 0.66 ? Math.round(sub * 0.1 * 100) / 100 : 0;
      const shipping = sub - discount > 75 ? 0 : 9.95;
      const status = ageDays > 12 ? (U.rnd(i * 9.13) > 0.09 ? 'Delivered' : 'Cancelled')
        : ageDays > 7 ? (U.rnd(i * 1.7) > 0.45 ? 'Out for delivery' : 'Shipped')
          : ageDays > 3 ? 'Shipped' : 'Processing';
      out.push(mkOrderObj('NV-' + (20000 + i * 37), at, c, items, status, c.region.replace(', ', ', ') + ' — ' + (100 + i) + ' ' + ['Alder St', 'Fremont Blvd', 'Harbour Rd', 'Linden Ave', 'Maple Way'][i % 5], shipping, Math.round((sub - discount) * 0.0825 * 100) / 100, discount));
    }
    return out.sort((a, b) => b.at - a.at);
  }
  function mkOrderObj(id, at, c, items, status, address, shipping, tax, discount) {
    const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
    const total = Math.round((sub - discount + shipping + tax) * 100) / 100;
    return {
      id: id, at: at, customerId: c.id, name: c.name, email: c.email, avatar: c.avatar,
      items: items, subtotal: sub, discount: discount, shipping: shipping, tax: tax, total: total,
      status: status, pay: status === 'Cancelled' ? 'Refunded' : (U.rnd(id.length * 4.4) > 0.12 ? 'Paid' : 'Pending'),
      address: address
    };
  }
  const ORDERS = mkOrders();

  /* --- category sales --- */
  const CAT_SALES = D.categories.map((c, i) => {
    const ps = D.products.filter(p => p.cat === c.id);
    const v = ps.reduce((s, p) => s + p.price * Math.min(p.sold, 5200), 0);
    return { id: c.id, label: c.name, value: Math.round(v / 100) * 84 + 4200, color: PALETTE[i % PALETTE.length], count: c.count };
  }).sort((a, b) => b.value - a.value);

  const TOP_PRODUCTS = D.products.slice().sort((a, b) => b.sold - a.sold).slice(0, 8);

  /* --- coupons --- */
  const COUPONS = D.coupons.map((c, i) => ({
    code: c.code, desc: c.label,
    type: c.freeShip ? 'ship' : (c.flat ? 'fixed' : 'pct'),
    value: c.flat || Math.round(c.off * 100),
    min: c.min || 0,
    used: 140 + Math.floor(U.rnd(i * 6.7 + 2.1) * 940),
    limit: 1000 + i * 750,
    expires: Date.now() + (18 + i * 16) * 86400000,
    active: i % 4 !== 3
  })).concat([
    { code: 'WELCOME15', desc: '15% off for new subscribers', type: 'pct', value: 15, min: 0, used: 2841, limit: 5000, expires: Date.now() + 62 * 86400000, active: true },
    { code: 'VIP25', desc: '25% off — VIP members only', type: 'pct', value: 25, min: 250, used: 96, limit: 400, expires: Date.now() + 12 * 86400000, active: false }
  ]);

  /* --- flash sales --- */
  function mkFlash() {
    const src = (D.flash && D.flash.length ? D.flash : D.products.slice(0, 6).map(p => ({ productId: p.id, claimed: 60 })));
    return src.slice(0, 6).map((f, i) => {
      const p = D.byId(f.productId) || D.products[i];
      return {
        id: 'fs' + (i + 1), productId: p.id, off: p.off || 20,
        endsAt: Date.now() + (3 + i * 4) * 3600000 + (i * 23 + 9) * 60000 + 12000,
        claimed: f.claimed || (55 + Math.floor(U.rnd(i * 3.3) * 38)),
        stock: 120 + Math.floor(U.rnd(i * 7.7) * 260)
      };
    });
  }
  const FLASH = mkFlash();

  /* --- bundles --- */
  const CAT_PICK = {
    audio: D.products.filter(p => p.cat === 'audio'),
    elec: D.products.filter(p => p.cat === 'electronics'),
    gaming: D.products.filter(p => p.cat === 'gaming'),
    acc: D.products.filter(p => p.cat === 'accessories')
  };
  const BUNDLES = [
    { id: 'bd1', name: 'Studio Sound Bundle', type: 'bundle', productIds: [CAT_PICK.audio[0].id, CAT_PICK.audio[4] ? CAT_PICK.audio[4].id : CAT_PICK.audio[1].id], price: 529, active: true },
    { id: 'bd2', name: 'Everyday Carry — Buy one get one', type: 'bogo', productIds: [CAT_PICK.acc[0].id], price: 0, active: true },
    { id: 'bd3', name: 'Desk Setup Bundle', type: 'bundle', productIds: [CAT_PICK.elec[2] ? CAT_PICK.elec[2].id : CAT_PICK.elec[0].id, CAT_PICK.gaming[0].id], price: 1788, active: false }
  ];

  /* --- announcements --- */
  const ANN = [
    { id: 'an1', text: 'Free express shipping on orders over $75', icon: 'truck', active: true },
    { id: 'an2', text: 'New arrivals drop every Friday, 9am PT', icon: 'spark', active: true },
    { id: 'an3', text: '30-day returns, no questions asked', icon: 'shield', active: true },
    { id: 'an4', text: 'Flash sale: up to 40% off Audio & Home', icon: 'flame', active: false }
  ];
  const ANN_ICONS = ['truck', 'spark', 'shield', 'flame', 'gift', 'percent', 'bolt', 'star', 'tag', 'crown'];

  /* --- featured --- */
  const FEATURED = [TOP_PRODUCTS[0].id, TOP_PRODUCTS[1].id, TOP_PRODUCTS[2].id, TOP_PRODUCTS[3].id].filter(Boolean);

  /* --- categories get admin fields --- */
  D.categories.forEach((c, i) => { if (c.order == null) c.order = i + 1; if (c.visible == null) c.visible = true; });

  /* ============================================================
     5. Shell + shared UI pieces
     ============================================================ */
  const NAV = [
    { sec: 'Overview' },
    { href: '#/admin', key: 'overview', label: 'Overview', icon: 'home' },
    { href: '#/admin/analytics', key: 'analytics', label: 'Analytics', icon: 'chart' },
    { sec: 'Catalog' },
    { href: '#/admin/products', key: 'products', label: 'Products', icon: 'package' },
    { href: '#/admin/orders', key: 'orders', label: 'Orders', icon: 'truck' },
    { sec: 'Customers' },
    { href: '#/admin/customers', key: 'customers', label: 'Customers', icon: 'users' },
    { sec: 'Marketing' },
    { href: '#/admin/promotions', key: 'promotions', label: 'Promotions', icon: 'percent' },
    { href: '#/admin/content', key: 'content', label: 'Content', icon: 'megaphone' }
  ];

  function sideNav(active) {
    return NAV.map(n => n.sec
      ? '<div class="sec">' + h(n.sec) + '</div>'
      : '<a href="' + n.href + '" class="' + (n.key === active ? 'active' : '') + '">' + I.icon(n.icon) + h(n.label) + '</a>'
    ).join('') +
      '<div class="side-foot"><a href="#/">' + I.icon('store') + 'Back to storefront</a></div>';
  }

  function shell(active, inner) {
    return '<div class="container" style="padding-top:26px;padding-bottom:70px">' +
      '<div class="admin-layout">' +
      '<aside class="admin-side">' + sideNav(active) + '</aside>' +
      '<div id="admin-main">' + inner + '</div>' +
      '</div></div>';
  }

  function bar(title, sub, right) {
    return '<div class="admin-bar">' +
      '<div><h3 style="font-size:24px;letter-spacing:-.02em">' + h(title) + '</h3>' +
      (sub ? '<div class="ad-sub">' + h(sub) + '</div>' : '') + '</div>' +
      '<div class="row" style="gap:10px;flex-wrap:wrap">' + (right || '') + '</div></div>';
  }

  function rangeTabs(cur) {
    return '<div class="tabs" data-range>' + ['7d', '30d', '90d'].map(r =>
      '<button data-r="' + r + '" class="' + (r === cur ? 'active' : '') + '">' + r + '</button>').join('') + '</div>';
  }
  function exportBtn(kind) {
    return '<button class="btn btn-secondary btn-sm" data-export="' + h(kind) + '">' + I.icon('download') + 'Export</button>';
  }
  function pill(status) {
    const map = { 'Processing': 'status-processing', 'Shipped': 'status-shipped', 'Out for delivery': 'status-delivery', 'Delivered': 'status-delivered', 'Cancelled': 'status-cancelled' };
    return '<span class="status-pill ' + (map[status] || '') + '">' + h(status) + '</span>';
  }
  function payPill(p) {
    const map = { 'Paid': 'status-delivered', 'Pending': 'status-delivery', 'Refunded': 'status-shipped', 'Failed': 'status-cancelled' };
    return '<span class="status-pill ' + (map[p] || '') + '">' + h(p) + '</span>';
  }
  function pager(total, page, per, attr) {
    const pages = Math.max(1, Math.ceil(total / per));
    const p = U.clamp(page, 1, pages);
    let btns = '<button data-' + attr + '="' + (p - 1) + '"' + (p <= 1 ? ' disabled' : '') + ' aria-label="Previous">' + I.icon('chevronLeft', '', 'width:16px;height:16px') + '</button>';
    const from = Math.max(1, Math.min(p - 2, pages - 4));
    const to = Math.min(pages, from + 4);
    for (let i = from; i <= to; i++) {
      btns += '<button data-' + attr + '="' + i + '" class="' + (i === p ? 'active' : '') + '">' + i + '</button>';
    }
    btns += '<button data-' + attr + '="' + (p + 1) + '"' + (p >= pages ? ' disabled' : '') + ' aria-label="Next">' + I.icon('chevronRight', '', 'width:16px;height:16px') + '</button>';
    return '<div class="row" style="justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:14px">' +
      '<div class="ad-sub">Showing ' + (total ? ((p - 1) * per + 1) : 0) + '–' + Math.min(p * per, total) + ' of ' + n2(total) + '</div>' +
      '<div class="pager">' + btns + '</div></div>';
  }
  function field(label, control) {
    return '<div class="input-group"><label>' + h(label) + '</label>' + control + '</div>';
  }

  /* ============================================================
     6. Route plumbing (skeleton -> real content)
     ============================================================ */
  const ST = {
    range: '30d', metric: 'revenue',
    pq: '', pcat: '', pstat: '', ppage: 1,
    oq: '', ostatus: 'All', opage: 1,
    cq: '', csort: 'ltv', cpage: 1
  };
  let CURRENT = null;
  let TOKEN = 0;
  let TIMERS = [];

  function clearTimers() { TIMERS.forEach(t => clearInterval(t)); TIMERS = []; }
  function startTimers(root) {
    clearTimers();
    const els = U.qsa('[data-countdown]', root);
    if (!els.length) return;
    const tick = () => {
      els.forEach(el => {
        const end = Number(el.getAttribute('data-countdown')) || 0;
        let ms = Math.max(0, end - Date.now());
        const hh = Math.floor(ms / 3600000), mm = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60;
        el.innerHTML = cdUnit(hh, 'HRS') + '<span class="sep">:</span>' + cdUnit(mm, 'MIN') + '<span class="sep">:</span>' + cdUnit(ss, 'SEC');
      });
    };
    tick();
    TIMERS.push(setInterval(tick, 1000));
  }
  function cdUnit(n, l) {
    return '<span class="u"><span class="n">' + String(n).padStart(2, '0') + '</span><span class="l">' + l + '</span></span>';
  }

  function skeletonBlock() {
    return '<div class="ad-grid kpis">' + new Array(4).fill('<div class="skeleton sk-block" style="height:132px"></div>').join('') + '</div>' +
      '<div class="skeleton sk-block mt-5" style="height:300px"></div>' +
      '<div class="ad-grid cols-2 mt-5"><div class="skeleton sk-block" style="height:260px"></div><div class="skeleton sk-block" style="height:260px"></div></div>';
  }

  async function route(key, buildBar, buildBody) {
    const view = U.qs('#view');
    if (!view) return;
    const token = ++TOKEN;
    clearTimers();
    view.innerHTML = shell(key, bar('Loading', 'Fetching dashboard data…', '') + skeletonBlock());
    await U.sleep(320 + Math.floor(U.rnd(key.length * 3.7) * 170));
    if (token !== TOKEN) return;
    if ((location.hash || '').indexOf('#/admin') !== 0) return;
    CURRENT = { key: key, bar: buildBar, body: buildBody };
    paint();
    UI.observeReveals(view);
  }

  function paint() {
    if (!CURRENT) return;
    const main = U.qs('#admin-main');
    if (!main) return;
    clearTimers();
    main.innerHTML = CURRENT.bar() + CURRENT.body();
    startTimers(main);
    UI.observeReveals(main);
  }

  /* ============================================================
     7. Overview
     ============================================================ */
  function overviewBar() {
    const A = agg(ST.range);
    return bar('Overview', 'Store performance for the last ' + A.n + ' days · updated just now',
      rangeTabs(ST.range) + exportBtn('overview'));
  }

  function overviewBody() {
    const n = daysOf(ST.range);
    const A = agg(ST.range);
    const labels = LABELS.slice(-n);
    const rev = REV.slice(-n), ord = ORD.slice(-n), sess = SESS.slice(-n), nw = NEWC.slice(-n), rt = RETC.slice(-n), cv = CONV.slice(-n);

    const kpis = [
      { label: 'Revenue', icon: 'credit', value: bigMoney(A.rev), delta: deltaHtml(A.dRev), spark: sparkline(rev, PALETTE[0]) },
      { label: 'Orders', icon: 'package', value: n2(A.ord), delta: deltaHtml(A.dOrd), spark: sparkline(ord, PALETTE[3]) },
      { label: 'New Customers', icon: 'users', value: n2(A.customers), delta: deltaHtml(A.dCust), spark: sparkline(nw, PALETTE[1]) },
      { label: 'Conversion Rate', icon: 'trend', value: A.conv.toFixed(2) + '%', delta: deltaHtml(A.dConv, false, 'pt'), spark: sparkline(cv, PALETTE[5]) },
      { label: 'Average Order Value', icon: 'wallet', value: bigMoney(A.aov), delta: deltaHtml(A.dAov), spark: sparkline(rev.map((v, i) => v / ord[i]), PALETTE[2]) },
      { label: 'Refund Rate', icon: 'refresh', value: A.refund.toFixed(2) + '%', delta: deltaHtml(A.dRef, true, 'pt'), spark: sparkline(REFD.slice(-n), '#EF4444') }
    ];

    const metric = ST.metric;
    let chart, leg;
    if (metric === 'orders') {
      chart = areaChart({ h: 286, fmt: 'int', labels: labels, series: [{ name: 'Orders', color: PALETTE[3], values: ord }] });
      leg = legendHtml([{ name: 'Orders', color: PALETTE[3] }]);
    } else if (metric === 'sessions') {
      chart = areaChart({ h: 286, fmt: 'int', labels: labels, series: [{ name: 'Sessions', color: PALETTE[1], values: sess }] });
      leg = legendHtml([{ name: 'Sessions', color: PALETTE[1] }]);
    } else {
      chart = areaChart({
        h: 286, fmt: 'money', labels: labels,
        series: [
          { name: 'Revenue', color: PALETTE[0], values: rev, op: 0.34, fmt: 'usd' },
          { name: 'Orders', color: PALETTE[3], values: ord, dash: true, fill: false, w: 1.8, max: Math.max.apply(null, ord), min: 0, fmt: 'int' }
        ]
      });
      leg = '<div class="chart-legend"><span><i style="background:' + PALETTE[0] + '"></i>Revenue</span><span><i style="background:' + PALETTE[3] + '"></i>Orders (right scale)</span></div>';
    }

    const visits = sum(sess);
    const funnel = [
      { label: 'Visit', value: visits },
      { label: 'Product view', value: Math.round(visits * 0.624) },
      { label: 'Add to cart', value: Math.round(visits * 0.281) },
      { label: 'Checkout', value: Math.round(visits * 0.116) },
      { label: 'Purchase', value: A.ord }
    ];
    const fRows = funnel.map((f, i) => ({
      label: f.label, value: f.value, display: n2(f.value), color: PALETTE[i],
      sub: i === 0 ? '100%' : (Math.round((f.value / funnel[i - 1].value) * 1000) / 10) + '%'
    }));

    return '' +
      '<div class="ad-grid kpis reveal-stagger">' + kpis.map(k =>
        '<div class="kpi"><div class="l"><span>' + h(k.label) + '</span><span class="ic">' + I.icon(k.icon) + '</span></div>' +
        '<div class="v ad-num">' + h(k.value) + '</div>' +
        '<div class="d">' + k.delta + '<span>vs previous ' + A.n + 'd</span></div>' +
        '<div class="spark">' + k.spark + '</div></div>').join('') + '</div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:12px;flex-wrap:wrap;gap:10px">' +
      '<div><h4>Revenue trend</h4><div class="ad-sub">' + h(U.formatDate(dayAt(DAYS - n))) + ' — ' + h(U.formatDate(dayAt(DAYS - 1))) + '</div></div>' +
      '<div class="tabs" data-metric>' + ['revenue', 'orders', 'sessions'].map(m =>
        '<button data-m="' + m + '" class="' + (m === metric ? 'active' : '') + '">' + (m === 'revenue' ? 'Revenue' : m === 'orders' ? 'Orders' : 'Sessions') + '</button>').join('') + '</div>' +
      '</div>' + leg + chart + '</div>' +

      '<div class="ad-grid cols-2 mt-5">' +
      '<div class="chart-box reveal"><h4>Sales by category</h4><div class="ad-sub" style="margin-bottom:14px">Gross merchandise value, last ' + A.n + ' days</div>' +
      hbarChart({ rows: CAT_SALES.slice(0, 8).map(c => ({ label: c.label, value: c.value, display: bigMoney(c.value), sub: Math.round((c.value / sum(CAT_SALES.map(x => x.value))) * 1000) / 10 + '%', color: c.color })) }) + '</div>' +

      '<div class="chart-box reveal"><h4>Top products</h4><div class="ad-sub" style="margin-bottom:14px">By units sold</div>' +
      '<div class="ad-scroll sm"><table class="table"><thead><tr><th>Product</th><th style="text-align:right">Sold</th><th style="text-align:right">Revenue</th></tr></thead><tbody>' +
      TOP_PRODUCTS.slice(0, 6).map(p =>
        '<tr><td><div class="ad-cell"><img class="ad-thumb" src="' + img(p.imgs[0], 88, 88) + '" alt=""><div><div class="t">' + h(p.name) + '</div><div class="s">' + h(p.brand) + '</div></div></div></td>' +
        '<td class="ad-num" style="text-align:right">' + n2(p.sold) + '</td>' +
        '<td class="ad-num" style="text-align:right;font-weight:600">' + h(bigMoney(p.sold * p.price)) + '</td></tr>').join('') +
      '</tbody></table></div></div>' +
      '</div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:12px;flex-wrap:wrap;gap:10px"><div><h4>Recent orders</h4><div class="ad-sub">Latest ' + Math.min(8, ORDERS.length) + ' transactions</div></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/admin/orders">View all' + I.icon('chevronRight') + '</a></div>' +
      '<div class="ad-scroll">' + ordersTableHtml(ORDERS.slice(0, 8)) + '</div></div>' +

      '<div class="chart-box mt-5 reveal"><h4>Conversion funnel</h4><div class="ad-sub" style="margin-bottom:14px">Visit → Product view → Add to cart → Checkout → Purchase</div>' +
      hbarChart({ rows: fRows }) + '</div>';
  }

  function ordersTableHtml(list) {
    return '<table class="table"><thead><tr>' +
      '<th>Order</th><th>Customer</th><th>Date</th><th style="text-align:right">Items</th>' +
      '<th style="text-align:right">Total</th><th>Payment</th><th>Fulfilment</th></tr></thead><tbody>' +
      list.map(o =>
        '<tr data-order="' + h(o.id) + '" style="cursor:pointer">' +
        '<td class="ad-mono" style="font-weight:600">' + h(o.id) + '</td>' +
        '<td><div class="ad-cell" style="min-width:180px"><img class="ad-ava" src="' + img(o.avatar, 72, 72) + '" alt=""><div><div class="t">' + h(o.name) + '</div><div class="s">' + h(o.email) + '</div></div></div></td>' +
        '<td class="muted">' + h(U.formatDate(o.at)) + '<div class="s ad-sub">' + h(U.timeAgo(o.at)) + '</div></td>' +
        '<td class="ad-num" style="text-align:right">' + o.items.reduce((s, x) => s + x.qty, 0) + '</td>' +
        '<td class="ad-num" style="text-align:right;font-weight:700">' + h(money(o.total)) + '</td>' +
        '<td>' + payPill(o.pay) + '</td>' +
        '<td>' + pill(o.status) + '</td></tr>').join('') +
      '</tbody></table>';
  }

  /* ============================================================
     8. Products
     ============================================================ */
  function productsBar() {
    return bar('Products', n2(D.products.length) + ' SKUs · ' + D.categories.length + ' categories',
      '<button class="btn btn-primary btn-sm" data-add-product>' + I.icon('plus') + 'Add product</button>' + exportBtn('products'));
  }

  function filteredProducts() {
    const q = ST.pq.trim().toLowerCase();
    let list = D.products.slice();
    if (q) list = list.filter(p => (p.name + ' ' + p.brand + ' ' + p.catName).toLowerCase().indexOf(q) >= 0);
    if (ST.pcat) list = list.filter(p => p.cat === ST.pcat);
    if (ST.pstat) {
      list = list.filter(p => ST.pstat === 'in' ? p.stock > 10 : ST.pstat === 'low' ? (p.stock > 0 && p.stock <= 10) : p.stock <= 0);
    }
    return list;
  }

  function productsBody() {
    const all = filteredProducts();
    const per = 10;
    const pages = Math.max(1, Math.ceil(all.length / per));
    ST.ppage = U.clamp(ST.ppage, 1, pages);
    const list = all.slice((ST.ppage - 1) * per, ST.ppage * per);

    const toolbar =
      '<div class="ad-toolbar">' +
      '<div class="searchbox ad-search">' + I.icon('search', 'ic') + '<input data-psearch type="search" placeholder="Search products…" value="' + h(ST.pq) + '"></div>' +
      '<select class="input" data-pcat style="width:auto;min-width:170px;height:46px"><option value="">All categories</option>' +
      D.categories.map(c => '<option value="' + h(c.id) + '"' + (ST.pcat === c.id ? ' selected' : '') + '>' + h(c.name) + '</option>').join('') + '</select>' +
      '<select class="input" data-pstat style="width:auto;min-width:150px;height:46px">' +
      [['', 'Any status'], ['in', 'In stock'], ['low', 'Low stock'], ['out', 'Out of stock']].map(s =>
        '<option value="' + s[0] + '"' + (ST.pstat === s[0] ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select>' +
      ((ST.pq || ST.pcat || ST.pstat) ? '<button class="btn btn-ghost btn-sm" data-pclear>' + I.icon('close') + 'Clear</button>' : '') +
      '</div>';

    const rows = list.length ? list.map(p => {
      const low = p.stock <= 10;
      return '<tr>' +
        '<td><div class="ad-cell"><img class="ad-thumb" src="' + img(p.imgs[0], 88, 88) + '" alt="">' +
        '<div><div class="t">' + h(p.name) + '</div><div class="s">' + h(p.brand) + ' · ' + h(p.id) + '</div></div></div></td>' +
        '<td class="muted">' + h(p.catName) + '</td>' +
        '<td class="ad-num"><div style="font-weight:600">' + h(money(p.price)) + '</div>' + (p.was ? '<div class="ad-sub" style="text-decoration:line-through">' + h(money(p.was)) + '</div>' : '') + '</td>' +
        '<td><input class="input stk" type="number" min="0" step="1" value="' + Number(p.stock) + '" data-stock="' + h(p.id) + '" aria-label="Stock for ' + h(p.name) + '">' +
        (low ? '<div class="ad-sub ' + (p.stock <= 0 ? 'ad-neg' : 'ad-neg') + '" style="margin-top:4px">' + (p.stock <= 0 ? 'Out of stock' : 'Low stock') + '</div>' : '') + '</td>' +
        '<td class="ad-num">' + n2(p.sold) + '</td>' +
        '<td><span class="row" style="gap:6px">' + I.stars(p.rating) + '<span class="ad-num muted" style="font-size:12px">' + p.rating.toFixed(1) + '</span></span></td>' +
        '<td><div class="row" style="gap:6px"><button class="ad-iconbtn" data-edit-product="' + h(p.id) + '" data-tip="Edit">' + I.icon('edit') + '</button>' +
        '<button class="ad-iconbtn danger" data-del-product="' + h(p.id) + '" data-tip="Delete">' + I.icon('trash') + '</button></div></td>' +
        '</tr>';
    }).join('') : '';

    return toolbar +
      '<div class="chart-box"><div class="ad-scroll">' +
      '<table class="table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th style="text-align:right">Sold</th><th>Rating</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="7"><div class="ad-empty-pad">' + UI.empty({ icon: 'package', title: 'No products found', text: 'Try a different search term or clear the filters.', actions: '<button class="btn btn-secondary btn-sm" data-pclear>Clear filters</button>' }) + '</div></td></tr>') +
      '</tbody></table></div>' +
      (all.length ? pager(all.length, ST.ppage, per, 'ppage') : '') +
      '</div>';
  }

  function productForm(p) {
    p = p || {};
    const colors = (p.colors || []).map(c => c.name).join(', ');
    return '<div class="form-grid">' +
      '<div class="span-2">' + field('Product name', '<input class="input" name="name" value="' + h(p.name || '') + '" placeholder="e.g. Aurora Studio Pro Headphones">') + '</div>' +
      field('Brand', '<select class="input" name="brand">' + D.brands.map(b => '<option' + (b.name === (p.brand || D.brands[0].name) ? ' selected' : '') + '>' + h(b.name) + '</option>').join('') + '</select>') +
      field('Category', '<select class="input" name="cat">' + D.categories.map(c => '<option value="' + h(c.id) + '"' + (c.id === (p.cat || D.categories[0].id) ? ' selected' : '') + '>' + h(c.name) + '</option>').join('') + '</select>') +
      field('Price (USD)', '<input class="input" name="price" type="number" min="0" step="0.01" value="' + (p.price != null ? p.price : '') + '" placeholder="0.00">') +
      field('Compare-at price', '<input class="input" name="was" type="number" min="0" step="0.01" value="' + (p.was != null ? p.was : '') + '" placeholder="Optional">') +
      field('Stock', '<input class="input" name="stock" type="number" min="0" step="1" value="' + (p.stock != null ? p.stock : 50) + '">') +
      field('Image (Unsplash id)', '<input class="input" name="img" value="' + h((p.imgs && p.imgs[0]) || '') + '" placeholder="1505740420928-5e560c06d30e">') +
      '<div class="span-2">' + field('Colors (comma separated)', '<input class="input" name="colors" value="' + h(colors) + '" placeholder="Midnight, Silver, Sand">') + '</div>' +
      '<div class="span-2">' + field('Description', '<textarea class="input" name="desc" placeholder="Short merchandising copy…">' + h(p.desc || '') + '</textarea>') + '</div>' +
      '</div>';
  }

  function productModal(id) {
    const p = id ? D.byId(id) : null;
    UI.modal({
      title: p ? 'Edit product' : 'Add product',
      width: 680,
      body: productForm(p),
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>' + (p ? 'Save changes' : 'Create product') + '</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const g = (n) => { const el = body.querySelector('[name=' + n + ']'); return el ? el.value : ''; };
          const name = g('name').trim();
          if (!name) { UI.toast({ type: 'error', title: 'Name required', desc: 'Give the product a name before saving.' }); return; }
          const price = parseFloat(g('price')) || 0;
          const wasRaw = parseFloat(g('was'));
          const cat = D.categories.find(c => c.id === g('cat')) || D.categories[0];
          const stock = Math.max(0, parseInt(g('stock'), 10) || 0);
          const colors = g('colors').split(',').map(s => s.trim()).filter(Boolean).map((n, i) => ({ name: n, hex: ['#15161C', '#C9CCD3', '#D8C6A8', '#4A4E57', '#F3EFE7', '#2F5D8C', '#B4654A', '#2F4A3C'][i % 8] }));
          const imgId = g('img').trim() || (p && p.imgs[0]) || D.categories[0].img;
          const patch = {
            name: name, brand: g('brand'), brandId: U.slug(g('brand')), cat: cat.id, catName: cat.name,
            price: price, was: wasRaw && wasRaw > price ? wasRaw : null,
            stock: stock, desc: g('desc') || (D.DESC[cat.name] || ''),
            imgs: [imgId].concat((p && p.imgs && p.imgs.slice(1)) || [D.categories[0].img]),
            colors: colors.length ? colors : [{ name: 'Default', hex: '#C9CCD3' }]
          };
          patch.off = patch.was ? Math.round((1 - price / patch.was) * 100) : 0;
          if (p) {
            Object.assign(p, patch);
            UI.toast({ title: 'Product updated', desc: p.name });
          } else {
            const np = Object.assign({
              id: 'p' + (2000 + D.products.length + 1), rating: 0, reviews: 0, sizes: null, badge: 'new',
              sold: 0, ageDays: 0, features: [], specs: {}, included: [], material: '—', warranty: '1 year',
              shipDays: 3, freeShip: true, tags: [], sub: 'home'
            }, patch);
            D.products.unshift(np);
            UI.toast({ title: 'Product created', desc: np.name });
          }
          UI.closeModal();
          paint();
        });
      }
    });
  }

  function confirmDeleteProduct(id) {
    const p = D.byId(id);
    if (!p) return;
    UI.modal({
      title: 'Delete product',
      width: 460,
      body: '<p class="muted">Delete <b>' + h(p.name) + '</b>? This removes the SKU from the catalogue. This action cannot be undone.</p>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-danger" data-confirm>Delete</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-confirm]').addEventListener('click', function () {
          const i = D.products.indexOf(p);
          if (i >= 0) D.products.splice(i, 1);
          const f = FEATURED.indexOf(p.id);
          if (f >= 0) FEATURED.splice(f, 1);
          UI.closeModal();
          UI.toast({ type: 'warn', title: 'Product deleted', desc: p.name });
          paint();
        });
      }
    });
  }

  /* ============================================================
     9. Orders
     ============================================================ */
  function ordersBar() {
    const counts = { All: ORDERS.length };
    SHIP_STATES.forEach(s => counts[s] = ORDERS.filter(o => o.status === s).length);
    return bar('Orders', n2(ORDERS.length) + ' orders · ' + money(sum(ORDERS.map(o => o.total))) + ' lifetime value',
      '<div class="tabs" data-ostatus>' + ['All'].concat(SHIP_STATES).map(s =>
        '<button data-s="' + h(s) + '" class="' + (ST.ostatus === s ? 'active' : '') + '">' + h(s) + ' <span class="soft ad-num">' + counts[s] + '</span></button>').join('') + '</div>' +
      exportBtn('orders'));
  }

  function filteredOrders() {
    const q = ST.oq.trim().toLowerCase();
    let list = ORDERS.slice();
    if (ST.ostatus !== 'All') list = list.filter(o => o.status === ST.ostatus);
    if (q) list = list.filter(o => (o.id + ' ' + o.name + ' ' + o.email).toLowerCase().indexOf(q) >= 0);
    return list;
  }

  function ordersBody() {
    const all = filteredOrders();
    const per = 12;
    ST.opage = U.clamp(ST.opage, 1, Math.max(1, Math.ceil(all.length / per)));
    const list = all.slice((ST.opage - 1) * per, ST.opage * per);
    return '<div class="ad-toolbar"><div class="searchbox ad-search">' + I.icon('search', 'ic') +
      '<input data-osearch type="search" placeholder="Search order ID or customer…" value="' + h(ST.oq) + '"></div></div>' +
      '<div class="chart-box"><div class="ad-scroll">' + (list.length ? ordersTableHtml(list) :
        '<div class="ad-empty-pad">' + UI.empty({ icon: 'truck', title: 'No orders match', text: 'Adjust the status filter or clear the search.' }) + '</div>') +
      '</div>' + (all.length ? pager(all.length, ST.opage, per, 'opage') : '') + '</div>';
  }

  function orderTimeline(o) {
    const stages = ['Order placed', 'Payment confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
    const idx = SHIP_STATES.indexOf(o.status);
    const doneUpTo = o.status === 'Cancelled' ? 1 : (idx <= 0 ? 1 : idx + 2);
    return '<div class="timeline">' + stages.map((s, i) =>
      '<div class="tl' + (i < doneUpTo ? ' done' : '') + '"><div class="rail"><span class="dot"></span>' + (i < stages.length - 1 ? '<span class="bar"></span>' : '') + '</div>' +
      '<div class="c"><div class="t">' + h(s) + '</div><div class="d">' + (i < doneUpTo ? h(U.formatDate(Math.min(Date.now(), o.at + i * 54000000))) : 'Pending') + '</div></div></div>').join('') + '</div>';
  }

  function orderModal(id) {
    const o = ORDERS.find(x => x.id === id);
    if (!o) return;
    const itemsHtml = o.items.map(it => {
      const p = D.byId(it.productId);
      return '<div class="ad-row"><img class="ad-thumb" src="' + img(it.img || (p ? p.imgs[0] : AVATARS[0]), 88, 88) + '" alt="">' +
        '<div style="flex:1;min-width:0"><div style="font-weight:500;line-height:1.3">' + h(it.name) + '</div>' +
        '<div class="ad-sub">' + h(p ? p.brand : '') + ' · Qty ' + it.qty + '</div></div>' +
        '<div class="ad-num" style="font-weight:600">' + h(money(it.price * it.qty)) + '</div></div>';
    }).join('');

    UI.modal({
      title: 'Order ' + o.id,
      width: 760,
      body: '<div class="row" style="justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px">' +
        '<div class="row" style="gap:10px"><img class="ad-ava" src="' + img(o.avatar, 72, 72) + '" alt="">' +
        '<div><div style="font-weight:600">' + h(o.name) + '</div><div class="ad-sub">' + h(o.email) + '</div></div></div>' +
        '<div class="row" style="gap:8px">' + payPill(o.pay) + pill(o.status) + '</div></div>' +

        '<div class="ad-grid cols-2" style="gap:var(--s-5)">' +
        '<div><h5 style="margin-bottom:10px">Items</h5>' + itemsHtml +
        '<div style="border-top:1px solid var(--border);margin-top:10px;padding-top:10px">' +
        '<div class="summary-row"><span class="muted">Subtotal</span><span class="ad-num">' + h(money(o.subtotal)) + '</span></div>' +
        (o.discount ? '<div class="summary-row"><span class="muted">Discount</span><span class="ad-num ad-pos">-' + h(money(o.discount)) + '</span></div>' : '') +
        '<div class="summary-row"><span class="muted">Shipping</span><span class="ad-num">' + (o.shipping ? h(money(o.shipping)) : '<span class="ad-pos">FREE</span>') + '</span></div>' +
        '<div class="summary-row"><span class="muted">Tax</span><span class="ad-num">' + h(money(o.tax)) + '</span></div>' +
        '<div class="summary-row total"><span>Total</span><span class="ad-num">' + h(money(o.total)) + '</span></div>' +
        '</div></div>' +

        '<div><h5 style="margin-bottom:10px">Shipping address</h5>' +
        '<div class="card card-flat" style="padding:14px;font-size:14px">' + h(o.address) + '</div>' +
        '<h5 style="margin:18px 0 10px">Timeline</h5>' + orderTimeline(o) +
        '<div class="mt-4">' + field('Fulfilment status', '<select class="input" name="status">' +
          SHIP_STATES.map(s => '<option' + (s === o.status ? ' selected' : '') + '>' + h(s) + '</option>').join('') + '</select>') + '</div>' +
        '</div></div>',

      footer: (o.pay === 'Refunded' ? '' : '<button class="btn btn-danger" data-refund>' + I.icon('refresh') + 'Refund</button>') +
        '<button class="btn btn-secondary" data-close>Close</button>' +
        '<button class="btn btn-primary" data-save>Update status</button>',

      onMount: function (body, wrap) {
        const save = wrap.querySelector('[data-save]');
        if (save) save.addEventListener('click', function () {
          const s = body.querySelector('[name=status]').value;
          if (s === o.status) { UI.closeModal(); return; }
          o.status = s;
          if (s === 'Cancelled') o.pay = 'Refunded';
          UI.closeModal();
          UI.toast({ title: 'Status updated', desc: o.id + ' → ' + s });
          paint();
        });
        const rf = wrap.querySelector('[data-refund]');
        if (rf) rf.addEventListener('click', function () {
          UI.modal({
            title: 'Refund ' + o.id + '?',
            width: 440,
            body: '<p class="muted">Issue a full refund of <b>' + h(money(o.total)) + '</b> to ' + h(o.name) + '. The order will be marked as cancelled and the payment refunded.</p>',
            footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-danger" data-confirm>Refund</button>',
            onMount: function (b2, w2) {
              w2.querySelector('[data-confirm]').addEventListener('click', function () {
                o.pay = 'Refunded';
                o.status = 'Cancelled';
                UI.closeModal();
                UI.toast({ type: 'warn', title: 'Refund issued', desc: o.id + ' · ' + money(o.total) });
                paint();
              });
            }
          });
        });
      }
    });
  }

  /* ============================================================
     10. Customers
     ============================================================ */
  function customersBar() {
    const n = daysOf(ST.range);
    return bar('Customers', n2(TOTAL_CUSTOMERS) + ' accounts · ' + n2(sum(NEWC.slice(-n))) + ' acquired in the last ' + n + ' days', exportBtn('customers'));
  }

  function filteredCustomers() {
    const q = ST.cq.trim().toLowerCase();
    let list = CUSTOMERS.slice();
    if (q) list = list.filter(c => (c.name + ' ' + c.email + ' ' + c.region).toLowerCase().indexOf(q) >= 0);
    if (ST.csort === 'ltv') list.sort((a, b) => b.spend - a.spend);
    else if (ST.csort === 'orders') list.sort((a, b) => b.orders - a.orders);
    else list.sort((a, b) => b.joined - a.joined);
    return list;
  }

  function customersBody() {
    const n = daysOf(ST.range);
    const repeat = CUSTOMERS.filter(c => c.orders > 1).length / CUSTOMERS.length * 100;
    const ltv = sum(CUSTOMERS.map(c => c.spend)) / CUSTOMERS.length;
    const fresh = sum(NEWC.slice(-n));
    const kpis = [
      { label: 'Total customers', value: n2(TOTAL_CUSTOMERS), delta: deltaHtml(8.7) },
      { label: 'New (' + n + ' days)', value: n2(fresh), delta: deltaHtml(6.2) },
      { label: 'Repeat purchase rate', value: repeat.toFixed(1) + '%', delta: deltaHtml(2.8) },
      { label: 'Average LTV', value: bigMoney(ltv), delta: deltaHtml(4.6) }
    ];
    const all = filteredCustomers();
    const per = 12;
    ST.cpage = U.clamp(ST.cpage, 1, Math.max(1, Math.ceil(all.length / per)));
    const list = all.slice((ST.cpage - 1) * per, ST.cpage * per);

    return '<div class="ad-grid kpis reveal-stagger">' + kpis.map(k =>
      '<div class="kpi"><div class="l"><span>' + h(k.label) + '</span></div><div class="v ad-num">' + h(k.value) + '</div>' +
      '<div class="d">' + k.delta + '<span>vs last month</span></div></div>').join('') + '</div>' +

      '<div class="ad-toolbar mt-5">' +
      '<div class="searchbox ad-search">' + I.icon('search', 'ic') + '<input data-csearch type="search" placeholder="Search name, email or region…" value="' + h(ST.cq) + '"></div>' +
      '<div class="tabs" data-csort>' + [['ltv', 'LTV'], ['orders', 'Orders'], ['newest', 'Newest']].map(s =>
        '<button data-s="' + s[0] + '" class="' + (ST.csort === s[0] ? 'active' : '') + '">' + s[1] + '</button>').join('') + '</div>' +
      '</div>' +

      '<div class="chart-box"><div class="row-between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px">' +
      '<div><h4>Directory</h4><div class="ad-sub">' + n2(CUSTOMERS.length) + ' highest-value accounts of ' + n2(TOTAL_CUSTOMERS) + '</div></div></div>' +
      '<div class="ad-scroll"><table class="table"><thead><tr>' +
      '<th>Customer</th><th>Region</th><th style="text-align:right">Orders</th><th style="text-align:right">Lifetime spend</th><th>Joined</th><th>Tier</th></tr></thead><tbody>' +
      (list.length ? list.map(c =>
        '<tr data-customer="' + h(c.id) + '" style="cursor:pointer">' +
        '<td><div class="ad-cell"><img class="ad-ava" src="' + img(c.avatar, 80, 80) + '" alt=""><div><div class="t">' + h(c.name) + '</div><div class="s">' + h(c.email) + '</div></div></div></td>' +
        '<td class="muted">' + h(c.region) + '</td>' +
        '<td class="ad-num" style="text-align:right">' + c.orders + '</td>' +
        '<td class="ad-num" style="text-align:right;font-weight:600">' + h(money(c.spend)) + '</td>' +
        '<td class="muted">' + h(U.formatDate(c.joined)) + '<div class="ad-sub">' + h(U.timeAgo(c.joined)) + '</div></td>' +
        '<td>' + tierBadge(c.tier) + '</td></tr>').join('')
        : '<tr><td colspan="6"><div class="ad-empty-pad">' + UI.empty({ icon: 'users', title: 'No customers found', text: 'Try another search term.' }) + '</div></td></tr>') +
      '</tbody></table></div>' + pager(all.length, ST.cpage, per, 'cpage') + '</div>';
  }

  function customerModal(id) {
    const c = CUSTOMERS.find(x => x.id === id);
    if (!c) return;
    const mine = ORDERS.filter(o => o.customerId === c.id).slice(0, 5);
    const spend = [];
    for (let i = 11; i >= 0; i--) spend.push(Math.round((c.spend / 12) * (0.55 + U.rnd(c.id.length * 3.1 + i * 7.7) * 0.9)));
    UI.modal({
      title: c.name,
      width: 720,
      body: '<div class="row" style="gap:14px;margin-bottom:18px">' +
        '<img src="' + img(c.avatar, 160, 160) + '" alt="" style="width:66px;height:66px;border-radius:50%;object-fit:cover">' +
        '<div style="flex:1"><div style="font-weight:700;font-size:18px">' + h(c.name) + '</div>' +
        '<div class="ad-sub">' + h(c.email) + ' · ' + h(c.phone) + '</div>' +
        '<div class="chip-row mt-2">' + tierBadge(c.tier) + c.tags.map(t => '<span class="chip">' + h(t) + '</span>').join('') + '</div></div>' +
        '<div style="text-align:right"><div class="ad-sub">Lifetime spend</div><div style="font-size:22px;font-weight:800" class="ad-num">' + h(money(c.spend)) + '</div></div></div>' +

        '<div class="ad-grid cols-3" style="gap:12px;margin-bottom:18px">' +
        [['Orders', n2(c.orders)], ['Avg order', money(c.spend / c.orders)], ['Region', c.region]].map(s =>
          '<div class="card card-flat" style="padding:14px"><div class="ad-sub">' + h(s[0]) + '</div><div style="font-weight:700;font-size:16px" class="ad-num">' + h(s[1]) + '</div></div>').join('') + '</div>' +

        '<h5 style="margin-bottom:10px">Spend — last 12 months</h5>' +
        areaChart({ h: 150, fmt: 'money', series: [{ name: 'Spend', color: PALETTE[0], values: spend, fmt: 'usd' }], labels: spend.map((_, i) => 'M' + (i + 1)), xticks: 6 }) +

        '<h5 style="margin:20px 0 10px">Recent orders</h5>' +
        (mine.length ? '<div class="ad-scroll sm"><table class="table"><thead><tr><th>Order</th><th>Date</th><th style="text-align:right">Total</th><th>Status</th></tr></thead><tbody>' +
          mine.map(o => '<tr><td class="ad-mono" style="font-weight:600">' + h(o.id) + '</td><td class="muted">' + h(U.formatDate(o.at)) + '</td>' +
            '<td class="ad-num" style="text-align:right;font-weight:600">' + h(money(o.total)) + '</td><td>' + pill(o.status) + '</td></tr>').join('') +
          '</tbody></table></div>' : '<div class="muted" style="font-size:14px">No orders yet.</div>'),
      footer: '<button class="btn btn-secondary" data-close>Close</button><button class="btn btn-primary" data-mail>' + I.icon('mail') + 'Email customer</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-mail]').addEventListener('click', function () {
          UI.closeModal();
          UI.toast({ title: 'Email drafted', desc: c.email });
        });
      }
    });
  }

  /* ============================================================
     11. Analytics
     ============================================================ */
  function analyticsBar() {
    return bar('Analytics', 'Deep dive on traffic, revenue and retention', rangeTabs(ST.range) + exportBtn('analytics'));
  }

  function analyticsBody() {
    const n = daysOf(ST.range);
    const labels = LABELS.slice(-n);
    const rev = REV.slice(-n), ord = ORD.slice(-n), nw = NEWC.slice(-n), rt = RETC.slice(-n), cv = CONV.slice(-n);
    const catSeg = CAT_SALES.slice(0, 6).map((c, i) => ({ label: c.label, value: c.value, color: PALETTE[i % PALETTE.length] }));

    return '<div class="ad-grid cols-2">' +
      '<div class="chart-box span-2 reveal"><div class="row-between" style="flex-wrap:wrap;gap:10px"><div><h4>Revenue</h4><div class="ad-sub">Total ' + h(bigMoney(sum(rev))) + ' over ' + n + ' days</div></div>' + legendHtml([{ name: 'Revenue', color: PALETTE[0] }]) + '</div>' +
      areaChart({ h: 280, fmt: 'money', labels: labels, series: [{ name: 'Revenue', color: PALETTE[0], values: rev, fmt: 'usd' }] }) + '</div>' +

      '<div class="chart-box reveal"><h4>Orders</h4><div class="ad-sub" style="margin-bottom:12px">' + n2(sum(ord)) + ' orders placed</div>' +
      barChart({ h: 240, fmt: 'int', labels: labels, values: ord.map(v => Math.round(v)), color: PALETTE[3] }) + '</div>' +

      '<div class="chart-box reveal"><h4>Sales by category</h4><div class="ad-sub" style="margin-bottom:14px">Share of gross merchandise value</div>' +
      donutBlock({ segments: catSeg, fmt: 'money', center: '$' + compact(sum(catSeg.map(s => s.value))), centerLabel: 'GMV' }) + '</div>' +

      '<div class="chart-box reveal"><h4>Top products</h4><div class="ad-sub" style="margin-bottom:14px">Units and revenue contribution</div>' +
      '<div class="ad-scroll sm"><table class="table"><thead><tr><th>Product</th><th style="text-align:right">Sold</th><th style="text-align:right">Revenue</th></tr></thead><tbody>' +
      TOP_PRODUCTS.map(p => '<tr><td><div class="ad-cell"><img class="ad-thumb" src="' + img(p.imgs[0], 88, 88) + '" alt=""><div><div class="t">' + h(p.name) + '</div><div class="s">' + h(p.brand) + '</div></div></div></td>' +
        '<td class="ad-num" style="text-align:right">' + n2(p.sold) + '</td><td class="ad-num" style="text-align:right;font-weight:600">' + h(bigMoney(p.sold * p.price)) + '</td></tr>').join('') +
      '</tbody></table></div></div>' +

      '<div class="chart-box span-2 reveal"><h4>Customer growth</h4><div class="ad-sub" style="margin-bottom:12px">New vs returning customers</div>' +
      legendHtml([{ name: 'New', color: PALETTE[0] }, { name: 'Returning', color: PALETTE[2] }]) +
      areaChart({ h: 260, fmt: 'int', labels: labels, series: [{ name: 'New', color: PALETTE[0], values: nw, op: 0.30 }, { name: 'Returning', color: PALETTE[2], values: rt, op: 0.22 }] }) + '</div>' +

      '<div class="chart-box span-2 reveal"><h4>Conversion rate</h4><div class="ad-sub" style="margin-bottom:12px">Orders ÷ sessions, daily</div>' +
      areaChart({ h: 240, fmt: 'pct', labels: labels, series: [{ name: 'Conversion', color: PALETTE[5], values: cv, op: 0.26, fmt: 'pct' }] }) + '</div>' +
      '</div>';
  }

  /* ============================================================
     12. Promotions
     ============================================================ */
  function promotionsBar() {
    return bar('Promotions', COUPONS.length + ' coupons · ' + FLASH.length + ' flash sales · ' + BUNDLES.length + ' bundles',
      '<button class="btn btn-primary btn-sm" data-new-coupon>' + I.icon('plus') + 'Create coupon</button>');
  }

  function couponValue(c) {
    if (c.type === 'ship') return 'Free shipping';
    if (c.type === 'fixed') return money(c.value) + ' off';
    return c.value + '% off';
  }
  function couponStatus(c) {
    if (!c.active) return '<span class="badge">Paused</span>';
    if (c.expires < Date.now()) return '<span class="badge badge-hot">Expired</span>';
    if (c.used >= c.limit) return '<span class="badge badge-best">Limit reached</span>';
    return '<span class="badge badge-sale">Active</span>';
  }

  function promotionsBody() {
    const couponCards = COUPONS.map(c =>
      '<div class="col" style="gap:0">' +
      '<div class="coupon-card"><div style="min-width:0">' +
      '<div class="row" style="gap:8px"><span class="code ad-mono">' + h(c.code) + '</span>' + couponStatus(c) + '</div>' +
      '<div class="ad-sub" style="margin-top:4px">' + h(c.desc) + '</div>' +
      '<div class="ad-sub">Min spend ' + (c.min ? h(money(c.min)) : 'none') + ' · expires ' + h(U.formatDate(c.expires, { month: 'short', day: 'numeric' })) + '</div>' +
      '<div class="progress mt-2" style="margin-top:8px"><span class="bar" style="width:' + Math.min(100, Math.round((c.used / c.limit) * 100)) + '%"></span></div>' +
      '<div class="ad-sub" style="margin-top:6px">' + n2(c.used) + ' / ' + n2(c.limit) + ' used</div>' +
      '</div><button class="ad-iconbtn danger" data-del-coupon="' + h(c.code) + '" data-tip="Delete">' + I.icon('trash') + '</button></div></div>').join('');

    const flashCards = FLASH.map(f => {
      const p = D.byId(f.productId);
      if (!p) return '';
      return '<div class="flash-card">' +
        '<img class="thumb" src="' + img(p.imgs[0], 112, 112) + '" alt="">' +
        '<div style="flex:1;min-width:160px"><div style="font-weight:600;line-height:1.3">' + h(p.name) + '</div>' +
        '<div class="ad-sub">' + h(p.brand) + ' · ' + h(money(p.price)) + ' <s style="opacity:.6">' + h(money(p.was || p.price)) + '</s></div>' +
        '<div class="row" style="gap:8px;margin-top:6px"><span class="badge badge-hot">-' + f.off + '%</span>' +
        '<span class="ad-sub">' + f.claimed + '% claimed · ' + f.stock + ' left</span></div>' +
        '<div class="progress mt-2" style="margin-top:8px;max-width:220px"><span class="bar" style="width:' + f.claimed + '%;background:var(--danger)"></span></div></div>' +
        '<div style="text-align:center"><div class="ad-sub" style="margin-bottom:6px">Ends in</div>' +
        '<div class="cd" data-countdown="' + f.endsAt + '"></div></div>' +
        '<button class="ad-iconbtn danger" data-del-flash="' + h(f.id) + '" data-tip="Remove">' + I.icon('trash') + '</button></div>';
    }).join('');

    const bundleRows = BUNDLES.map(b =>
      '<div class="ad-row">' +
      '<div class="row" style="gap:8px;flex:none">' + b.productIds.map(id => {
        const p = D.byId(id); return p ? '<img class="ad-thumb" style="width:38px;height:38px" src="' + img(p.imgs[0], 76, 76) + '" alt="">' : '';
      }).join('') + '</div>' +
      '<div style="flex:1;min-width:140px"><div style="font-weight:600">' + h(b.name) + '</div>' +
      '<div class="ad-sub">' + (b.type === 'bogo' ? 'Buy one get one' : 'Bundle price ' + h(money(b.price))) + ' · ' + b.productIds.length + ' item(s)</div></div>' +
      '<button class="switch' + (b.active ? ' on' : '') + '" data-bundle-toggle="' + h(b.id) + '" aria-label="Toggle bundle"><i></i></button>' +
      '<button class="ad-iconbtn danger" data-del-bundle="' + h(b.id) + '" data-tip="Delete">' + I.icon('trash') + '</button></div>').join('');

    return '<div class="chart-box reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Coupons</h4><div class="ad-sub">Discount codes available at checkout</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-new-coupon>' + I.icon('plus') + 'Create coupon</button></div>' +
      '<div class="coupon-grid">' + couponCards + '</div></div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Flash sale</h4><div class="ad-sub">Live countdown deals on the storefront hero</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-new-flash>' + I.icon('bolt') + 'Add flash sale</button></div>' +
      '<div class="col" style="gap:12px">' + (flashCards || '<div class="muted">No active flash sales.</div>') + '</div></div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Bundle deals</h4><div class="ad-sub">Buy one get one and fixed-price bundles</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-new-bundle>' + I.icon('gift') + 'Create bundle</button></div>' +
      '<div>' + bundleRows + '</div></div>';
  }

  function couponModal() {
    UI.modal({
      title: 'Create coupon',
      width: 620,
      body: '<div class="form-grid">' +
        field('Code', '<input class="input ad-mono" name="code" placeholder="SUMMER25" style="text-transform:uppercase">') +
        field('Type', '<select class="input" name="type"><option value="pct">Percentage</option><option value="fixed">Fixed amount</option><option value="ship">Free shipping</option></select>') +
        field('Value (% or $)', '<input class="input" name="value" type="number" min="0" step="1" value="15">') +
        field('Minimum spend', '<input class="input" name="min" type="number" min="0" step="1" value="0">') +
        field('Expiry', '<input class="input" name="exp" type="date" value="' + new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) + '">') +
        field('Usage limit', '<input class="input" name="limit" type="number" min="1" step="1" value="1000">') +
        '<div class="span-2">' + field('Description', '<input class="input" name="desc" placeholder="25% off summer collection">') + '</div>' +
        '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Create coupon</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const g = (n) => body.querySelector('[name=' + n + ']').value;
          const code = g('code').trim().toUpperCase();
          if (!code) { UI.toast({ type: 'error', title: 'Code required' }); return; }
          if (COUPONS.some(c => c.code === code)) { UI.toast({ type: 'error', title: 'Code already exists', desc: code }); return; }
          const type = g('type');
          const value = type === 'ship' ? 0 : (parseFloat(g('value')) || 0);
          COUPONS.unshift({
            code: code, desc: g('desc').trim() || (type === 'ship' ? 'Free shipping' : (type === 'fixed' ? money(value) + ' off' : value + '% off')),
            type: type, value: value, min: parseFloat(g('min')) || 0, used: 0,
            limit: parseInt(g('limit'), 10) || 1000,
            expires: new Date(g('exp') || Date.now() + 30 * 86400000).getTime(),
            active: true
          });
          UI.closeModal();
          UI.toast({ title: 'Coupon created', desc: code });
          paint();
        });
      }
    });
  }

  function flashModal() {
    UI.modal({
      title: 'Add flash sale',
      width: 620,
      body: '<div class="form-grid">' +
        '<div class="span-2">' + field('Product', '<select class="input" name="pid">' + D.products.map(p =>
          '<option value="' + h(p.id) + '">' + h(p.name) + ' — ' + h(money(p.price)) + '</option>').join('') + '</select>') + '</div>' +
        field('Discount %', '<input class="input" name="off" type="number" min="1" max="90" value="25">') +
        field('Duration (hours)', '<input class="input" name="hrs" type="number" min="1" max="72" value="6">') +
        '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Start flash sale</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const pid = body.querySelector('[name=pid]').value;
          const off = U.clamp(parseInt(body.querySelector('[name=off]').value, 10) || 20, 1, 90);
          const hrs = U.clamp(parseInt(body.querySelector('[name=hrs]').value, 10) || 6, 1, 72);
          FLASH.unshift({ id: 'fs' + (FLASH.length + 1) + '_' + Date.now().toString(36), productId: pid, off: off, endsAt: Date.now() + hrs * 3600000, claimed: 0, stock: 150 });
          UI.closeModal();
          UI.toast({ title: 'Flash sale live', desc: (D.byId(pid) || {}).name + ' · -' + off + '%' });
          paint();
        });
      }
    });
  }

  function bundleModal() {
    UI.modal({
      title: 'Create bundle',
      width: 660,
      body: '<div class="form-grid">' +
        '<div class="span-2">' + field('Bundle name', '<input class="input" name="name" placeholder="Studio Sound Bundle">') + '</div>' +
        field('Type', '<select class="input" name="type"><option value="bundle">Bundle price</option><option value="bogo">Buy one get one</option></select>') +
        field('Bundle price (USD)', '<input class="input" name="price" type="number" min="0" step="0.01" value="0">') +
        '<div class="span-2">' + field('Products', '<div class="pick-list">' + D.products.map(p =>
          '<label class="checkbox"><input type="checkbox" name="bp" value="' + h(p.id) + '"><span class="box"></span>' +
          '<img src="' + img(p.imgs[0], 64, 64) + '" alt=""><span class="pn">' + h(p.name) + '</span>' +
          '<span class="ad-sub">' + h(money(p.price)) + '</span></label>').join('') + '</div>') + '</div>' +
        '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Create bundle</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const name = body.querySelector('[name=name]').value.trim();
          if (!name) { UI.toast({ type: 'error', title: 'Name required' }); return; }
          const ids = U.qsa('[name=bp]', body).filter(x => x.checked).map(x => x.value);
          if (!ids.length) { UI.toast({ type: 'error', title: 'Pick at least one product' }); return; }
          BUNDLES.unshift({
            id: 'bd' + (BUNDLES.length + 1) + '_' + Date.now().toString(36), name: name,
            type: body.querySelector('[name=type]').value,
            price: parseFloat(body.querySelector('[name=price]').value) || 0,
            productIds: ids, active: true
          });
          UI.closeModal();
          UI.toast({ title: 'Bundle created', desc: name });
          paint();
        });
      }
    });
  }

  /* ============================================================
     13. Content
     ============================================================ */
  function contentBar() {
    return bar('Content', D.banners.length + ' banners · ' + D.categories.length + ' categories · ' + ANN.length + ' announcements',
      '<button class="btn btn-primary btn-sm" data-new-banner>' + I.icon('plus') + 'New banner</button>');
  }

  function contentBody() {
    const banners = D.banners.map(b =>
      '<div class="card"><div class="banner-prev"><img src="' + img(b.img, 640, 360) + '" alt=""><span class="ov"></span>' +
      '<div class="cap"><div style="font-weight:700;font-size:16px">' + h(b.title) + '</div>' +
      '<div style="font-size:12px;opacity:.85">' + h(b.sub || '') + '</div></div></div>' +
      '<div style="padding:14px"><div class="row-between" style="gap:8px"><div style="min-width:0">' +
      '<div style="font-weight:600">' + h(b.title) + '</div><div class="ad-sub">' + h(b.cta || 'Shop now') + '</div></div>' +
      '<div class="row" style="gap:6px"><button class="ad-iconbtn" data-edit-banner="' + h(b.id) + '" data-tip="Edit">' + I.icon('edit') + '</button>' +
      '<button class="ad-iconbtn danger" data-del-banner="' + h(b.id) + '" data-tip="Delete">' + I.icon('trash') + '</button></div></div></div></div>').join('');

    const catRows = D.categories.slice().sort((a, b) => a.order - b.order).map(c =>
      '<tr><td><div class="ad-cell"><img class="ad-thumb" src="' + img(c.img, 88, 88) + '" alt="">' +
      '<div><div class="t">' + h(c.name) + '</div><div class="s">' + n2(c.count) + ' products</div></div></div></td>' +
      '<td class="ad-mono soft">' + h(c.id) + '</td>' +
      '<td><input class="input ord-input" type="number" min="1" value="' + Number(c.order) + '" data-cat-order="' + h(c.id) + '" aria-label="Display order"></td>' +
      '<td><button class="switch' + (c.visible ? ' on' : '') + '" data-cat-vis="' + h(c.id) + '" aria-label="Toggle visibility"><i></i></button></td></tr>').join('');

    const featuredChips = FEATURED.length ? FEATURED.map(id => {
      const p = D.byId(id);
      if (!p) return '';
      return '<span class="chip"><img src="' + img(p.imgs[0], 48, 48) + '" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover">' +
        h(p.name) + '<button class="x" data-feat-remove="' + h(id) + '" aria-label="Remove">' + I.icon('x') + '</button></span>';
    }).join('') : '<span class="muted" style="font-size:14px">No featured products yet.</span>';

    const annRows = ANN.map(a =>
      '<div class="ann-row"><span class="ic">' + I.icon(a.icon) + '</span>' +
      '<div style="flex:1;min-width:0"><div style="font-weight:500">' + h(a.text) + '</div>' +
      '<div class="ad-sub">' + (a.active ? 'Visible in announcement bar' : 'Hidden') + '</div></div>' +
      '<button class="switch' + (a.active ? ' on' : '') + '" data-ann-toggle="' + h(a.id) + '" aria-label="Toggle"><i></i></button>' +
      '<button class="ad-iconbtn" data-edit-ann="' + h(a.id) + '" data-tip="Edit">' + I.icon('edit') + '</button>' +
      '<button class="ad-iconbtn danger" data-del-ann="' + h(a.id) + '" data-tip="Delete">' + I.icon('trash') + '</button></div>').join('');

    return '<div class="chart-box reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Homepage banners</h4><div class="ad-sub">Hero carousel shown on the storefront</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-new-banner>' + I.icon('plus') + 'New banner</button></div>' +
      '<div class="banner-grid">' + banners + '</div></div>' +

      '<div class="chart-box mt-5 reveal"><h4>Categories</h4><div class="ad-sub" style="margin-bottom:14px">Name, artwork, display order and visibility</div>' +
      '<div class="ad-scroll sm"><table class="table"><thead><tr><th>Category</th><th>Slug</th><th>Display order</th><th>Visible</th></tr></thead><tbody>' +
      catRows + '</tbody></table></div></div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Featured products</h4><div class="ad-sub">Pinned to the top of the shop grid</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-featured-open>' + I.icon('crown') + 'Select products</button></div>' +
      '<div class="chip-row">' + featuredChips + '</div></div>' +

      '<div class="chart-box mt-5 reveal">' +
      '<div class="row-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px"><div><h4>Announcements</h4><div class="ad-sub">Scrolling messages in the top bar</div></div>' +
      '<button class="btn btn-secondary btn-sm" data-new-ann>' + I.icon('megaphone') + 'New announcement</button></div>' +
      '<div class="col" style="gap:10px">' + annRows + '</div></div>';
  }

  function bannerModal(id) {
    const b = id ? D.banners.find(x => x.id === id) : null;
    UI.modal({
      title: b ? 'Edit banner' : 'New banner',
      width: 600,
      body: '<div class="form-grid">' +
        '<div class="span-2">' + field('Title', '<input class="input" name="title" value="' + h(b ? b.title : '') + '" placeholder="Shop The Future">') + '</div>' +
        '<div class="span-2">' + field('Subtitle', '<input class="input" name="sub" value="' + h(b ? b.sub : '') + '" placeholder="Discover products designed for the way you live.">') + '</div>' +
        field('CTA label', '<input class="input" name="cta" value="' + h(b ? b.cta : 'Shop now') + '">') +
        field('Image (Unsplash id)', '<input class="input" name="img" value="' + h(b ? b.img : '1505740420928-5e560c06d30e') + '">') +
        '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>' + (b ? 'Save' : 'Create') + '</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const g = (n) => body.querySelector('[name=' + n + ']').value;
          const title = g('title').trim();
          if (!title) { UI.toast({ type: 'error', title: 'Title required' }); return; }
          const patch = { title: title, sub: g('sub').trim(), cta: g('cta').trim() || 'Shop now', img: g('img').trim() || '1505740420928-5e560c06d30e' };
          if (b) { Object.assign(b, patch); UI.toast({ title: 'Banner updated', desc: title }); }
          else { D.banners.push(Object.assign({ id: 'b' + (D.banners.length + 1) + '_' + Date.now().toString(36) }, patch)); UI.toast({ title: 'Banner created', desc: title }); }
          UI.closeModal();
          paint();
        });
      }
    });
  }

  function featuredModal() {
    UI.modal({
      title: 'Select featured products',
      width: 640,
      body: '<div class="pick-list">' + D.products.map(p =>
        '<label class="checkbox"><input type="checkbox" name="fp" value="' + h(p.id) + '"' + (FEATURED.indexOf(p.id) >= 0 ? ' checked' : '') + '><span class="box"></span>' +
        '<img src="' + img(p.imgs[0], 64, 64) + '" alt=""><span class="pn">' + h(p.name) + '</span>' +
        '<span class="ad-sub">' + h(money(p.price)) + '</span></label>').join('') + '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Save selection</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          FEATURED.length = 0;
          U.qsa('[name=fp]', body).filter(x => x.checked).slice(0, 8).forEach(x => FEATURED.push(x.value));
          UI.closeModal();
          UI.toast({ title: 'Featured updated', desc: FEATURED.length + ' product(s) pinned' });
          paint();
        });
      }
    });
  }

  function annModal(id) {
    const a = id ? ANN.find(x => x.id === id) : null;
    UI.modal({
      title: a ? 'Edit announcement' : 'New announcement',
      width: 560,
      body: '<div class="form-grid">' +
        '<div class="span-2">' + field('Message', '<input class="input" name="text" value="' + h(a ? a.text : '') + '" placeholder="Free express shipping on orders over $75">') + '</div>' +
        '<div class="span-2">' + field('Icon', '<select class="input" name="icon">' + ANN_ICONS.map(ic =>
          '<option value="' + ic + '"' + (a && a.icon === ic ? ' selected' : '') + '>' + h(ic) + '</option>').join('') + '</select>') + '</div>' +
        '</div>',
      footer: '<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>' + (a ? 'Save' : 'Create') + '</button>',
      onMount: function (body, wrap) {
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          const text = body.querySelector('[name=text]').value.trim();
          if (!text) { UI.toast({ type: 'error', title: 'Message required' }); return; }
          const icon = body.querySelector('[name=icon]').value;
          if (a) { a.text = text; a.icon = icon; UI.toast({ title: 'Announcement updated' }); }
          else { ANN.unshift({ id: 'an' + Date.now().toString(36), text: text, icon: icon, active: true }); UI.toast({ title: 'Announcement added' }); }
          UI.closeModal();
          paint();
        });
      }
    });
  }

  /* ============================================================
     14. CSV export
     ============================================================ */
  function toCSV(rows) {
    return rows.map(r => r.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
  }
  function download(name, text) {
    try {
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return true;
    } catch (e) { return false; }
  }
  function exportData(kind) {
    let rows = [], name = 'nova-export.csv';
    if (kind === 'overview' || kind === 'analytics') {
      const n = daysOf(ST.range);
      rows = [['Date', 'Revenue', 'Orders', 'Sessions', 'New customers', 'Conversion %']];
      for (let i = 0; i < n; i++) {
        const j = DAYS - n + i;
        rows.push([U.formatDate(dayAt(j)), REV[j].toFixed(2), ORD[j], SESS[j], NEWC[j], CONV[j]]);
      }
      name = 'nova-' + kind + '-' + ST.range + '.csv';
    } else if (kind === 'products') {
      rows = [['ID', 'Name', 'Brand', 'Category', 'Price', 'Compare at', 'Stock', 'Sold', 'Rating']];
      filteredProducts().forEach(p => rows.push([p.id, p.name, p.brand, p.catName, p.price, p.was || '', p.stock, p.sold, p.rating]));
      name = 'nova-products.csv';
    } else if (kind === 'orders') {
      rows = [['Order', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Payment', 'Status']];
      filteredOrders().forEach(o => rows.push([o.id, U.formatDate(o.at), o.name, o.email, o.items.reduce((s, x) => s + x.qty, 0), o.total, o.pay, o.status]));
      name = 'nova-orders.csv';
    } else if (kind === 'customers') {
      rows = [['Name', 'Email', 'Region', 'Orders', 'LTV', 'Tier', 'Joined']];
      filteredCustomers().forEach(c => rows.push([c.name, c.email, c.region, c.orders, c.spend, c.tier.name, U.formatDate(c.joined)]));
      name = 'nova-customers.csv';
    }
    const ok = download(name, toCSV(rows));
    UI.toast({ type: ok ? 'success' : 'warn', title: ok ? 'Export ready' : 'Export failed', desc: name + ' · ' + (rows.length - 1) + ' rows' });
  }

  /* ============================================================
     15. Chart tooltip + global delegated interactions
     ============================================================ */
  function showTip(wrap, hit) {
    const tip = wrap.querySelector('.chart-tip');
    if (!tip) return;
    tip.querySelector('.tl').textContent = hit.getAttribute('data-l') || '';
    tip.querySelector('b').textContent = hit.getAttribute('data-v') || '';
    const wr = wrap.getBoundingClientRect(), hr = hit.getBoundingClientRect();
    tip.style.left = (hr.left + hr.width / 2 - wr.left) + 'px';
    tip.style.top = (hr.top - wr.top) + 'px';
    tip.classList.add('on');
    const cross = wrap.querySelector('.ad-cross'), dot = wrap.querySelector('.ad-dot');
    const cx = hit.getAttribute('data-cx'), cy = hit.getAttribute('data-cy');
    if (cross && cx) { cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.style.opacity = '1'; }
    if (dot && cx && cy) { dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.style.opacity = '1'; }
  }
  function hideTip(wrap) {
    const tip = wrap.querySelector('.chart-tip');
    if (tip) tip.classList.remove('on');
    const cross = wrap.querySelector('.ad-cross'), dot = wrap.querySelector('.ad-dot');
    if (cross) cross.style.opacity = '0';
    if (dot) dot.style.opacity = '0';
  }

  function bindGlobal() {
    document.addEventListener('mouseover', function (e) {
      const hit = e.target && e.target.closest ? e.target.closest('[data-hit]') : null;
      if (!hit) return;
      const wrap = hit.closest('.chart-wrap');
      if (wrap) showTip(wrap, hit);
    });
    document.addEventListener('mouseout', function (e) {
      const hit = e.target && e.target.closest ? e.target.closest('[data-hit]') : null;
      if (!hit) return;
      const wrap = hit.closest('.chart-wrap');
      if (wrap) hideTip(wrap);
    });

    document.addEventListener('click', function (e) {
      const t = e.target;
      const hitOf = (sel) => (t.closest ? t.closest(sel) : null);

      /* range + metric */
      const r = hitOf('[data-r]');
      if (r) { ST.range = r.getAttribute('data-r'); paint(); return; }
      const m = hitOf('[data-m]');
      if (m) { ST.metric = m.getAttribute('data-m'); paint(); return; }
      const ex = hitOf('[data-export]');
      if (ex) { exportData(ex.getAttribute('data-export')); return; }

      /* products */
      if (hitOf('[data-add-product]')) { productModal(null); return; }
      const ep = hitOf('[data-edit-product]');
      if (ep) { productModal(ep.getAttribute('data-edit-product')); return; }
      const dp = hitOf('[data-del-product]');
      if (dp) { confirmDeleteProduct(dp.getAttribute('data-del-product')); return; }
      if (hitOf('[data-pclear]')) { ST.pq = ''; ST.pcat = ''; ST.pstat = ''; ST.ppage = 1; paint(); return; }
      const pp = hitOf('[data-ppage]');
      if (pp) { ST.ppage = parseInt(pp.getAttribute('data-ppage'), 10) || 1; paint(); return; }

      /* orders */
      const os = hitOf('[data-s]');
      if (os && os.closest('[data-ostatus]')) { ST.ostatus = os.getAttribute('data-s'); ST.opage = 1; paint(); return; }
      const op = hitOf('[data-opage]');
      if (op) { ST.opage = parseInt(op.getAttribute('data-opage'), 10) || 1; paint(); return; }
      const orow = hitOf('[data-order]');
      if (orow && !hitOf('button') && !hitOf('a')) { orderModal(orow.getAttribute('data-order')); return; }

      /* customers */
      const cs = hitOf('[data-s]');
      if (cs && cs.closest('[data-csort]')) { ST.csort = cs.getAttribute('data-s'); ST.cpage = 1; paint(); return; }
      const cp = hitOf('[data-cpage]');
      if (cp) { ST.cpage = parseInt(cp.getAttribute('data-cpage'), 10) || 1; paint(); return; }
      const crow = hitOf('[data-customer]');
      if (crow) { customerModal(crow.getAttribute('data-customer')); return; }

      /* promotions */
      if (hitOf('[data-new-coupon]')) { couponModal(); return; }
      const dc = hitOf('[data-del-coupon]');
      if (dc) {
        const code = dc.getAttribute('data-del-coupon');
        const i = COUPONS.findIndex(c => c.code === code);
        if (i >= 0) { COUPONS.splice(i, 1); UI.toast({ type: 'warn', title: 'Coupon deleted', desc: code }); paint(); }
        return;
      }
      if (hitOf('[data-new-flash]')) { flashModal(); return; }
      const df = hitOf('[data-del-flash]');
      if (df) {
        const id = df.getAttribute('data-del-flash');
        const i = FLASH.findIndex(f => f.id === id);
        if (i >= 0) { FLASH.splice(i, 1); UI.toast({ type: 'warn', title: 'Flash sale removed' }); paint(); }
        return;
      }
      if (hitOf('[data-new-bundle]')) { bundleModal(); return; }
      const db = hitOf('[data-del-bundle]');
      if (db) {
        const id = db.getAttribute('data-del-bundle');
        const i = BUNDLES.findIndex(b => b.id === id);
        if (i >= 0) { BUNDLES.splice(i, 1); UI.toast({ type: 'warn', title: 'Bundle deleted' }); paint(); }
        return;
      }
      const bt = hitOf('[data-bundle-toggle]');
      if (bt) {
        const b = BUNDLES.find(x => x.id === bt.getAttribute('data-bundle-toggle'));
        if (b) { b.active = !b.active; UI.toast({ title: b.active ? 'Bundle activated' : 'Bundle paused', desc: b.name }); paint(); }
        return;
      }

      /* content */
      if (hitOf('[data-new-banner]')) { bannerModal(null); return; }
      const eb = hitOf('[data-edit-banner]');
      if (eb) { bannerModal(eb.getAttribute('data-edit-banner')); return; }
      const rb = hitOf('[data-del-banner]');
      if (rb) {
        const id = rb.getAttribute('data-del-banner');
        const i = D.banners.findIndex(b => b.id === id);
        if (i >= 0) { D.banners.splice(i, 1); UI.toast({ type: 'warn', title: 'Banner deleted' }); paint(); }
        return;
      }
      const cv = hitOf('[data-cat-vis]');
      if (cv) {
        const c = D.categories.find(x => x.id === cv.getAttribute('data-cat-vis'));
        if (c) { c.visible = !c.visible; UI.toast({ title: c.visible ? 'Category visible' : 'Category hidden', desc: c.name }); paint(); }
        return;
      }
      if (hitOf('[data-featured-open]')) { featuredModal(); return; }
      const fr = hitOf('[data-feat-remove]');
      if (fr) {
        const id = fr.getAttribute('data-feat-remove');
        const i = FEATURED.indexOf(id);
        if (i >= 0) { FEATURED.splice(i, 1); UI.toast({ title: 'Removed from featured' }); paint(); }
        return;
      }
      if (hitOf('[data-new-ann]')) { annModal(null); return; }
      const ea = hitOf('[data-edit-ann]');
      if (ea) { annModal(ea.getAttribute('data-edit-ann')); return; }
      const da = hitOf('[data-del-ann]');
      if (da) {
        const id = da.getAttribute('data-del-ann');
        const i = ANN.findIndex(a => a.id === id);
        if (i >= 0) { ANN.splice(i, 1); UI.toast({ type: 'warn', title: 'Announcement deleted' }); paint(); }
        return;
      }
      const at = hitOf('[data-ann-toggle]');
      if (at) {
        const a = ANN.find(x => x.id === at.getAttribute('data-ann-toggle'));
        if (a) { a.active = !a.active; UI.toast({ title: a.active ? 'Announcement live' : 'Announcement hidden' }); paint(); }
        return;
      }
    });

    /* search inputs (debounced) */
    const onSearch = U.debounce(function () { paint(); }, 260);
    document.addEventListener('input', function (e) {
      const el = e.target;
      if (!el || !el.getAttribute) return;
      if (el.hasAttribute('data-psearch')) { ST.pq = el.value; ST.ppage = 1; onSearch(); return; }
      if (el.hasAttribute('data-osearch')) { ST.oq = el.value; ST.opage = 1; onSearch(); return; }
      if (el.hasAttribute('data-csearch')) { ST.cq = el.value; ST.cpage = 1; onSearch(); return; }
    });

    /* selects + inline numbers */
    document.addEventListener('change', function (e) {
      const el = e.target;
      if (!el || !el.getAttribute) return;
      if (el.hasAttribute('data-pcat')) { ST.pcat = el.value; ST.ppage = 1; paint(); return; }
      if (el.hasAttribute('data-pstat')) { ST.pstat = el.value; ST.ppage = 1; paint(); return; }
      if (el.hasAttribute('data-stock')) {
        const p = D.byId(el.getAttribute('data-stock'));
        if (p) {
          const v = U.clamp(parseInt(el.value, 10) || 0, 0, 99999);
          p.stock = v; el.value = v;
          UI.toast({ type: v <= 10 ? 'warn' : 'success', title: 'Stock updated', desc: p.name + ' → ' + v });
          paint();
        }
        return;
      }
      if (el.hasAttribute('data-cat-order')) {
        const c = D.categories.find(x => x.id === el.getAttribute('data-cat-order'));
        if (c) { c.order = U.clamp(parseInt(el.value, 10) || 1, 1, 99); el.value = c.order; UI.toast({ title: 'Order saved', desc: c.name + ' → ' + c.order }); }
        return;
      }
    });
  }

  /* ============================================================
     16. Routes
     ============================================================ */
  function init() {
    injectCSS();
    bindGlobal();
    window.addEventListener('hashchange', function () { clearTimers(); });
  }
  init();

  NOVA.Admin = {
    state: ST,
    data: { CUSTOMERS: CUSTOMERS, ORDERS: ORDERS, COUPONS: COUPONS, FLASH: FLASH, BUNDLES: BUNDLES, ANN: ANN, FEATURED: FEATURED, CAT_SALES: CAT_SALES },
    series: { REV: REV, ORD: ORD, SESS: SESS, NEWC: NEWC, RETC: RETC, CONV: CONV, LABELS: LABELS }
  };

  NOVA.Router.register('/admin', function () { return route('overview', overviewBar, overviewBody); });
  NOVA.Router.register('/admin/products', function () { return route('products', productsBar, productsBody); });
  NOVA.Router.register('/admin/orders', function () { return route('orders', ordersBar, ordersBody); });
  NOVA.Router.register('/admin/customers', function () { return route('customers', customersBar, customersBody); });
  NOVA.Router.register('/admin/analytics', function () { return route('analytics', analyticsBar, analyticsBody); });
  NOVA.Router.register('/admin/promotions', function () { return route('promotions', promotionsBar, promotionsBody); });
  NOVA.Router.register('/admin/content', function () { return route('content', contentBar, contentBody); });
})();
