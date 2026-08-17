import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProjects } from '../data/firebaseApi'
import ProjectCard from '../components/ProjectCard'

const CATEGORIES = ['All', 'Web Development', 'Mobile Apps', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Game Dev']

export default function BrowseProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const filters = {}
        if (category !== 'All') filters.category = category
        if (search) filters.search = search
        const data = await getProjects(filters)
        setProjects(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [category, search])

  return (
    <div className="page-wrapper">
      {/* Hero header */}
      <div style={{
        position: 'relative',
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginTop: '-1rem',
      }}>
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translateY(-50%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-badge" style={{ background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', color: '#A78BFA' }}>Projects</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '0.5rem' }}>Browse Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: '2rem' }}>Discover real projects posted by clients and startups.</p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.4 }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, skill, or technology..."
              className="form-input-styled"
              style={{ paddingLeft: 48, fontSize: 15 }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: category === cat ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: category === cat ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                color: category === cat ? '#A78BFA' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-card" style={{ height: 280, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="skeleton-shimmer" style={{ height: '100%', borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24 }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>No projects posted yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 460, margin: '0 auto 1.5rem' }}>
              Projects posted by clients will appear here automatically. Login as a client to post your first project!
            </p>
            <Link to="/client/post-project" className="btn btn-primary" style={{ borderRadius: 12, padding: '12px 28px' }}>
              Post a Project as Client 🚀
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
