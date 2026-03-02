// ================================
// auth.js - Connected to Backend (JWT FIXED)
// ================================
console.log("JS WORKING");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regRole = document.getElementById("regRole");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// ---------------------------
// Animated Tab Toggle
// ---------------------------
const indicator = document.querySelector(".tab-indicator");

// Default position
indicator.style.transform = "translateX(0%)";

loginTab.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  indicator.style.transform = "translateX(0%)";
});

registerTab.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  indicator.style.transform = "translateX(100%)";
});

// ---------------------------
// Toast Notification
// ---------------------------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed; top: 2rem; right: 2rem; padding: 1rem 1.5rem;
    background: ${type === 'error' ? '#EF4444' : '#10B981'}; color: white;
    border-radius: 12px; z-index: 10000; font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===============================
// REGISTER (Connected to DB)
// ===============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  const role = regRole.value;

  if (!name || !email || !password || !role) {
    showToast("Please fill all fields!", 'error');
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Registration failed", 'error');
      return;
    }

    showToast("Registration successful! Please login.", 'success');
    loginTab.click(); // switch to login
    registerForm.reset();
  } catch (error) {
    showToast("Network error occurred", 'error');
  }
});

// ===============================
// LOGIN (JWT TOKEN FIXED)
// ===============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showToast("Please fill all fields!", 'error');
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Login failed", 'error');
      return;
    }

    // ✅ FIXED: Save BOTH token AND user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('eventsyncUser', JSON.stringify(data.user));
    
    showToast("Login successful! Redirecting...", 'success');
    
    // Small delay for better UX
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);

  } catch (error) {
    console.error('Login error:', error);
    showToast("Network error occurred", 'error');
  }
});
