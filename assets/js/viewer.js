// /assets/js/viewer.js

async function initViewer() {
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('id');
  
  if (!appId) {
    document.getElementById('viewer-container').innerHTML = '<h2>App ID is missing</h2>';
    return;
  }

  const appData = await API.fetchApp(appId);
  
  if (!appData) {
    document.getElementById('viewer-container').innerHTML = '<h2>App failed to load or does not exist.</h2>';
    return;
  }

  // Update UI metadata
  document.title = `${escapeHTML(appData.title)} - Universal Apps`;
  document.getElementById('app-title').textContent = appData.title;
  document.getElementById('app-publisher').textContent = `Published by ${appData.publisher_name}`;
  document.getElementById('app-views').textContent = `${appData.views} views`;
  
  // Inject the iframe securely
  const iframeContainer = document.getElementById('iframe-wrapper');
  iframeContainer.innerHTML = `
    <iframe 
      src="${appData.app_url}" 
      title="${escapeHTML(appData.title)}"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals"
      style="width: 100%; height: 100%; border: none;"
      allowfullscreen
    ></iframe>
  `;
}

function toggleFullscreen() {
  const wrapper = document.getElementById('iframe-wrapper');
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen().catch(err => {
      alert(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener('DOMContentLoaded', initViewer);
