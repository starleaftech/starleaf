# STARLEAF Technologies — Vercel Production V2

Vercel-ready static website + Node.js serverless contact API.

## V2 fixes

- Mobile-first hero layout: dashboard no longer forces the page horizontally off-screen.
- Responsive dashboard cards constrained to their column.
- Back-to-top button rebuilt with a consistent fixed position, safe-area support and reliable pointer state.
- Equal-height cards across service, portfolio, blog and statistics grids.
- All internal routes normalized to clean absolute URLs.
- Removed remaining `.php` navigation links.
- Added legacy redirects for `/home` and old `.php` URLs.
- Fixed nested-page asset paths by using `/assets/...`.
- Fixed service-page Lottie asset resolution.
- Fixed service-page canonical URLs.
- Homepage counters render their final values before JavaScript enhancement.
- Added `sitemap.xml` and updated `robots.txt`.
- Added a generated favicon.
- Added security headers in `vercel.json`.
- Contact form uses `/api/contact` with SMTP environment variables.

## Vercel deployment

Framework preset: **Other**

Build command: **empty**

Output directory: **empty**

Deploy the repository root.

### Required environment variables

`SMTP_HOST`
`SMTP_PORT`
`SMTP_USER`
`SMTP_PASS`
`SMTP_FROM`
`CONTACT_TO`
`SMTP_SECURE`

For port 587, leave `SMTP_SECURE` empty. For port 465 SSL, set `SMTP_SECURE=ssl`.

Never commit SMTP credentials.
