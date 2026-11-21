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
2. Create a Node.js application using Node.js 20 or newer. Set its application root to this repository and its startup file to `server.cjs`.
3. Add production environment variables in cPanel:
   - `NODE_ENV=production`
   - `PORT` (use the value assigned by cPanel, if provided)
   - `JWT_SECRET` (a long, unique, randomly generated secret)
   - `ADMIN_EMAIL` (your admin email)
   - `ADMIN_PASSWORD` (a unique password of at least 12 characters)
4. Run `npm install` from the application root using cPanel's terminal or Node.js application interface.
5. Run `npm run build`.
6. Restart the Node.js application in cPanel and point the domain or subdomain at the application.
7. Open `/admin`, sign in with the configured admin credentials, and confirm the public site and uploaded files are working.

The server creates `portfolio.db` on first launch and stores uploaded files in `public/uploads`. Both locations must be writable and must persist across application restarts and deployments. Back up the database and uploads regularly.

The first production launch creates the initial administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Changing these environment values later does not change an already-created account; use the CMS password-management API or update the administrator record through a secure maintenance process.

## Security and deployment notes

- Never commit `.env`, `portfolio.db`, or user-uploaded files. These are excluded by `.gitignore`.
- `.env.example` contains placeholders only. Configure real secrets in cPanel's environment settings.
- The server refuses to start in production if `JWT_SECRET` or `ADMIN_PASSWORD` is missing or still has the development default.
- For a production website, use HTTPS and restrict access to `/admin` as appropriate for your hosting setup.
- SQLite is suitable for a small portfolio CMS. Use a managed database and object storage if the content volume or traffic grows.
