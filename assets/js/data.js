/* ============================================================
   NOVA — Data layer: categories, brands, products, reviews, orders
   ============================================================ */
window.NOVA = window.NOVA || {};
(function () {
  const U = NOVA.U;

  /* -------- Image helper -------- */
  const IMG_BASE = 'https://images.unsplash.com/photo-';
  function img(id, w, h) {
    const q = 'auto=format&fit=crop&q=72';
    if (w && h) return IMG_BASE + id + '?' + q + '&w=' + w + '&h=' + h;
    return IMG_BASE + id + '?' + q + '&w=900';
  }
  function srcset(id, w) {
    return img(id, w, Math.round(w * 1.25)) + ' 1x, ' + img(id, w * 2, Math.round(w * 2.5)) + ' 2x';
  }
  NOVA.img = img; NOVA.srcset = srcset;

  /* -------- Categories -------- */
  const categories = [
    { id: 'electronics', name: 'Electronics', img: '1496181133206-80ce9b88a853', count: 0, icon: 'phone', blurb: 'Phones, laptops & cameras' },
    { id: 'audio', name: 'Audio', img: '1505740420928-5e560c06d30e', count: 0, icon: 'sparkle', blurb: 'Headphones & speakers' },
    { id: 'fashion', name: 'Fashion', img: '1567016432779-094069958ea5', count: 0, icon: 'shirt', blurb: 'Apparel & outerwear' },
    { id: 'shoes', name: 'Shoes', img: '1542291026-7eec264c27ff', count: 0, icon: 'shoe', blurb: 'Sneakers & heels' },
    { id: 'beauty', name: 'Beauty', img: '1541643600914-78b084683601', count: 0, icon: 'drop', blurb: 'Skincare & fragrance' },
    { id: 'home', name: 'Home & Living', img: '1555041469-a586c61ea9bc', count: 0, icon: 'sofa', blurb: 'Furniture & decor' },
    { id: 'gaming', name: 'Gaming', img: '1592750475338-74b7b21085ab', count: 0, icon: 'gamepad', blurb: 'Rigs & peripherals' },
    { id: 'accessories', name: 'Accessories', img: '1572635148818-ef6fd45eb394', count: 0, icon: 'bag', blurb: 'Everyday carry' },
    { id: 'sports', name: 'Sports', img: '1560769629-975ec94e6a86', count: 0, icon: 'bolt', blurb: 'Training & outdoors' },
    { id: 'watches', name: 'Watches', img: '1523170335258-f5ed11844a49', count: 0, icon: 'watch', blurb: 'Timepieces & smart' },
    { id: 'bags', name: 'Bags', img: '1548036328-c9fa89d128fa', count: 0, icon: 'bag', blurb: 'Handbags & backpacks' }
  ];

  /* -------- Brands -------- */
  const brands = [
    { id: 'apple', name: 'Apple', letter: 'A', products: 0, blurb: 'Personal technology, refined.' },
    { id: 'aurora', name: 'Aurora', letter: 'A', products: 0, blurb: 'Design-led home objects.' },
    { id: 'bose', name: 'Bose', letter: 'B', products: 0, blurb: 'Sound that disappears into music.' },
    { id: 'canon', name: 'Canon', letter: 'C', products: 0, blurb: 'Optics for every story.' },
    { id: 'dyson', name: 'Dyson', letter: 'D', products: 0, blurb: 'Engineering for the home.' },
    { id: 'everlane', name: 'Everlane', letter: 'E', products: 0, blurb: 'Radically transparent basics.' },
    { id: 'fossil', name: 'Fossil', letter: 'F', products: 0, blurb: 'Modern vintage watches.' },
    { id: 'glossier', name: 'Glossier', letter: 'G', products: 0, blurb: 'Skincare first, makeup second.' },
    { id: 'herschel', name: 'Herschel', letter: 'H', products: 0, blurb: 'Bags built for the long way round.' },
    { id: 'lumen', name: 'Lumen', letter: 'L', products: 0, blurb: 'Ambient lighting, quietly smart.' },
    { id: 'nike', name: 'Nike', letter: 'N', products: 0, blurb: 'Innovation for every athlete.' },
    { id: 'nordic', name: 'Nordic', letter: 'N', products: 0, blurb: 'Scandinavian furniture, flat-packed.' },
    { id: 'razer', name: 'Razer', letter: 'R', products: 0, blurb: 'For gamers. By gamers.' },
    { id: 'sony', name: 'Sony', letter: 'S', products: 0, blurb: 'Feel the entertainment.' },
    { id: 'samsung', name: 'Samsung', letter: 'S', products: 0, blurb: 'Do what you can’t.' },
    { id: 'uniqlo', name: 'Uniqlo', letter: 'U', products: 0, blurb: 'LifeWear for all.' },
    { id: 'vessel', name: 'Vessel', letter: 'V', products: 0, blurb: 'Hydration, engineered.' },
    { id: 'zara', name: 'Zara', letter: 'Z', products: 0, blurb: 'Runway to rack, fast.' }
  ];

  /* -------- Content templates -------- */
  const TEMPLATES = {
    audio: {
      features: [
        { icon: 'sparkle', t: 'Adaptive noise cancellation', d: 'Eight microphones read your environment 700× per second and tune the cancellation in real time.' },
        { icon: 'bolt', t: 'All-day battery', d: 'Up to 40 hours of playback with ANC on. A 5-minute charge gives you 4 hours.' },
        { icon: 'globe', t: 'Multipoint pairing', d: 'Stay connected to two devices at once and switch between them without touching a menu.' }
      ],
      specs: { 'Driver': '40 mm dynamic', 'Frequency response': '4 Hz – 40 kHz', 'Battery life': '40 h (ANC on)', 'Charging': 'USB-C, 5 min → 4 h', 'Bluetooth': '5.3, LDAC + AAC', 'Weight': '254 g', 'Water resistance': 'IPX4' },
      included: ['Headphones', 'Hard travel case', 'USB-C charging cable', '3.5 mm audio cable', 'Airline adapter'],
      material: 'Aluminium + protein leather', warranty: '2 years'
    },
    phone: {
      features: [
        { icon: 'camera', t: 'Pro camera system', d: 'A 48 MP main sensor with sensor-shift stabilisation and a 5× telephoto lens.' },
        { icon: 'bolt', t: 'All-day battery', d: 'Up to 29 hours of video playback, with 50% charge in 30 minutes.' },
        { icon: 'shield', t: 'Ceramic Shield front', d: 'Tougher than any smartphone glass, with an aerospace-grade aluminium frame.' }
      ],
      specs: { 'Display': '6.7" Super Retina XDR', 'Chip': 'A18 Pro, 6-core GPU', 'Main camera': '48 MP f/1.6', 'Battery': '29 h video playback', 'Water resistance': 'IP68', 'Storage': '256 GB', 'Weight': '199 g' },
      included: ['Handset', 'USB-C cable', 'SIM eject tool', 'Quick start guide'],
      material: 'Aluminium & glass', warranty: '1 year'
    },
    laptop: {
      features: [
        { icon: 'bolt', t: 'Desktop-class performance', d: 'A 12-core CPU with hardware ray tracing and a 16-core Neural Engine.' },
        { icon: 'sparkle', t: 'Liquid Retina XDR', d: '1600 nits peak brightness, 1 billion colours, ProMotion up to 120 Hz.' },
        { icon: 'shield', t: 'All-day battery', d: 'Up to 22 hours on a single charge so the charger can stay at home.' }
      ],
      specs: { 'Display': '14.2" Liquid Retina XDR', 'Chip': 'M4 Pro, 12-core CPU', 'Memory': '24 GB unified', 'Storage': '512 GB SSD', 'Ports': '3× Thunderbolt 5, HDMI, SD', 'Battery': '22 h', 'Weight': '1.55 kg' },
      included: ['Laptop', '140 W USB-C adapter', 'USB-C charge cable'],
      material: 'Recycled aluminium', warranty: '1 year'
    },
    camera: {
      features: [
        { icon: 'camera', t: 'Full-frame sensor', d: 'A 45 MP back-illuminated sensor with 15 stops of dynamic range.' },
        { icon: 'bolt', t: '8-stop stabilisation', d: 'In-body image stabilisation gives you sharp handheld shots at 1/8 s.' },
        { icon: 'sparkle', t: '8K video', d: 'Internal 8K/30p RAW recording with full-pixel readout.' }
      ],
      specs: { 'Sensor': '45 MP full-frame CMOS', 'ISO': '64 – 102 400', 'Video': '8K/30p, 4K/120p', 'Viewfinder': '5.76 M-dot OLED', 'Mount': 'RF', 'Weight': '660 g' },
      included: ['Camera body', 'Battery', 'Charger', 'Strap', 'Body cap'],
      material: 'Magnesium alloy', warranty: '2 years'
    },
    watch: {
      features: [
        { icon: 'bolt', t: 'Advanced health sensing', d: 'ECG, blood oxygen, skin temperature and sleep-stage tracking, around the clock.' },
        { icon: 'sparkle', t: 'Always-on display', d: '3000-nit peak brightness so it stays readable in direct sunlight.' },
        { icon: 'shield', t: 'Built to roam', d: '100 m water resistance and a titanium case that shrugs off the everyday.' }
      ],
      specs: { 'Case': '46 mm titanium', 'Display': 'Always-On Retina, 3000 nits', 'Battery': '36 h (72 h low power)', 'Water': '100 m / IP6X', 'Connectivity': 'LTE + Bluetooth 5.3', 'Sensors': 'ECG, SpO₂, temperature' },
      included: ['Watch', 'Sport band', 'Magnetic charger'],
      material: 'Titanium', warranty: '2 years'
    },
    shoe: {
      features: [
        { icon: 'bolt', t: 'Responsive cushioning', d: 'A full-length foam midsole returns energy with every stride.' },
        { icon: 'sparkle', t: 'Engineered upper', d: 'Breathable knit with targeted zones of support where you need them.' },
        { icon: 'shield', t: 'Durable outsole', d: 'Abrasion-resistant rubber with a traction pattern tested on wet surfaces.' }
      ],
      specs: { 'Upper': 'Engineered knit', 'Midsole': 'Nitrogen-infused foam', 'Drop': '8 mm', 'Weight': '264 g (US 9)', 'Fit': 'True to size', 'Care': 'Spot clean' },
      included: ['Shoes', 'Extra laces', 'Dust bag'],
      material: 'Recycled knit & rubber', warranty: '1 year'
    },
    bag: {
      features: [
        { icon: 'shield', t: 'Weather-resistant shell', d: 'A coated canvas body with sealed zips keeps contents dry in a downpour.' },
        { icon: 'sparkle', t: 'Smart organisation', d: 'A padded 16" laptop sleeve plus eight internal pockets for the small things.' },
        { icon: 'bolt', t: 'Comfort carry', d: 'Contoured straps and a ventilated back panel spread the load evenly.' }
      ],
      specs: { 'Capacity': '28 L', 'Laptop': 'Fits up to 16"', 'Material': 'Coated canvas', 'Water resistance': 'IPX3', 'Weight': '980 g', 'Dimensions': '46 × 30 × 16 cm' },
      included: ['Bag', 'Rain cover', 'Luggage strap'],
      material: 'Coated canvas & leather trim', warranty: '5 years'
    },
    beauty: {
      features: [
        { icon: 'drop', t: 'Clinically tested', d: 'Dermatologist-tested, non-comedogenic and suitable for sensitive skin.' },
        { icon: 'sparkle', t: 'Clean formulation', d: 'No parabens, sulphates or synthetic fragrance. Cruelty-free and vegan.' },
        { icon: 'shield', t: 'Visible results', d: '92% of users reported visibly smoother skin after four weeks of use.' }
      ],
      specs: { 'Volume': '50 ml', 'Skin type': 'All skin types', 'Key actives': 'Niacinamide, squalane', 'Free from': 'Parabens, sulphates', 'Cruelty-free': 'Yes', 'Shelf life': '24 months' },
      included: ['Product', 'Applicator', 'Instruction card'],
      material: 'Recycled glass bottle', warranty: '30-day satisfaction guarantee'
    },
    home: {
      features: [
        { icon: 'sparkle', t: 'Designed to last', d: 'Solid hardwood frame with mortise-and-tenon joinery, built for a decade of use.' },
        { icon: 'bolt', t: 'Easy assembly', d: 'Tool-light assembly in under 20 minutes with clear printed instructions.' },
        { icon: 'shield', t: 'Responsibly sourced', d: 'FSC-certified timber and low-VOC finishes throughout.' }
      ],
      specs: { 'Dimensions': '210 × 92 × 78 cm', 'Frame': 'Solid hardwood', 'Upholstery': 'Performance weave', 'Assembly': 'Under 20 min', 'Weight capacity': '340 kg', 'Care': 'Vacuum, spot clean' },
      included: ['Item', 'Assembly hardware', 'Care guide'],
      material: 'FSC hardwood & performance fabric', warranty: '10 years'
    },
    gaming: {
      features: [
        { icon: 'bolt', t: 'Tournament-grade latency', d: '1 ms wireless response with a 1000 Hz polling rate — no perceptible lag.' },
        { icon: 'sparkle', t: 'Customisable RGB', d: 'Per-key lighting with 16.8 million colours and onboard profiles.' },
        { icon: 'shield', t: 'Built for the grind', d: 'Rated for 80 million keystrokes with hot-swappable switches.' }
      ],
      specs: { 'Switches': 'Hot-swappable optical', 'Polling rate': '1000 Hz', 'Latency': '1 ms', 'Lighting': 'Per-key RGB', 'Connection': 'USB-C + 2.4 GHz', 'Weight': '880 g' },
      included: ['Device', 'USB-C cable', 'Switch puller', 'Extra switches'],
      material: 'Aircraft aluminium', warranty: '2 years'
    },
    fashion: {
      features: [
        { icon: 'sparkle', t: 'Premium fabric', d: 'A heavyweight cotton blend that holds its shape wash after wash.' },
        { icon: 'bolt', t: 'Considered fit', d: 'Cut from a 3D body scan for a fit that moves with you.' },
        { icon: 'shield', t: 'Made to last', d: 'Reinforced seams and colourfast dyes tested to 50 washes.' }
      ],
      specs: { 'Fabric': '98% cotton, 2% elastane', 'Weight': '320 gsm', 'Fit': 'Regular', 'Care': 'Machine wash 30°C', 'Origin': 'Made in Portugal', 'Sizes': 'XS – XXL' },
      included: ['Garment', 'Care card'],
      material: 'Long-staple cotton', warranty: '1 year'
    },
    appliance: {
      features: [
        { icon: 'bolt', t: 'High-efficiency motor', d: 'A digital motor spinning at 125 000 rpm with a sealed filtration system.' },
        { icon: 'sparkle', t: 'Whisper quiet', d: 'Acoustically engineered to run 30% quieter than the previous generation.' },
        { icon: 'shield', t: 'Whole-home coverage', d: 'Captures 99.95% of particles down to 0.1 microns across 80 m².' }
      ],
      specs: { 'Coverage': '80 m²', 'Filtration': 'HEPA H13 + carbon', 'Noise': '56 dB max', 'Power': '45 W', 'Filter life': '12 months', 'Warranty': '2 years' },
      included: ['Unit', 'Remote', 'Filters (2)', 'Manual'],
      material: 'Recycled ABS', warranty: '2 years'
    }
  };

  const DESC = {
    Electronics: 'Engineered around a single idea: technology should disappear so you can get on with what matters. Every detail — from the materials to the acoustics — has been tuned in our studio until nothing is left to improve.',
    Audio: 'Tuned by acoustic engineers over eighteen months, this is sound with nothing added and nothing taken away. Hear the room, the breath, the silence between notes.',
    Fashion: 'Cut from fabric we develop with mills we have worked with for years. The result is a piece that looks considered on day one and still feels right in year five.',
    Shoes: 'Built on a last refined across thousands of foot scans. Cushioned where you land, supported where you push, and quiet enough to forget you are wearing them.',
    Beauty: 'Formulated with a short, honest ingredient list at active concentrations that actually do something. No filler, no fragrance, no false promises.',
    'Home & Living': 'Designed in-house and built to be lived on. Generous proportions, honest materials and joinery that will outlast the trend cycle.',
    Gaming: 'Built with input from players who compete for a living. Every millisecond, every switch, every gram is there for a reason.',
    Accessories: 'The small things you touch every day, made properly. Considered materials, quiet branding and hardware that will not let you down.',
    Sports: 'Tested on real training blocks, not in a lab. Moisture management, chafe-free seams and durability that survives the wash cycle.',
    Watches: 'A timepiece built to be worn daily and noticed occasionally. Hand-finished details, a movement you can service, and a case that ages well.',
    Bags: 'Designed around how people actually carry things. Balanced when full, protective where it counts, and quiet enough for any room.'
  };

  /* -------- Product factory -------- */
  const COLOR_POOL = [
    { name: 'Midnight', hex: '#15161C' }, { name: 'Silver', hex: '#C9CCD3' }, { name: 'Sand', hex: '#D8C6A8' },
    { name: 'Graphite', hex: '#4A4E57' }, { name: 'Ivory', hex: '#F3EFE7' }, { name: 'Pacific', hex: '#2F5D8C' },
    { name: 'Clay', hex: '#B4654A' }, { name: 'Forest', hex: '#2F4A3C' }, { name: 'Onyx', hex: '#0B0B0D' },
    { name: 'Blush', hex: '#E6C2C4' }
  ];
  function pickColors(seed, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(COLOR_POOL[(seed * 3 + i * 7) % COLOR_POOL.length]);
    return out.filter((c, i, a) => a.findIndex(x => x.name === c.name) === i);
  }

  let pid = 0;
  function P(o) {
    pid++;
    const seed = pid;
    const id = o.id || ('p' + String(1000 + pid));
    const tpl = TEMPLATES[o.sub] || TEMPLATES.home;
    const catObj = categories.find(c => c.id === o.cat) || categories[0];
    const p = {
      id: id,
      name: o.name,
      brand: o.brand,
      brandId: U.slug(o.brand),
      cat: o.cat,
      catName: catObj.name,
      sub: o.sub,
      price: o.price,
      was: o.was || null,
      rating: o.rating,
      reviews: o.reviews,
      imgs: o.imgs,
      video: o.video || null,
      colors: o.colors || pickColors(seed, o.ncolors || 3),
      sizes: o.sizes || null,
      badge: o.badge || null,
      stock: o.stock != null ? o.stock : 40 + Math.floor(U.rnd(seed) * 200),
      sold: o.sold != null ? o.sold : 200 + Math.floor(U.rnd(seed * 2) * 9000),
      ageDays: o.age != null ? o.age : Math.floor(U.rnd(seed * 5) * 220),
      desc: o.desc || DESC[catObj.name] || DESC.Electronics,
      features: o.features || tpl.features,
      specs: o.specs || tpl.specs,
      included: o.included || tpl.included,
      material: o.material || tpl.material,
      warranty: o.warranty || tpl.warranty,
      shipDays: o.shipDays || (2 + Math.floor(U.rnd(seed) * 4)),
      freeShip: o.freeShip !== false,
      tags: o.tags || [],
      saleEnd: o.saleEnd || null
    };
    p.off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    return p;
  }

  /* -------- Catalog -------- */
  const products = [
    /* --- Audio --- */
    P({ name: 'Sony WH-1000XM6 Wireless Headphones', brand: 'Sony', cat: 'audio', sub: 'audio', price: 399, was: 449, rating: 4.8, reviews: 342, imgs: ['1505740420928-5e560c06d30e', '1560343090-f0409e92791a', '1585386959984-a4155224a1ad'], badge: 'best', tags: ['anc', 'over-ear'], ncolors: 4, stock: 62 }),
    P({ name: 'Aurora Studio Pro ANC Headphones', brand: 'Aurora', cat: 'audio', sub: 'audio', price: 289, was: 349, rating: 4.6, reviews: 188, imgs: ['1560343090-f0409e92791a', '1505740420928-5e560c06d30e', '1585386959984-a4155224a1ad'], badge: 'new', age: 9, ncolors: 3 }),
    P({ name: 'Bose QuietComfort Ultra Earbuds', brand: 'Bose', cat: 'audio', sub: 'audio', price: 249, was: 299, rating: 4.7, reviews: 1204, imgs: ['1596462502278-27bfdc403348', '1572569511254-d8f925fe2cbb', '1585386959984-a4155224a1ad'], badge: 'best', ncolors: 3 }),
    P({ name: 'Sony LinkBuds Open Wireless Earbuds', brand: 'Sony', cat: 'audio', sub: 'audio', price: 179, rating: 4.3, reviews: 512, imgs: ['1572569511254-d8f925fe2cbb', '1596462502278-27bfdc403348'], age: 40, ncolors: 2 }),
    P({ name: 'Aurora SoundCore 360 Speaker', brand: 'Aurora', cat: 'audio', sub: 'audio', price: 199, was: 259, rating: 4.5, reviews: 276, imgs: ['1512446816042-444d641267d4', '1578314675249-a6910f80cc4e', '1543512214-318c7553f230'], ncolors: 2 }),
    P({ name: 'Lumen Echo Smart Speaker', brand: 'Lumen', cat: 'audio', sub: 'audio', price: 129, was: 169, rating: 4.4, reviews: 894, imgs: ['1543512214-318c7553f230', '1512446816042-444d641267d4'], ncolors: 2 }),

    /* --- Electronics --- */
    P({ name: 'Apple iPhone 17 Pro Max 256GB', brand: 'Apple', cat: 'electronics', sub: 'phone', price: 1199, rating: 4.9, reviews: 2841, imgs: ['1511707171634-5f897ff02aa9', '1512054502232-10a0a035d672', '1512941937669-90a1b58e7e9c'], badge: 'new', age: 6, ncolors: 4, stock: 24 }),
    P({ name: 'Samsung Galaxy S25 Ultra 512GB', brand: 'Samsung', cat: 'electronics', sub: 'phone', price: 1099, was: 1299, rating: 4.7, reviews: 1633, imgs: ['1593642632823-8f785ba67e45', '1598327105666-5b89351aff97', '1585386959984-a4155224a1ad'], ncolors: 3 }),
    P({ name: 'Apple MacBook Pro 14" M4 Pro', brand: 'Apple', cat: 'electronics', sub: 'laptop', price: 1999, was: 2199, rating: 4.9, reviews: 942, imgs: ['1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1593642702821-c8da6771f0c6'], badge: 'best', ncolors: 2 }),
    P({ name: 'Aurora Slim 13 Ultrabook', brand: 'Aurora', cat: 'electronics', sub: 'laptop', price: 1249, was: 1499, rating: 4.5, reviews: 318, imgs: ['1531297484001-80022131f5a1', '1593642702821-c8da6771f0c6'], ncolors: 2 }),
    P({ name: 'Canon EOS R6 Mark III Body', brand: 'Canon', cat: 'electronics', sub: 'camera', price: 2499, was: 2799, rating: 4.8, reviews: 421, imgs: ['1502920917128-1aa500764cbd', '1516035069371-29a1b244cc32', '1519638831568-d9897f54ed69'], ncolors: 1, stock: 12 }),
    P({ name: 'Canon PowerShot Vlog Creator Kit', brand: 'Canon', cat: 'electronics', sub: 'camera', price: 899, rating: 4.4, reviews: 233, imgs: ['1519638831568-d9897f54ed69', '1526170375885-4d8ecf77b99f'], age: 55, ncolors: 2 }),
    P({ name: 'Sony Action Cam FDR-X5000', brand: 'Sony', cat: 'electronics', sub: 'camera', price: 449, was: 549, rating: 4.2, reviews: 176, imgs: ['1526170375885-4d8ecf77b99f', '1519638831568-d9897f54ed69'], ncolors: 2 }),
    P({ name: 'Lumen Vision 55" 4K OLED TV', brand: 'Lumen', cat: 'electronics', sub: 'appliance', price: 1699, was: 1999, rating: 4.7, reviews: 508, imgs: ['1614624532983-4ce03382d63d', '1616594039964-ae9021a400a0'], ncolors: 1 }),
    P({ name: 'Aurora Air Purifier P400', brand: 'Aurora', cat: 'home', sub: 'appliance', price: 549, was: 649, rating: 4.6, reviews: 612, imgs: ['1616486029423-aaa4789e8c9a', '1618220179428-22790b461013'], ncolors: 2 }),

    /* --- Watches --- */
    P({ name: 'Apple Watch Ultra 3 Titanium', brand: 'Apple', cat: 'watches', sub: 'watch', price: 799, rating: 4.8, reviews: 1187, imgs: ['1546868871-7041f2a55e12', '1523275335684-37898b6baf30'], badge: 'new', age: 12, ncolors: 3 }),
    P({ name: 'Fossil Heritage Automatic', brand: 'Fossil', cat: 'watches', sub: 'watch', price: 329, was: 429, rating: 4.5, reviews: 344, imgs: ['1523170335258-f5ed11844a49', '1583394838336-acd977736f90'], ncolors: 3 }),
    P({ name: 'Aurora Meridian Chronograph', brand: 'Aurora', cat: 'watches', sub: 'watch', price: 589, was: 749, rating: 4.6, reviews: 198, imgs: ['1583394838336-acd977736f90', '1523170335258-f5ed11844a49'], badge: 'limited', ncolors: 2, stock: 8 }),
    P({ name: 'Nordic Minimal Smartwatch 2', brand: 'Nordic', cat: 'watches', sub: 'watch', price: 219, was: 279, rating: 4.2, reviews: 421, imgs: ['1523275335684-37898b6baf30', '1546868871-7041f2a55e12'], ncolors: 3 }),

    /* --- Shoes --- */
    P({ name: 'Nike Air Zoom Pegasus 42', brand: 'Nike', cat: 'shoes', sub: 'shoe', price: 139, was: 179, rating: 4.7, reviews: 2210, imgs: ['1542291026-7eec264c27ff', '1549298916-b41d501d3772'], badge: 'best', sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'], ncolors: 4 }),
    P({ name: 'Nike Court Legacy Lift', brand: 'Nike', cat: 'shoes', sub: 'shoe', price: 95, rating: 4.4, reviews: 688, imgs: ['1595950653106-6c9ebd614d3a', '1600185365926-3a2ce3cdb9eb'], sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'], ncolors: 3 }),
    P({ name: 'Everlane Day Glove Flat', brand: 'Everlane', cat: 'shoes', sub: 'shoe', price: 165, was: 195, rating: 4.5, reviews: 402, imgs: ['1600185365926-3a2ce3cdb9eb', '1543163521-1bf539c55dd2'], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'], ncolors: 3 }),
    P({ name: 'Zara Sculpted Heel 85', brand: 'Zara', cat: 'shoes', sub: 'shoe', price: 129, was: 169, rating: 4.1, reviews: 156, imgs: ['1543163521-1bf539c55dd2', '1607522370275-f14206abe5d3'], sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39'], ncolors: 2 }),
    P({ name: 'Uniqlo Court Sneaker', brand: 'Uniqlo', cat: 'shoes', sub: 'shoe', price: 69, rating: 4.3, reviews: 934, imgs: ['1600185365483-26d7a4cc7519', '1595950653106-6c9ebd614d3a'], sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'], ncolors: 3 }),
    P({ name: 'Nike Pegasus Trail GTX', brand: 'Nike', cat: 'sports', sub: 'shoe', price: 169, was: 199, rating: 4.6, reviews: 517, imgs: ['1560769629-975ec94e6a86', '1549298916-b41d501d3772'], sizes: ['US 8', 'US 9', 'US 10', 'US 11'], ncolors: 3 }),

    /* --- Bags --- */
    P({ name: 'Herschel Ridge 28L Backpack', brand: 'Herschel', cat: 'bags', sub: 'bag', price: 159, was: 189, rating: 4.6, reviews: 1122, imgs: ['1553062407-98eeb64c6a62', '1592899677977-9c10ca588bbd'], ncolors: 4 }),
    P({ name: 'Aurora Signature Tote', brand: 'Aurora', cat: 'bags', sub: 'bag', price: 429, was: 549, rating: 4.7, reviews: 289, imgs: ['1548036328-c9fa89d128fa', '1611930022073-b7a4ba5fcccd'], badge: 'limited', ncolors: 3, stock: 6 }),
    P({ name: 'Everlane Leather Zip Wallet', brand: 'Everlane', cat: 'accessories', sub: 'bag', price: 89, rating: 4.4, reviews: 643, imgs: ['1566150905458-1bf1fc113f0d', '1592899677977-9c10ca588bbd'], ncolors: 4 }),
    P({ name: 'Zara Structured Shoulder Bag', brand: 'Zara', cat: 'bags', sub: 'bag', price: 219, was: 279, rating: 4.2, reviews: 187, imgs: ['1611930022073-b7a4ba5fcccd', '1548036328-c9fa89d128fa'], ncolors: 3 }),
    P({ name: 'Herschel Heritage Duffle 40L', brand: 'Herschel', cat: 'bags', sub: 'bag', price: 189, rating: 4.5, reviews: 356, imgs: ['1592899677977-9c10ca588bbd', '1553062407-98eeb64c6a62'], ncolors: 3 }),

    /* --- Beauty --- */
    P({ name: 'Glossier Futuredew Serum', brand: 'Glossier', cat: 'beauty', sub: 'beauty', price: 48, was: 58, rating: 4.6, reviews: 1533, imgs: ['1522335789203-aabd1fc54bc9', '1526947425960-945c6e72858f'], ncolors: 1 }),
    P({ name: 'Aurora Noir Eau de Parfum 100ml', brand: 'Aurora', cat: 'beauty', sub: 'beauty', price: 148, was: 189, rating: 4.8, reviews: 742, imgs: ['1541643600914-78b084683601', '1620916566398-39f1143ab7be'], badge: 'best', ncolors: 1 }),
    P({ name: 'Glossier Brush Set (8 pc)', brand: 'Glossier', cat: 'beauty', sub: 'beauty', price: 78, was: 98, rating: 4.5, reviews: 421, imgs: ['1608231387042-66d1773070a5', '1522335789203-aabd1fc54bc9'], ncolors: 2 }),
    P({ name: 'Aurora Botanical Face Oil', brand: 'Aurora', cat: 'beauty', sub: 'beauty', price: 62, rating: 4.4, reviews: 298, imgs: ['1526947425960-945c6e72858f', '1522335789203-aabd1fc54bc9'], ncolors: 1 }),
    P({ name: 'Nordic Shave Ritual Set', brand: 'Nordic', cat: 'beauty', sub: 'beauty', price: 96, was: 124, rating: 4.3, reviews: 214, imgs: ['1556228720-195a672e8a03', '1620916566398-39f1143ab7be'], ncolors: 1 }),

    /* --- Home --- */
    P({ name: 'Nordic Haven 3-Seat Sofa', brand: 'Nordic', cat: 'home', sub: 'home', price: 1899, was: 2399, rating: 4.7, reviews: 421, imgs: ['1555041469-a586c61ea9bc', '1493663284031-b7e3aefcae8e'], ncolors: 4, badge: 'best' }),
    P({ name: 'Aurora Cloud Loveseat', brand: 'Aurora', cat: 'home', sub: 'home', price: 1299, was: 1599, rating: 4.6, reviews: 233, imgs: ['1493663284031-b7e3aefcae8e', '1567016432779-094069958ea5'], ncolors: 3 }),
    P({ name: 'Lumen Arc Floor Lamp', brand: 'Lumen', cat: 'home', sub: 'home', price: 289, was: 349, rating: 4.5, reviews: 512, imgs: ['1513506003901-1e6a229e2d15', '1610945265064-0e34e5519bbf'], ncolors: 3 }),
    P({ name: 'Nordic Oak Dining Chair', brand: 'Nordic', cat: 'home', sub: 'home', price: 219, rating: 4.4, reviews: 187, imgs: ['1567538096630-e0c55bd6374c', '1618220179428-22790b461013'], ncolors: 3 }),
    P({ name: 'Aurora Marble Side Table', brand: 'Aurora', cat: 'home', sub: 'home', price: 349, was: 429, rating: 4.6, reviews: 143, imgs: ['1503602642458-232111445657', '1618220179428-22790b461013'], ncolors: 2 }),
    P({ name: 'Nordic Linen Duvet Set', brand: 'Nordic', cat: 'home', sub: 'home', price: 179, was: 229, rating: 4.5, reviews: 892, imgs: ['1615529182904-14819c35db37', '1615874959474-d609969a20ed'], ncolors: 4 }),
    P({ name: 'Aurora Ceramic Vase (Large)', brand: 'Aurora', cat: 'home', sub: 'home', price: 89, rating: 4.3, reviews: 156, imgs: ['1618220179428-22790b461013', '1567225557594-88d73e55f2cb'], ncolors: 3 }),
    P({ name: 'Lumen Smart Bulb Starter Kit', brand: 'Lumen', cat: 'home', sub: 'appliance', price: 79, was: 99, rating: 4.4, reviews: 1204, imgs: ['1610945265064-0e34e5519bbf', '1513506003901-1e6a229e2d15'], ncolors: 1 }),
    P({ name: 'Nordic Modular Shelving Unit', brand: 'Nordic', cat: 'home', sub: 'home', price: 649, was: 799, rating: 4.5, reviews: 208, imgs: ['1522708323590-d24dbb6b0267', '1616594039964-ae9021a400a0'], ncolors: 2 }),

    /* --- Gaming --- */
    P({ name: 'Razer BlackWidow V5 Pro', brand: 'Razer', cat: 'gaming', sub: 'gaming', price: 249, was: 299, rating: 4.7, reviews: 1533, imgs: ['1592750475338-74b7b21085ab', '1585386959984-a4155224a1ad'], badge: 'best', ncolors: 2 }),
    P({ name: 'Razer Kraken V4 Headset', brand: 'Razer', cat: 'gaming', sub: 'gaming', price: 199, was: 249, rating: 4.6, reviews: 876, imgs: ['1585386959984-a4155224a1ad', '1592750475338-74b7b21085ab'], ncolors: 2 }),
    P({ name: 'Aurora 65% Mechanical Keyboard', brand: 'Aurora', cat: 'gaming', sub: 'gaming', price: 159, was: 199, rating: 4.5, reviews: 412, imgs: ['1595225476474-87563907a212', '1592750475338-74b7b21085ab'], badge: 'new', age: 14, ncolors: 3 }),
    P({ name: 'Razer Viper Ultimate Mouse', brand: 'Razer', cat: 'gaming', sub: 'gaming', price: 139, was: 169, rating: 4.6, reviews: 1121, imgs: ['1519389950473-47ba0277781c', '1592750475338-74b7b21085ab'], ncolors: 2 }),
    P({ name: 'Aurora Titan RTX Workstation GPU', brand: 'Aurora', cat: 'gaming', sub: 'gaming', price: 1499, was: 1799, rating: 4.8, reviews: 233, imgs: ['1591799264318-7e6ef8ddb7ea', '1595428774223-ef52624120d2'], ncolors: 1, stock: 5, badge: 'limited' }),
    P({ name: 'Nordic 2TB NVMe Gen5 SSD', brand: 'Nordic', cat: 'gaming', sub: 'gaming', price: 249, was: 319, rating: 4.7, reviews: 512, imgs: ['1595428774223-ef52624120d2', '1591799264318-7e6ef8ddb7ea'], ncolors: 1 }),

    /* --- Fashion --- */
    P({ name: 'Everlane Heavyweight Crew', brand: 'Everlane', cat: 'fashion', sub: 'fashion', price: 78, was: 98, rating: 4.5, reviews: 1043, imgs: ['1567016432779-094069958ea5', '1571945153237-4929e783af4a'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], ncolors: 5 }),
    P({ name: 'Uniqlo Wide-Leg Trouser', brand: 'Uniqlo', cat: 'fashion', sub: 'fashion', price: 59, rating: 4.3, reviews: 687, imgs: ['1594633312681-425c7b97ccd1', '1571945153237-4929e783af4a'], sizes: ['XS', 'S', 'M', 'L', 'XL'], ncolors: 4 }),
    P({ name: 'Zara Oversized Wool Coat', brand: 'Zara', cat: 'fashion', sub: 'fashion', price: 249, was: 329, rating: 4.4, reviews: 312, imgs: ['1571945153237-4929e783af4a', '1567016432779-094069958ea5'], sizes: ['S', 'M', 'L', 'XL'], ncolors: 3 }),
    P({ name: 'Everlane Cashmere Crew', brand: 'Everlane', cat: 'fashion', sub: 'fashion', price: 149, was: 189, rating: 4.7, reviews: 421, imgs: ['1560769629-975ec94e6a86', '1594633312681-425c7b97ccd1'], sizes: ['XS', 'S', 'M', 'L', 'XL'], ncolors: 4, badge: 'new', age: 11 }),

    /* --- Accessories --- */
    P({ name: 'Aurora Polarised Aviator', brand: 'Aurora', cat: 'accessories', sub: 'fashion', price: 189, was: 239, rating: 4.5, reviews: 534, imgs: ['1572635148818-ef6fd45eb394', '1519638831568-d9897f54ed69'], ncolors: 3 }),
    P({ name: 'Vessel Insulated Bottle 750ml', brand: 'Vessel', cat: 'sports', sub: 'appliance', price: 49, was: 65, rating: 4.6, reviews: 2210, imgs: ['1602143407151-7111542de6e8', '1595428774223-ef52624120d2'], ncolors: 5 }),
    P({ name: 'Aurora Ceramic Pour-Over Kit', brand: 'Aurora', cat: 'home', sub: 'appliance', price: 89, rating: 4.4, reviews: 341, imgs: ['1572635196237-14b3f281503f', '1618220179428-22790b461013'], ncolors: 2 }),
    P({ name: 'Nordic Everyday Tote 18L', brand: 'Nordic', cat: 'accessories', sub: 'bag', price: 119, was: 149, rating: 4.3, reviews: 276, imgs: ['1592899677977-9c10ca588bbd', '1553062407-98eeb64c6a62'], ncolors: 3 }),
    P({ name: 'Vessel Trail Cooler 20L', brand: 'Vessel', cat: 'sports', sub: 'appliance', price: 199, was: 249, rating: 4.5, reviews: 198, imgs: ['1595428774223-ef52624120d2', '1602143407151-7111542de6e8'], ncolors: 2 }),
    P({ name: 'Aurora Tech Organiser Pouch', brand: 'Aurora', cat: 'accessories', sub: 'bag', price: 59, rating: 4.4, reviews: 512, imgs: ['1566150905458-1bf1fc113f0d', '1553062407-98eeb64c6a62'], ncolors: 4 }),

    /* --- Sports --- */
    P({ name: 'Nike Dri-FIT Training Tee', brand: 'Nike', cat: 'sports', sub: 'fashion', price: 45, was: 59, rating: 4.4, reviews: 1533, imgs: ['1560769629-975ec94e6a86', '1571945153237-4929e783af4a'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], ncolors: 4 }),
    P({ name: 'Vessel Performance Bottle 1L', brand: 'Vessel', cat: 'sports', sub: 'appliance', price: 59, rating: 4.6, reviews: 876, imgs: ['1602143407151-7111542de6e8', '1595428774223-ef52624120d2'], ncolors: 4 }),
    P({ name: 'Nike Training Grip Gloves', brand: 'Nike', cat: 'sports', sub: 'fashion', price: 35, was: 45, rating: 4.2, reviews: 233, imgs: ['1542291026-7eec264c27ff', '1560769629-975ec94e6a86'], ncolors: 2 })
  ];

  /* -------- Derive counts -------- */
  categories.forEach(c => {
    c.count = products.filter(p => p.cat === c.id).length * 37 + 12;
  });
  brands.forEach(b => {
    b.products = products.filter(p => p.brandId === b.id).length;
  });
  brands.forEach(b => { if (b.products === 0) b.products = 4 + Math.floor(U.rnd(b.id.length * 7) * 40); });

  /* -------- Reviews -------- */
  const REVIEWERS = ['Amara O.', 'Daniel K.', 'Priya S.', 'Marcus L.', 'Elena V.', 'Tomás R.', 'Hannah B.', 'Yuki T.', 'Noor A.', 'Jonas W.', 'Sofia M.', 'Liam D.', 'Chloe F.', 'Ravi P.', 'Isla C.'];
  const POS = ['Exactly what I was hoping for. The build quality is a clear step up from what I had before and it arrived two days early.',
    'I was sceptical about the price but after three weeks of daily use it has genuinely earned its place. No regrets.',
    'Setup took about four minutes and everything has worked flawlessly since. The little details are what sell it.',
    'Bought as a gift and it landed really well. Packaging alone felt premium, let alone the product itself.',
    'Solid. Not perfect — I would like a slightly longer cable — but the core experience is excellent.',
    'Third one I have owned. They keep improving it without breaking what already worked. That is rare.'];
  const NEU = ['Good product, but shipping took longer than the estimate said. Nothing to complain about once it arrived.',
    'Does the job well. I think the marketing oversells one feature slightly, but overall I am happy.',
    'Nice design and decent value. Battery life is a bit shorter than advertised in my experience.'];
  const NEG = ['Mine arrived with a small scuff on the underside. Support replaced it quickly, so credit where it is due.',
    'Quality is fine but it just was not right for me. Returned it — the process was painless at least.'];

  function reviewsFor(product) {
    const n = Math.min(6, 3 + Math.floor(U.rnd(product.id.length + product.reviews) * 3));
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = U.rnd(product.reviews + i * 13);
      const star = r < 0.62 ? 5 : r < 0.82 ? 4 : r < 0.93 ? 3 : r < 0.97 ? 2 : 1;
      const body = star >= 4 ? POS[(i + product.reviews) % POS.length] : star === 3 ? NEU[i % NEU.length] : NEG[i % NEG.length];
      out.push({
        id: product.id + '-r' + i,
        who: REVIEWERS[(product.reviews + i * 5) % REVIEWERS.length],
        stars: star,
        title: star >= 4 ? 'Genuinely impressed' : star === 3 ? 'Good, with caveats' : 'Not for me',
        body: body,
        when: Date.now() - (i * 6 + 2) * 86400000,
        helpful: Math.floor(U.rnd(product.reviews * (i + 3)) * 180),
        verified: U.rnd(product.reviews + i) > 0.25,
        variant: product.colors[i % product.colors.length].name,
        media: (i === 0 && U.rnd(product.reviews) > 0.5) ? [product.imgs[1] || product.imgs[0]] : (i === 1 && U.rnd(product.reviews * 3) > 0.7) ? [product.imgs[0]] : []
      });
    }
    return out.sort((a, b) => b.helpful - a.helpful);
  }
  const QA = [
    { q: 'Does this come with a warranty?', a: 'Yes — it ships with a manufacturer warranty and you can add extended coverage at checkout.', who: 'Marcus L.', when: 4 },
    { q: 'How long does delivery usually take?', a: 'Standard delivery is 3–5 business days. Express options are available at checkout.', who: 'Priya S.', when: 9 },
    { q: 'Is this compatible with older models?', a: 'It is backwards compatible with everything from the previous two generations.', who: 'Jonas W.', when: 17 },
    { q: 'Can I return it if it does not fit?', a: 'Yes, returns are free within 30 days as long as the item is unused and in its original packaging.', who: 'Sofia M.', when: 26 }
  ];

  /* -------- Orders -------- */
  function mkOrders() {
    const statuses = ['Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Delivered', 'Delivered'];
    const out = [];
    for (let i = 0; i < 8; i++) {
      const items = [];
      const n = 1 + Math.floor(U.rnd(i * 31) * 3);
      for (let j = 0; j < n; j++) {
        const p = products[(i * 5 + j * 3) % products.length];
        items.push({ productId: p.id, qty: 1 + Math.floor(U.rnd(i + j) * 2), price: p.price, color: p.colors[0].name, size: p.sizes ? p.sizes[0] : null });
      }
      const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
      out.push({
        id: 'NV-' + (10240 + i * 17),
        date: Date.now() - (i * 11 + 1) * 86400000,
        status: statuses[i % statuses.length],
        items: items,
        subtotal: sub,
        shipping: sub > 50 ? 0 : 8.99,
        tax: Math.round(sub * 0.0825 * 100) / 100,
        discount: i % 3 === 0 ? Math.round(sub * 0.1 * 100) / 100 : 0,
        total: 0,
        address: '221B Alder Street, Portland, OR 97204',
        eta: Date.now() + (3 - i % 3) * 86400000
      });
      out[i].total = out[i].subtotal + out[i].shipping + out[i].tax - out[i].discount;
    }
    return out;
  }

  /* -------- Seed notifications -------- */
  function mkNotifications() {
    return [
      { id: 'n1', type: 'order', icon: 'truck', title: 'Order NV-10257 is out for delivery', body: 'Arriving today between 2–5pm. Track it live.', at: Date.now() - 3600000 * 2, read: false },
      { id: 'n2', type: 'price', icon: 'tag', title: 'Price drop on your wishlist', body: 'Aurora Signature Tote is now $429 — down from $549.', at: Date.now() - 86400000, read: false },
      { id: 'n3', type: 'stock', icon: 'package', title: 'Back in stock', body: 'Canon EOS R6 Mark III is available again.', at: Date.now() - 86400000 * 2, read: false },
      { id: 'n4', type: 'promo', icon: 'spark', title: 'Weekend flash sale starts Friday', body: 'Up to 40% off across Audio and Home.', at: Date.now() - 86400000 * 3, read: true },
      { id: 'n5', type: 'order', icon: 'check', title: 'Order NV-10240 delivered', body: 'How was everything? Leave a review to earn 50 points.', at: Date.now() - 86400000 * 6, read: true },
      { id: 'n6', type: 'reward', icon: 'award', title: 'You reached Gold tier', body: 'You now earn 1.5× points on every order.', at: Date.now() - 86400000 * 9, read: true }
    ];
  }

  /* -------- Coupons -------- */
  const coupons = [
    { code: 'NOVA10', label: '10% off your first order', off: 0.10, min: 0 },
    { code: 'FLASH20', label: '20% off flash sale items', off: 0.20, min: 150 },
    { code: 'SHIPFREE', label: 'Free express shipping', off: 0, min: 0, freeShip: true },
    { code: 'GOLD50', label: '$50 off orders over $400', off: 0, min: 400, flat: 50 }
  ];

  /* -------- Banners -------- */
  const banners = [
    { id: 'b1', title: 'Shop The Future', sub: 'Discover products designed for the way you live.', img: '1505740420928-5e560c06d30e', cta: 'Explore Collection' },
    { id: 'b2', title: 'New Season, New Standard', sub: 'Four hundred new arrivals, curated by our editors.', img: '1555041469-a586c61ea9bc', cta: 'Shop New Arrivals' },
    { id: 'b3', title: 'Sound, Reimagined', sub: 'Studio-grade audio, anywhere you go.', img: '1542291026-7eec264c27ff', cta: 'Shop Audio' }
  ];

  /* -------- Flash sale -------- */
  function mkFlash() {
    return products.filter(p => p.off >= 15).slice(0, 8).map((p, i) => ({
      productId: p.id,
      claimed: 55 + Math.floor(U.rnd(i * 17) * 38),
      endsAt: Date.now() + (5 * 3600 + 42 * 60 + 18) * 1000
    }));
  }

  /* -------- Public API -------- */
  const Data = {
    categories, brands, products, coupons, banners, TEMPLATES, DESC,
    flash: mkFlash(),
    customer: {
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      phone: '+1 (503) 555-0147',
      avatar: '1524594152303-aabd1fc54bc9'
    },
    addresses: [
      { id: 'a1', label: 'Home', name: 'Alex Mercer', line1: '221B Alder Street', city: 'Portland', state: 'OR', zip: '97204', country: 'United States', phone: '+1 (503) 555-0147', isDefault: true },
      { id: 'a2', label: 'Office', name: 'Alex Mercer', line1: '88 Fremont Boulevard, Floor 12', city: 'San Francisco', state: 'CA', zip: '94105', country: 'United States', phone: '+1 (415) 555-0110', isDefault: false }
    ],
    payments: [
      { id: 'pm1', type: 'card', brand: 'Visa', last4: '4242', exp: '09/28', isDefault: true },
      { id: 'pm2', type: 'paypal', email: 'alex.mercer@example.com', isDefault: false },
      { id: 'pm3', type: 'card', brand: 'Mastercard', last4: '8891', exp: '02/27', isDefault: false }
    ],
    orders: mkOrders(),
    notifications: mkNotifications(),
    qa: QA,
    byId(id) { return products.find(p => p.id === id); },
    reviewsFor,
    related(p, n) {
      n = n || 8;
      const same = products.filter(x => x.id !== p.id && x.cat === p.cat);
      const brand = products.filter(x => x.id !== p.id && x.brandId === p.brandId);
      const pool = same.concat(brand, products).filter((x, i, a) => a.findIndex(y => y.id === x.id) === i);
      return pool.filter(x => x.id !== p.id).slice(0, n);
    },
    boughtTogether(p) {
      return products.filter(x => x.id !== p.id && (x.cat === p.cat || Math.abs(x.price - p.price) < p.price * 0.4)).slice(0, 3);
    },
    search(q) {
      q = (q || '').trim().toLowerCase();
      if (!q) return { products: [], categories: [], brands: [] };
      const toks = q.split(/\s+/);
      const score = (p) => {
        const hay = (p.name + ' ' + p.brand + ' ' + p.catName + ' ' + p.tags.join(' ')).toLowerCase();
        let s = 0;
        toks.forEach(t => {
          if (hay.indexOf(t) === 0) s += 6;
          else if (hay.includes(' ' + t)) s += 4;
          else if (hay.includes(t)) s += 2;
        });
        return s;
      };
      const prods = products.map(p => ({ p, s: score(p) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.p);
      return {
        products: prods,
        categories: categories.filter(c => c.name.toLowerCase().includes(q)),
        brands: brands.filter(b => b.name.toLowerCase().includes(q))
      };
    },
    /* Fuzzy "did you mean" */
    suggest(q) {
      const terms = ['headphones', 'laptop', 'sneakers', 'watch', 'sofa', 'perfume', 'keyboard', 'backpack', 'camera', 'speaker'];
      const query = (q || '').toLowerCase();
      if (!query) return null;
      let best = null, bestScore = 0;
      terms.forEach(t => {
        const s = similarity(query, t);
        if (s > bestScore && s > 0.55 && s < 1) { bestScore = s; best = t; }
      });
      return best;
    }
  };
  function similarity(a, b) {
    const m = a.length, n = b.length;
    if (!m || !n) return 0;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i].concat(new Array(n).fill(0)));
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - dp[m][n] / Math.max(m, n);
  }

  NOVA.Data = Data;
})();
