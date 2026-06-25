// assets/js/auth.js

const Auth = {
  user: null,

  async init() {
    try {
      // In 2026, secure HttpOnly cookies are superior to localStorage for XSS protection.
      // We ping the worker to get session state securely.
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
    const authContainer = document.getElementById('nav-auth');
    if (!authContainer) return;

    if (this.user) {
      authContainer.innerHTML = `
        <a href="/browse.html" class="nav-link">Browse</a>
        <a href="/publish.html" class="nav-link">Publish</a>
        <a href="/dashboard.html" class="nav-link" style="margin-left:16px;">
          <img src="${this.user.avatar || 'https://github.com/ghost.png'}" alt="Avatar" style="width:32px; height:32px; border-radius:50%; border:1px solid var(--border);">
        </a>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="/browse.html" class="nav-link">Browse</a>
        <a href="/publish.html" class="nav-link">Publish</a>
        <button class="btn btn-primary" onclick="Auth.login()" style="margin-left: 16px;">Log in with GitHub</button>
      `;
    }
  }
};

// Global Initialization
document.addEventListener('DOMContentLoaded', () => Auth.init());
