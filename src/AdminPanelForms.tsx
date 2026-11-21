import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { LayoutDashboard, LogOut, Menu, Settings, BriefcaseBusiness, GraduationCap, Award, BadgeCheck, FolderKanban, ListTree, Wrench, Upload } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { RichTextEditor } from './RichTextEditor'
import './AdminPanel.css'

const tabs = [
  { key: 'settings', label: 'Site settings', icon: Settings },
  { key: 'menu_items', label: 'Menus', icon: Menu },
  { key: 'sections', label: 'Sections', icon: ListTree },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'certifications', label: 'Certifications', icon: BadgeCheck },
  { key: 'awards', label: 'Awards', icon: Award },
  { key: 'skills', label: 'Skills', icon: Wrench },
]

type Field = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'checkbox' | 'select' | 'tags'
  options?: string[]
  placeholder?: string
}

const fields: Record<string, Field[]> = {
  settings: [
    { key: 'name', label: 'Website owner name' },
    { key: 'initials', label: 'Brand initials' },
    { key: 'tagline', label: 'Professional tagline' },
    { key: 'title', label: 'Homepage hero title' },
    { key: 'description', label: 'Homepage hero description', type: 'textarea' },
    { key: 'resume_summary', label: 'Resume professional summary', type: 'textarea' },
    { key: 'email', label: 'Contact email', type: 'email' },
    { key: 'phone', label: 'Phone number' },
    { key: 'location', label: 'Location' },
    { key: 'linkedin_url', label: 'LinkedIn profile', type: 'url' },
    { key: 'github_url', label: 'GitHub profile', type: 'url' },
    { key: 'profile_image', label: 'Profile image URL' },
    { key: 'footer_text', label: 'Footer text' },
  ],
  menu_items: [
    { key: 'label', label: 'Menu label' },
    { key: 'path', label: 'Page link', placeholder: '/about' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Show in navigation', type: 'checkbox' },
  ],
  sections: [
    { key: 'key', label: 'Section identifier', placeholder: 'hero, about, featured-project' },
    { key: 'eyebrow', label: 'Small heading / eyebrow' },
    { key: 'title', label: 'Section title' },
    { key: 'description', label: 'Section description', type: 'textarea' },
    { key: 'content', label: 'Additional content', type: 'textarea' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Section enabled', type: 'checkbox' },
  ],
  projects: [
    { key: 'title', label: 'Project title' },
    { key: 'category', label: 'Category or role' },
    { key: 'year', label: 'Year or date range' },
    { key: 'description', label: 'Project description', type: 'textarea' },
    { key: 'tech_stack', label: 'Project tags', type: 'tags', placeholder: 'Add a tag, e.g. React' },
    { key: 'image', label: 'Project thumbnail URL' },
    { key: 'url', label: 'Live project or repository link', type: 'url' },
    { key: 'accent', label: 'Card colour', type: 'select', options: ['mint', 'blue', 'gold', 'coral'] },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'featured', label: 'Featured on homepage', type: 'checkbox' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
  experience: [
    { key: 'role', label: 'Job title / role' },
    { key: 'organization', label: 'Company or organization' },
    { key: 'location', label: 'Location' },
    { key: 'start_date', label: 'Start date' },
    { key: 'end_date', label: 'End date or Present' },
    { key: 'description', label: 'Responsibilities and achievements', type: 'textarea' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
  education: [
    { key: 'degree', label: 'Degree or qualification' },
    { key: 'institution', label: 'University or institution' },
    { key: 'location', label: 'Location' },
    { key: 'start_date', label: 'Start date' },
    { key: 'end_date', label: 'End date' },
    { key: 'description', label: 'Additional details', type: 'textarea' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
  certifications: [
    { key: 'title', label: 'Certification name' },
    { key: 'issuer', label: 'Issuing organization' },
    { key: 'date', label: 'Issue date' },
    { key: 'description', label: 'Certificate description', type: 'textarea' },
    { key: 'certificate_file', label: 'Uploaded certificate' },
    { key: 'credential_url', label: 'Credential link', type: 'url' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
  awards: [
    { key: 'title', label: 'Award name' },
    { key: 'issuer', label: 'Issuing organization' },
    { key: 'date', label: 'Award date or year' },
    { key: 'description', label: 'Award description', type: 'textarea' },
    { key: 'award_file', label: 'Uploaded award' },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
  skills: [
    { key: 'name', label: 'Skill name' },
    { key: 'category', label: 'Skill category' },
    { key: 'level', label: 'Skill level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { key: 'position', label: 'Display position', type: 'number' },
    { key: 'enabled', label: 'Published', type: 'checkbox' },
  ],
}

const templates: Record<string, Record<string, unknown>> = Object.fromEntries(
  Object.entries(fields).map(([key, fieldList]) => [key, {
    ...Object.fromEntries(fieldList.map((field) => [
      field.key,
      field.type === 'checkbox' ? 1 : field.type === 'number' ? 1 : '',
    ])),
    ...(key === 'projects' ? { gallery_images: '[]' } : {}),
  }]),
)

function recordTitle(row: Record<string, unknown>) {
  const key = ['title', 'label', 'name', 'role', 'degree', 'key'].find((candidate) => row[candidate])
  return key ? String(row[key]) : 'Untitled record'
}

function parseGalleryImages(value: unknown): string[] {
  if (typeof value !== 'string' || !value) return []
  try {
    const images: unknown = JSON.parse(value)
    return Array.isArray(images) ? images.filter((image): image is string => typeof image === 'string' && image.length > 0) : []
  } catch {
    return []
  }
}

export default function AdminPanelForms() {
  const [token, setToken] = useState(() => localStorage.getItem('cms_token') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [active, setActive] = useState('settings')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...templates.settings })
  const [message, setMessage] = useState('')
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<'profile' | 'project-thumbnail'>('profile')
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const api = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })
    if (response.status === 401) {
      localStorage.removeItem('cms_token')
      setToken('')
      throw new Error('Session expired')
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Request failed')
    }
    return response.status === 204 ? null : response.json()
  }

  useEffect(() => {
    if (!token) return
    setMessage('')
    setSelected(null)
    if (active === 'settings') {
      fetch('/api/content').then((response) => response.json()).then((data) => setDraft({ ...templates.settings, ...data.settings }))
    } else {
      api(`/api/admin/${active}`).then((data) => { setRows(data); setDraft({ ...templates[active] }) }).catch((error) => setMessage(error.message))
    }
  }, [token, active])

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoginError('')
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('cms_token', data.token)
      setToken(data.token)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const setField = (key: string, value: unknown) => setDraft((current) => ({ ...current, [key]: value }))

  const chooseRow = (row: Record<string, unknown>) => {
    setSelected(row)
    setDraft({ ...templates[active], ...row })
  }

  const createDraft = () => {
    setSelected(null)
    setDraft({ ...templates[active] })
  }

  const save = async () => {
    setMessage('')
    try {
      if (active === 'settings') {
        await api('/api/settings', { method: 'PUT', body: JSON.stringify(draft) })
      } else if (selected?.id) {
        await api(`/api/admin/${active}/${selected.id}`, { method: 'PUT', body: JSON.stringify(draft) })
        setRows(await api(`/api/admin/${active}`))
      } else {
        await api(`/api/admin/${active}`, { method: 'POST', body: JSON.stringify(draft) })
        setRows(await api(`/api/admin/${active}`))
      }
      setMessage('Saved successfully')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save')
    }
  }

  const remove = async () => {
    if (!selected?.id || !window.confirm('Delete this record?')) return
    try {
      await api(`/api/admin/${active}/${selected.id}`, { method: 'DELETE' })
      setRows(await api(`/api/admin/${active}`))
      setSelected(null)
      setDraft({ ...templates[active] })
      setMessage('Deleted successfully')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete')
    }
  }

  const openCropper = (file: File, target: 'profile' | 'project-thumbnail') => {
    if (cropImage) URL.revokeObjectURL(cropImage)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropTarget(target)
    setCropImage(URL.createObjectURL(file))
  }

  const uploadCroppedImage = async () => {
    if (!cropImage || !croppedAreaPixels) return
    try {
      const blob = await getCroppedBlob(cropImage, croppedAreaPixels)
      const form = new FormData()
      form.append('file', blob, 'cropped-image.jpg')
      const response = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setField(cropTarget === 'profile' ? 'profile_image' : 'image', data.url)
      setMessage(cropTarget === 'profile' ? 'Cropped profile image uploaded' : 'Cropped project thumbnail uploaded')
      URL.revokeObjectURL(cropImage)
      setCropImage(null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const cancelCrop = () => {
    if (cropImage) URL.revokeObjectURL(cropImage)
    setCropImage(null)
  }

  const projectGallery = parseGalleryImages(draft.gallery_images)

  const uploadProjectImages = async (files: File[]) => {
    const uploaded: string[] = []
    const failed: string[] = []
    for (const file of files) {
      try {
        const form = new FormData()
        form.append('file', file)
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload rejected')
        uploaded.push(data.url)
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown upload error'
        failed.push(`${file.name}: ${reason}`)
      }
    }

    if (uploaded.length) {
      setField('gallery_images', JSON.stringify([...projectGallery, ...uploaded]))
    }
    const completedMessage = `${uploaded.length} project image${uploaded.length === 1 ? '' : 's'} uploaded.`
    if (!uploaded.length && failed.length) {
      setMessage(`Project image upload failed: ${failed.join('; ')}`)
      return
    }
    const failedMessage = failed.length ? ` Failed: ${failed.join('; ')}.` : ''
    setMessage(`${completedMessage}${failedMessage} Save the project to publish uploaded images.`)
  }

  const uploadCertificate = async (file: File) => {
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Certificate upload failed')
      setField('certificate_file', data.url)
      setMessage('Certificate uploaded. Save the certification to publish it.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Certificate upload failed')
    }
  }

  const uploadAward = async (file: File) => {
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Award upload failed')
      setField('award_file', data.url)
      setMessage('Award file uploaded. Save the award to publish it.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Award upload failed')
    }
  }

  if (!token) {
    return (
      <div className="admin-login"><form onSubmit={login}><div className="admin-login-mark"><LayoutDashboard /></div><span className="admin-kicker">Content Management</span><h1>Portfolio Admin</h1><p>Sign in to update this website.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{loginError && <div className="admin-error">{loginError}</div>}<button type="submit">Sign in</button></form></div>
    )
  }

  const visibleFields = fields[active] || []

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar"><div className="admin-brand"><span>US</span><div><strong>Portfolio CMS</strong><small>Uzair Said</small></div></div><nav>{tabs.map((tab) => { const Icon = tab.icon; return <button className={active === tab.key ? 'active' : ''} key={tab.key} onClick={() => setActive(tab.key)}><Icon size={17} />{tab.label}</button> })}</nav><button className="admin-logout" onClick={() => { localStorage.removeItem('cms_token'); setToken('') }}><LogOut size={16} />Sign out</button></aside>
      <main className="admin-main"><header className="admin-header"><div><span>Management</span><h1>{tabs.find((tab) => tab.key === active)?.label}</h1></div>{active !== 'settings' && <button className="admin-new" onClick={createDraft}>+ Add new</button>}</header>{message && <div className="admin-message">{message}</div>}
        {active === 'settings' ? (
          <section className="admin-editor admin-editor-wide"><h2>Website settings</h2><p>Update the general content shown throughout the public website.</p><div className="admin-fields">{visibleFields.map((field) => <AdminField key={field.key} field={field} value={draft[field.key]} onChange={(value) => setField(field.key, value)} />)}</div><label className="admin-image-upload"><Upload size={16} />Upload profile image<input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && openCropper(event.target.files[0], 'profile')} /></label><div className="admin-actions"><button onClick={save}>Save settings</button></div></section>
        ) : (
          <div className="admin-grid"><section className="admin-list"><h2>Records</h2>{rows.map((row) => <button key={String(row.id)} className={selected?.id === row.id ? 'active' : ''} onClick={() => chooseRow(row)}><strong>{recordTitle(row)}</strong><small>{String(row.category || row.organization || row.institution || row.issuer || row.path || '')}</small></button>)}{!rows.length && <p className="admin-empty">No records yet.</p>}</section><section className="admin-editor"><h2>{selected ? 'Edit record' : 'Create record'}</h2><div className="admin-fields">{visibleFields.map((field) => <AdminField key={field.key} field={field} value={draft[field.key]} onChange={(value) => setField(field.key, value)} />)}</div>{active === 'projects' && <div className="project-image-manager"><div><strong>Project thumbnail</strong><p>Upload and crop the image shown on project cards.</p></div><label className="admin-image-upload"><Upload size={16} />Upload thumbnail<input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && openCropper(event.target.files[0], 'project-thumbnail')} /></label>{typeof draft.image === 'string' && draft.image && <div className="project-thumbnail-preview"><img src={draft.image} alt="Project thumbnail preview" /><button type="button" onClick={() => setField('image', '')}>Remove thumbnail</button></div>}<div className="project-gallery-manager"><div><strong>Project detail images</strong><p>Upload additional screenshots or photos for the project details page.</p></div><label className="admin-image-upload"><Upload size={16} />Upload detail images<input type="file" accept="image/*" multiple onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length) void uploadProjectImages(files); event.target.value = '' }} /></label><div className="project-gallery-previews">{projectGallery.map((image, index) => <div className="project-gallery-preview" key={`${image}-${index}`}><img src={image} alt={`Project detail ${index + 1}`} /><button type="button" onClick={() => setField('gallery_images', JSON.stringify(projectGallery.filter((_, imageIndex) => imageIndex !== index)))}>Remove</button></div>)}</div></div></div>}{active === 'certifications' && <div className="certificate-upload"><label className="admin-image-upload"><Upload size={16} />Upload certificate<input type="file" accept=".pdf,image/*" onChange={(event) => event.target.files?.[0] && uploadCertificate(event.target.files[0])} /></label>{typeof draft.certificate_file === 'string' && draft.certificate_file && <div className="certificate-current"><a href={draft.certificate_file} target="_blank" rel="noreferrer">View uploaded certificate</a><button type="button" onClick={() => setField('certificate_file', '')}>Remove</button></div>}</div>}{active === 'awards' && <div className="certificate-upload"><label className="admin-image-upload"><Upload size={16} />Upload award file<input type="file" accept=".pdf,image/*" onChange={(event) => event.target.files?.[0] && uploadAward(event.target.files[0])} /></label>{typeof draft.award_file === 'string' && draft.award_file && <div className="certificate-current"><a href={draft.award_file} target="_blank" rel="noreferrer">View uploaded award</a><button type="button" onClick={() => setField('award_file', '')}>Remove</button></div>}</div>}<div className="admin-actions">{selected && <button className="danger" onClick={remove}>Delete</button>}<button onClick={save}>{selected ? 'Save changes' : 'Create record'}</button></div></section></div>
        )}
      </main>
      {cropImage && (
        <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Adjust uploaded image">
          <div className="crop-dialog">
            <div className="crop-header"><div><span>Image editor</span><h2>{cropTarget === 'profile' ? 'Adjust profile image' : 'Crop project thumbnail'}</h2></div><button type="button" onClick={cancelCrop} aria-label="Close">×</button></div>
            <div className="crop-workspace">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={cropTarget === 'profile' ? 1 : 16 / 10}
                cropShape={cropTarget === 'profile' ? 'round' : 'rect'}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <label className="crop-zoom"><span>Zoom</span><input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
            <div className="crop-actions"><button type="button" className="crop-cancel" onClick={cancelCrop}>Cancel</button><button type="button" onClick={uploadCroppedImage}>Crop & upload</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

async function getCroppedBlob(imageUrl: string, pixelArea: Area): Promise<Blob> {
  const image = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare image')
  canvas.width = pixelArea.width
  canvas.height = pixelArea.height
  context.drawImage(image, pixelArea.x, pixelArea.y, pixelArea.width, pixelArea.height, 0, 0, pixelArea.width, pixelArea.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not crop image')), 'image/jpeg', 0.92)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load image'))
    image.src = url
  })
}

function AdminField({ field, value, onChange }: { field: Field; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === 'tags') {
    return <ProjectTagsField value={String(value ?? '')} onChange={(tags) => onChange(tags.join(', '))} />
  }
  if (field.type === 'checkbox') {
    return <label className="admin-checkbox"><input type="checkbox" checked={value === 1 || value === true} onChange={(event) => onChange(event.target.checked ? 1 : 0)} /><span>{field.label}</span></label>
  }
  if (field.type === 'textarea') {
    return <div className="admin-field rich-text-field"><span>{field.label}</span><RichTextEditor label={field.label} value={String(value ?? '')} onChange={onChange} /></div>
  }
  if (field.type === 'select') {
    return <label className="admin-field"><span>{field.label}</span><select value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}><option value="">Select...</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  }
  return <label className="admin-field"><span>{field.label}</span><input type={field.type || 'text'} value={String(value ?? '')} placeholder={field.placeholder} onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)} /></label>
}

