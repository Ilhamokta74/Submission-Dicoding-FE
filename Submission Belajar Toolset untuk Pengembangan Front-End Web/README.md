# Story App

SPA (Vite + Bootstrap + Lit) yang memakai Story API Dicoding.

## Menjalankan
```bash
npm install
npm run dev      # development
npm run build    # production build ke dist/
npm run lint     # ESLint + Prettier
```

## Struktur
- `src/scripts/data/api.js` : Axios instance, Auth, StoryApi
- `src/scripts/routes/router.js` : hash router + route guard
- `src/scripts/pages/` : home, add-story, login, register
- `src/scripts/components/` : navbar, `<loading-indicator>` (Lit)
- `src/scripts/utils/` : helper UI dan field password
