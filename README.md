# Portfolio CMS

A full-stack, customizable portfolio built with React, TypeScript, Vite, Express, and SQLite. It includes a responsive public website and an authenticated browser-based CMS.

## Features

- Responsive portfolio pages for profile, resume, projects, project details, and contact
- Browser-based administration at `/admin`
- Editable profile settings, navigation, sections, projects, experience, education, certifications, awards, and skills
- Rich-text content editing
- Profile, project, certificate, and award file uploads
- Print-friendly resume layout
- Honeypot-protected contact form with SMTP email delivery
- JWT authentication and password management
- Fictional seed content for a ready-to-customize first launch
- SQLite database suitable for small portfolio deployments

## Requirements

- Node.js 20.19 or newer
- npm
- SMTP credentials for contact form email delivery
- For cPanel deployment: Node.js Application Manager and persistent writable storage

## Local setup

1. Clone the repository and install dependencies:

   ```sh
   npm install
   ```

2. Copy the environment template:

   ```sh
   copy .env.example .env
   ```

   On macOS or Linux, use `cp .env.example .env` instead.

3. Start the frontend and API together:

   ```sh
   npm run cms
   ```

4. Open:

   - Public website: <http://localhost:5173>
   - CMS: <http://localhost:5173/admin>

The local development administrator is:

- Email: `admin@portfolio.local`
- Password: `ChangeMe123!`

Change these values before using the project publicly.

The first launch creates `portfolio.db` with fictional sample content. Use the CMS to replace it with your profile and portfolio data.

## Content customization

Sign in at `/admin`, open **Website settings**, and update:

- Name, initials, title, tagline, and professional summary
- Email, phone, location, LinkedIn, and GitHub
- Profile image and footer text

Use the CMS tabs to manage:

- Menu items
- Homepage sections
- Projects and project galleries
- Professional experience
- Education
- Certifications and credential files
- Awards and award files
- Technical skills

Uploaded images and documents are stored in `public/uploads/` and referenced from SQLite.

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | API port; defaults to `3001` locally |
| `NODE_ENV` | Set to `production` for production deployments |
| `JWT_SECRET` | Long random secret used to sign CMS sessions |
| `ADMIN_EMAIL` | Initial administrator email |
| `ADMIN_PASSWORD` | Initial administrator password |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port, usually `587` |
| `SMTP_SECURE` | Set to `true` for implicit TLS, otherwise `false` |
| `SMTP_USER` | SMTP account username |
| `SMTP_PASS` | SMTP account password or application password |
| `SMTP_FROM` | Sender address authorized by your email provider |
| `CONTACT_RECIPIENT` | Inbox that receives contact form submissions |

Never commit `.env`, secrets, database files, or uploaded user content.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start only the Vite frontend |
| `npm run server` | Start only the Express CMS API |
| `npm run cms` | Start the frontend and API together |
| `npm run build` | Create the production build with a memory-limited Node process |
| `npm run lint` | Run the configured linter |
| `npm run check` | Run lint, TypeScript validation, and the production build |
| `npm start` | Build the project and start the Express server |
| `npm run preview` | Preview the Vite build |
| `npm run native:rebuild` | Rebuild the native SQLite dependency |

The cPanel `npm run build` command uses Esbuild rather than Vite's development bundler, avoiding WebAssembly memory allocation failures on constrained shared hosts. Vite remains available for local development. For cPanel, use Node.js 20 or 22 rather than Node.js 24.

## Project structure

```text
src/
  App.tsx                 Public pages and routes
  App.css                 Public website styles
  AdminPanelForms.tsx     CMS interface
  AdminPanel.css          CMS styles
  RichText.tsx            Sanitized rich-text renderer
  RichTextEditor.tsx      CMS rich-text editor
  richTextUtils.ts        Rich-text conversion and sanitization
  main.tsx                React entry point
server.cjs                Express API, SQLite, authentication, and uploads
public/                   Static assets and uploaded files
vite.config.ts            Vite and development proxy configuration
dist/                     Generated production build
portfolio.db              Generated SQLite database
```

Generated directories and runtime files are excluded by `.gitignore`:

- `dist/`
- `node_modules/`
- `portfolio.db`, `portfolio.db-shm`, `portfolio.db-wal`
- `public/uploads/`
- `.env`

## cPanel deployment

This project requires cPanel **Setup Node.js App / Application Manager** support. It is not a static-only website because it uses a Node.js API, SQLite, authentication, uploads, and SMTP delivery.

1. Clone this repository into the Node.js application's root directory using cPanel Git Version Control.
2. Create a Node.js application with Node.js 20.19 or newer.
3. Set the application root to the repository and the startup file to `server.cjs`.
4. Configure all production environment variables in the cPanel application environment.
5. Run `npm install`.
6. Run `npm run native:rebuild` if `better-sqlite3` reports a native ABI or binary error.
7. Run `npm run build`.
8. Restart the application.
9. Map the domain or subdomain to the Node.js application.
10. Verify `https://your-domain.example/api/health` returns:

    ```json
    {"status":"ok","database":"ok"}
    ```

The application root must contain:

- `server.cjs`
- `package.json`
- `node_modules/`
- `dist/`

The server reads cPanel's assigned `PORT` automatically. Do not configure the startup file as `dist/index.html`.

## Database and file persistence

SQLite and uploaded files must remain on persistent storage:

- Database: `portfolio.db`
- Uploads: `public/uploads/`

Back up the database and uploads regularly. Keep both outside version control and restore them together to avoid broken file references.

## Contact form

The contact form sends messages through SMTP to `CONTACT_RECIPIENT`. The visitor's email is used as `replyTo`, allowing replies to reach the visitor directly.

In local development, the form only works after SMTP variables are configured. The server returns `503` when email delivery is not configured.

## Security

- Use unique production values for `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
- The production server refuses to start if required credentials are missing or use development defaults.
- Use HTTPS for public deployments.
- Restrict `/admin` access with hosting-level controls where possible.
- Back up and protect `portfolio.db` and `public/uploads/`.
- The first production launch creates the administrator account. Later environment-variable changes do not update an existing account password; change passwords through the CMS.

SQLite is suitable for a small portfolio with low to moderate traffic. Larger deployments may require a managed database and object storage.
