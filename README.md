## Quick start

### Option 1 — Just open it

```
Double-click index.html
```

That's it. There is nothing to install and nothing to compile.

> Requires an internet connection on first load: product photography is served from Unsplash and the Inter typeface from Google Fonts. Offline, the layout still renders but images will be empty.

### Option 2 — Local server (recommended)

Some browsers apply stricter rules to `file://` origins. A one-line server avoids all of it:

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve -l 8080
```

Then open <http://localhost:8080>.

### Option 3 — Deploy

It is 100% static, so any host works:

```bash
# GitHub Pages: push to main, then Settings → Pages → Deploy from branch → main / (root)
# Netlify / Vercel: drag the folder, or connect the repo — no build command, no output directory
```

---

## Live demo

Add your GitHub Pages URL here once deployed:

```
https://<your-username>.github.io/<your-repo>/
```

---

## Feature overview

### Storefront

| Feature | Notes |
|---|---|
| Announcement bar | Rotating ticker, respects reduced-motion |
| Sticky navigation | Shrinks and gains backdrop blur on scroll; mega-menu on desktop, hamburger + bottom nav on mobile |
| Cinematic hero | Parallax layers, floating product cards, aurora gradient |
| Category explorer | 11 categories as large image cards with hover zoom and product counts |
| Product cards | Dual-image crossfade, colour swatches, badges, wishlist, quick-view, quick-add |
| Flash sale | Live countdown timer, stock progress bars, "only N left" urgency |
| Recommendations | Recently viewed, related products, frequently-bought-together |

### Catalogue & discovery

| Feature | Notes |
|---|---|
| Shop page | 10 filter dimensions — category, brand, price, rating, colour, size, availability, discount, material, features |
| Filtering | Multi-select, range sliders, search-within-filters, active filter chips, clear-all |
| Sorting | Recommended, popular, newest, price ↑/↓, highest rated, biggest discount |
| Search overlay | Debounced live results across products, brands and categories, with "Did you mean…?" correction |
| Brand directory | A–Z alphabetical navigation, brand search, 18 brands with featured products |
| Comparison | Side-by-side table of up to 4 products with spec-diff highlighting |

### Commerce

| Feature | Notes |
|---|---|
| Cart drawer | Slide-out with quantity controls, save-for-later, remove, free-shipping progress bar |
| Cart page | Full-page variant with coupon entry and trust badges |
| Checkout | 5 steps — Cart → Information → Shipping → Payment → Confirmation |
| Validation | Inline, real-time field validation with accessible error messaging |
| Payment methods | Card (with brand detection and Luhn check), PayPal, Apple Pay, Google Pay, instalments |
| Coupons | `NOVA10` (10% off), `FLASH20` (20% off, min $150), `SHIPFREE`, `GOLD50` ($50 off, min $400) |

### Account

Overview · Orders (with tracking timeline) · Wishlist · Address book (CRUD + default) · Saved payment methods · Rewards & tiers · Notification centre · Settings (profile, password, notifications, privacy, theme, language, currency)

### Rewards

Four tiers — Bronze, Silver, Gold, Platinum. Points earned from purchases, reviews, referrals, birthdays, daily check-in and promotions, and redeemable for discounts.

### ShopAI assistant

A floating assistant with a small intent-parsing engine. It understands budget constraints, product categories, attribute requests and comparisons:

```
"Find me a gaming laptop under $1,500."
"Show me wireless headphones with the best battery life."
"What should I buy for my girlfriend?"
"Compare the iPhone 17 Pro Max and Galaxy S25."
```

Responses render as product cards with direct **Add to cart** actions.

### Merchant admin

Overview (KPIs + hand-written inline SVG charts) · Products (CRUD, inventory, pagination) · Orders (status workflow, refunds) · Customers (profiles, LTV) · Analytics (revenue, orders, category split, cohort growth, conversion funnel) · Promotions (coupons, flash sales, bundles) · Content (banners, categories, featured products, announcements)

Every chart is hand-written SVG — no Chart.js, no D3.

---

## Project structure

```
.
├── index.html                 Entry point. Loads CSS, then JS in strict dependency order.
└── assets/
    ├── css/
    │   ├── tokens.css         Design tokens: colour, spacing, radii, shadows, z-index, themes
    │   ├── base.css           Reset, typography, focus states, keyframes, reduced-motion guards
    │   ├── components.css     Buttons, cards, inputs, modals, drawers, toasts, tabs, skeletons
    │   ├── layout.css         Navbar, footer, hero, announcement bar, mobile navigation
    │   └── pages.css          Page-specific styles: shop, product, checkout, account, admin
    └── js/
        ├── icons.js           83 inline SVG icons            — load 1st
        ├── core.js            Utils, Store, Router, i18n     — load 2nd
        ├── data.js            Catalogue, orders, coupons     — load 3rd
        ├── ui.js              Toast, Modal, ProductCard, …   — load 4th
        ├── pages-home.js      Route: /
        ├── pages-shop.js      Route: /shop
        ├── pages-product.js   Route: /product/:id
        ├── pages-account.js   Routes: /account/*
        ├── pages-misc.js      Brands, deals, compare, search, static pages, 404
        ├── checkout.js        Cart page + 5-step checkout
        ├── admin.js           Merchant dashboard
        ├── assistant.js       ShopAI + floating compare bar
        └── app.js             Shell bootstrap and router start — load last
```

**19 files · ~11,900 lines · 0 dependencies.**

> ⚠️ **Do not reorder the `<script>` tags.** The load order is a real dependency chain: `icons → core → data → ui → pages → assistant → app`.

---

## Architecture

### Global namespace

Everything hangs off a single global, `NOVA`:

```js
NOVA.U       // Utilities: qs, qsa, h (escape), uid, clamp, debounce, rnd, slug, formatDate, timeAgo, sleep
NOVA.Store   // State container (alias: S)
NOVA.Data    // Domain data (alias: D)
NOVA.ICONS   // Icon set (alias: I)
NOVA.UI      // Renderers and overlays (alias: UI)
NOVA.Router  // Hash router
NOVA.img     // Image URL builder
NOVA.ShopAI  // Assistant
```

### State management

A tiny observable store with pub/sub:

```js
const S = NOVA.Store;

S.set({ currency: 'EUR' });      // Patch state — persists to localStorage
S.on('cart', fn);                // Subscribe to a topic
S.addToCart('p-014', 2, { color: 'Midnight', size: 'M' });
S.toggleWishlist('p-014');
S.money(1299);                   // → "€1,194.28" (respects active currency)
```

State is persisted to `localStorage` under the `nova.` prefix. Topics include `cart`, `wishlist`, `compare`, `theme`, `points`, `notifications`, `orders`.

### Routing

A hash router with `:param` support and query strings:

```js
NOVA.Router.register('/product/:id', async function (ctx) {
  const product = NOVA.Data.byId(ctx.params.id);
  document.querySelector('#view').innerHTML = render(product);
});

NOVA.Router.notFound(notFoundHandler);
NOVA.Router.go('/shop');
```

### Rendering

Deliberately simple and fast: pages are string templates assigned to `#view.innerHTML`, then enhanced.

```js
const view = U.qs('#view');
view.innerHTML = html;
UI.observeReveals(view);   // Wire scroll-reveal
UI.wireCarousel(view);     // Wire carousel arrows
```

Declarative interactions use delegated data attributes — no manual event binding:

```html
<button data-add="p-014">Add to cart</button>
<button data-wish="p-014">Wishlist</button>
<button data-quick="p-014">Quick view</button>
<button data-compare="p-014">Compare</button>
```

---

## Design system

| Token | Value |
|---|---|
| Accent | A single indigo–violet ramp — used for CTAs, links, active states and badges only |
| Neutrals | White, off-white, soft grey, charcoal, black |
| Typeface | Inter (400 / 500 / 600 / 700 / 800) |
| Spacing | Strict 8px scale |
| Radii | 8 / 12 / 16 / 24px |
| Motion | 150–400ms, cubic-bezier(.2,.7,.3,1) |
| Themes | Light and dark, hand-tuned — dark is **not** an inversion |

Dark mode is a considered palette: elevated surfaces, adjusted border luminance, softened shadows and re-balanced accent saturation. The choice persists and is applied before first paint to prevent a flash.

---

## Routing

36 routes. Append any of these to the URL after `index.html#`:

| Route | Page |
|---|---|
| `/` | Home |
| `/shop` | Shop with full filtering |
| `/product/:id` | Product detail |
| `/cart` · `/checkout` · `/checkout/confirm/:orderId` | Commerce flow |
| `/wishlist` · `/compare` | Wishlist · Comparison |
| `/search?q=…` | Search results |
| `/brands` · `/brand/:id` | Brand directory · Brand page |
| `/deals` · `/new-arrivals` | Deals · New arrivals |
| `/account` · `/account/orders` · `/account/wishlist` | Account |
| `/account/addresses` · `/account/payments` | Account |
| `/account/rewards` · `/account/notifications` · `/account/settings` | Account |
| `/admin` · `/admin/products` · `/admin/orders` | Merchant admin |
| `/admin/customers` · `/admin/analytics` | Merchant admin |
| `/admin/promotions` · `/admin/content` | Merchant admin |
| `/about` · `/contact` · `/faq` · `/shipping` · `/returns` · `/legal` | Content |
| *anything else* | Styled 404 |

---

## Data model

```js
{
  id: 'p-014',
  name: 'Aurora Slim 13 Ultrabook',
  brand: 'Aurora', brandId: 'b-aurora',
  cat: 'electronics', catName: 'Electronics',
  price: 1249, was: 1499, off: 17,
  rating: 4.5, reviews: 318,
  imgs: ['1517336714731-489689fd1ca8', /* … */],
  colors: [{ name: 'Midnight', hex: '#1c1c22' }],
  sizes: ['13"', '15"'],
  stock: 24, sold: 1840, ageDays: 21,
  desc, features, specs, included,
  material, warranty, shipDays, tags, badge
}
```

Seed data: **63 products · 11 categories · 18 brands · 8 orders · 4 coupons.**

---

## Internationalisation & currency

- **Languages:** English, 简体中文, Español — extend by adding a key to `I18N` in `core.js`
- **Currencies:** USD, EUR, GBP, CNY, JPY, AUD — add to `CURRENCIES` in `core.js`

Both are switchable at runtime from **Account → Settings**.

---

## Persistence

State is written to `localStorage` under `nova.*`. To reset:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith('nova.'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

Or in DevTools: **Application → Local Storage → Clear**.

---

## Extending the project

**Add a product** — append to the `products` array in `data.js`, or add an entry to `TEMPLATES` and let the generator build variants.

**Add a page** — create your route handler, then register it:

```js
NOVA.Router.register('/gift-cards', async function (ctx) {
  const view = U.qs('#view');
  view.innerHTML = UI.skeletonGrid(8);          // Loading state first
  await U.sleep(320);
  view.innerHTML = renderGiftCards();
  UI.observeReveals(view);
});
```

**Add an icon** — add a path to the `p` object in `icons.js`, then `I.icon('yourIcon')`.

**Add a filter facet** — extend the filter state in `pages-shop.js`; the render pipeline reads it declaratively.

**Change the accent colour** — edit the `--accent-*` ramp in `tokens.css`. Because every component references tokens, one edit re-themes the entire application in both light and dark modes.

---

## Accessibility

- Semantic HTML landmarks (`header`, `main`, `footer`, `nav`) with ARIA labels
- Skip-to-content link as the first focusable element
- Visible focus rings on every interactive element
- Full keyboard support — `Esc` closes modals and drawers, focus is trapped while open
- `prefers-reduced-motion` disables parallax, tickers and transforms
- `aria-live` regions for cart updates and toasts
- Colour contrast meets WCAG AA in both themes

---

## Performance

- Responsive images via `srcset` and native lazy loading
- Debounced search (no request storm while typing)
- Skeleton screens instead of blank states
- `IntersectionObserver` for scroll reveals (no scroll listeners)
- Deterministic seeded RNG so admin charts render identically every time
- No framework reconciliation — direct string rendering keeps it fast

---

## Browser support

| Browser | Minimum |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 15+ |
| iOS Safari | 15+ |
| Android Chrome | 90+ |

Uses `IntersectionObserver`, CSS custom properties, `backdrop-filter` and hash-based routing. No polyfills required for the targets above.

---

## Known limitations

Read these before using it as a starting point:

1. **No backend.** Cart, orders, wishlist and admin edits live in `localStorage` only. Clearing site data resets everything.
2. **No real payments.** Card forms validate format and Luhn checksums but never transmit anything.
3. **Images are remote.** Photography is hot-linked from Unsplash; for production, self-host and add caching.
4. **Single-file build is not minified.** Fine for demos; minify before production.
5. **ShopAI is rule-based.** It is an intent parser over the local catalogue, not an LLM. No network calls.
6. **Admin is unauthenticated.** Anyone can reach `#/admin`. Add real auth before deploying.
7. **No automated tests.** Verification was done via Playwright smoke tests across all 36 routes.

