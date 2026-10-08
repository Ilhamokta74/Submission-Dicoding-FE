import { Auth } from '../data/api.js';
import { hideAlert, setButtonLoading, showAlert } from '../utils/ui.js';
import {
  isPasswordValid,
  passwordFieldTemplate,
  setupPasswordField,
} from '../utils/password-field.js';

export default {
  render(container) {
    container.innerHTML = `
      <section class="card auth-card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h3 mb-3">Register</h1>
          <div id="form-alert" class="alert d-none" role="alert" aria-live="assertive"></div>
          <form id="register-form" novalidate>
            <label for="name" class="form-label">Nama</label>
            <input type="text" id="name" class="form-control mb-3" required autocomplete="name" />
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" class="form-control mb-3" required
              autocomplete="email" />
            ${passwordFieldTemplate('new-password')}
            <button type="submit" id="submit-btn" class="btn btn-primary w-100">Daftar</button>
          </form>
          <p class="mt-3 mb-0 text-center">Sudah punya akun? <a href="#/login">Login</a></p>
        </div>
      </section>`;

    const form = container.querySelector('#register-form');
    const alertBox = container.querySelector('#form-alert');
    const button = container.querySelector('#submit-btn');
    setupPasswordField(form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideAlert(alertBox);
      const name = form.querySelector('#name').value.trim();
      const emailInput = form.querySelector('#email');
      const passwordInput = form.querySelector('#password');

      if (!name) {
        showAlert(alertBox, 'Nama wajib diisi.');
        return;
      }
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
        await Auth.register({
          name,
          email: emailInput.value.trim(),
          password: passwordInput.value,
        });
        sessionStorage.setItem('flash', 'Akun berhasil dibuat, silakan login.');
        location.hash = '#/login';
      } catch (err) {
        showAlert(alertBox, err.message);
        setButtonLoading(button, false, 'Daftar');
      }
    });
  },
};
