import { LitElement, html } from 'lit';

class LoadingIndicator extends LitElement {
  static properties = { label: { type: String } };

  // Light DOM agar gaya Bootstrap berlaku
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="d-flex justify-content-center align-items-center py-5" role="status">
        <div class="spinner-border text-primary me-2" aria-hidden="true"></div>
        <span>${this.label ?? 'Memuat...'}</span>
      </div>
    `;
  }
}

customElements.define('loading-indicator', LoadingIndicator);
