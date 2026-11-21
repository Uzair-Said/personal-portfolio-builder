import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, BookOpen, ExternalLink, Mail, MapPin, Menu, Printer, X } from 'lucide-react'
import './App.css'
import AdminPanel from './AdminPanelForms'

type CmsContent = {
  settings: Record<string, string>
  menu: Array<{ label: string; path: string }>
  sections: Array<{ key: string; eyebrow: string; title: string; description: string }>
  projects: Array<{ id: number; title: string; category: string; year: string; description: string; tech_stack: string; image?: string; url?: string; accent: string; featured: number; enabled: number }>
  experience: Array<{ id: number; role: string; organization: string; location: string; start_date: string; end_date: string; description: string }>
  education: Array<{ id: number; degree: string; institution: string; location: string; start_date: string; end_date: string; description: string }>
  certifications: Array<{ id: number; title: string; issuer: string; date: string; description: string; certificate_file?: string; credential_url?: string }>
  awards: Array<{ id: number; title: string; issuer: string; date: string; description: string; award_file?: string }>
  skills: Array<{ id: number; name: string; category: string }>
}

const fallbackContent: CmsContent = {
  settings: { name: 'Uzair Said', initials: 'US', tagline: 'Computer Science Graduate · IT Support', description: 'Bachelor of Computer Science graduate from Abdul Wali Khan University Mardan.', resume_summary: 'Computer Science graduate with hands-on experience in web development, enterprise ERP systems, IT support, and digital service delivery.', email: 'uzairsaid7@gmail.com', location: 'Mardan, Pakistan', profile_image: '/Profile pic.png', footer_text: 'IT Support · Web Development · Computer Science' },
  menu: [{ label: 'Home', path: '/' }, { label: 'Resume', path: '/resume' }, { label: 'Projects', path: '/projects' }, { label: 'Contact', path: '/contact' }],
  sections: [], projects: [], experience: [], education: [], certifications: [], awards: [], skills: [],
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
  return (
    <>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">{content.sections.find((section) => section.key === 'hero')?.eyebrow || content.settings.tagline}</span>
            <h1>{content.sections.find((section) => section.key === 'hero')?.title || 'Technology with purpose.'}</h1>
            <p>{content.sections.find((section) => section.key === 'hero')?.description || content.settings.description}</p>
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
              <NavLink className="project-card home-project-tile" key={project.title} to="/projects" aria-label={`View details for ${project.title}`}>
                <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
                <h3>{project.title}</h3>
                <span className="home-project-link">View project <ArrowRight size={16} /></span>
              </NavLink>
            ))}
          </div>
        </section>

        <section className="about-strip">
          <span className="eyebrow">{content.sections.find((section) => section.key === 'about')?.eyebrow || 'About this portfolio'}</span>
          <h2>{content.sections.find((section) => section.key === 'about')?.title || 'Combining technical support with practical software development.'}</h2>
          <p>{content.sections.find((section) => section.key === 'about')?.description || content.settings.description}</p>
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
        <p>{summary}</p>
      </section>

      <section className="resume-section">
        <h2>Education</h2>
        <div className="resume-entry-list">
          {content.education.map((item) => (
            <article className="resume-entry" key={item.id}>
              <div className="resume-entry-heading"><h3>{item.degree}</h3><span>{item.start_date}{item.end_date ? ` — ${item.end_date}` : ''}</span></div>
              <p className="resume-entry-subtitle">{item.institution}{item.location ? ` · ${item.location}` : ''}</p>
              {item.description && <p className="resume-entry-description">{item.description}</p>}
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
          {content.certifications.map((item) => <article className="resume-compact-entry" key={item.id}><div><h3>{item.title}</h3><p>{item.issuer}{item.date ? ` · ${item.date}` : ''}</p>{item.description && <p>{item.description}</p>}{(item.certificate_file || item.credential_url) && <a className="certificate-link" href={item.certificate_file || item.credential_url} target="_blank" rel="noreferrer">View certificate <ArrowRight size={14} /></a>}</div></article>)}
        </section>
        <section className="resume-section">
          <h2>Awards</h2>
          {content.awards.map((item) => <article className="resume-compact-entry" key={item.id}><div><h3>{item.title}</h3><p>{item.issuer}{item.date ? ` · ${item.date}` : ''}</p>{item.description && <p>{item.description}</p>}{item.award_file && <a className="certificate-link" href={item.award_file} target="_blank" rel="noreferrer">View award <ArrowRight size={14} /></a>}</div></article>)}
        </section>
      </div>
    </main>
  )
}

function ResumeDescription({ text }: { text: string }) {
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
            <div className={`project-art ${project.accent}`}>
              {project.image ? <img src={project.image} alt={project.title} /> : <span className="project-monogram">{project.category.slice(0, 2).toUpperCase()}</span>}
              <span className="project-year">{project.year}</span>
            </div>
            <div className="project-detail-content">
              <span className="project-category">{project.category}</span>
              <h2>{project.title}</h2>
              {project.description && <p className="project-description">{project.description}</p>}
              {!!project.tech_stack && <div className="project-tags">{project.tech_stack.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => <span key={tag}>{tag}</span>)}</div>}
              {project.url && <a className="project-detail-link" href={project.url} target="_blank" rel="noreferrer">Visit project <ArrowRight size={16} /></a>}
            </div>
          </article>
        ))}
        {!content.projects.length && <p className="projects-empty">Projects will be added here soon.</p>}
      </div>
    </main>
  )
}

function Contact({ content }: { content: CmsContent }) {
  return (
    <main className="inner-page contact-page"><PageTitle eyebrow="Get in touch" title="Start a conversation" copy="For IT opportunities, software projects, or professional collaboration." /><div className="contact-layout"><div><h2>Let’s work together</h2><p><Mail size={18} /> {content.settings.email}</p><p>{content.settings.location}</p><div className="social-row"><a href={`mailto:${content.settings.email}`} aria-label="Email">@</a></div></div><form onSubmit={(event) => event.preventDefault()}><label>Name<input placeholder="Your name" /></label><label>Email<input type="email" placeholder="you@example.com" /></label><label>Message<textarea placeholder="Tell me about your project" rows={5} /></label><button className="button primary" type="submit">Send message <ArrowRight size={18} /></button></form></div></main>
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
  if (location.pathname.startsWith('/admin')) return <AdminPanel />

  return (
    <>
      <Header content={content} />
      <Routes>
        <Route path="/" element={<Home content={content} />} />
        <Route path="/resume" element={<Resume content={content} />} />
        <Route path="/projects" element={<ProjectsPage content={content} />} />
        <Route path="/contact" element={<Contact content={content} />} />
        <Route path="/privacy" element={<main className="inner-page"><PageTitle eyebrow="Legal" title="Privacy policy" copy="Privacy information will be added here." /></main>} />
        <Route path="/terms" element={<main className="inner-page"><PageTitle eyebrow="Legal" title="Terms of service" copy="Terms of service will be added here." /></main>} />
      </Routes>
      <Footer content={content} />
    </>
  )
}

export default App
