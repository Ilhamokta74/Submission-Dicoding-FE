import { Auth } from '../data/api.js';
import { hideAlert, setButtonLoading, showAlert } from '../utils/ui.js';
import {
  isPasswordValid,
  passwordFieldTemplate,
  setupPasswordField,
} from '../utils/password-field.js';

export default {
  render(container) {
    const flash = sessionStorage.getItem('flash');
    sessionStorage.removeItem('flash');

    container.innerHTML = `
      <section class="card auth-card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h3 mb-3">Login</h1>
          <div id="form-alert" class="alert d-none" role="alert" aria-live="assertive"></div>
          <form id="login-form" novalidate>
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" class="form-control mb-3" required
              autocomplete="email" />
            ${passwordFieldTemplate('current-password')}
            <button type="submit" id="submit-btn" class="btn btn-primary w-100">Login</button>
          </form>
          <p class="mt-3 mb-0 text-center">Belum punya akun? <a href="#/register">Daftar</a></p>
        </div>
      </section>`;

    const form = container.querySelector('#login-form');
    const alertBox = container.querySelector('#form-alert');
    const button = container.querySelector('#submit-btn');
    setupPasswordField(form);
    if (flash) showAlert(alertBox, flash, 'success');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideAlert(alertBox);
      const emailInput = form.querySelector('#email');
      const passwordInput = form.querySelector('#password');

      if (!emailInput.value.trim() || !emailInput.checkValidity()) {
        showAlert(alertBox, 'Masukkan alamat email yang valid.');
        return;
      }
      if (!isPasswordValid(passwordInput.value)) {
        passwordInput.classList.add('is-invalid');
        passwordInput.focus();
        return;
      }

      setButtonLoading(button, true);
      try {
        await Auth.login({ email: emailInput.value.trim(), password: passwordInput.value });
        location.hash = '#/';
      } catch (err) {
        showAlert(alertBox, err.message);
        setButtonLoading(button, false, 'Login');
      }
    });
  },
};
