// ---------- Product catalog ----------
const products = [
  { id: 1,  name: "Wireless Headphones",  category: "Electronics", price: 59.99, icon: "\u{1F3A7}" },
  { id: 2,  name: "Smart Watch",          category: "Electronics", price: 89.00, icon: "\u231A" },
  { id: 3,  name: "Wireless Mouse",       category: "Electronics", price: 24.50, icon: "\u{1F5B1}\uFE0F" },
  { id: 4,  name: "Mechanical Keyboard",  category: "Electronics", price: 45.00, icon: "\u2328\uFE0F" },
  { id: 5,  name: "C++ Programming Book", category: "Books",       price: 32.00, icon: "\u{1F4D8}" },
  { id: 6,  name: "Data Structures Book", category: "Books",       price: 38.50, icon: "\u{1F4D7}" },
  { id: 7,  name: "Cotton T-Shirt",       category: "Clothing",    price: 15.99, icon: "\u{1F455}" },
  { id: 8,  name: "Winter Jacket",        category: "Clothing",    price: 69.00, icon: "\u{1F9E5}" },
  { id: 9,  name: "Running Sneakers",     category: "Clothing",    price: 54.90, icon: "\u{1F45F}" },
  { id: 10, name: "LED Desk Lamp",        category: "Home",        price: 19.99, icon: "\u{1F4A1}" },
  { id: 11, name: "Ceramic Coffee Mug",   category: "Home",        price: 8.50,  icon: "\u2615" },
  { id: 12, name: "Laptop Backpack",      category: "Home",        price: 36.00, icon: "\u{1F392}" }
];

const CART_KEY = "shopease_cart_v1";
const MAX_QTY = 99;
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toFixed(2);

// ---------- Cart state (saved in localStorage) ----------
let cart = loadCart();

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    const clean = {};
    for (const p of products) {
      const q = Number(parsed[p.id]);
      if (Number.isInteger(q) && q > 0) clean[p.id] = Math.min(q, MAX_QTY);
    }
    return clean;
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    // storage can be unavailable (private mode); the cart still works in memory
  }
}

function cartTotals() {
  let count = 0;
  let total = 0;
  for (const p of products) {
    const q = cart[p.id] || 0;
    count += q;
    total += q * p.price;
  }
  return { count, total };
}

// ---------- Small DOM helper (uses textContent, never innerHTML) ----------
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- Product list ----------
function setupFilters() {
  const select = $("category");
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  for (const c of categories) {
    const option = el("option", "", c);
    option.value = c;
    select.appendChild(option);
  }
}

function filteredProducts() {
  const q = $("search").value.trim().toLowerCase();
  const category = $("category").value;
  const list = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  const sort = $("sort").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  else if (sort === "high") list.sort((a, b) => b.price - a.price);
  else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderProducts() {
  const grid = $("products");
  grid.replaceChildren();
  const list = filteredProducts();
  $("result-count").textContent = list.length + (list.length === 1 ? " product" : " products");

  if (list.length === 0) {
    grid.appendChild(el("p", "empty", "No products match your search."));
    return;
  }
  for (const p of list) {
    const card = el("article", "card");
    card.appendChild(el("div", "icon", p.icon));
    card.appendChild(el("span", "tag", p.category));
    card.appendChild(el("h3", "", p.name));
    card.appendChild(el("p", "price", money(p.price)));
    const button = el("button", "btn primary", "Add to cart");
    button.addEventListener("click", () => addToCart(p.id));
    card.appendChild(button);
    grid.appendChild(card);
  }
}

// ---------- Cart actions ----------
function addToCart(id) {
  cart[id] = Math.min((cart[id] || 0) + 1, MAX_QTY);
  $("message").textContent = "";
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const q = (cart[id] || 0) + delta;
  if (q <= 0) delete cart[id];
  else cart[id] = Math.min(q, MAX_QTY);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function checkout() {
  const { count, total } = cartTotals();
  if (count === 0) return;
  clearCart();
  $("message").textContent =
    "Order placed! " + count + (count === 1 ? " item" : " items") + ", total " + money(total) + ". (Demo only)";
}

// ---------- Cart panel ----------
function renderCart() {
  const box = $("cart-items");
  box.replaceChildren();
  const { count, total } = cartTotals();
  $("cart-count").textContent = count;
  $("cart-total").textContent = money(total);
  $("checkout").disabled = count === 0;
  $("clear").disabled = count === 0;

  if (count === 0) {
    box.appendChild(el("p", "empty", "Your cart is empty."));
    return;
  }
  for (const p of products) {
    const qty = cart[p.id];
    if (!qty) continue;

    const row = el("div", "row");
    row.appendChild(el("span", "row-icon", p.icon));

    const info = el("div", "row-info");
    info.appendChild(el("strong", "", p.name));
    info.appendChild(el("span", "muted", money(p.price) + " each"));
    row.appendChild(info);

    const controls = el("div", "qty");
    const minus = el("button", "qbtn", "-");
    minus.setAttribute("aria-label", "Decrease quantity of " + p.name);
    minus.addEventListener("click", () => changeQty(p.id, -1));
    const plus = el("button", "qbtn", "+");
    plus.setAttribute("aria-label", "Increase quantity of " + p.name);
    plus.addEventListener("click", () => changeQty(p.id, 1));
    controls.append(minus, el("span", "", String(qty)), plus);
    row.appendChild(controls);

    row.appendChild(el("span", "line-total", money(p.price * qty)));
    box.appendChild(row);
  }
}

function setCartOpen(open) {
  $("cart-panel").classList.toggle("open", open);
  $("overlay").classList.toggle("show", open);
  $("cart-panel").setAttribute("aria-hidden", String(!open));
}

// ---------- Start ----------
setupFilters();
renderProducts();
renderCart();
$("year").textContent = new Date().getFullYear();

$("search").addEventListener("input", renderProducts);
$("category").addEventListener("change", renderProducts);
$("sort").addEventListener("change", renderProducts);
$("cart-btn").addEventListener("click", () => setCartOpen(true));
$("cart-close").addEventListener("click", () => setCartOpen(false));
$("overlay").addEventListener("click", () => setCartOpen(false));
$("checkout").addEventListener("click", checkout);
$("clear").addEventListener("click", clearCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setCartOpen(false);
});
