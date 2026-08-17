import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getClientProjects } from '../../data/firebaseApi'
import toast from 'react-hot-toast'

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const formatDisplayName = (name) => {
    if (!name) return 'Client'
    return name.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  const getFirstName = (name) => {
    if (!name) return 'Client'
    return formatDisplayName(name).split(' ')[0]
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return
      try {
        const data = await getClientProjects(user.uid)
        setProjects(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const stats = {
    total: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const getInitials = (name) => {
    if (!name) return 'C'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Client Workspace</h3>
              <span style={{ fontSize: 11, color: '#64748b' }}>Hiring Manager Portal</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '1rem' }}>
          <NavLink to="/client/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </NavLink>

          <NavLink to="/client/post-project">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Post New Project
          </NavLink>

          <NavLink to="/client/projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            My Projects
          </NavLink>

          <NavLink to="/browse-students">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Student
          </NavLink>

          <NavLink to="/messages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Messages
          </NavLink>

          <div style={{ height: 1, background: 'rgba(0, 0, 0, 0.06)', margin: '1rem 0' }} />

          <button onClick={handleLogout} className="sidebar-logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Welcome back, {getFirstName(user?.name)}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Manage your technical project listings, incoming developer proposals, and engineering pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{formatDisplayName(user?.name)}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{user?.company || 'Client Workspace'}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-shimmer" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                {
                  label: 'Total Listings',
                  val: stats.total,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ),
                  color: '#7C3AED',
                  bgColor: 'rgba(124, 58, 237, 0.08)',
                },
                {
                  label: 'Active Listings',
                  val: stats.open,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  color: '#10B981',
                  bgColor: 'rgba(16, 185, 129, 0.08)',
                },
                {
                  label: 'In Progress',
                  val: stats.inProgress,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  ),
                  color: '#F59E0B',
                  bgColor: 'rgba(245, 158, 11, 0.08)',
                },
                {
                  label: 'Completed Projects',
                  val: stats.completed,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  color: '#06B6D4',
                  bgColor: 'rgba(6, 182, 212, 0.08)',
                },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(0, 0, 0, 0.07)',
                  borderRadius: 16, padding: '1.5rem',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>{s.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                    </div>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    {s.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Projects Table / Cards */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>My Project Listings</h2>
              <Link to="/client/post-project" className="btn btn-primary btn-sm" style={{ borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Post New Project +</Link>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(0, 0, 0, 0.07)', borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
              {projects.length === 0 ? (
                <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No Project Listings Created</h3>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.5rem', maxWidth: 460, margin: '0 auto 1.5rem' }}>Create a project post to start receiving proposals from qualified B.Tech student developers.</p>
                  <Link to="/client/post-project" className="btn btn-primary btn-md">Create Your First Project Listing</Link>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'rgba(248, 250, 252, 0.8)' }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project Title</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Budget</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Applicants</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => {
                      const statusColor = p.status === 'open' ? '#059669' : p.status === 'in-progress' ? '#d97706' : '#0284c7'
                      const statusBg = p.status === 'open' ? 'rgba(16,185,129,0.1)' : p.status === 'in-progress' ? 'rgba(245,158,11,0.1)' : 'rgba(6,182,212,0.1)'
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.5)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{p.title}</td>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 14 }}>{p.category}</td>
                          <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a', fontSize: 14 }}>₹{p.budget?.toLocaleString()}</td>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 14 }}>{p.applicantCount || 0}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <Link to={`/projects/${p.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View Details →</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
