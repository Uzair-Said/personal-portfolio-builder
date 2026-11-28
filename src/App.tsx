import { lazy, Suspense, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, ExternalLink, Mail, MapPin, Menu, Phone, Printer, X } from 'lucide-react'
import './App.css'
import { RichText } from './RichText'
import { hasRichTextMarkup } from './richTextUtils'

const AdminPanel = lazy(() => import('./AdminPanelForms'))

type CmsContent = {
  settings: Record<string, string>
  menu: Array<{ label: string; path: string }>
  sections: Array<{ key: string; eyebrow: string; title: string; description: string }>
  projects: Array<{ id: number; title: string; category: string; year: string; description: string; tech_stack: string; image?: string; gallery_images?: string; url?: string; accent: string; featured: number; enabled: number }>
  experience: Array<{ id: number; role: string; organization: string; location: string; start_date: string; end_date: string; description: string }>
  education: Array<{ id: number; degree: string; institution: string; location: string; start_date: string; end_date: string; description: string }>
  certifications: Array<{ id: number; title: string; issuer: string; date: string; description: string; certificate_file?: string; credential_url?: string }>
  awards: Array<{ id: number; title: string; issuer: string; date: string; description: string; award_file?: string }>
  skills: Array<{ id: number; name: string; category: string }>
}

const fallbackContent: CmsContent = {
  settings: {
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
  },
  menu: [{ label: 'Home', path: '/' }, { label: 'Resume', path: '/resume' }, { label: 'Projects', path: '/projects' }, { label: 'Contact', path: '/contact' }],
  sections: [
    { key: 'hero', eyebrow: 'Full-Stack Developer | UX Enthusiast', title: 'Building thoughtful products for everyday people.', description: 'I am a full-stack developer focused on creating clear, dependable digital experiences.' },
    { key: 'featured-project', eyebrow: 'Featured project', title: 'A smarter way to manage daily tasks', description: 'A selection of my recent product and engineering work.' },
    { key: 'about', eyebrow: 'About', title: 'Designing useful experiences from idea to launch.', description: 'I enjoy building accessible interfaces and dependable applications.' },
  ],
  projects: [{ id: 1, title: 'Northstar Task Planner', category: 'Productivity Web App', year: '2026', description: 'A responsive task planning application for organizing projects, deadlines, and team priorities.', tech_stack: 'React, TypeScript, Node.js, SQLite, CSS', accent: 'mint', featured: 1, enabled: 1 }],
  experience: [{ id: 1, role: 'Full-Stack Developer', organization: 'Northwind Digital Studio', location: 'Seattle, WA', start_date: '2024', end_date: 'Present', description: 'Build and maintain responsive web applications, collaborate with designers and stakeholders, and improve API and database reliability.' }],
  education: [{ id: 1, degree: 'Bachelor of Science in Computer Science', institution: 'Example State University', location: 'Seattle, WA', start_date: '2020', end_date: '2024', description: 'Coursework included software engineering, databases, human-computer interaction, and distributed systems.' }],
  certifications: [{ id: 1, title: 'Frontend Development Certificate', issuer: 'Example Learning Institute', date: '2025', description: 'Completed an intensive course covering modern frontend engineering and accessibility.' }],
  awards: [{ id: 1, title: 'Team Innovation Award', issuer: 'Northwind Digital Studio', date: '2025', description: 'Recognized for delivering a new internal planning tool used across the company.' }],
  skills: [
    { id: 1, name: 'React', category: 'Frontend' }, { id: 2, name: 'TypeScript', category: 'Frontend' },
    { id: 3, name: 'Node.js', category: 'Backend' }, { id: 4, name: 'SQLite', category: 'Databases' },
  ],
}

function projectSlug(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function projectPath(project: CmsContent['projects'][number], projects: CmsContent['projects']): string {
  const slug = projectSlug(project.title) || `project-${project.id}`
  const duplicateSlug = projects.some((other) => other.id !== project.id && projectSlug(other.title) === slug)
  return `/projects/${duplicateSlug ? `${slug}-${project.id}` : slug}`
}

function Header({ content }: { content: CmsContent }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Go to home">
        {content.settings.logo_url
          ? <span className="brand-mark brand-logo"><img src={content.settings.logo_url} alt="" /></span>
          : <span className="brand-mark">{content.settings.initials || 'JL'}</span>}
        <span><strong>{content.settings.name || 'Jordan Lee'}</strong><small>{content.settings.tagline || 'Portfolio'}</small></span>
      </NavLink>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={open ? 'nav open' : 'nav'}>
        {content.menu.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>
        ))}
      </nav>
    </header>
  )
}

function PageTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <section className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {copy && <p>{copy}</p>}
    </section>
  )
}

function Home({ content }: { content: CmsContent }) {
  const heroSection = content.sections.find((section) => section.key === 'hero')

  return (
    <>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">{heroSection?.eyebrow || content.settings.tagline}</span>
            <h1>{content.settings.title || heroSection?.title || 'Technology with purpose.'}</h1>
            <RichText className="hero-description rich-text-content" content={content.settings.description || heroSection?.description || ''} />
            <div className="hero-actions">
              <NavLink className="button primary" to="/projects">Explore my work <ArrowRight size={18} /></NavLink>
              <NavLink className="button secondary" to="/resume">View resume</NavLink>
            </div>
          </div>
          {content.settings.profile_image && (
            <div className="hero-visual" aria-label="Profile portrait">
              <div className="portrait-ring">
                <div className="portrait"><img src={content.settings.profile_image} alt={content.settings.name || 'Profile'} /></div>
              </div>
            </div>
          )}
        </section>

        <section className="focus-section">
          <div className="section-heading">
            <div><span className="eyebrow">{content.sections.find((section) => section.key === 'featured-project')?.eyebrow || 'Featured project'}</span><h2>{content.sections.find((section) => section.key === 'featured-project')?.title || 'Selected work'}</h2></div>
            <NavLink to="/projects">View project <ArrowRight size={16} /></NavLink>
          </div>
          <div className="focus-grid single-project">
            {content.projects.filter((project) => project.featured === 1).map((project) => (
              <NavLink className="project-card home-project-tile" key={project.title} to={projectPath(project, content.projects)} aria-label={`View details for ${project.title}`}>
                <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
                <h3>{project.title}</h3>
                <span className="home-project-link">View details <ArrowRight size={16} /></span>
              </NavLink>
            ))}
          </div>
        </section>

        <section className="about-strip">
          <span className="eyebrow">{content.sections.find((section) => section.key === 'about')?.eyebrow || 'About this portfolio'}</span>
          <h2>{content.sections.find((section) => section.key === 'about')?.title || 'About me'}</h2>
          <RichText className="rich-text-content" content={content.sections.find((section) => section.key === 'about')?.description || content.settings.description || ''} />
          <NavLink className="text-link" to="/resume">Discover my journey <ArrowRight size={16} /></NavLink>
        </section>
      </main>
    </>
  )
}

