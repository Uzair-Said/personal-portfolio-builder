# Uzair Said Portfolio

A React, TypeScript, and Vite portfolio with an Express CMS API, SQLite storage, and a browser-based admin panel.

## Local development

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the frontend and API together:

   ```sh
   npm run cms
   ```

4. Open `http://localhost:5173`. The admin panel is at `http://localhost:5173/admin`.

The local development admin account is `admin@portfolio.local` / `ChangeMe123!`. Change these values before exposing the app publicly.

## cPanel deployment

This app requires cPanel hosting with **Setup Node.js App / Application Manager** support. It is not a static-only website: the CMS requires a running Node.js process, a writable SQLite database, and persistent upload storage.

1. In cPanel Git Version Control, clone `https://github.com/Uzair-Said/Portfolio.git` directly into the Node.js application's root directory. Keep this directory as a Git working copy; do not deploy over it using File Manager or an archive.
2. Create a Node.js application using Node.js 20.19 or newer (22.12 or newer is preferred). Set its application root to this repository and its startup file to `server.cjs`. Do not set the startup file to `dist/index.html`.
3. Add production environment variables in cPanel:
   - `NODE_ENV=production`
   - `PORT` (use the value assigned by cPanel, if provided)
   - `JWT_SECRET` (a long, unique, randomly generated secret)
   - `ADMIN_EMAIL` (your admin email)
   - `ADMIN_PASSWORD` (a unique password of at least 12 characters)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` (SMTP settings provided by your email host; use a mailbox authorized to send from your domain)
4. Run `npm install` from the application root using cPanel's terminal or Node.js application interface.
5. If `better-sqlite3` reports a binary or ABI error, run `npm run native:rebuild`.
6. Run `npm run build`.
7. Restart the Node.js application in cPanel, then map or point the domain/subdomain to that Node.js application using cPanel's domain or application route controls. Do not replace the application mapping with a static document-root-only site.
8. Check `https://your-domain.example/api/health`. It must return `{"status":"ok","database":"ok"}`. Then open `/admin` and confirm the public site and uploaded files.

If cPanel returns `503`, open the application log and verify that `node server.cjs` is still running. Do not use cPanel's assigned `PORT` manually; the application reads it automatically. The application root must contain `server.cjs`, `package.json`, `node_modules`, and the generated `dist` directory.

The server creates `portfolio.db` on first launch and stores uploaded files in `public/uploads`. Both locations must be writable and must persist across application restarts and deployments. Back up the database and uploads regularly.

The contact form sends submissions to `uzairsaid7@gmail.com` using the configured SMTP mailbox. The visitor's email is set as the reply-to address. Set the SMTP variables in the local `.env` or cPanel environment configuration, then restart the Node.js app. Do not use the recipient address as the SMTP username unless your email provider authorizes it for sending.

The first production launch creates the initial administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Changing these environment values later does not change an already-created account; use the CMS password-management API or update the administrator record through a secure maintenance process.

## Security and deployment notes

- Never commit `.env`, `portfolio.db`, or user-uploaded files. These are excluded by `.gitignore`.
- `.env.example` contains placeholders only. Configure real secrets in cPanel's environment settings.
- The server refuses to start in production if `JWT_SECRET` or `ADMIN_PASSWORD` is missing or still has the development default.
- For a production website, use HTTPS and restrict access to `/admin` as appropriate for your hosting setup.
- SQLite is suitable for a small portfolio CMS. Use a managed database and object storage if the content volume or traffic grows.
