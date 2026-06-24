// /assets/js/api.js

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
  }
};