function ProjectTagsField({ value, onChange }: { value: string; onChange: (tags: string[]) => void }) {
  const [tagInput, setTagInput] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const tags = value.split(',').map((tag) => tag.trim()).filter(Boolean)

  const saveTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    const updated = [...tags]
    if (editingIndex === null) {
      if (updated.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return
      updated.push(tag)
    } else {
      if (updated.some((existing, index) => index !== editingIndex && existing.toLowerCase() === tag.toLowerCase())) return
      updated[editingIndex] = tag
    }
    onChange(updated)
    setTagInput('')
    setEditingIndex(null)
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, tagIndex) => tagIndex !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setTagInput('')
    }
  }

  return (
    <div className="admin-field project-tags-field">
      <span>Project tags</span>
      <div className="project-tag-list">
        {tags.map((tag, index) => (
          <span className="project-tag-editor-chip" key={`${tag}-${index}`}>
            {tag}
            <button type="button" aria-label={`Edit ${tag}`} onClick={() => { setEditingIndex(index); setTagInput(tag) }}>Edit</button>
            <button type="button" aria-label={`Delete ${tag}`} onClick={() => removeTag(index)}>×</button>
          </span>
        ))}
        {!tags.length && <span className="project-tags-empty">No tags added yet.</span>}
      </div>
      <div className="project-tag-add">
        <input value={tagInput} placeholder="Add a tag, e.g. React" onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); saveTag() } }} />
        <button type="button" onClick={saveTag}>{editingIndex === null ? 'Add tag' : 'Save tag'}</button>
        {editingIndex !== null && <button type="button" className="project-tag-cancel" onClick={() => { setEditingIndex(null); setTagInput('') }}>Cancel</button>}
      </div>
    </div>
  )
}
