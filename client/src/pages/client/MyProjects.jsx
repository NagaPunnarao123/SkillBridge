import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientProjects, deleteProject } from '../../data/firebaseApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return
      try {
        const data = await getClientProjects(user.uid)
        setProjects(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this project listing? All associated applications will also be removed.')) return
    try {
      await deleteProject(projectId)
      toast.success('Project deleted successfully')
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete project')
    }
  }

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter.toLowerCase().replace(' ', '-'))
  const statusColors = { open: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' }, 'in-progress': { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' }, completed: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' } }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 1000, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Projects</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/client/post-project" className="btn btn-primary" style={{ borderRadius: 12, padding: '12px 24px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            + Post New Project
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
          {['All', 'Open', 'In-Progress', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.3s',
                border: filter === tab ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: filter === tab ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                color: filter === tab ? '#A78BFA' : 'var(--text-secondary)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>No projects found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {filter === 'All' ? "Post your first project to start hiring!" : `No ${filter.toLowerCase()} projects.`}
            </p>
            <Link to="/client/post-project" className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 24px' }}>Post a Project</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(p => {
              const sc = statusColors[p.status] || { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' }
              return (
                <Link key={p.id} to={`/projects/${p.id}`} style={{
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20, padding: '1.5rem 2rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.3s', gap: '1.5rem',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.title}</h3>
                      <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {p.status?.toUpperCase().replace('-', ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>
                      <span>{p.category}</span>
                      <span>{p.applicantCount || 0} applicants</span>
                      <span>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div className="gradient-text" style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)' }}>₹{p.budget?.toLocaleString()}</div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProject(e, p.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#EF4444',
                        padding: '4px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      🗑️ Delete Project
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
