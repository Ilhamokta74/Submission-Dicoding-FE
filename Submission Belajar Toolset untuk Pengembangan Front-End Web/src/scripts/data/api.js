import axios from 'axios';

const BASE_URL = 'https://story-api.dicoding.dev/v1';
const TOKEN_KEY = 'story_token';
const NAME_KEY = 'story_name';
const MAX_PHOTO_SIZE = 1024 * 1024; // 1MB sesuai dokumentasi API

// Axios instance: dipakai untuk SEMUA request
const http = axios.create({ baseURL: BASE_URL, timeout: 15000 });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = /\/(login|register)$/.test(error.config?.url ?? '');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(NAME_KEY);
      location.hash = '#/login';
    }
    return Promise.reject(error);
  },
);

// SESUAIKAN pola ini setelah melihat pesan error asli dari API (tab Network)
const FRIENDLY_MESSAGES = [
  [/invalid password/i, 'Password salah. Silakan coba lagi.'],
  [/user not found/i, 'Email belum terdaftar. Silakan daftar terlebih dahulu.'],
  [/already|taken/i, 'Email sudah digunakan. Gunakan email lain atau login.'],
  [/valid email/i, 'Format email tidak valid.'],
  [/at least 8|8 char/i, 'Password minimal 8 karakter.'],
];

function toError(error) {
  if (error.response) {
    const raw = error.response.data?.message ?? '';
    const match = FRIENDLY_MESSAGES.find(([pattern]) => pattern.test(raw));
    return new Error(match ? match[1] : raw || 'Terjadi kesalahan pada server.');
  }
  if (error.request) {
    return new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }
  return new Error(error.message);
}

function buildStoryForm({ description, photo, lat, lon }) {
  if (photo.size > MAX_PHOTO_SIZE) throw new Error('Ukuran foto maksimal 1MB.');
  const form = new FormData();
  form.append('description', description);
  form.append('photo', photo);
  if (lat !== null && lat !== undefined) form.append('lat', lat);
  if (lon !== null && lon !== undefined) form.append('lon', lon);
  return form;
}

export const Auth = {
  getName: () => localStorage.getItem(NAME_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
  },

  async register({ name, email, password }) {
    try {
      const { data } = await http.post('/register', { name, email, password });
      return data;
    } catch (e) {
      throw toError(e);
    }
  },

  async login({ email, password }) {
    try {
      const { data } = await http.post('/login', { email, password });
      const { token, name } = data.loginResult;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(NAME_KEY, name);
      return data.loginResult;
    } catch (e) {
      throw toError(e);
    }
  },
};

export const StoryApi = {
  async getStories({ page, size, location = 0 } = {}) {
    try {
      const { data } = await http.get('/stories', { params: { page, size, location } });
      return data.listStory;
    } catch (e) {
      throw toError(e);
    }
  },

  async getStoryDetail(id) {
    try {
      const { data } = await http.get(`/stories/${id}`);
      return data.story;
    } catch (e) {
      throw toError(e);
    }
  },

  async addStory(payload) {
    const form = buildStoryForm(payload);
    try {
      const { data } = await http.post('/stories', form); // Content-Type diatur otomatis
      return data;
    } catch (e) {
      throw toError(e);
    }
  },
};
