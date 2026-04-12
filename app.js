/* ═══════════════════════════════════════════
   AYUSH STORE — app.js
   ═══════════════════════════════════════════ */

'use strict';

// ── Currency Config ─────────────────────────────────────────────────────────
const CURRENCY_CONFIG = {
  USD: { symbol: '$', rate: 1,      locale: 'en-US' },
  INR: { symbol: '₹', rate: 83.12,  locale: 'en-IN' },
};

// ── Product Data ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: 'Merino Wool Tee',
    desc: 'Breathable 100% merino wool, naturally odour-resistant and soft against skin.',
    price: 58, category: 'Apparel', emoji: '👕', popularity: 95,
  },
  {
    id: 2, name: 'Canvas Tote Bag',
    desc: 'Heavy-duty 12oz canvas with reinforced handles and an interior zip pocket.',
    price: 34, category: 'Bags', emoji: '🛍️', popularity: 88,
  },
  {
    id: 3, name: 'Ceramic Pour-Over',
    desc: 'Hand-thrown stoneware dripper with a heat-retaining matte glaze finish.',
    price: 46, category: 'Kitchen', emoji: '☕', popularity: 72,
  },
  {
    id: 4, name: 'Leather Wallet',
    desc: 'Full-grain leather bifold, waxed edges, holds 8 cards and slim cash slot.',
    price: 79, category: 'Accessories', emoji: '👜', popularity: 91,
  },
  {
    id: 5, name: 'Wireless Earbuds',
    desc: 'ANC-enabled, 32-hour total battery life, IPX5 water resistant.',
    price: 129, category: 'Tech', emoji: '🎧', popularity: 98,
  },
  {
    id: 6, name: 'Notebook — Dot Grid',
    desc: '192 pages of 100gsm paper, lay-flat binding, bookmark ribbon.',
    price: 22, category: 'Stationery', emoji: '📓', popularity: 76,
  },
  {
    id: 7, name: 'Plant-Based Candle',
    desc: 'Soy wax with cedar & vetiver fragrance, 60-hour burn time.',
    price: 38, category: 'Home', emoji: '🕯️', popularity: 83,
  },
  {
    id: 8, name: 'Titanium Pen',
    desc: 'CNC-machined titanium barrel, refillable Schmidt ink cartridge.',
    price: 65, category: 'Stationery', emoji: '🖊️', popularity: 69,
  },
  {
    id: 9, name: 'Linen Throw',
    desc: 'Stone-washed linen blend in a natural undyed weave, 140 × 180 cm.',
    price: 110, category: 'Home', emoji: '🛋️', popularity: 77,
  },
  {
    id: 10, name: 'Portable Charger',
    desc: '20,000 mAh, 65W GaN PD, charges laptops and phones simultaneously.',
    price: 89, category: 'Tech', emoji: '🔋', popularity: 94,
  },
  {
    id: 11, name: 'Cork Yoga Mat',
    desc: 'Naturally antimicrobial cork surface, 5mm recycled rubber base.',
    price: 96, category: 'Wellness', emoji: '🧘', popularity: 80,
  },
  {
    id: 12, name: 'Cold Brew Bottle',
    desc: '1L borosilicate glass, silicone sleeve, fine-mesh stainless filter.',
    price: 42, category: 'Kitchen', emoji: '🍶', popularity: 86,
  },
];

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  cart: [],                 // [{ product, qty }]
  search: '',
  sort: 'popularity',
  currency: 'USD',
};

// ── DOM Refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const productGrid    = $('productGrid');
const emptyState     = $('emptyState');
const cartDrawer     = $('cartDrawer');
const cartButton     = $('cartButton');
const closeCart      = $('closeCart');
const cartBackdrop   = $('cartBackdrop');
const cartCount      = $('cartCount');
const cartItems      = $('cartItems');
const cartTotalEl    = $('cartTotal');
const checkoutButton = $('checkoutButton');
const searchInput    = $('searchInput');
const sortSelect     = $('sortSelect');
const currencySelect = $('currencySelect');

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(usdPrice) {
  const { rate, locale, symbol } = CURRENCY_CONFIG[state.currency];
  const converted = usdPrice * rate;
  if (state.currency === 'INR') {
    return symbol + Math.round(converted).toLocaleString(locale);
  }
  return symbol + converted.toFixed(2);
}

function getCartTotal() {
  return state.cart.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
}

function getCartItemCount() {
  return state.cart.reduce((sum, { qty }) => sum + qty, 0);
}

function getFilteredSorted() {
  const q = state.search.trim().toLowerCase();
  let list = PRODUCTS.filter(p =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q)
  );
  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price);                         break;
    case 'price-desc': list.sort((a, b) => b.price - a.price);                         break;
    case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name));              break;
    case 'name-desc':  list.sort((a, b) => b.name.localeCompare(a.name));              break;
    default:           list.sort((a, b) => b.popularity - a.popularity);               break;
  }
  return list;
}

