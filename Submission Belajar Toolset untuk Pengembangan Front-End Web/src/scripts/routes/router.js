import { Auth } from '../data/api.js';
import { renderNavbar } from '../components/navbar.js';
import home from '../pages/home.js';
import addStory from '../pages/add-story.js';
import login from '../pages/login.js';
import register from '../pages/register.js';
import notFound from '../pages/not-found.js';

const routes = { '/': home, '/add': addStory, '/login': login, '/register': register };
const PUBLIC_ROUTES = ['/login', '/register'];

function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

function guard(path) {
  const isPublic = PUBLIC_ROUTES.includes(path);
  if (!Auth.isLoggedIn() && !isPublic) return '/login';
  if (Auth.isLoggedIn() && isPublic) return '/';
  return path;
}

async function navigate() {
  const path = currentPath();
  const target = guard(path);
  if (target !== path) {
    location.hash = `#${target}`;
    return;
  }

  const main = document.querySelector('#main-content');
  renderNavbar(document.querySelector('#navbar'), path);
  const page = routes[path] ?? notFound;

  const render = () => page.render(main);
  if (document.startViewTransition) {
    await document.startViewTransition(render).finished;
  } else {
    await render();
  }
  main.focus();
}

export function startRouter() {
  window.addEventListener('hashchange', navigate);
  navigate();
}
