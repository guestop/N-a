// /assets/js/app.js

function createAppCard(app) {
  return `
    <a href="/app.html?id=${app.id}" class="card">
      <img src="${app.thumbnail || 'https://via.placeholder.com/400x200?text=No+Thumbnail'}" alt="${app.title}" class="card-img" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Error'">
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(app.title)}</h3>
        <p class="card-publisher">by ${escapeHTML(app.publisher_name)}</p>
        <div class="card-meta">
          <span class="badge">${escapeHTML(app.category || 'App')}</span>
          <span>${app.views} views</span>
        </div>
      </div>
    </a>
  `;
}

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Render grid helper
function renderGrid(containerId, apps) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (apps.length === 0) {
    container.innerHTML = '<p class="text-muted">No apps found.</p>';
    return;
  }
  
  container.innerHTML = apps.map(createAppCard).join('');
}