---

## Roadmap

- [ ] Service worker + offline catalogue caching
- [ ] Self-hosted, optimised image pipeline (AVIF/WebP)
- [ ] Real backend integration with a documented REST contract
- [ ] Vitest unit tests for Store, Router and filter logic
- [ ] Production build: minify, bundle, tree-shake
- [ ] Server-side rendering for SEO and first-paint speed
- [ ] Additional locales and RTL support

---

## Contributing

Pull requests are welcome.

1. Fork the repository
2. Create a branch — `git checkout -b feature/your-feature`
3. Commit — `git commit -m "Add your feature"`
4. Push — `git push origin feature/your-feature`
5. Open a Pull Request

**Guidelines**

- No dependencies. Keep it vanilla — that is the point of the project.
- Respect the 8px spacing scale and existing design tokens; no hard-coded colours.
- Escape every dynamic string with `U.h()` before inserting it into HTML.
- Keep motion between 150–400ms and honour `prefers-reduced-motion`.
- Test in both light and dark themes, and at 390px, 768px and 1440px widths.

---

## Credits

- **Photography** — [Unsplash](https://unsplash.com)
- **Typeface** — [Inter](https://rsms.me/inter/) by Rasmus Andersson
- **Icons** — hand-authored inline SVG
---

<div align="center">
Built as a reference for what a modern storefront can be without a framework.
</div>
