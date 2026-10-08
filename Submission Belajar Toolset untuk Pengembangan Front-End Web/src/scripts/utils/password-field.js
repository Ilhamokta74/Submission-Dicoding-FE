export const MIN_PASSWORD_LENGTH = 8;

export function passwordFieldTemplate(autocomplete) {
  return `
    <label for="password" class="form-label">Password</label>
    <div class="input-group has-validation mb-3">
      <input type="password" id="password" class="form-control" required
        minlength="${MIN_PASSWORD_LENGTH}" autocomplete="${autocomplete}"
        aria-describedby="password-help" />
      <button type="button" class="btn btn-outline-secondary" id="toggle-password"
        aria-label="Tampilkan password" aria-pressed="false">
        <i class="bi bi-eye" aria-hidden="true"></i>
      </button>
      <div id="password-help" class="invalid-feedback">
        Password minimal ${MIN_PASSWORD_LENGTH} karakter.
      </div>
    </div>`;
}

export function isPasswordValid(value) {
  return value.length >= MIN_PASSWORD_LENGTH;
}

export function setupPasswordField(form) {
  const input = form.querySelector('#password');
  const toggle = form.querySelector('#toggle-password');
  const icon = toggle.querySelector('i');

  toggle.addEventListener('click', () => {
    const wasVisible = input.type === 'text';
    input.type = wasVisible ? 'password' : 'text';
    icon.className = wasVisible ? 'bi bi-eye' : 'bi bi-eye-slash';
    toggle.setAttribute('aria-pressed', String(!wasVisible));
    toggle.setAttribute('aria-label', wasVisible ? 'Tampilkan password' : 'Sembunyikan password');
  });

  input.addEventListener('input', () => {
    input.classList.toggle('is-invalid', input.value.length > 0 && !isPasswordValid(input.value));
  });
}
