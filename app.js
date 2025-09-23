// Remote data
const API_BASE = "/api";

// Demo products (used only if API returns empty)
const SAMPLE_PRODUCTS = [
  { id: 1, name: "Wireless Headphones", slug: "p1", price: 59.99, image_url: "https://images.unsplash.com/photo-1518449079783-5ce36c56de1c?q=80&w=800&auto=format&fit=crop", popularity: 98, category: "Audio" },
  { id: 2, name: "Smart Watch", slug: "p2", price: 89.99, image_url: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800&auto=format&fit=crop", popularity: 92, category: "Wearables" },
  { id: 3, name: "Gaming Mouse", slug: "p3", price: 29.99, image_url: "https://images.unsplash.com/photo-1596445836561-cf0b0f3a3f59?q=80&w=800&auto=format&fit=crop", popularity: 85, category: "Accessories" }
];

// State
const state = {
  products: [],
  search: "",
  sort: "popularity",
  cart: loadCart(),
  currency: loadCurrency(),
  exchangeRates: { USD: 1, INR: 83 },
};

// Utilities
function saveCurrency(code) {
  try { localStorage.setItem("currency", code); } catch (_) {}
}

function loadCurrency() {
  try {
    return localStorage.getItem("currency") || "USD";
  } catch (_) {
    return "USD";
  }
}

function convertPrice(valueUSD) {
  const rate = state.exchangeRates[state.currency] || 1;
  return Number(valueUSD) * rate;
}

function formatCurrency(valueUSD) {
  const amount = convertPrice(valueUSD);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: state.currency }).format(amount);
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function getCartCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal(cart) {
  return Object.values(cart).reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
}

// Renderers
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const query = state.search.trim().toLowerCase();

  let items = state.products.filter(p => p.name.toLowerCase().includes(query));

  switch (state.sort) {
    case "price-asc":
      items.sort((a, b) => Number(a.price) - Number(b.price)); break;
    case "price-desc":
      items.sort((a, b) => Number(b.price) - Number(a.price)); break;
    case "name-asc":
      items.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "name-desc":
      items.sort((a, b) => b.name.localeCompare(a.name)); break;
    default:
      items.sort((a, b) => b.popularity - a.popularity);
  }

  grid.innerHTML = "";
  if (items.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const p of items) {
    const inCartQty = state.cart[p.id]?.quantity || 0;
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <div class="card-media">
        <img src="${p.image_url || p.image || ''}" alt="${p.name}" loading="lazy"/>
      </div>
      <div class="card-body">
        <h3 class="title">${p.name}</h3>
        <div class="price-row">
          <span class="price">${formatCurrency(Number(p.price))}</span>
          <span class="muted">${p.category || ''}</span>
        </div>
        <div class="add-row">
          <button class="button button-primary" data-add="${p.id}">Add to Cart</button>
          <div class="qty-control">
            <button class="icon-button" data-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span aria-live="polite" data-qty="${p.id}">${inCartQty}</span>
            <button class="icon-button" data-inc="${p.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");

  const entries = Object.values(state.cart);
  itemsEl.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Your cart is empty.";
    itemsEl.appendChild(empty);
  } else {
    for (const item of entries) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image_url || item.image || ''}" alt="${item.name}">
        <div>
          <p class="name">${item.name}</p>
          <p class="meta">${formatCurrency(item.price)} × ${item.quantity}</p>
        </div>
        <div class="qty-control">
          <button class="icon-button" data-cart-dec="${item.id}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button class="icon-button" data-cart-inc="${item.id}" aria-label="Increase quantity">+</button>
          <button class="icon-button" data-remove="${item.id}" aria-label="Remove item">🗑</button>
        </div>
      `;
      itemsEl.appendChild(row);
    }
  }

  countEl.textContent = String(getCartCount(state.cart));
  totalEl.textContent = formatCurrency(getCartTotal(state.cart));
}

// Event Handlers
function onAdd(id) {
  const product = state.products.find(p => String(p.id) === String(id));
  if (!product) return;
  const existing = state.cart[id] || { ...product, quantity: 0 };
  existing.quantity += 1;
  state.cart[id] = existing;
  saveCart(state.cart);
  renderProducts();
  renderCart();
}

function onInc(id) {
  if (!state.cart[id]) onAdd(id); else { state.cart[id].quantity += 1; saveCart(state.cart); renderProducts(); renderCart(); }
}
function onDec(id) {
  if (!state.cart[id]) return;
  state.cart[id].quantity -= 1;
  if (state.cart[id].quantity <= 0) delete state.cart[id];
  saveCart(state.cart);
  renderProducts();
  renderCart();
}
function onRemove(id) {
  if (!state.cart[id]) return;
  delete state.cart[id];
  saveCart(state.cart);
  renderProducts();
  renderCart();
}

function attachGlobalHandlers() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const add = t.getAttribute("data-add");
    const inc = t.getAttribute("data-inc");
    const dec = t.getAttribute("data-dec");
    const cinc = t.getAttribute("data-cart-inc");
    const cdec = t.getAttribute("data-cart-dec");
    const remove = t.getAttribute("data-remove");
    if (add) onAdd(add);
    if (inc) onInc(inc);
    if (dec) onDec(dec);
    if (cinc) onInc(cinc);
    if (cdec) onDec(cdec);
    if (remove) onRemove(remove);
  });

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderProducts();
  });

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderProducts();
  });

  const currencySelect = document.getElementById("currencySelect");
  if (currencySelect) {
    currencySelect.value = state.currency;
    currencySelect.addEventListener("change", (e) => {
      state.currency = e.target.value;
      saveCurrency(state.currency);
      renderProducts();
      renderCart();
    });
  }

  const cartButton = document.getElementById("cartButton");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const closeCart = document.getElementById("closeCart");
  function toggleCart(open) {
    const isOpen = open ?? !cartDrawer.classList.contains("open");
    cartDrawer.classList.toggle("open", isOpen);
    cartDrawer.setAttribute("aria-hidden", String(!isOpen));
    cartButton.setAttribute("aria-expanded", String(isOpen));
  }
  cartButton.addEventListener("click", () => toggleCart());
  cartBackdrop.addEventListener("click", () => toggleCart(false));
  closeCart.addEventListener("click", () => toggleCart(false));

  const checkout = document.getElementById("checkoutButton");
  checkout.addEventListener("click", () => {
    if (Object.keys(state.cart).length === 0) {
      alert("Your cart is empty.");
      return;
    }
    submitOrder().catch(err => {
      console.error(err);
      alert("Checkout failed. See console.");
    });
  });
}

function init() {
  document.getElementById("year").textContent = String(new Date().getFullYear());
  fetchProducts().then(() => renderProducts());
  renderCart();
  attachGlobalHandlers();
}

document.addEventListener("DOMContentLoaded", init);

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products/`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
    const data = await res.json();
    const fromApi = Array.isArray(data) ? data : data.results || [];
    state.products = fromApi.length ? fromApi : SAMPLE_PRODUCTS;
  } catch (e) {
    console.error(e);
    state.products = SAMPLE_PRODUCTS;
  }
}

async function submitOrder() {
  const items = Object.values(state.cart).map(item => ({
    product: item.id,
    quantity: item.quantity,
  }));
  const payload = {
    customer_name: "Guest",
    customer_email: "guest@example.com",
    customer_address: "N/A",
    items,
    currency: state.currency,
  };
  const res = await fetch(`${API_BASE}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Order failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  alert(`Order placed! ID: ${data.order_id}`);
  state.cart = {};
  saveCart(state.cart);
  renderProducts();
  renderCart();
}


