import { StoryApi } from '../data/api.js';
import { hideAlert, setButtonLoading, showAlert } from '../utils/ui.js';

const MAX_PHOTO_SIZE = 1024 * 1024;

function parseCoord(value, min, max) {
  if (value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : NaN;
}

export default {
  render(container) {
    container.innerHTML = `
      <section class="card auth-card shadow-sm" style="max-width: 640px">
        <div class="card-body p-4">
          <h1 class="h3 mb-3">Tambah Story</h1>
          <div id="form-alert" class="alert d-none" role="alert" aria-live="assertive"></div>
          <form id="story-form" novalidate>
            <label for="description" class="form-label">Deskripsi</label>
            <textarea id="description" class="form-control mb-3" rows="4" required></textarea>

            <label for="photo" class="form-label">Foto (maks. 1MB)</label>
            <input type="file" id="photo" class="form-control mb-2" accept="image/*" required />
            <img id="preview" class="img-fluid rounded mb-3 d-none" alt="Pratinjau foto" />

            <div class="row g-3 mb-3">
              <div class="col">
                <label for="lat" class="form-label">Latitude (opsional)</label>
                <input type="number" id="lat" class="form-control" step="any" />
              </div>
              <div class="col">
                <label for="lon" class="form-label">Longitude (opsional)</label>
                <input type="number" id="lon" class="form-control" step="any" />
              </div>
            </div>
            <button type="submit" id="submit-btn" class="btn btn-primary w-100">Kirim Story</button>
          </form>
        </div>
      </section>`;

    const form = container.querySelector('#story-form');
    const alertBox = container.querySelector('#form-alert');
    const button = container.querySelector('#submit-btn');
    const photoInput = form.querySelector('#photo');
    const preview = form.querySelector('#preview');
    let previewUrl = null;

    photoInput.addEventListener('change', () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const file = photoInput.files[0];
      if (!file) {
        preview.classList.add('d-none');
        return;
      }
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      preview.classList.remove('d-none');
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideAlert(alertBox);
      const description = form.querySelector('#description').value.trim();
      const photo = photoInput.files[0];
      const lat = parseCoord(form.querySelector('#lat').value, -90, 90);
      const lon = parseCoord(form.querySelector('#lon').value, -180, 180);

      if (!description) return showAlert(alertBox, 'Deskripsi wajib diisi.');
      if (!photo) return showAlert(alertBox, 'Pilih foto terlebih dahulu.');
      if (!photo.type.startsWith('image/')) return showAlert(alertBox, 'File harus berupa gambar.');
      if (photo.size > MAX_PHOTO_SIZE) return showAlert(alertBox, 'Ukuran foto maksimal 1MB.');
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return showAlert(alertBox, 'Koordinat tidak valid.');
      }

      setButtonLoading(button, true);
      try {
        await StoryApi.addStory({ description, photo, lat, lon });
        location.hash = '#/';
      } catch (err) {
        showAlert(alertBox, err.message);
        setButtonLoading(button, false, 'Kirim Story');
      }
    });
  },
};
