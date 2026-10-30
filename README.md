# Urban City Cuts

Website for Urban City Cuts Barbershop & Café, Iloilo City. React 18, Vite, Tailwind, Lenis, MapLibre (mapcn).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # chatbot regression tests (Node's built-in runner)
npm run build    # production build in dist/
```

## Pages
- `/` the website
- `/login`, `/admin` owner dashboard demo (edits prices, announcements and gallery; changes show on the site live)
- `/preview` device preview for showing the site on a phone

## Before going live
- **The admin login is a demo.** `admin` / `admin123` is in the page's JavaScript and protects nothing, and dashboard edits only save in the visitor's own browser. Replace it with real sign-in and a database, or remove `/admin` from the public build.
- Set `DEMO_MODE = false` in `src/lib/site.js` to hide the Tour / Admin / Mobile buttons and the guided tour.
- Fill the placeholders in `src/lib/site.js`: `BOOKING_URL` (GetMore), `FRANCHISE_FORM_URL` (Formspree), exact branch coordinates, and confirm the phone numbers.

## Images
`npm run` is not needed for photos; `node scripts/optimize-images.mjs` regenerates the responsive AVIF/WebP set in `public/img/` from `pictures of urban/`.
