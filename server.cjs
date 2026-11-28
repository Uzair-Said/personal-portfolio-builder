require('dotenv').config()

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { DatabaseSync } = require('node:sqlite')
const path = require('path')
const fs = require('fs')

const app = express()
const port = Number(process.env.PORT || 3001)
const isProduction = process.env.NODE_ENV === 'production'
const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'local-development-secret-change-before-deploying')
const adminEmail = process.env.ADMIN_EMAIL || (isProduction ? '' : 'admin@portfolio.local')
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'ChangeMe123!')
const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || smtpUser
const contactRecipient = process.env.CONTACT_RECIPIENT || smtpUser
if (isProduction && (jwtSecret.length < 32 || !adminEmail || adminPassword.length < 12 || adminPassword === 'ChangeMe123!')) {
  throw new Error('Production requires a JWT_SECRET of at least 32 characters, ADMIN_EMAIL, and a unique ADMIN_PASSWORD of at least 12 characters')
}
const dbPath = path.join(__dirname, 'portfolio.db')
const db = new DatabaseSync(dbPath)
db.exec('PRAGMA journal_mode = WAL')

app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT 1').get()
    res.json({ status: 'ok', database: 'ok' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'error', message: error.message })
  }
})

const publicDir = path.join(__dirname, 'public')
const uploadDir = path.join(publicDir, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
      cb(null, `${Date.now()}-${safeName}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
})

function seedSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      path TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS app_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      eyebrow TEXT,
      title TEXT,
      description TEXT,
      content TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      year TEXT,
      description TEXT,
      tech_stack TEXT,
      image TEXT,
      gallery_images TEXT NOT NULL DEFAULT '[]',
      url TEXT,
      accent TEXT DEFAULT 'mint',
      position INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      organization TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      degree TEXT NOT NULL,
      institution TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT,
      date TEXT,
      description TEXT,
      certificate_file TEXT,
      credential_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS awards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT,
      date TEXT,
      description TEXT,
      award_file TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      level TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
  `)

  const certificationColumns = db.prepare('PRAGMA table_info(certifications)').all()
  if (!certificationColumns.some((column) => column.name === 'certificate_file')) {
    db.exec('ALTER TABLE certifications ADD COLUMN certificate_file TEXT')
  }
  const awardColumns = db.prepare('PRAGMA table_info(awards)').all()
  if (!awardColumns.some((column) => column.name === 'award_file')) {
    db.exec('ALTER TABLE awards ADD COLUMN award_file TEXT')
  }
  const projectColumns = db.prepare('PRAGMA table_info(projects)').all()
  if (!projectColumns.some((column) => column.name === 'gallery_images')) {
    db.exec("ALTER TABLE projects ADD COLUMN gallery_images TEXT NOT NULL DEFAULT '[]'")
  }

  const settingCount = db.prepare('SELECT COUNT(*) AS count FROM settings').get().count
  if (!settingCount) {
    const settings = {
      name: 'Jordan Lee',
      initials: 'JL',
      site_title: 'Jordan Lee — Developer Portfolio',
      favicon_url: '/favicon.svg',
      logo_url: '',
      tagline: 'Full-Stack Developer | UX Enthusiast',
      title: 'Building thoughtful products for everyday people.',
      description: 'I am a full-stack developer focused on creating clear, dependable digital experiences. I combine modern web technologies with practical problem-solving to turn ideas into polished applications.',
      resume_summary: 'Full-stack developer with experience designing responsive web applications, accessible interfaces, and reliable APIs. Comfortable across frontend development, backend integration, databases, and collaborative delivery.',
      email: 'jordan.lee@example.com',
      location: 'Seattle, WA',
      phone: '+1 206 555 0142',
      linkedin_url: 'https://www.linkedin.com/',
      github_url: 'https://github.com/',
      profile_image: '/profile-placeholder.svg',
      footer_text: 'Full-Stack Development · UI/UX · Web Applications',
    }
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of Object.entries(settings)) insert.run(key, value)
  }
  else {
    const insertMissing = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of Object.entries({
      phone: '+1 206 555 0142',
      linkedin_url: 'https://www.linkedin.com/',
      github_url: 'https://github.com/',
      site_title: 'Jordan Lee — Developer Portfolio',
      favicon_url: '/favicon.svg',
      logo_url: '',
    })) insertMissing.run(key, value)
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM menu_items').get().count) {
    const insert = db.prepare('INSERT INTO menu_items (label, path, position) VALUES (?, ?, ?)')
    ;[['Home', '/', 1], ['Resume', '/resume', 2], ['Projects', '/projects', 3], ['Certificates', '/certificates', 4], ['Contact', '/contact', 5]].forEach((item) => insert.run(...item))
  }

  const certificateMenuMigration = 'certificates-menu-item'
  if (!db.prepare('SELECT 1 FROM app_migrations WHERE name = ?').get(certificateMenuMigration)) {
    const certificateMenuItem = db.prepare('SELECT 1 FROM menu_items WHERE path = ?').get('/certificates')
    if (!certificateMenuItem) {
      const position = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS position FROM menu_items').get().position
      db.prepare('INSERT INTO menu_items (label, path, position) VALUES (?, ?, ?)').run('Certificates', '/certificates', position)
    }
    db.prepare('INSERT INTO app_migrations (name) VALUES (?)').run(certificateMenuMigration)
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM sections').get().count) {
    const insert = db.prepare('INSERT INTO sections (key, eyebrow, title, description, content, position) VALUES (?, ?, ?, ?, ?, ?)')
    insert.run('hero', 'Full-Stack Developer | UX Enthusiast', 'Building thoughtful products for everyday people.', 'I am a full-stack developer focused on creating clear, dependable digital experiences. I combine modern web technologies with practical problem-solving to turn ideas into polished applications.', '', 1)
    insert.run('featured-project', 'Featured project', 'A smarter way to manage daily tasks', 'A selection of my recent product and engineering work.', '', 2)
    insert.run('about', 'About', 'Designing useful experiences from idea to launch.', 'My work spans interface design, application development, API integration, and continuous improvement. I enjoy collaborating with teams and making complex workflows feel simple.', '', 3)
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM projects').get().count) {
    db.prepare(`INSERT INTO projects (title, category, year, description, tech_stack, accent, position, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'Northstar Task Planner', 'Productivity Web App', '2026',
      'A responsive task planning application for organizing projects, deadlines, and team priorities.',
      'React, TypeScript, Node.js, SQLite, CSS',
      'mint', 1, 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM experience').get().count) {
    db.prepare(`INSERT INTO experience (role, organization, location, start_date, end_date, description, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'Full-Stack Developer', 'Northwind Digital Studio', 'Seattle, WA',
      '2024', 'Present',
      'Build and maintain responsive web applications, collaborate with designers and stakeholders, and improve API and database reliability.',
      1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM education').get().count) {
    db.prepare(`INSERT INTO education (degree, institution, location, start_date, end_date, description, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'Bachelor of Science in Computer Science', 'Example State University', 'Seattle, WA',
      '2020', '2024', 'Coursework included software engineering, databases, human-computer interaction, and distributed systems.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM certifications').get().count) {
    db.prepare(`INSERT INTO certifications (title, issuer, date, description, position)
      VALUES (?, ?, ?, ?, ?)`).run(
      'Frontend Development Certificate', 'Example Learning Institute', '2025', 'Completed an intensive course covering modern frontend engineering and accessibility.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM awards').get().count) {
    db.prepare(`INSERT INTO awards (title, issuer, date, description, position)
      VALUES (?, ?, ?, ?, ?)`).run(
      'Team Innovation Award', 'Northwind Digital Studio', '2025', 'Recognized for delivering a new internal planning tool used across the company.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM skills').get().count) {
    const insert = db.prepare('INSERT INTO skills (name, category, position) VALUES (?, ?, ?)')
    ;[
      ['React', 'Frontend', 1],
      ['TypeScript', 'Frontend', 2],
      ['Node.js', 'Backend', 3],
      ['SQLite', 'Databases', 4],
      ['Git', 'Tools', 5],
      ['Figma', 'Design', 6],
    ].forEach((item) => insert.run(...item))
  }
}

function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existing) {
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(adminEmail, bcrypt.hashSync(adminPassword, 10))
  }
}

seedSchema()
seedAdmin()

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all()
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

function setSettings(body) {
  const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
  db.exec('BEGIN')
  try {
    const values = body
    for (const [key, value] of Object.entries(values)) insert.run(key, String(value ?? ''))
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

function syncHeroSectionFromSettings(settings) {
  const hero = db.prepare('SELECT * FROM sections WHERE key = ? ORDER BY id ASC LIMIT 1').get('hero')
  if (!hero) return

  db.prepare('UPDATE sections SET eyebrow = ?, title = ?, description = ? WHERE id = ?').run(
    Object.hasOwn(settings, 'tagline') ? String(settings.tagline ?? '') : hero.eyebrow,
    Object.hasOwn(settings, 'title') ? String(settings.title ?? '') : hero.title,
    Object.hasOwn(settings, 'description') ? String(settings.description ?? '') : hero.description,
    hero.id,
  )
}

function syncSettingsFromHeroSection(section) {
  if (section.key !== 'hero') return

  const settings = {}
  if (section.eyebrow !== undefined) settings.tagline = section.eyebrow
  if (section.title !== undefined) settings.title = section.title
  if (section.description !== undefined) settings.description = section.description
  setSettings(settings)
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, jwtSecret)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email } })
})

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user || !bcrypt.compareSync(currentPassword || '', user.password_hash)) return res.status(400).json({ error: 'Current password is incorrect' })
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must contain at least 8 characters' })
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10))
  res.json({ success: true })
})

app.post('/api/contact', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  const honeypot = typeof req.body?.website === 'string' ? req.body.website.trim() : ''

  if (honeypot) return res.status(400).json({ error: 'Unable to send message' })
  if (!name || name.length > 120) return res.status(400).json({ error: 'Name is required and must be 120 characters or fewer' })
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' })
  }
  if (!message || message.length > 10000) return res.status(400).json({ error: 'Message is required and must be 10,000 characters or fewer' })
  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom || !contactRecipient || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    return res.status(503).json({ error: 'Email delivery is not configured. Please contact the site owner directly.' })
  }

  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    })
    await transporter.sendMail({
      from: smtpFrom,
      to: contactRecipient,
      replyTo: { name, address: email },
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Contact email delivery failed:', error)
    res.status(502).json({ error: 'Your message could not be sent right now. Please try again later.' })
  }
})

app.get('/api/content', (_req, res) => {
  const all = (table) => db.prepare(`SELECT * FROM ${table} WHERE enabled = 1 ORDER BY position ASC, id ASC`).all()
  res.json({
    settings: getSettings(),
    menu: db.prepare('SELECT * FROM menu_items WHERE enabled = 1 ORDER BY position ASC, id ASC').all(),
    sections: db.prepare('SELECT * FROM sections WHERE enabled = 1 ORDER BY position ASC, id ASC').all(),
    projects: all('projects'),
    experience: all('experience'),
    education: all('education'),
    certifications: all('certifications'),
    awards: all('awards'),
    skills: all('skills'),
  })
})

app.put('/api/settings', requireAuth, (req, res) => {
  setSettings(req.body)
  syncHeroSectionFromSettings(req.body)
  res.json({ settings: getSettings() })
})

const crudTables = ['menu_items', 'sections', 'projects', 'experience', 'education', 'certifications', 'awards', 'skills']
const crudFields = {
  menu_items: ['label', 'path', 'position', 'enabled'],
  sections: ['key', 'eyebrow', 'title', 'description', 'content', 'position', 'enabled'],
  projects: ['title', 'category', 'year', 'description', 'tech_stack', 'image', 'gallery_images', 'url', 'accent', 'position', 'featured', 'enabled'],
  experience: ['role', 'organization', 'location', 'start_date', 'end_date', 'description', 'position', 'enabled'],
  education: ['degree', 'institution', 'location', 'start_date', 'end_date', 'description', 'position', 'enabled'],
  certifications: ['title', 'issuer', 'date', 'description', 'certificate_file', 'credential_url', 'position', 'enabled'],
  awards: ['title', 'issuer', 'date', 'description', 'award_file', 'position', 'enabled'],
  skills: ['name', 'category', 'level', 'position', 'enabled'],
}
for (const table of crudTables) {
  app.get(`/api/admin/${table}`, requireAuth, (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY position ASC, id ASC`).all())
  })
  app.post(`/api/admin/${table}`, requireAuth, (req, res) => {
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => crudFields[table].includes(key)))
    const keys = Object.keys(data)
    if (!keys.length) return res.status(400).json({ error: 'No fields supplied' })
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
    const result = db.prepare(sql).run(...keys.map((key) => data[key]))
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid)
    if (table === 'sections') syncSettingsFromHeroSection(row)
    res.status(201).json(row)
  })
  app.put(`/api/admin/${table}/:id`, requireAuth, (req, res) => {
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => crudFields[table].includes(key)))
    const keys = Object.keys(data)
    if (!keys.length) return res.status(400).json({ error: 'No fields supplied' })
    const sql = `UPDATE ${table} SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`
    db.prepare(sql).run(...keys.map((key) => data[key]), Number(req.params.id))
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(Number(req.params.id))
    if (table === 'sections' && row) syncSettingsFromHeroSection(row)
    res.json(row)
  })
  app.delete(`/api/admin/${table}/:id`, requireAuth, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(Number(req.params.id))
    res.status(204).end()
  })
}

app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.status(201).json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename })
})

app.use('/uploads', express.static(uploadDir))
app.use(express.static(publicDir))

const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio CMS running on port ${port}`)
  console.log(`Admin account: ${adminEmail}`)
})

server.on('error', (error) => {
  console.error('Portfolio CMS failed to start:', error)
  process.exit(1)
})
