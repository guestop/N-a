// assets/js/api.js

const API = {
  async fetchApps(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/apps${query ? '?' + query : ''}`);
      if (!res.ok) throw new Error('Failed to fetch apps');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async fetchApp(id) {
    try {
      const res = await fetch(`/api/apps?id=${id}`);
      if (!res.ok) throw new Error('App not found');
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async publishApp(appData) {
    try {
      // Must include JWT header if auth is via localStorage, 
      // but Worker uses HttpOnly cookie for security.
      const res = await fetch(`/api/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async toggleLike(id) {
    // POST /api/apps/:id/like
    // Using placeholder logic since backend isn't deeply rewritten for this route yet
    console.log('Toggled like for', id);
    return true;
  },

  async incrementView(id) {
    // POST /api/apps/:id/view
    // We update view via GET single app in the backend currently
    console.log('Incremented view for', id);
  }
};
