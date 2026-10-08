export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function showAlert(box, message, type = 'danger') {
  box.className = `alert alert-${type}`;
  box.textContent = message;
}

export function hideAlert(box) {
  box.className = 'alert d-none';
  box.textContent = '';
}

export function setButtonLoading(button, loading, label) {
  button.disabled = loading;
  button.innerHTML = loading
    ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Memproses...'
    : label;
}