function Resume({ content }: { content: CmsContent }) {
  const groupedSkills = content.skills.reduce<Record<string, CmsContent['skills']>>((groups, skill) => {
    const category = skill.category || 'Additional skills'
    groups[category] = [...(groups[category] || []), skill]
    return groups
  }, {})
  const currentRole = content.experience.find((item) => (item.end_date || '').toLowerCase() === 'present')
  const summary = content.settings.resume_summary || 'Add a professional summary describing your background, experience, and strengths.'

  return (
    <main className="inner-page resume-page">
      <header className="resume-profile">
        <div className="resume-profile-heading">
          <div>
            <span className="eyebrow">Curriculum vitae</span>
            <h1>{content.settings.name || 'Jordan Lee'}</h1>
            <p className="resume-tagline">{content.settings.tagline}</p>
          </div>
          <button className="resume-print" type="button" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>
        </div>
        {currentRole && <p className="resume-affiliation">{currentRole.role} · {currentRole.organization}{currentRole.location ? `, ${currentRole.location}` : ''}</p>}
        <div className="resume-contact">
          {content.settings.email && <a href={`mailto:${content.settings.email}`}><Mail size={15} />{content.settings.email}</a>}
          {content.settings.phone && <a href={`tel:${content.settings.phone.replace(/[^\d+]/g, '')}`}>{content.settings.phone}</a>}
          {content.settings.location && <span><MapPin size={15} />{content.settings.location}</span>}
          {content.settings.linkedin_url && <a href={content.settings.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={13} /></a>}
          {content.settings.github_url && <a href={content.settings.github_url} target="_blank" rel="noreferrer">GitHub <ExternalLink size={13} /></a>}
        </div>
        <div className="resume-highlights">
          <span><strong>{content.experience.length}</strong> Experience {content.experience.length === 1 ? 'role' : 'roles'}</span>
          <span><strong>{content.projects.length}</strong> Projects</span>
          {content.education[0] && <span><strong>{content.education[0].degree}</strong></span>}
        </div>
      </header>

      <section className="resume-section resume-summary">
        <h2>Professional Summary</h2>
        <RichText className="rich-text-content" content={summary} />
      </section>

      <section className="resume-section">
        <h2>Education</h2>
        <div className="resume-entry-list">
          {content.education.map((item) => (
            <article className="resume-entry" key={item.id}>
              <div className="resume-entry-heading"><h3>{item.degree}</h3><span>{item.start_date}{item.end_date ? ` — ${item.end_date}` : ''}</span></div>
              <p className="resume-entry-subtitle">{item.institution}{item.location ? ` · ${item.location}` : ''}</p>
              {item.description && <RichText className="resume-entry-description rich-text-content" content={item.description} />}
            </article>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <h2>Professional Experience</h2>
        <div className="resume-entry-list">
          {content.experience.map((item) => (
            <article className="resume-entry" key={item.id}>
              <div className="resume-entry-heading"><h3>{item.role}</h3><span>{item.start_date}{item.end_date ? ` — ${item.end_date}` : ''}</span></div>
              <p className="resume-entry-subtitle">{item.organization}{item.location ? ` · ${item.location}` : ''}</p>
              {item.description && <ResumeDescription text={item.description} />}
            </article>
          ))}
        </div>
      </section>

      {content.projects.length > 0 && (
        <section className="resume-section">
          <h2>Projects</h2>
          <div className="resume-project-list">
            {content.projects.map((project) => (
              <article className="resume-project-entry" key={project.id}>
                <div className="resume-entry-heading">
                  <h3><NavLink to={projectPath(project, content.projects)}>{project.title}</NavLink></h3>
                  {project.year && <span>{project.year}</span>}
                </div>
                {project.category && <p className="resume-entry-subtitle">{project.category}</p>}
                {project.description && <RichText className="resume-entry-description rich-text-content" content={project.description} />}
                {!!project.tech_stack && <p className="resume-project-technologies"><strong>Technologies:</strong> {project.tech_stack}</p>}
                {project.url && <a className="certificate-link resume-project-link" href={project.url} target="_blank" rel="noreferrer">View project <ExternalLink size={14} /></a>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="resume-section">
        <h2>Technical Skills</h2>
        <div className="resume-skills">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div className="resume-skill-group" key={category}><h3>{category}</h3><div className="skill-tags">{skills.map((skill) => <span key={skill.id}>{skill.name}</span>)}</div></div>
          ))}
        </div>
      </section>

      <div className="resume-bottom-grid">
        <section className="resume-section">
          <h2>Certifications</h2>
          {content.certifications.map((item) => <article className="resume-compact-entry" key={item.id}><div><h3>{item.title}</h3><p>{item.issuer}{item.date ? ` · ${item.date}` : ''}</p>{item.description && <RichText className="rich-text-content" content={item.description} />}{(item.certificate_file || item.credential_url) && <a className="certificate-link" href={item.certificate_file || item.credential_url} target="_blank" rel="noreferrer">View certificate <ArrowRight size={14} /></a>}</div></article>)}
        </section>
        <section className="resume-section">
          <h2>Awards</h2>
          {content.awards.map((item) => <article className="resume-compact-entry" key={item.id}><div><h3>{item.title}</h3><p>{item.issuer}{item.date ? ` · ${item.date}` : ''}</p>{item.description && <RichText className="rich-text-content" content={item.description} />}{item.award_file && <a className="certificate-link" href={item.award_file} target="_blank" rel="noreferrer">View award <ArrowRight size={14} /></a>}</div></article>)}
        </section>
      </div>
    </main>
  )
}

function ResumeDescription({ text }: { text: string }) {
  if (hasRichTextMarkup(text)) return <RichText className="resume-entry-description rich-text-content" content={text} />

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const hasBullets = lines.some((line) => /^[•\-*]\s*/.test(line))
  if (!hasBullets) return <p className="resume-entry-description">{lines.join(' ') || text}</p>

  const bullets = lines.reduce<string[]>((items, line) => {
    if (/^[•\-*]\s*/.test(line)) items.push(line.replace(/^[•\-*]\s*/, ''))
    else if (items.length) items[items.length - 1] += ` ${line}`
    else items.push(line)
    return items
  }, [])
  return <ul className="resume-responsibilities">{bullets.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ul>
}

function CertificatesPage({ content }: { content: CmsContent }) {
  return (
    <main className="inner-page certificates-page">
      <div className="projects-intro">
        <PageTitle eyebrow="Credentials" title="Certificates" copy="Professional courses and certifications completed throughout my learning and development journey." />
        <span className="project-count">{String(content.certifications.length).padStart(2, '0')} certificates</span>
      </div>
      <div className="certificates-grid">
        {content.certifications.map((item) => (
          <article className="certificate-card" key={item.id}>
            <span className="eyebrow">Certificate</span>
            <h2>{item.title}</h2>
            <p className="certificate-issuer">{item.issuer}{item.date ? ` · ${item.date}` : ''}</p>
            {item.description && <RichText className="certificate-description rich-text-content" content={item.description} />}
            {(item.certificate_file || item.credential_url) && (
              <a className="certificate-link" href={item.certificate_file || item.credential_url} target="_blank" rel="noreferrer">
                View certificate <ArrowRight size={14} />
              </a>
            )}
          </article>
        ))}
        {!content.certifications.length && <p className="projects-empty">Certificates will be added here soon.</p>}
      </div>
    </main>
  )
}

function ProjectsPage({ content }: { content: CmsContent }) {
  return (
    <main className="inner-page projects-page">
      <div className="projects-intro">
        <PageTitle eyebrow="Selected work" title="Projects" copy="A closer look at the applications and technical work I have built, including the tools and ideas behind each project." />
        <span className="project-count">{String(content.projects.length).padStart(2, '0')} projects</span>
      </div>
      <div className="projects-page-grid">
        {content.projects.map((project) => (
          <article className="project-card large project-detail-card" key={project.title}>
            <NavLink className="project-detail-card-link" to={projectPath(project, content.projects)} aria-label={`View details for ${project.title}`}>
              <div className={`project-art ${project.accent}`}>
                {project.image ? <img src={project.image} alt="" /> : <span className="project-monogram">{project.category.slice(0, 2).toUpperCase()}</span>}
                <span className="project-year">{project.year}</span>
              </div>
              <div className="project-detail-content">
                <span className="project-category">{project.category}</span>
                <h2>{project.title}</h2>
                {project.description && <RichText className="project-description rich-text-content" content={project.description} />}
                {!!project.tech_stack && <div className="project-tags">{project.tech_stack.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div>}
                <span className="project-detail-link">View details <ArrowRight size={16} /></span>
              </div>
            </NavLink>
            {project.url && <a className="project-external-link" href={project.url} target="_blank" rel="noreferrer">Visit project <ExternalLink size={15} /></a>}
          </article>
        ))}
        {!content.projects.length && <p className="projects-empty">Projects will be added here soon.</p>}
      </div>
    </main>
  )
}

function ProjectDetail({ content }: { content: CmsContent }) {
  const { projectSlug: requestedSlug } = useParams()
  const project = content.projects.find((item) => (
    projectPath(item, content.projects) === `/projects/${requestedSlug}` || String(item.id) === requestedSlug
  ))

  if (!project) {
    return <main className="inner-page"><PageTitle eyebrow="Project" title="Project not found" copy="This project may have been removed or is no longer available." /><NavLink className="project-detail-link" to="/projects">Back to projects <ArrowRight size={16} /></NavLink></main>
  }

  let galleryImages: string[] = []
  try {
    const parsed: unknown = JSON.parse(project.gallery_images || '[]')
    if (Array.isArray(parsed)) galleryImages = parsed.filter((image): image is string => typeof image === 'string' && image.length > 0)
  } catch {
    galleryImages = []
  }

  return (
    <main className="inner-page project-page">
      <NavLink className="project-back-link" to="/projects"><ArrowRight size={15} /> All projects</NavLink>
      <div className="project-page-content">
        <div className="project-page-meta">
          <span className="project-category">{project.category}</span>
          {project.year && <span className="project-page-year">{project.year}</span>}
        </div>
        <h1>{project.title}</h1>
        {project.description && <RichText className="project-description rich-text-content" content={project.description} />}
        {!!project.tech_stack && <div className="project-tags">{project.tech_stack.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div>}
        {project.url && <a className="button primary project-page-visit" href={project.url} target="_blank" rel="noreferrer">Visit project <ExternalLink size={16} /></a>}
      </div>
      {!!galleryImages.length && <section className="project-gallery"><h2>Project gallery</h2><div className="project-gallery-grid">{galleryImages.map((image, index) => <img src={image} alt={`${project.title} screenshot ${index + 1}`} key={`${image}-${index}`} loading="lazy" />)}</div></section>}
    </main>
  )
}

function Contact({ content }: { content: CmsContent }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('')
    setSending(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Your message could not be sent.')
      setForm({ name: '', email: '', message: '', website: '' })
      setStatus('Thanks for reaching out. Your message has been sent.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Your message could not be sent. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="inner-page contact-page">
      <PageTitle
        eyebrow="Get in touch"
        title="Start a conversation"
        copy="Have a project, opportunity, or idea? Send a message and I’ll get back to you."
      />
      <div className="contact-layout">
        <aside className="contact-details">
          <span className="eyebrow">Contact information</span>
          <h2>Let’s work together</h2>
          <p className="contact-intro">I’m always interested in hearing about thoughtful projects and new opportunities.</p>

          <div className="contact-detail-list">
            {content.settings.email && (
              <a className="contact-detail" href={`mailto:${content.settings.email}`}>
                <span className="contact-detail-icon"><Mail size={20} /></span>
                <span><small>Email</small><strong>{content.settings.email}</strong></span>
              </a>
            )}
            {content.settings.phone && (
              <a className="contact-detail" href={`tel:${content.settings.phone.replace(/[^\d+]/g, '')}`}>
                <span className="contact-detail-icon"><Phone size={20} /></span>
                <span><small>Phone</small><strong>{content.settings.phone}</strong></span>
              </a>
            )}
            {content.settings.location && (
              <div className="contact-detail">
                <span className="contact-detail-icon"><MapPin size={20} /></span>
                <span><small>Location</small><strong>{content.settings.location}</strong></span>
              </div>
            )}
          </div>

          {(content.settings.linkedin_url || content.settings.github_url) && (
            <div className="contact-social">
              <small>Connect</small>
              <div className="social-row">
                {content.settings.linkedin_url && (
                  <a href={content.settings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <span>in</span>
                  </a>
                )}
                {content.settings.github_url && (
                  <a href={content.settings.github_url} target="_blank" rel="noreferrer" aria-label="GitHub">
                    <span>GH</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>

        <form className="contact-form" onSubmit={submitContactForm}>
          <div className="contact-form-heading">
            <span>Send a message</span>
            <p>Fields marked with * are required.</p>
          </div>
          <div className="contact-form-grid">
            <label>Name *<input name="name" autoComplete="name" maxLength={120} placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label>Email *<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          </div>
          <label>Message *<textarea name="message" maxLength={10000} placeholder="Tell me about your project, role, or idea…" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={7} required /></label>
          <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
          {status && <p className={`contact-status${sending ? '' : ' visible'}`} role="status">{status}</p>}
          <button className="button primary" type="submit" disabled={sending}>
            {sending ? 'Sending…' : <>Send message <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </main>
  )
}

function Footer({ content }: { content: CmsContent }) {
  return (
    <footer className="footer"><div className="footer-brand">{content.settings.logo_url ? <span className="brand-mark brand-logo"><img src={content.settings.logo_url} alt="" /></span> : <span className="brand-mark">{content.settings.initials || 'JL'}</span>}<span><strong>{content.settings.name}</strong><small>{content.settings.tagline}</small></span></div><p>{content.settings.footer_text}</p></footer>
  )
}

function App() {
  const [content, setContent] = useState<CmsContent>(fallbackContent)

  useEffect(() => {
    fetch('/api/content')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setContent({ ...fallbackContent, ...data, settings: { ...fallbackContent.settings, ...data.settings } }))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const siteTitle = content.settings.site_title || content.settings.name || 'Portfolio'
    document.title = siteTitle

    const faviconUrl = content.settings.favicon_url
    if (faviconUrl) {
      let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = faviconUrl
      const faviconExtension = faviconUrl.toLowerCase().split('?')[0]
      favicon.type = faviconExtension.endsWith('.svg')
        ? 'image/svg+xml'
        : faviconExtension.endsWith('.png')
          ? 'image/png'
          : 'image/x-icon'
    }
  }, [content.settings.site_title, content.settings.name, content.settings.favicon_url])

  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (location.pathname.startsWith('/admin')) {
    return <Suspense fallback={<div className="admin-loading">Loading admin panel...</div>}><AdminPanel /></Suspense>
  }

  return (
    <>
      <Header content={content} />
      <Routes>
        <Route path="/" element={<Home content={content} />} />
        <Route path="/resume" element={<Resume content={content} />} />
        <Route path="/projects" element={<ProjectsPage content={content} />} />
        <Route path="/projects/:projectSlug" element={<ProjectDetail content={content} />} />
        <Route path="/certificates" element={<CertificatesPage content={content} />} />
        <Route path="/contact" element={<Contact content={content} />} />
      </Routes>
      <Footer content={content} />
    </>
  )
}

export default App
