import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check,
  Code2, Copy, Download, FileText, Github, Linkedin,
  Mail, Menu, MoveUpRight, Pencil, Send, Sparkles, X, Facebook, Globe2,
} from 'lucide-react'
import { portfolioData } from '../data'
import type { Certificate, PortfolioData, Project, Skill } from '../types'

const STORAGE_KEY = 'jac-portfolio-content-v1'
const iconFor = (icon: string, size = 17) => {
  const common = { size, strokeWidth: 1.7, 'aria-hidden': true as const }
  if (icon === 'github') return <Github {...common} />
  if (icon === 'linkedin') return <Linkedin {...common} />
  if (icon === 'facebook') return <Facebook {...common} />
  return <Globe2 {...common} />
}
const skillIcon = (s: Skill) => <span className="skill-icon" aria-hidden="true">{s.icon}</span>
const loadData = (): PortfolioData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...portfolioData, ...JSON.parse(saved) }
  } catch { /* Restore the editable source data if local storage is unavailable. */ }
  return portfolioData
}
const setPath = (obj: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> => {
  const [head, ...tail] = path
  if (!head) return obj
  const out = { ...obj }
  out[head] = tail.length ? setPath((obj[head] ?? {}) as Record<string, unknown>, tail, value) : value
  return out
}

function SectionHead({ number, eyebrow, title, description }: { number: string; eyebrow: string; title: ReactNode; description: string }) {
  return <div className="section-head reveal"><div><div className="section-eyebrow"><span>{number}</span>{eyebrow}</div><h2>{title}</h2></div><p>{description}</p></div>
}

function Dialog({ children, onClose, wide = false }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = old; window.removeEventListener('keydown', onKey) }
  }, [onClose])
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className={`modal-panel${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true">{children}</section></div>
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  return <Dialog onClose={onClose} wide><button className="modal-close" onClick={onClose} aria-label="Close project details"><X size={20} /></button><img className="project-detail-image" src={project.image} alt={`${project.title} project preview`} /><div className="project-detail-body"><div className="section-eyebrow"><span>{project.number}</span>{project.category}</div><h2>{project.title}</h2><p className="project-detail-lede">{project.description}</p><div className="detail-columns"><div><h3>The challenge</h3><p>{project.problem}</p><h3>The approach</h3><p>{project.solution}</p></div><div><h3>What it includes</h3><ul>{project.features.map(item => <li key={item}>{item}</li>)}</ul><h3>My contribution</h3><p>{project.contribution}</p></div></div><div className="tag-row">{project.technologies.map(t => <span key={t}>{t}</span>)}</div><div className="detail-actions">{project.demo && <a className="button button-primary" href={project.demo} target="_blank" rel="noreferrer">Visit live project <ArrowUpRight size={16} /></a>}{project.github && <a className="button button-outline" href={project.github} target="_blank" rel="noreferrer"><Github size={16} /> Source code</a>}{!project.demo && !project.github && <span className="private-note"><Code2 size={15} /> Project links can be added in Edit Portfolio.</span>}</div></div></Dialog>
}

function CertificateDialog({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  return <Dialog onClose={onClose}><button className="modal-close" onClick={onClose} aria-label="Close certificate"><X size={20} /></button><img className="certificate-modal-image" src={cert.image} alt={`${cert.title} certificate`} /><div className="certificate-modal-caption"><div className="section-eyebrow"><span>LEARNING</span>{cert.date}</div><h2>{cert.title}</h2><p>{cert.issuer}</p>{cert.credential && <a href={cert.credential} target="_blank" rel="noreferrer">Verify credential <ArrowUpRight size={15} /></a>}</div></Dialog>
}

const editSections = [
  { key: 'profile', label: 'Profile' }, { key: 'projects', label: 'Projects' }, { key: 'skills', label: 'Skills' },
  { key: 'certificates', label: 'Certificates' }, { key: 'socials', label: 'Socials' }, { key: 'theme', label: 'Colors' },
] as const
type EditKey = (typeof editSections)[number]['key']
function Editor({ data, onChange, onClose }: { data: PortfolioData; onChange: (next: PortfolioData) => void; onClose: () => void }) {
  const [section, setSection] = useState<EditKey>('profile')
  const [draft, setDraft] = useState(JSON.stringify(data.profile, null, 2))
  const [message, setMessage] = useState('Saved in this browser.')
  useEffect(() => setDraft(JSON.stringify(data[section], null, 2)), [section, data])
  const parsed = (() => { try { return JSON.parse(draft) as unknown } catch { return undefined } })()
  const applyText = (text = draft) => {
    try {
      const value = JSON.parse(text) as PortfolioData[EditKey]
      const next = { ...data, [section]: value }
      onChange(next)
      setMessage('Changes saved and preview updated.')
    } catch { setMessage('Check the JSON syntax, then apply your changes.') }
  }
  const uploadImage = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage('Choose an image file to upload.'); return }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file)
      })
      const target = window.prompt('Image destination: profile, project ID, or certificate ID', 'profile')?.trim()
      if (!target) return
      let next = data
      if (target === 'profile') next = { ...data, profile: { ...data.profile, photo: dataUrl } }
      else if (data.projects.some(p => p.id === target)) next = { ...data, projects: data.projects.map(p => p.id === target ? { ...p, image: dataUrl } : p) }
      else if (data.certificates.some(c => c.id === target)) next = { ...data, certificates: data.certificates.map(c => c.id === target ? { ...c, image: dataUrl } : c) }
      else { setMessage('That ID was not found. Add or check it in the selected data first.'); return }
      onChange(next); setSection(target === 'profile' ? 'profile' : target.includes('certificate') ? 'certificates' : 'projects')
      setMessage('Image uploaded and preview updated.')
    } catch { setMessage('Could not read that image.') }
  }
  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'portfolio-content.json'; a.click(); URL.revokeObjectURL(url)
  }
  const importConfig = async (file?: File) => {
    if (!file) return
    try { const imported = JSON.parse(await file.text()) as PortfolioData; if (!imported.profile || !Array.isArray(imported.projects)) throw new Error(); onChange(imported); setMessage('Portfolio content imported and preview updated.') }
    catch { setMessage('Could not import this file. Use a portfolio-content.json export.') }
  }
  return <Dialog onClose={onClose} wide><div className="editor-shell"><aside className="editor-side"><a href="#home" className="brand-mark"><span>J</span> EDITOR</a><p className="editor-side-copy">Your portfolio, your words.</p><nav aria-label="Editor categories">{editSections.map(s => <button className={s.key === section ? 'editor-nav-active' : ''} onClick={() => { setSection(s.key); setMessage('Edits save as you apply them.') }} key={s.key}>{s.label}<ArrowRight size={15} /></button>)}</nav><button className="editor-preview-link" onClick={onClose}><ArrowLeft size={16} /> Back to portfolio</button></aside><main className="editor-main"><div className="editor-top"><div><div className="section-eyebrow"><span>EDIT MODE</span>LOCAL PREVIEW</div><h2>Edit portfolio content</h2><p>Update the data below and apply it to see your preview change.</p></div><button className="modal-close editor-close" onClick={onClose} aria-label="Close editor"><X size={20} /></button></div><div className="editor-warning"><Sparkles size={18} /><span><strong>This browser saves your edits locally.</strong> To make edits permanent in the source files, copy the same changes into <code>src/data/</code>.</span></div><label className="editor-label" htmlFor="content-json">{section === 'theme' ? 'Color configuration' : `${editSections.find(s => s.key === section)?.label} data`}<span>JSON</span></label><textarea id="content-json" className="editor-textarea" spellCheck={false} value={draft} onChange={e => setDraft(e.target.value)} /><div className="editor-toolbar"><span className={parsed === undefined ? 'save-message save-error' : 'save-message'}>{parsed === undefined ? 'JSON needs a quick check.' : message}</span><button className="button button-primary" disabled={parsed === undefined} onClick={() => applyText()}>Apply changes <Check size={15} /></button></div><div className="editor-assets"><div><h3>Images & content files</h3><p>Point to the file in this browser or update a file path in your data.</p></div><label className="button button-outline upload-label"><FileText size={15} /> Upload an image<input type="file" accept="image/*" onChange={e => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = '' }} /></label></div><div className="editor-bottom"><button onClick={downloadConfig} className="text-button"><Download size={15} /> Export all content</button><label className="text-button import-label"><Copy size={15} /> Import content<input type="file" accept="application/json,.json" onChange={e => { void importConfig(e.target.files?.[0]); e.currentTarget.value = '' }} /></label><button className="text-button danger-text" onClick={() => { if (window.confirm('Restore the original portfolio data in this browser?')) { localStorage.removeItem(STORAGE_KEY); onChange(portfolioData); setMessage('Original content restored.') } }}>Restore defaults</button></div></main></div></Dialog>
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return <article className="project-card reveal"><button className="project-image-button" onClick={onOpen} aria-label={`View ${project.title} details`}><img className="project-image" src={project.image} alt={`${project.title} preview`} loading="lazy" /><span className="project-number">{project.number} / 03</span><span className="project-image-arrow"><ArrowUpRight size={18} /></span></button><div className="project-card-body"><div className="project-category">{project.category}</div><button className="project-title-button" onClick={onOpen}><h3>{project.title}</h3><ArrowUpRight size={19} /></button><p>{project.description}</p><div className="project-card-bottom"><div className="tag-row">{project.technologies.map(t => <span key={t}>{t}</span>)}</div><button className="view-project" onClick={onOpen}>Details <ArrowRight size={15} /></button></div></div></article>
}

export default function Site() {
  const [data, setData] = useState<PortfolioData>(loadData)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [sent, setSent] = useState(false)
  const projectFilters = ['All', ...new Set(data.projects.map(p => p.category.split(' · ')[0]))]
  const shownProjects = activeFilter === 'All' ? data.projects : data.projects.filter(p => p.category.startsWith(`${activeFilter} ·`) || p.category === activeFilter)
  const persist = (next: PortfolioData) => {
    setData(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { setData(next) }
    document.documentElement.style.setProperty('--accent', next.theme.accent)
    document.documentElement.style.setProperty('--accent-soft', next.theme.accentSoft)
  }
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', data.theme.accent)
    document.documentElement.style.setProperty('--accent-soft', data.theme.accentSoft)
    const items = document.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } }), { threshold: .08 })
    items.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [data])
  const closeProject = () => setProject(null)
  const closeCert = () => setCertificate(null)
  const copyEmail = async () => { try { await navigator.clipboard.writeText(data.profile.email); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { window.location.href = `mailto:${data.profile.email}` } }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const subject = encodeURIComponent(`Portfolio inquiry from ${f.get('name')}`)
    const body = encodeURIComponent(`From: ${f.get('name')}\nReply to: ${f.get('email')}\n\n${f.get('message')}`)
    setSent(true)
    window.location.href = `mailto:${data.profile.email}?subject=${subject}&body=${body}`
  }
  const navLinks = [['Home', '#home'], ['About', '#about'], ['Portfolio', '#portfolio'], ['Certificates', '#certificates'], ['Contact', '#contact']]

  return <>
    <header className="site-header"><a href="#home" className="brand-mark" aria-label="John Albert Cunag home"><span>J</span><b>JOHN ALBERT<br />CUNAG</b></a><nav className={`main-nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">{navLinks.map(([name, href]) => <a key={name} href={href} onClick={() => setMenuOpen(false)}>{name}</a>)}<button className="nav-edit-mobile" onClick={() => { setEditing(true); setMenuOpen(false) }}><Pencil size={14} /> Edit Portfolio</button></nav><div className="header-actions"><span className="header-time"><span /> PH / UTC+8</span><button className="nav-edit" onClick={() => setEditing(true)}><Pencil size={14} /> Edit Portfolio</button><button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button></div></header>
    <main>
      <section className="hero section-wrap" id="home"><div className="hero-copy"><div className="availability"><span className="availability-dot" /> {data.profile.availability}</div><div className="hero-eyebrow"><span className="mono-marker">✳</span>{data.profile.eyebrow}</div><h1>{data.profile.name.split(' ').map((part, i) => <span key={part} className={i === data.profile.name.split(' ').length - 1 ? 'accent-name' : ''}>{part}</span>)}</h1><div className="hero-role"><span />{data.profile.title}</div><p className="hero-intro">{data.profile.intro}</p><div className="hero-actions"><a className="button button-primary inline-flex items-center" href={data.profile.resume} download><Download size={16} /> Download CV</a><a className="button button-outline" href="#portfolio">Explore my work <ArrowDownRight size={16} /></a></div><div className="hero-footnote"><span>SCROLL TO EXPLORE</span><span className="footnote-line" /><span>01 — 05</span></div></div><div className="hero-visual"><div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" /><div className="hero-image-frame"><img src={data.profile.photo} alt={`${data.profile.name} portrait`} /></div><div className="hero-image-index"><span>PORTRAIT</span><span>01 / 01</span></div><div className="float-card float-card-top"><Sparkles size={14} /><span>LEARNING<br /><strong>BY BUILDING</strong></span></div><div className="float-card float-card-bottom"><span className="float-card-mark">✳</span><span>GOOD IDEAS<br /><strong>START SMALL.</strong></span></div><div className="hero-coordinate">14° 35′ N&nbsp; / &nbsp;120° 58′ E</div></div><a className="hero-side-note" href="#about"><span>SCROLL A LITTLE</span><ArrowDownRight size={15} /></a></section>

      <section className="about-section section-wrap section-pad" id="about"><SectionHead number="01" eyebrow="A LITTLE ABOUT ME" title={<>Curious mind.<br /><em>Useful things.</em></>} description="I like making the complicated feel a little simpler — then learning what it takes to make an idea real." /><div className="about-grid"><div className="about-main-card reveal"><div className="about-card-label"><span className="accent-spark">✳</span> THE SHORT VERSION</div><p>{data.profile.about}</p><div className="about-card-signature"><span>BASED IN {data.profile.location.toUpperCase()}</span><span>OPEN TO WHAT'S NEXT <ArrowUpRight size={13} /></span></div></div><div className="education-card reveal"><div className="card-topline"><span className="card-icon"><FileText size={17} /></span><span className="section-eyebrow"><span>EDUCATION</span> {data.profile.education.period}</span></div><h3>{data.profile.education.degree}</h3><p>{data.profile.education.school}</p><div className="education-status"><span className="availability-dot" /> Currently studying</div></div><div className="interests-card reveal"><div className="card-topline"><span className="card-icon"><Sparkles size={17} /></span><span className="section-eyebrow"><span>WHAT I'M INTO</span></span></div><div className="interest-list">{['Thoughtful web experiences', 'Learning by building', 'IT support & troubleshooting', 'Finding better ways to work'].map((item, i) => <div key={item}><span>0{i + 1}</span>{item}<ArrowUpRight size={13} /></div>)}</div></div></div></section>

      <section className="skills-section section-wrap section-pad" id="skills"><SectionHead number="02" eyebrow="MY TOOLKIT" title={<>Things I’m learning<br />to <em>do well.</em></>} description="A growing set of skills for building, making things work, and helping people solve everyday tech problems." /><div className="skills-grid">{data.skills.map((skill, i) => <article className="skill-card reveal" key={`${skill.name}-${i}`}><div className="skill-card-top">{skillIcon(skill)}<span className="skill-level"><i />{skill.level}</span></div><h3>{skill.name}</h3><p>{skill.description}</p><span className="skill-category">{skill.category}</span></article>)}</div></section>

      <section className="portfolio-section section-wrap section-pad" id="portfolio"><SectionHead number="03" eyebrow="SELECTED PROJECTS" title={<>A few things<br /><em>taking shape.</em></>} description="Coursework, small experiments, and ideas that turned into something you can click through." /><div className="projects-toolbar"><div className="filter-tabs" aria-label="Filter projects">{projectFilters.map(filter => <button key={filter} className={activeFilter === filter ? 'filter-active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><span className="project-count">{String(shownProjects.length).padStart(2, '0')} PROJECTS</span></div><div className="projects-grid">{shownProjects.map((p, i) => <ProjectCard key={p.id} project={{ ...p, number: String(i + 1).padStart(2, '0') }} onOpen={() => setProject({ ...p, number: String(i + 1).padStart(2, '0') })} />)}</div><div className="portfolio-note reveal"><span className="note-marker">✳</span><p>All good work starts somewhere.<br /><strong>These projects are a work in progress — and so am I.</strong></p><a href="#contact">Have an idea? <ArrowUpRight size={15} /></a></div></section>

      <section className="certificates-section section-wrap section-pad" id="certificates"><SectionHead number="04" eyebrow="MILESTONES ALONG THE WAY" title={<>Always room to<br /><em>learn more.</em></>} description="Courses, certifications, and little wins that mark what I’ve been learning along the way." /><div className="cert-grid">{data.certificates.map((cert, i) => <button className="certificate-card reveal" key={cert.id} onClick={() => setCertificate(cert)}><div className="cert-image-wrap"><img src={cert.image} alt={`${cert.title} certificate preview`} loading="lazy" /><span className="cert-zoom"><ArrowUpRight size={18} /></span></div><div className="cert-card-info"><span className="section-eyebrow"><span>{String(i + 1).padStart(2, '0')}</span> {cert.date}</span><h3>{cert.title}</h3><p>{cert.issuer}</p></div></button>)}</div></section>

      <section className="contact-section section-wrap section-pad" id="contact"><SectionHead number="05" eyebrow="YOUR TURN" title={<>Good things start<br />with <em>a hello.</em></>} description="Got a project idea, an internship opportunity, or a question? I’d be glad to hear from you." /><div className="contact-grid"><div className="contact-info reveal"><div className="contact-invitation"><span className="contact-spark">✳</span><h3>Let’s make<br />something useful.</h3><p>Tell me a little about what’s on your mind. I’ll get back to you as soon as I can.</p></div><button className="email-card" onClick={copyEmail}><span className="email-icon"><Mail size={18} /></span><span><small>EMAIL ME AT</small><strong>{data.profile.email}</strong></span><span className="copy-indicator">{copied ? <Check size={17} /> : <Copy size={16} />}</span></button><div className="contact-socials">{data.socials.map(s => <a href={s.url} key={s.name} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={s.name}>{iconFor(s.icon)}</a>)}<span>ELSEWHERE ONLINE</span></div><div className="location-note"><span className="availability-dot" /> {data.profile.location} <span>·</span> Local time, UTC+8</div></div><form className="contact-form reveal" onSubmit={handleSubmit}><div className="form-heading"><span className="section-eyebrow"><span>THE CONTACT FORM</span></span><span className="form-step">SAY HELLO <MoveUpRight size={14} /></span></div><label>Your name<input name="name" type="text" placeholder="Jane Smith" autoComplete="name" required /></label><label>Email address<input name="email" type="email" placeholder="jane@example.com" autoComplete="email" required /></label><label>A little about your message<textarea name="message" placeholder="What would you like to chat about?" rows={4} required /></label><div className="form-submit-row"><button className="button button-primary" type="submit">Send a message <Send size={15} /></button><span>{sent ? 'Your email app should open to finish sending.' : 'Your email app will open to send.'}</span></div></form></div></section>
    </main>

    <footer className="site-footer"><div className="footer-main section-wrap"><a href="#home" className="footer-brand"><span className="footer-monogram">J</span><span><strong>{data.profile.name}</strong><small>{data.profile.title} · {data.profile.location}</small></span></a><p>Learning out loud.<br />Building one useful thing at a time.</p><div className="footer-links">{data.socials.map(s => <a key={s.name} href={s.url} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{s.label}<ArrowUpRight size={13} /></a>)}<a href={`mailto:${data.profile.email}`}>Email <ArrowUpRight size={13} /></a></div></div><div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} {data.profile.name.toUpperCase()}</span><span>DESIGNED WITH INTENTION <span className="footer-dot">✳</span></span><a href="#home">BACK TO TOP <ArrowUpRight size={13} /></a></div></footer>
    {project && <ProjectDialog project={project} onClose={closeProject} />}{certificate && <CertificateDialog cert={certificate} onClose={closeCert} />}{editing && <Editor data={data} onChange={persist} onClose={() => setEditing(false)} />}
  </>
}
