import { StoryApi } from '../data/api.js';
import { escapeHtml, formatDate } from '../utils/ui.js';

function cardTemplate(story) {
  const hasCoords = Number.isFinite(story.lat) && Number.isFinite(story.lon);
  const place = hasCoords
    ? `<small class="text-body-secondary"><i class="bi bi-geo-alt" aria-hidden="true"></i>
        ${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}</small>`
    : '';
  return `
    <div class="col">
      <article class="card h-100 shadow-sm">
        <img src="${escapeHtml(story.photoUrl)}" class="card-img-top story-img" loading="lazy"
          alt="Foto story dari ${escapeHtml(story.name)}" />
        <div class="card-body">
          <h2 class="h5 card-title">${escapeHtml(story.name)}</h2>
          <p class="card-text">${escapeHtml(story.description)}</p>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <small class="text-body-secondary">${formatDate(story.createdAt)}</small>
          ${place}
        </div>
      </article>
    </div>`;
}

async function loadStories(list) {
  list.innerHTML = '<loading-indicator label="Memuat story..."></loading-indicator>';
  try {
    const stories = await StoryApi.getStories();
    list.innerHTML = stories.length
      ? `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
           ${stories.map(cardTemplate).join('')}
         </div>`
      : '<p class="text-center text-body-secondary">Belum ada story.</p>';
  } catch (err) {
    list.innerHTML = `
      <div class="alert alert-danger d-flex justify-content-between align-items-center"
        role="alert">
        <span>${escapeHtml(err.message)}</span>
        <button type="button" class="btn btn-sm btn-outline-danger" id="retry">Coba lagi</button>
      </div>`;
    list.querySelector('#retry').addEventListener('click', () => loadStories(list));
  }
}

export default {
  render(container) {
    container.innerHTML = `
      <h1 class="h3 mb-4">Dasbor Story</h1>
      <div id="story-list" aria-live="polite"></div>`;
    return loadStories(container.querySelector('#story-list'));
  },
};
