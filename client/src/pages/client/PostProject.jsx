import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createProject } from '../../data/firebaseApi'
import toast from 'react-hot-toast'

const CATEGORIES = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Game Dev', 'Backend APIs']
const SUGGESTED_SKILLS = ['React', 'Node.js', 'Python', 'Flutter', 'Figma', 'MongoDB', 'TypeScript', 'Docker', 'AWS', 'Firebase', 'Next.js', 'Django', 'PostgreSQL', 'Tailwind CSS', 'GraphQL', 'Redis', 'Kubernetes', 'TensorFlow']

export default function PostProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posting, setPosting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', budget: '',
    requirements: '', deliverables: '', deadline: '',
    techStack: [],
  })
  const [techInput, setTechInput] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const addTech = (tech) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData({ ...formData, techStack: [...formData.techStack, tech] })
    }
    setTechInput('')
  }

  const removeTech = (tech) => {
    setFormData({ ...formData, techStack: formData.techStack.filter(t => t !== tech) })
  }

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTech(techInput.trim())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.category || !formData.budget) {
      toast.error('Please fill all required fields')
      return
    }
    setPosting(true)
    try {
      await createProject({
        ...formData,
        budget: Number(formData.budget),
      }, user.uid)
      toast.success('Project posted successfully! 🎉')
      navigate('/client/my-projects')
    } catch (err) {
      toast.error('Failed to post project')
    } finally {
      setPosting(false)
    }
  }

  const filteredSuggestions = SUGGESTED_SKILLS
    .filter(s => !formData.techStack.includes(s))
    .filter(s => !techInput || s.toLowerCase().includes(techInput.toLowerCase()))
    .slice(0, 8)

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-badge" style={{ background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', color: '#A78BFA' }}>New Project</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, marginBottom: '0.5rem' }}>Post a Project</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Describe your project and start receiving proposals from talented student developers.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>📋 Basic Information</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Project Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. E-Commerce Platform with React & Node.js" className="form-input-styled" required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe your project in detail. What are you building? What's the goal?" className="form-input-styled" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-input-styled" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Budget (₹) *</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="45000" className="form-input-styled" required />
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>🛠️ Tech Stack</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
              {formData.techStack.map(tech => (
                <span key={tech} style={{
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  color: '#22D3EE',
                  padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              placeholder="Type a skill and press Enter"
              className="form-input-styled"
              style={{ marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filteredSuggestions.map(s => (
                <button key={s} type="button" onClick={() => addTech(s)} style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.color = '#22D3EE' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </section>

          {/* Requirements & Deliverables */}
          <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>📦 Requirements & Deliverables</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Requirements</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={4} placeholder="List key requirements (one per line, prefix with -)" className="form-input-styled" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Deliverables</label>
              <textarea name="deliverables" value={formData.deliverables} onChange={handleChange} rows={4} placeholder="What do you expect to receive? (e.g. source code, documentation)" className="form-input-styled" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="form-input-styled" />
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '14px 24px', borderRadius: 12, fontWeight: 600 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={posting} style={{ padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
              {posting ? 'Posting...' : 'Post Project 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
