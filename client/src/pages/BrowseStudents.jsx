import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStudents } from '../data/firebaseApi'
import StudentCard from '../components/StudentCard'

const SKILLS = ['All', 'React', 'Node.js', 'Python', 'Flutter', 'Figma', 'MongoDB', 'TypeScript', 'Docker', 'Machine Learning']

export default function BrowseStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeSkill, setActiveSkill] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const filters = {}
        if (search) filters.search = search
        if (activeSkill !== 'All') filters.skill = activeSkill
        if (availableOnly) filters.availability = 'true'
        const data = await getStudents(filters)
        setStudents(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [search, activeSkill, availableOnly])

  return (
    <div className="page-wrapper">
      {/* Hero header */}
      <div style={{
        position: 'relative',
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.05) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginTop: '-1rem',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translateY(-50%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-badge" style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.3)', color: '#22D3EE' }}>Talent Pool</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '0.5rem' }}>Find Student Developers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: '2rem' }}>Browse registered student developers from top universities across India.</p>

          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.4 }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skill, or college..."
              className="form-input-styled"
              style={{ paddingLeft: 48, fontSize: 15 }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => setActiveSkill(skill)}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.3s',
                  border: activeSkill === skill ? '1px solid rgba(6,182,212,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: activeSkill === skill ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.02)',
                  color: activeSkill === skill ? '#22D3EE' : 'var(--text-secondary)',
                }}
              >
                {skill}
              </button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={e => setAvailableOnly(e.target.checked)}
              style={{ accentColor: '#06B6D4' }}
            />
            Available only
          </label>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1.5rem' }}>
          {loading ? 'Loading...' : `${students.length} developer${students.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 260, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="skeleton-shimmer" style={{ height: '100%', borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24 }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎓</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>No student profiles yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 460, margin: '0 auto 1.5rem' }}>
              Student profiles will appear here after student users register or sign in. Register as a student developer to show your profile here!
            </p>
            <Link to="/register?role=student" className="btn btn-primary" style={{ borderRadius: 12, padding: '12px 28px' }}>
              Register as Student Developer 🎓
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {students.map(s => <StudentCard key={s.uid || s.id} student={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}