// ── Render Products ──────────────────────────────────────────────────────────
function renderProducts() {
  const list = getFilteredSorted();

  if (!list.length) {
    productGrid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  productGrid.innerHTML = list.map((p, i) => {
    const inCart = state.cart.find(c => c.product.id === p.id);
    return `
      <article class="product-card" role="listitem" style="animation-delay:${i * 0.05}s">
        <span class="product-category">${p.category}</span>
        <div class="product-image-wrap">
          <div class="product-emoji" aria-hidden="true">${p.emoji}</div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-footer">
            <span class="product-price">${formatPrice(p.price)}</span>
            <button
              class="add-to-cart${inCart ? ' added' : ''}"
              data-id="${p.id}"
              aria-label="Add ${p.name} to cart"
            >
              ${inCart ? '✓ Added' : '+ Add'}
            </button>
          </div>
        </div>
      </article>`;
  }).join('');
}

// ── Render Cart ──────────────────────────────────────────────────────────────
function renderCart() {
  // update badge
  const count = getCartItemCount();
  cartCount.textContent = count;
  cartCount.dataset.count = count;

  // animate badge
  cartCount.animate([
    { transform: 'scale(1.6)', background: 'var(--text)' },
    { transform: 'scale(1)',   background: 'var(--accent)' },
  ], { duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' });

  // update total
  cartTotalEl.textContent = formatPrice(getCartTotal());

  // render items
  if (!state.cart.length) {
    cartItems.innerHTML = `
      <div class="cart-empty" role="status">
        <span class="cart-empty-icon" aria-hidden="true">🛒</span>
        <span>Your cart is empty.</span>
      </div>`;
    return;
  }

  cartItems.innerHTML = state.cart.map(({ product, qty }) => `
    <div class="cart-item" data-id="${product.id}">
      <div class="cart-item-emoji" aria-hidden="true">${product.emoji}</div>
      <div class="cart-item-info">
        <span class="cart-item-name">${product.name}</span>
        <span class="cart-item-price">${formatPrice(product.price * qty)}</span>
      </div>
      <div class="cart-item-controls">
        <div class="qty-controls" role="group" aria-label="Quantity for ${product.name}">
          <button class="qty-btn" data-action="dec" data-id="${product.id}" aria-label="Decrease quantity">−</button>
          <span class="qty-value" aria-live="polite">${qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${product.id}" aria-label="Remove ${product.name}">Remove</button>
      </div>
    </div>`).join('');
}

// ── Cart Operations ──────────────────────────────────────────────────────────
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = state.cart.find(c => c.product.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ product, qty: 1 });
  }
  renderCart();
  renderProducts();        // refresh "Added" state
}

function updateQty(productId, delta) {
  const item = state.cart.find(c => c.product.id === productId);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) removeFromCart(productId);
  else { renderCart(); renderProducts(); }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(c => c.product.id !== productId);
  renderCart();
  renderProducts();
}

// ── Cart Drawer ──────────────────────────────────────────────────────────────
function openCart() {
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartButton.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  closeCart.focus();
}

function closeCartDrawer() {
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  cartButton.focus();
}

// ── Event Delegation ─────────────────────────────────────────────────────────
productGrid.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-cart');
  if (btn) addToCart(Number(btn.dataset.id));
});

cartItems.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (action === 'inc')    updateQty(id, +1);
  if (action === 'dec')    updateQty(id, -1);
  if (action === 'remove') removeFromCart(id);
});

cartButton.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartDrawer);
cartBackdrop.addEventListener('click', closeCartDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartDrawer.getAttribute('aria-hidden') === 'false') {
    closeCartDrawer();
  }
});

checkoutButton.addEventListener('click', () => {
  if (!state.cart.length) return;
  // Friendly checkout simulation
  const total = formatPrice(getCartTotal());
  const count = getCartItemCount();
  closeCartDrawer();
  setTimeout(() => {
    const msg = document.createElement('div');
    msg.setAttribute('role', 'alert');
    Object.assign(msg.style, {
      position: 'fixed', bottom: '2rem', left: '50%',
      transform: 'translateX(-50%) translateY(100px)',
      background: 'var(--accent)', color: '#0a0a0a',
      padding: '.9rem 2rem', borderRadius: '8px',
      fontFamily: 'var(--font-body)', fontWeight: '600',
      fontSize: '.85rem', letterSpacing: '.02em',
      boxShadow: '0 8px 40px rgba(201,168,76,.4)',
      zIndex: '9998', transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)',
    });
    msg.textContent = `✓ Order placed! ${count} item${count > 1 ? 's' : ''} · ${total}`;
    document.body.appendChild(msg);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { msg.style.transform = 'translateX(-50%) translateY(0)'; });
    });
    setTimeout(() => {
      msg.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => msg.remove(), 500);
    }, 3500);
    state.cart = [];
    renderCart();
    renderProducts();
  }, 300);
});

// ── Search / Sort / Currency ─────────────────────────────────────────────────
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value;
    renderProducts();
  }, 200);
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  renderProducts();
});

currencySelect.addEventListener('change', () => {
  state.currency = currencySelect.value;
  renderProducts();
  renderCart();
});

// ── Footer Year ──────────────────────────────────────────────────────────────
$('year').textContent = new Date().getFullYear();

// ── Init ─────────────────────────────────────────────────────────────────────
renderProducts();
renderCart();
