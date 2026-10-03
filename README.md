# STARLEAF Technologies — Vercel-ready deployment

This package converts the original PHP/Apache website into a Vercel-friendly deployment:

- Static HTML pages generated from the original PHP templates
- Existing CSS, JavaScript, images and Lottie assets preserved
- Clean URLs such as `/about`, `/services/ai-development`, `/contact`
- Vercel serverless contact endpoint at `/api/contact`
- SMTP credentials moved to Vercel Environment Variables
- No PHP runtime or `.htaccess` required

## Deploy

1. Upload/push this folder to GitHub.
2. Import the repository into Vercel.
3. Framework preset: **Other**
4. Root Directory: leave as repository root.
5. Build Command: **leave empty**
6. Output Directory: **leave empty**
7. Deploy.

## Required Vercel Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

- `SMTP_HOST` — SMTP server hostname
- `SMTP_PORT` — usually `587` for STARTTLS or `465` for SSL
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password/app password/API credential
- `SMTP_FROM` — verified sender address
- `CONTACT_TO` — address that receives website enquiries
- `SMTP_SECURE` — `ssl` for port 465; leave empty for STARTTLS/587

Do NOT put real SMTP passwords into source files.

## Local test

```bash
npm install
npx vercel dev
```

Then open `/contact` and submit the form.

## Important

The original PHP source, `.htaccess`, and PHPMailer are intentionally not required by the Vercel deployment package. The site is pre-rendered to static HTML and the contact form uses a Node.js serverless function.
