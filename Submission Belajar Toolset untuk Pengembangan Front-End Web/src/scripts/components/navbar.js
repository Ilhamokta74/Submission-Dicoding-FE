import { Auth } from '../data/api.js';
import { escapeHtml } from '../utils/ui.js';

function link(href, label, path) {
  const current = href === `#${path}` ? ' aria-current="page"' : '';
  const active = current ? ' active' : '';
  return `<li class="nav-item"><a class="nav-link${active}" href="${href}"${current}>${label}</a></li>`;
}

export function renderNavbar(header, path) {
  const loggedIn = Auth.isLoggedIn();
  const items = loggedIn
    ? `${link('#/', 'Beranda', path)}${link('#/add', 'Tambah Story', path)}`
    : `${link('#/login', 'Login', path)}${link('#/register', 'Register', path)}`;
  const userArea = loggedIn
    ? `<span class="navbar-text me-3">Halo, ${escapeHtml(Auth.getName())}</span>
       <button type="button" id="logout-btn" class="btn btn-outline-light btn-sm">Logout</button>`
    : '';

  header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#/">Story App</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#nav-menu" aria-controls="nav-menu" aria-expanded="false"
          aria-label="Buka menu navigasi">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-menu">
          <ul class="navbar-nav me-auto">${items}</ul>
          ${userArea}
        </div>
      </div>
    </nav>`;

  header.querySelector('#logout-btn')?.addEventListener('click', () => {
    Auth.logout();
    location.hash = '#/login';
  });
}
