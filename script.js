const API_BASE = "https://your-backend-domain.com";

const products = [
{
id: 1,
name: "Goyard Cardholder",
brand: "Goyard",
category: "Accessories",
price: 699,
badge: "BESTSELLER",
description: "Компактный картхолдер в узнаваемом стиле select accessories."
},
{
id: 2,
name: "Corteiz Hoodie",
brand: "Corteiz",
category: "Clothing",
price: 2990,
badge: "NEW",
description: "Худи в streetwear-подаче с плотным силуэтом и акцентом на вайб."
},
{
id: 3,
name: "MM6 x Salomon",
brand: "MM6 x Salomon",
category: "Footwear",
price: 7990,
badge: "LIMITED",
description: "Сильная пара с fashion-tech вайбом и современным силуэтом."
},
{
id: 4,
name: "Essential Tee",
brand: "ONYX SELECT",
category: "Clothing",
price: 1490,
badge: "DROP",
description: "Чистая футболка под базовый или layered-образ."
},
{
id: 5,
name: "Structured Bag",
brand: "ONYX SELECT",
category: "Accessories",
price: 3590,
badge: "NEW",
description: "Сумка в минималистичном исполнении под daily use."
},
{
id: 6,
name: "Street Runner",
brand: "ONYX SELECT",
category: "Footwear",
price: 5490,
badge: "HOT",
description: "Универсальная пара для повседневного streetwear-лука."
}
];

let cart = JSON.parse(localStorage.getItem("onyx_cart") || "[]");

const productGrid = document.getElementById("productGrid");
const featuredGrid = document.getElementById("featuredGrid");
const brandFilter = document.getElementById("brandFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartBtn = document.getElementById("closeCartBtn");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutForm = document.getElementById("checkoutForm");
const toast = document.getElementById("toast");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

function formatPrice(value) {
return `${value.toLocaleString("ru-RU")} ₽`;
}

function showToast(text) {
toast.textContent = text;
toast.classList.add("show");
setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveCart() {
localStorage.setItem("onyx_cart", JSON.stringify(cart));
}

function updateCartCount() {
const count = cart.reduce((sum, item) => sum + item.qty, 0);
cartCount.textContent = count;
}

function getCartTotal() {
return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function openCart() {
cartDrawer.classList.add("open");
overlay.classList.add("show");
cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
cartDrawer.classList.remove("open");
overlay.classList.remove("show");
cartDrawer.setAttribute("aria-hidden", "true");
}

function renderCart() {
if (!cart.length) {
cartItems.innerHTML = `<div class="empty-state">Корзина пока пустая.</div>`;
cartTotal.textContent = formatPrice(0);
updateCartCount();
saveCart();
return;
}

cartItems.innerHTML = cart.map(item => `     <div class="cart-item">       <div>         <strong>${item.name}</strong>         <small>${item.brand} · ${item.category}</small>         <small>${formatPrice(item.price)}</small>       </div>       <div class="cart-item-actions">         <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>         <span>${item.qty}</span>         <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>       </div>     </div>
  `).join("");

cartTotal.textContent = formatPrice(getCartTotal());
updateCartCount();
saveCart();
}

function addToCart(productId) {
const existing = cart.find(item => item.id === productId);
if (existing) {
existing.qty += 1;
} else {
const product = products.find(p => p.id === productId);
cart.push({ ...product, qty: 1 });
}
renderCart();
showToast("Товар добавлен в корзину");
openCart();
}

function changeQty(id, action) {
const item = cart.find(x => x.id === id);
if (!item) return;

if (action === "increase") item.qty += 1;
if (action === "decrease") item.qty -= 1;

cart = cart.filter(x => x.qty > 0);
renderCart();
}

function getFilteredProducts() {
const search = searchInput.value.trim().toLowerCase();
const category = categoryFilter.value;
const brand = brandFilter.value;
const sort = sortFilter.value;

let filtered = [...products].filter(product => {
const matchesSearch =
product.name.toLowerCase().includes(search) ||
product.brand.toLowerCase().includes(search) ||
product.category.toLowerCase().includes(search);

```
const matchesCategory = category === "all" || product.category === category;
const matchesBrand = brand === "all" || product.brand === brand;

return matchesSearch && matchesCategory && matchesBrand;
```

});

if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));

return filtered;
}

function makeCard(product) {
const template = document.getElementById("productCardTemplate");
const node = template.content.cloneNode(true);

node.querySelector(".product-badge").textContent = product.badge;
node.querySelector(".product-meta").textContent = `${product.brand} · ${product.category}`;
node.querySelector(".product-title").textContent = product.name;
node.querySelector(".product-desc").textContent = product.description;
node.querySelector(".product-price").textContent = formatPrice(product.price);
node.querySelector(".add-btn").addEventListener("click", () => addToCart(product.id));

return node;
}

function renderProducts() {
const filtered = getFilteredProducts();

if (!filtered.length) {
productGrid.innerHTML = `<div class="empty-state">Ничего не найдено. Попробуй другие фильтры.</div>`;
return;
}

productGrid.innerHTML = "";
filtered.forEach(product => productGrid.appendChild(makeCard(product)));
applyReveal();
}

function renderFeatured() {
featuredGrid.innerHTML = "";
products.slice(0, 3).forEach(product => featuredGrid.appendChild(makeCard(product)));
}

function fillBrands() {
const brands = [...new Set(products.map(product => product.brand))];
brands.forEach(brand => {
const option = document.createElement("option");
option.value = brand;
option.textContent = brand;
brandFilter.appendChild(option);
});
}

function applyReveal() {
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (entry.isIntersecting) entry.target.classList.add("visible");
});
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

document.addEventListener("click", (event) => {
const categoryLink = event.target.closest("[data-filter-category]");
if (categoryLink) {
const category = categoryLink.getAttribute("data-filter-category");
categoryFilter.value = category;
renderProducts();
}

const qtyBtn = event.target.closest(".qty-btn");
if (qtyBtn) {
const id = Number(qtyBtn.dataset.id);
const action = qtyBtn.dataset.action;
changeQty(id, action);
}
});

[searchInput, categoryFilter, brandFilter, sortFilter].forEach(el => {
el.addEventListener("input", renderProducts);
el.addEventListener("change", renderProducts);
});

cartBtn.addEventListener("click", () => {
renderCart();
openCart();
});

closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

burger.addEventListener("click", () => {
nav.classList.toggle("open");
});

checkoutForm.addEventListener("submit", async (event) => {
event.preventDefault();

if (!cart.length) {
showToast("Корзина пустая");
return;
}

const customerName = document.getElementById("customerName").value.trim();
const customerContact = document.getElementById("customerContact").value.trim();
const customerAddress = document.getElementById("customerAddress").value.trim();
const customerComment = document.getElementById("customerComment").value.trim();

const payload = {
items: cart.map(item => ({
name: item.name,
brand: item.brand,
category: item.category,
qty: item.qty,
priceRub: item.price
})),
total: getCartTotal(),
customerName,
customerContact: `${customerContact} | Адрес: ${customerAddress}`,
customerComment
};

try {
const response = await fetch(`${API_BASE}/api/order`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload)
});

```
if (!response.ok) throw new Error("Ошибка заказа");

showToast("Заказ отправлен");
checkoutForm.reset();
cart = [];
renderCart();
setTimeout(closeCart, 500);
```

} catch (error) {
console.error(error);
showToast("Пока демо: укажи реальный backend-домен");
}
});

fillBrands();
renderFeatured();
renderProducts();
renderCart();
applyReveal();
