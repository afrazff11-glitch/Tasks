const API = window.location.port === "5000"
  ? "/api"
  : "http://127.0.0.1:5000/api";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value || fallback;
  } catch (error) {
    localStorage.removeItem(key);
    return fallback;
  }
}

const getCart = () => {
  const cart = readStorage("cart", []);
  return Array.isArray(cart) ? cart : [];
};

const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));
const getToken = () => localStorage.getItem("token");
const getUser = () => readStorage("user", null);

function setMessage(text) {
  const message = document.getElementById("message");

  if (message) message.textContent = text;
}

function showOrderSuccess(orderId) {
  const form = document.getElementById("checkout-form");
  const success = document.getElementById("order-success");
  const reference = document.getElementById("order-reference");

  if (!success) return;

  if (form) form.hidden = true;
  success.hidden = false;

  if (reference) {
    reference.textContent = orderId ? `Order ID: ${orderId}` : "";
    reference.hidden = !orderId;
  }

  setMessage("");
}

function updateHeader() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById("cart-count");
  const authLink = document.querySelector("[data-auth-link]");
  const user = getUser();

  if (countEl) countEl.textContent = count;

  if (authLink && user) {
    authLink.textContent = "Logout";
    authLink.href = "#";
    authLink.classList.add("logout-link");
    authLink.onclick = (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    };
  } else if (authLink) {
    authLink.textContent = "Login";
    authLink.href = "login.html";
    authLink.classList.remove("logout-link");
    authLink.onclick = null;
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      updateHeader();
      throw new Error("Your session expired. Please login again before placing an order.");
    }

    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

async function loadProducts() {
  const container = document.getElementById("products");

  if (container) {
    container.innerHTML = "<p>Loading products...</p>";
  }

  try {
    const response = await request("/products");
    const data = Array.isArray(response) ? response : [];
    const search = document.getElementById("search");

    const render = (products) => {
      if (products.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
        return;
      }

      container.innerHTML = products.map((p) => `
        <article class="card">
          <img src="${p.image}" alt="${p.name}">
          <div class="card-body">
            <p class="eyebrow">${p.category}</p>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p class="price">${money.format(p.price)}</p>
            <div class="actions">
              <a href="product.html?id=${p._id}">View</a>
              <button onclick='addToCart(${JSON.stringify({
                productId: p._id,
                name: p.name,
                price: p.price,
                image: p.image
              })})'>Add to cart</button>
            </div>
          </div>
        </article>
      `).join("");
    };

    render(data);
    setMessage("");

    search.addEventListener("input", () => {
      const query = search.value.toLowerCase();
      const filtered = data.filter((product) => {
        return product.name.toLowerCase().includes(query)
          || product.category.toLowerCase().includes(query);
      });

      render(filtered);
    });
  } catch (error) {
    if (container) {
      container.innerHTML = "";
    }

    setMessage("Could not load products. Make sure the Express backend is running on port 5000, then refresh.");
  }
}

async function loadProductDetail() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = await request(`/products/${id}`);
    const detail = document.getElementById("product-detail");

    detail.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <section class="detail-panel">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <p class="price">${money.format(product.price)}</p>
        <p>${product.stock} items in stock</p>
        <button onclick='addToCart(${JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image
        })})'>Add to cart</button>
      </section>
    `;
  } catch (error) {
    setMessage(error.message);
  }
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateHeader();
  setMessage(`${product.name} added to cart.`);
}

function updateQuantity(productId, change) {
  const cart = getCart().map((item) => {
    if (item.productId === productId) {
      return { ...item, quantity: item.quantity + change };
    }

    return item;
  }).filter((item) => item.quantity > 0);

  saveCart(cart);
  renderCart();
  updateHeader();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.productId !== productId));
  renderCart();
  updateHeader();
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty. Add a few products first.</p>";
  } else {
    container.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p class="price">${money.format(item.price)}</p>
          <button class="secondary" onclick="removeFromCart('${item.productId}')">Remove</button>
        </div>
        <div class="qty-controls">
          <button onclick="updateQuantity('${item.productId}', -1)">-</button>
          <strong>${item.quantity}</strong>
          <button onclick="updateQuantity('${item.productId}', 1)">+</button>
        </div>
      </article>
    `).join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (totalEl) totalEl.textContent = money.format(total);
}

async function checkout(event) {
  if (event) event.preventDefault();

  try {
    const cart = getCart();
    const formEl = document.getElementById("checkout-form");

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (!getToken()) {
      setMessage("Please login before placing an order.");
      return;
    }

    if (!formEl.reportValidity()) {
      return;
    }

    const form = new FormData(formEl);
    const order = await request("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customer: {
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          address: form.get("address")
        }
      })
    });

    localStorage.removeItem("cart");
    renderCart();
    updateHeader();
    formEl.reset();

    const orderId = order.orderId || order._id || order.id || order.order?._id || order.order?.id;

    showOrderSuccess(orderId);
  } catch (error) {
    setMessage(error.message);
  }
}

async function login(event) {
  event.preventDefault();

  try {
    const form = new FormData(event.target);
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (error) {
    setMessage(error.message);
  }
}

async function register(event) {
  event.preventDefault();

  try {
    const form = new FormData(event.target);
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password")
      })
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (error) {
    setMessage(error.message);
  }
}

updateHeader();

if (document.getElementById("products")) {
  loadProducts();
}

if (document.getElementById("product-detail")) {
  loadProductDetail();
}

if (document.getElementById("cart-items")) {
  renderCart();
  document.getElementById("checkout-form").addEventListener("submit", checkout);
  document.getElementById("place-order-button").addEventListener("click", checkout);
}

if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", login);
}

if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", register);
}
