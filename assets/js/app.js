// assets/js/app.js

const AppRenderer = {
  createCardHTML(app, delayIndex = 0) {
    const delay = delayIndex * 50;
    
    // Fallbacks
    const icon = app.thumbnail || 'https://via.placeholder.com/48x48/111111/ffffff?text=U';
    const title = this.escapeHTML(app.title || 'Untitled App');
    const desc = this.escapeHTML(app.description || 'No description provided');
    const pub = this.escapeHTML(app.publisher_name || 'Anonymous');
    const cat = this.escapeHTML(app.category || 'App');
    const views = app.views || 0;
    const likes = app.likes || 0;

    return `
      <a href="/app.html?id=${app.id}" class="app-card" style="animation-delay: ${delay}ms;">
        <div class="app-card-top">
          <div class="app-icon"><img src="${icon}" onerror="this.style.display='none'"></div>
          <div class="app-info">
            <h3 class="app-title">${title}</h3>
            <div class="app-publisher">
              <div class="pub-avatar"></div>
              <span>${pub}</span>
            </div>
          </div>
        </div>
        <p class="app-desc">${desc}</p>
        <div class="app-bottom">
          <span class="category-pill">${cat}</span>
          <div class="app-stats">
            <span>👁 ${this.abbreviateNumber(views)}</span>
            <span>♥ ${this.abbreviateNumber(likes)}</span>
          </div>
        </div>
      </a>
    `;
  },

  renderGrid(containerId, apps) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!apps || apps.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1; padding: 40px;">No apps found.</p>';
      return;
    }
    
    container.innerHTML = apps.map((app, i) => this.createCardHTML(app, i)).join('');
  },

  renderDemos(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const demos = Array.from({length: count}).map((_, i) => ({
      id: `demo-${i}`,
      title: `Amazing App ${i+1}`,
      description: 'Experience the premium 2026 platform. This is a beautiful placeholder since the database is currently empty. Start publishing today!',
      publisher_name: 'Universal Team',
      category: ['Games', 'AI', 'Productivity', 'Creative'][i % 4],
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000)
    }));
    
    this.renderGrid(containerId, demos);
  },

  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  abbreviateNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'm';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num;
  }
};

// Recommendation Algorithm
function getRecommendations(userHistory, allApps) {
  // Score each app based on:
  // 1. Category match with viewed apps (weight: 40%)
  // 2. Trending score = views last 7 days (weight: 30%) 
  // 3. Like ratio = likes/views (weight: 20%)
  // 4. Recency = newer apps get boost (weight: 10%)
  // Return top 10 sorted by total score
  
  if (!allApps || allApps.length === 0) return [];
  
  // Build category preference map from user history
  const catPrefs = {};
  if (userHistory && userHistory.length > 0) {
    userHistory.forEach(historyItem => {
      const cat = historyItem.category;
      catPrefs[cat] = (catPrefs[cat] || 0) + 1;
    });
  }

  const scoredApps = allApps.map(app => {
    let score = 0;
    
    // 1. Category match (40 max)
    if (catPrefs[app.category]) {
      score += Math.min(40, catPrefs[app.category] * 10); 
    }

    // 2. Trending Score (30 max) - Simplification: total views weighted
    const trendingVal = app.views ? Math.min(30, (app.views / 1000) * 5) : 0;
    score += trendingVal;

    // 3. Like ratio (20 max)
    if (app.views > 0 && app.likes) {
      const ratio = app.likes / app.views;
      score += Math.min(20, ratio * 100); 
    }

    // 4. Recency (10 max)
    const ageDays = (new Date() - new Date(app.created_at)) / (1000 * 60 * 60 * 24);
    if (!isNaN(ageDays)) {
      const recencyScore = Math.max(0, 10 - ageDays);
      score += recencyScore;
    }

    return { ...app, _score: score };
  });

  return scoredApps.sort((a, b) => b._score - a._score).slice(0, 10);
}
