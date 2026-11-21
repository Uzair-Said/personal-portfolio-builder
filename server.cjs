require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const Database = require('better-sqlite3')
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
if (isProduction && (jwtSecret.length < 32 || !adminEmail || adminPassword.length < 12 || adminPassword === 'ChangeMe123!')) {
  throw new Error('Production requires a JWT_SECRET of at least 32 characters, ADMIN_EMAIL, and a unique ADMIN_PASSWORD of at least 12 characters')
}
const dbPath = path.join(__dirname, 'portfolio.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

app.use(cors())
app.use(express.json({ limit: '10mb' }))

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
      name: 'Uzair Said',
      initials: 'US',
      tagline: 'Computer Science Graduate | IT Support | Web Development',
      title: 'Practical technology. Reliable support. Meaningful impact.',
      description: 'I’m Uzair Said, a Computer Science graduate with experience in IT support, web development, and digital service delivery. I solve technical problems, support the people who rely on technology, and build practical tools that make everyday work easier.',
      resume_summary: 'Computer Science graduate with practical experience in IT support, web development, and digital service delivery. Experienced in troubleshooting hardware and software, supporting enterprise ERP and citizen-service platforms, and building responsive web applications. Brings a user-focused approach, clear communication, and a commitment to reliable, effective solutions.',
      email: 'uzairsaid7@gmail.com',
      location: 'Mardan, Pakistan',
      profile_image: '/Profile pic.png',
      footer_text: 'IT Support · Web Development · Computer Science',
    }
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of Object.entries(settings)) insert.run(key, value)
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM menu_items').get().count) {
    const insert = db.prepare('INSERT INTO menu_items (label, path, position) VALUES (?, ?, ?)')
    ;[['Home', '/', 1], ['Resume', '/resume', 2], ['Projects', '/projects', 3], ['Contact', '/contact', 4]].forEach((item) => insert.run(...item))
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM sections').get().count) {
    const insert = db.prepare('INSERT INTO sections (key, eyebrow, title, description, content, position) VALUES (?, ?, ?, ?, ?, ?)')
    insert.run('hero', 'Computer Science Graduate | IT Support | Web Development', 'Practical technology. Reliable support. Meaningful impact.', 'I’m Uzair Said, a Computer Science graduate with experience in IT support, web development, and digital service delivery. I solve technical problems, support the people who rely on technology, and build practical tools that make everyday work easier.', '', 1)
    insert.run('featured-project', 'Featured project', 'Building reliable digital experiences', 'A selection of my software project work.', '', 2)
    insert.run('about', 'About this portfolio', 'Combining technical support with practical software development.', 'My experience covers hardware and software troubleshooting, citizen-facing digital platforms, React development, and cloud-enabled application projects.', '', 3)
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM projects').get().count) {
    db.prepare(`INSERT INTO projects (title, category, year, description, tech_stack, accent, position, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'Shop Swift — E-Commerce Platform', 'React & Firebase', '2025',
      'A full-featured e-commerce application for premium tech retail.',
      'React.js, Firebase Realtime Database, Auth0, React Router, JavaScript, Bootstrap',
      'mint', 1, 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM experience').get().count) {
    db.prepare(`INSERT INTO experience (role, organization, location, start_date, end_date, description, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'IT Support Intern', 'Citizen Facilitation Centre (CFC)', 'Mardan, Pakistan',
      '04/08/2025', 'Present',
      'Maintained hardware and software systems, resolved network and application issues, and guided staff and citizens through digital public-service portals.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM education').get().count) {
    db.prepare(`INSERT INTO education (degree, institution, location, start_date, end_date, description, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'Bachelor of Computer Science (Honours)', 'Abdul Wali Khan University Mardan', 'Mardan, Pakistan',
      '04/10/2021', '28/07/2025', 'Honours degree in Computer Science.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM certifications').get().count) {
    db.prepare(`INSERT INTO certifications (title, issuer, date, description, position)
      VALUES (?, ?, ?, ?, ?)`).run(
      'Generative AI Training Course — Top Performer Certificate', 'IdeaGist', '20/12/2025', 'Generative AI training course completed online.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM awards').get().count) {
    db.prepare(`INSERT INTO awards (title, issuer, date, description, position)
      VALUES (?, ?, ?, ?, ?)`).run(
      'Career Finder Tournament Winner', 'AWS Cloud Club AWKUM', '2025', 'Project-based tournament winner.', 1,
    )
  }

  if (!db.prepare('SELECT COUNT(*) AS count FROM skills').get().count) {
    const insert = db.prepare('INSERT INTO skills (name, category, position) VALUES (?, ?, ?)')
    ;[
      ['Microsoft Office', 'Tools', 1], ['Python', 'Programming', 2], ['SQL', 'Programming', 3],
      ['LaTeX', 'Tools', 4], ['React.js', 'Frontend', 5], ['Firebase', 'Backend', 6], ['Auth0', 'Authentication', 7],
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
  const tx = db.transaction((values) => {
    for (const [key, value] of Object.entries(values)) insert.run(key, String(value ?? ''))
  })
  tx(body)
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
  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
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
      to: 'uzairsaid7@gmail.com',
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
for (const table of crudTables) {
  app.get(`/api/admin/${table}`, requireAuth, (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY position ASC, id ASC`).all())
  })
  app.post(`/api/admin/${table}`, requireAuth, (req, res) => {
    const data = { ...req.body }
    delete data.id
    const keys = Object.keys(data)
    if (!keys.length) return res.status(400).json({ error: 'No fields supplied' })
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
    const result = db.prepare(sql).run(...keys.map((key) => data[key]))
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid)
    if (table === 'sections') syncSettingsFromHeroSection(row)
    res.status(201).json(row)
  })
  app.put(`/api/admin/${table}/:id`, requireAuth, (req, res) => {
    const data = { ...req.body }
    delete data.id
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

app.listen(port, () => {
  console.log(`Portfolio CMS running at http://localhost:${port}`)
  console.log(`Admin account: ${adminEmail}`)
})
