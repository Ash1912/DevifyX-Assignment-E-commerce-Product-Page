// Clear the cart on page load
localStorage.removeItem("cart");

// --- Cart Logic ---
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cart-count");
const addToCart = document.getElementById("add-to-cart");
const cartPreview = document.getElementById("cart-preview");
const cartItems = document.getElementById("cart-items");

function updateCartCount() {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function renderCartPreview() {
  cartItems.innerHTML = cart.length
    ? cart.map(item =>
        `<div>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</div>`
      ).join("")
    : "<div>Your cart is empty.</div>";
  cartPreview.classList.add("visible");
}

addToCart.addEventListener("click", () => {
  const name = document.getElementById("product-title").textContent;
  const price = parseFloat(document.getElementById("product-price").textContent.replace("$", ""));
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!quantity || quantity < 1) return alert("Please enter a valid quantity.");

  const existing = cart.find(item => item.name === name);
  if (existing) existing.quantity += quantity;
  else cart.push({ name, price, quantity });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartPreview();
});

cartCount.addEventListener("click", () => {
  cartPreview.classList.toggle("visible");
});

// Make all Add to Cart buttons functional
document.querySelectorAll('button.sticky-button').forEach(button => {
  button.addEventListener('click', () => {
    // Find the closest product container
    const productSection = button.closest('.product-details, .product-row, .product-wrapper');

    if (!productSection) return;

    // Extract product details
    const nameEl = productSection.querySelector('h2, #product-title');
    const priceEl = productSection.querySelector('p, #product-price');

    if (!nameEl || !priceEl) return alert("Product info missing!");

    const name = nameEl.textContent.trim();
    let priceText = priceEl.textContent.trim();
    priceText = priceText.replace(/[^0-9.]/g, ''); // Extract numbers only
    const price = parseFloat(priceText);

    // Quantity input for main product, fallback to 1 for others
    let quantity = 1;
    const qtyInput = productSection.querySelector('input[type="number"]');
    if (qtyInput) {
      quantity = parseInt(qtyInput.value);
      if (!quantity || quantity < 1) {
        return alert("Please enter a valid quantity.");
      }
    }

    // Add to cart logic
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ name, price, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartPreview();

    // Optional: show a quick toast message
    showToast(`${name} added to cart!`);
  });
});

// Cart preview toggle
cartCount.addEventListener("click", () => {
  cartPreview.classList.toggle("visible");
});

updateCartCount();


// Toast helper function
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

updateCartCount();

// --- Image Thumbnail Logic ---
const thumbs = document.querySelectorAll(".thumb");
const mainImg = document.getElementById("main-image");

thumbs.forEach(thumb => {
  thumb.addEventListener("click", () => {
    thumbs.forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
    mainImg.src = thumb.src;
  });
});

// --- Image Zoom on Desktop ---
mainImg.addEventListener("mousemove", (e) => {
  if (window.innerWidth > 768) {
    const rect = mainImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mainImg.style.transformOrigin = `${x}px ${y}px`;
    mainImg.style.transform = "scale(1.5)";
  }
});

mainImg.addEventListener("mouseleave", () => {
  mainImg.style.transform = "scale(1)";
  mainImg.style.transformOrigin = "center";
});

// --- Quantity Buttons ---
const decrease = document.getElementById("decrease");
const increase = document.getElementById("increase");
const quantity = document.getElementById("quantity");

decrease.addEventListener("click", () => {
  if (quantity.value > 1) quantity.value--;
});

increase.addEventListener("click", () => {
  quantity.value++;
});

// --- Wishlist ---
const wishlistBtn = document.getElementById("add-to-wishlist");

wishlistBtn.addEventListener("click", () => {
  const name = document.getElementById("product-title").textContent;
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (!wishlist.includes(name)) {
    wishlist.push(name);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert("Saved to wishlist!");
  } else {
    alert("Already in wishlist.");
  }
});

// --- Reviews ---
const reviewForm = document.getElementById("review-form");
const reviewsList = document.getElementById("reviews-list");

reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("review-text").value.trim();
  if (text) {
    const p = document.createElement("p");
    p.textContent = `★★★★☆ ${text}`;
    reviewsList.appendChild(p);
    document.getElementById("review-text").value = "";
  }
});

// --- Variant Handling ---
const colorSelect = document.getElementById("color");
const sizeSelect = document.getElementById("size");

const variants = {
  white: {
    8: { price: 99.99, img: "images/thumb1.jpg", stock: true },
    9: { price: 99.99, img: "images/thumb2.jpg", stock: false }
  },
  black: {
    8: { price: 89.99, img: "images/thumb1.jpg", stock: true },
    9: { price: 89.99, img: "images/thumb2.jpg", stock: true }
  }
};

// Dynamically populate color options
function populateColorOptions() {
  colorSelect.innerHTML = '<option value="">Select Color</option>';
  Object.keys(variants).forEach(color => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    colorSelect.appendChild(option);
  });
}

// Dynamically populate size options based on selected color
function populateSizeOptions() {
  sizeSelect.innerHTML = '<option value="">Select Size</option>';
  const color = colorSelect.value;
  if (variants[color]) {
    Object.keys(variants[color]).forEach(size => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      option.disabled = !variants[color][size].stock;
      sizeSelect.appendChild(option);
    });
  }
}

// Update UI based on selected variant
function updateVariant() {
  const color = colorSelect.value;
  const size = sizeSelect.value;
  const variant = variants[color]?.[size];

  if (!variant) {
    addToCart.disabled = true;
    addToCart.textContent = "Select a variant";
    return;
  }

  if (!variant.stock) {
    addToCart.disabled = true;
    addToCart.textContent = "Out of Stock";
  } else {
    addToCart.disabled = false;
    addToCart.textContent = "Add to Cart";
  }

  document.getElementById("product-price").textContent = `$${variant.price.toFixed(2)}`;
  mainImg.src = variant.img;

  // Set active thumbnail if matching one exists
  thumbs.forEach(t => {
    t.classList.remove("active");
    if (t.src.includes(variant.img)) t.classList.add("active");
  });
}

// Attach events
colorSelect.addEventListener("change", () => {
  populateSizeOptions();
  updateVariant();
});
sizeSelect.addEventListener("change", updateVariant);

// Initialize
populateColorOptions();
updateVariant();
