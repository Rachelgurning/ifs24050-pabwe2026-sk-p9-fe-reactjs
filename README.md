# ifs24050-pabwe2026-sk-p9-fe-reactjs — Delcom Blog (React SPA)

## Jalankan lokal (port 5174, proxy /api -> :8081)
```bash
npm install
npm run dev        # http://localhost:5174
```
Rute: `/`, `/public`, `/posts/:slug`, `/login`, `/register`, `/author`, `/admin`.

## Build & deploy (hosting statis)
```bash
# set URL backend hasil deploy:
# Windows PowerShell: $env:VITE_API_URL="https://ifs24050-pabwe2026-sk-p9-be-golang-gin.xxx"
npm run build      # hasil di dist/
```
- Vercel: nama project `ifs24050-pabwe2026-sk-p9-fe-reactjs`, Environment Variable `VITE_API_URL`, `vercel.json` sudah berisi SPA rewrite + cache aset.
- Netlify / Cloudflare Pages: `public/_redirects` sudah ada. Docker: `Dockerfile` + `nginx.conf`.
- Jika `VITE_API_URL` kosong dan domain FE mengandung `-fe-reactjs`, API otomatis diarahkan ke domain yang sama dengan `-be-golang-gin`.
- URL hasil deploy wajib diawali `https://ifs24050-pabwe2026-sk-p9-fe-reactjs`.
