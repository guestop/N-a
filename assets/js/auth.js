// /assets/js/auth.js

const Auth = {
  user: null,

  async init() {
    try {
      const res = await fetch('/functions/auth/me');
      if (res.ok) {
        const data = await res.json();
        this.user = data.user;
      }
    } catch (e) {
      console.error('Auth check failed', e);
    }
    this.updateUI();
    return this.user;
  },

  login() {
    window.location.href = '/functions/auth/login';
  },

  logout() {
    window.location.href = '/functions/auth/logout';
  },

  updateUI() {
    const authContainer = document.getElementById('auth-section');
    if (!authContainer) return;

    if (this.user) {
      authContainer.innerHTML = `
        <a href="/publish.html" class="btn">Publish App</a>
        <a href="/dashboard.html">Dashboard</a>
        <a href="#" onclick="Auth.logout(); return false;">Logout</a>
      `;
    } else {
      authContainer.innerHTML = `
        <button onclick="Auth.login()" class="btn">Login with GitHub</button>
      `;
    }
  }
};

// Auto-init on page load
document.addEventListener('DOMContentLoaded', () => Auth.init());
