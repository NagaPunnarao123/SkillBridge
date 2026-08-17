import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getStudentApplications } from '../../data/firebaseApi'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalApplications: 0, accepted: 0, completedProjects: 0, averageRating: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  const formatDisplayName = (name) => {
    if (!name) return 'Student'
    return name.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  const getFirstName = (name) => {
    if (!name) return 'Student'
    return formatDisplayName(name).split(' ')[0]
  }

  const calculateProfileCompletion = () => {
    if (!user) return 0
    const fields = ['avatar', 'bio', 'college', 'graduationYear', 'skills', 'github', 'linkedin', 'portfolio']
    let filled = 0
    fields.forEach(f => { if (user[f] && (Array.isArray(user[f]) ? user[f].length > 0 : true)) filled++ })
    return Math.round((filled / fields.length) * 100)
  }

  const completionRate = calculateProfileCompletion()

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return
      try {
        const apps = await getStudentApplications(user.uid)
        setRecentApps(apps.slice(0, 5))
        setStats({
          totalApplications: apps.length,
          accepted: apps.filter(a => a.status === 'accepted').length,
          completedProjects: apps.filter(a => a.projectData?.status === 'completed' && a.status === 'accepted').length,
          averageRating: user?.rating || 0,
        })
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleLogout = () => { logout(); navigate('/login') }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Student Portal</h3>
              <span style={{ fontSize: 11, color: '#64748b' }}>Developer Workspace</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '1rem' }}>
          <NavLink to="/student/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </NavLink>

          <NavLink to="/browse-projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Projects
          </NavLink>

          <NavLink to="/student/applications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            My Applications
          </NavLink>

          <NavLink to="/student/profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Edit Profile
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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Welcome back, {getFirstName(user?.name)}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Overview of your project applications, performance metrics, and active activity.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{formatDisplayName(user?.name)}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{user?.college || 'Student Developer'}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#06B6D4,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-shimmer" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
        ) : (
          <>
            {/* Stats + Profile Completion */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                {[
                  {
                    label: 'Total Applications',
                    val: stats.totalApplications,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    ),
                    color: '#7C3AED',
                    bgColor: 'rgba(124, 58, 237, 0.08)',
                  },
                  {
                    label: 'Accepted Proposals',
                    val: stats.accepted,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                    color: '#10B981',
                    bgColor: 'rgba(16, 185, 129, 0.08)',
                  },
                  {
                    label: 'Completed Projects',
                    val: stats.completedProjects,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    ),
                    color: '#06B6D4',
                    bgColor: 'rgba(6, 182, 212, 0.08)',
                  },
                  {
                    label: 'Average Rating',
                    val: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ),
                    color: '#F59E0B',
                    bgColor: 'rgba(245, 158, 11, 0.08)',
                  },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(0, 0, 0, 0.07)',
                      borderRadius: 16,
                      padding: '1.5rem',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.25s ease',
                      position: 'relative',
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

              {/* Profile Completion Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.07)',
                borderRadius: 16,
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                textAlign: 'center',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Profile Strength</h3>
                <div style={{
                  position: 'relative', width: 110, height: 110, borderRadius: '50%',
                  background: `conic-gradient(#6366f1 ${completionRate * 3.6}deg, rgba(0,0,0,0.06) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)',
                    color: completionRate >= 80 ? '#10B981' : completionRate >= 50 ? '#F59E0B' : '#EF4444',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  }}>
                    {completionRate}%
                  </div>
                </div>
                {completionRate < 100 && (
                  <Link to="/student/profile" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                    Complete your profile →
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <Link to="/browse-projects" style={{
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.07)',
                borderRadius: 16, padding: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.07)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Explore Available Projects</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Browse live client requirements and submit proposals</div>
                </div>
              </Link>

              <Link to="/student/profile" style={{
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.07)',
                borderRadius: 16, padding: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.07)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(8, 145, 178, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Update Developer Profile</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Add skills, GitHub portfolio, and contact info</div>
                </div>
              </Link>
            </div>

            {/* Recent Applications Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Recent Applications</h2>
              <Link to="/browse-projects" className="btn btn-secondary btn-sm" style={{ borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Find More Projects →</Link>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(0, 0, 0, 0.07)', borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
              {recentApps.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>No Applications Yet</h3>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.5rem' }}>Submit proposals to client projects to track application progress here.</p>
                  <Link to="/browse-projects" className="btn btn-primary btn-md">Browse Live Projects</Link>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'rgba(248, 250, 252, 0.8)' }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project Title</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Client</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map(app => {
                      const sc = app.status === 'accepted'
                        ? { bg: 'rgba(16,185,129,0.1)', text: '#059669' }
                        : app.status === 'rejected'
                          ? { bg: 'rgba(239,68,68,0.1)', text: '#dc2626' }
                          : { bg: 'rgba(245,158,11,0.1)', text: '#d97706' }
                      return (
                        <tr key={app.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.5)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{app.projectData?.title || 'Project'}</td>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 14 }}>{app.projectData?.clientData?.name || 'Client'}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ background: sc.bg, color: sc.text, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 13 }}>
                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
