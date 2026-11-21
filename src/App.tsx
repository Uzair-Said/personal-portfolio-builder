import { lazy, Suspense, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, ExternalLink, Mail, MapPin, Menu, Printer, X } from 'lucide-react'
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
  settings: { name: 'Uzair Said', initials: 'US', tagline: 'Computer Science Graduate | IT Support | Web Development', title: 'Practical technology. Reliable support. Meaningful impact.', description: 'I’m Uzair Said, a Computer Science graduate with experience in IT support, web development, and digital service delivery. I solve technical problems, support the people who rely on technology, and build practical tools that make everyday work easier.', resume_summary: 'Computer Science graduate with practical experience in IT support, web development, and digital service delivery. Experienced in troubleshooting hardware and software, supporting enterprise ERP and citizen-service platforms, and building responsive web applications. Brings a user-focused approach, clear communication, and a commitment to reliable, effective solutions.', email: 'uzairsaid7@gmail.com', location: 'Mardan, Pakistan', profile_image: '/Profile pic.png', footer_text: 'IT Support · Web Development · Computer Science' },
  menu: [{ label: 'Home', path: '/' }, { label: 'Resume', path: '/resume' }, { label: 'Projects', path: '/projects' }, { label: 'Contact', path: '/contact' }],
  sections: [], projects: [], experience: [], education: [], certifications: [], awards: [], skills: [],
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
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Go to home">
        <span className="brand-mark">{content.settings.initials || 'US'}</span>
        <span><strong>{content.settings.name || 'Uzair Said'}</strong><small>{content.settings.tagline || 'Portfolio'}</small></span>
      </NavLink>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={open ? 'nav open' : 'nav'}>
        {content.menu.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>
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
          <div className="hero-visual" aria-label="Uzair Said portrait">
            <div className="portrait-ring">
              <div className="portrait"><img src={content.settings.profile_image || '/Profile pic.png'} alt={content.settings.name || 'Profile'} /></div>
            </div>
            <div className="floating-card research"><BookOpen size={20} /><span><strong>BCS</strong><small>Computer Science</small></span></div>
            <div className="floating-card students"><strong>IT</strong><small>Support specialist</small></div>
          </div>
        </section>

        <section className="focus-section">
          <div className="section-heading">
            <div><span className="eyebrow">{content.sections.find((section) => section.key === 'featured-project')?.eyebrow || 'Featured project'}</span><h2>{content.sections.find((section) => section.key === 'featured-project')?.title || 'Building reliable digital experiences'}</h2></div>
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
          <h2>{content.sections.find((section) => section.key === 'about')?.title || 'Combining technical support with practical software development.'}</h2>
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
  const summary = content.settings.resume_summary || 'Computer Science graduate with hands-on experience in web development, enterprise ERP systems, IT support, and digital service delivery.'

  return (
    <main className="inner-page resume-page">
      <header className="resume-profile">
        <div className="resume-profile-heading">
          <div>
            <span className="eyebrow">Curriculum vitae</span>
            <h1>{content.settings.name || 'Your Name'}</h1>
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
    <main className="inner-page contact-page"><PageTitle eyebrow="Get in touch" title="Start a conversation" copy="For IT opportunities, software projects, or professional collaboration." /><div className="contact-layout"><div><h2>Let’s work together</h2><p><Mail size={18} /> {content.settings.email}</p><p>{content.settings.location}</p><div className="social-row"><a href={`mailto:${content.settings.email}`} aria-label="Email">@</a></div></div><form onSubmit={submitContactForm}><label>Name<input name="name" autoComplete="name" maxLength={120} placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Message<textarea name="message" maxLength={10000} placeholder="Tell me about your project" rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></label><label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>{status && <p className="contact-status" role="status">{status}</p>}<button className="button primary" type="submit" disabled={sending}>{sending ? 'Sending…' : <>Send message <ArrowRight size={18} /></>}</button></form></div></main>
  )
}

function Footer({ content }: { content: CmsContent }) {
  return (
    <footer className="footer"><div className="footer-brand"><span className="brand-mark">{content.settings.initials || 'US'}</span><span><strong>{content.settings.name}</strong><small>{content.settings.tagline}</small></span></div><p>{content.settings.footer_text}</p><div><NavLink to="/privacy">Privacy</NavLink><NavLink to="/terms">Terms</NavLink></div></footer>
  )
}

function App() {
  const [content, setContent] = useState<CmsContent>(fallbackContent)

  useEffect(() => {
    fetch('/api/content')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setContent({ ...fallbackContent, ...data }))
      .catch(() => undefined)
  }, [])

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
        <Route path="/contact" element={<Contact content={content} />} />
        <Route path="/privacy" element={<main className="inner-page"><PageTitle eyebrow="Legal" title="Privacy policy" copy="Privacy information will be added here." /></main>} />
        <Route path="/terms" element={<main className="inner-page"><PageTitle eyebrow="Legal" title="Terms of service" copy="Terms of service will be added here." /></main>} />
      </Routes>
      <Footer content={content} />
    </>
  )
}

export default App
