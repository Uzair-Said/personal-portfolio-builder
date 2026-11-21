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

### Automatic deployment on GitHub pushes

The GitHub Actions workflow at `.github/workflows/deploy-cpanel.yml` deploys each push to `main` over SSH. It fetches and fast-forward pulls the cPanel Git working copy, runs `npm ci` and `npm run build`, then touches `tmp/restart.txt` to restart the Node.js app managed by cPanel/Passenger.

Before it can run:

1. Complete the initial cPanel Git clone and Node.js app setup above.
2. Because the repository is private, authorize cPanel to fetch it. Add a read-only GitHub deploy key using the cPanel account's SSH public key, and configure the cPanel clone's `origin` to use that SSH key. Keep this GitHub deploy key separate from the key GitHub Actions uses to SSH into cPanel.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `CPANEL_SSH_HOST`: your cPanel server's SSH hostname.
   - `CPANEL_SSH_PORT`: the SSH port (usually `22`).
   - `CPANEL_SSH_USER`: your cPanel SSH account username.
   - `CPANEL_SSH_PRIVATE_KEY`: the private key for an SSH key whose public key is authorized in cPanel. Do not use a password or a GitHub access token here.
   - `CPANEL_SSH_KNOWN_HOSTS`: the server's verified SSH host-key line(s), obtained from your hosting provider or cPanel and verified with them.
   - `CPANEL_APP_PATH`: the absolute Linux path to the Git clone and Node.js app root, for example `/home/CPANEL_USER/portfolio`.
4. Ensure SSH access and the required commands (`git`, `npm`, `node`) are available for the cPanel account. The Node.js app's restart mechanism must honor `tmp/restart.txt`.
5. Push a commit to `main`, then check **GitHub → Actions → Deploy to cPanel** for the deployment result.

The workflow uses strict SSH host-key checking. It will stop rather than deploy if required secrets are missing, the cPanel app directory is not the expected Git clone, or the branch cannot be fast-forwarded. It does not remove or overwrite the SQLite database or uploaded files.

The first production launch creates the initial administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Changing these environment values later does not change an already-created account; use the CMS password-management API or update the administrator record through a secure maintenance process.

## Security and deployment notes

- Never commit `.env`, `portfolio.db`, or user-uploaded files. These are excluded by `.gitignore`.
- `.env.example` contains placeholders only. Configure real secrets in cPanel's environment settings.
- The server refuses to start in production if `JWT_SECRET` or `ADMIN_PASSWORD` is missing or still has the development default.
- For a production website, use HTTPS and restrict access to `/admin` as appropriate for your hosting setup.
- SQLite is suitable for a small portfolio CMS. Use a managed database and object storage if the content volume or traffic grows.
