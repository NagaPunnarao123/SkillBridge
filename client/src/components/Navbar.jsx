import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount, resetAllData } from '../data/firebaseApi'
import LogoIcon from './LogoIcon'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const dashboardPath = user?.role === 'client' ? '/client/dashboard' : '/student/dashboard'

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleResetAllData = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL website user data (clients, students, projects, applications, and messages)? This will reset the platform.')) {
      await resetAllData()
      logout()
      window.location.href = '/'
    }
  }

  // Fetch notifications periodically
  useEffect(() => {
    if (!user?.uid) return
    const fetchNotifs = async () => {
      try {
        const notifs = await getUserNotifications(user.uid)
        setNotifications(notifs)
        const count = await getUnreadNotificationCount(user.uid)
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to fetch notifications', err)
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 5000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifOpen(false)
    if (notif.type === 'new_application') {
      navigate(`/projects/${notif.data.projectId}`)
    } else if (notif.type === 'application_accepted') {
      navigate(`/messages/${notif.data.conversationId}`)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user.uid)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const formatNotifTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const formatDisplayName = (name) => {
    if (!name) return 'User'
    return name.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  const getFirstName = (name) => {
    if (!name) return 'User'
    const formatted = formatDisplayName(name)
    return formatted.split(' ')[0]
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <LogoIcon size={50} showText={true} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/browse-projects" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Projects
          </NavLink>
          <NavLink to="/browse-students" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Student
          </NavLink>
          {user && (
            <NavLink to="/messages" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              Messages 💬
            </NavLink>
          )}
          {user?.role === 'client' && (
            <NavLink to="/client/post-project" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              Post a Project
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
                  style={{
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 38, height: 38,
                    borderRadius: '50%',
                    background: notifOpen ? 'rgba(124, 58, 237, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                    border: notifOpen ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifOpen ? '#7C3AED' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -2, right: -2,
                      minWidth: 18, height: 18, borderRadius: 999,
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: 'white', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                      animation: 'pulse 2s infinite',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 360,
                    maxHeight: 460,
                    background: 'rgba(255, 255, 255, 0.97)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 16,
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -6px rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span style={{
                            background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED',
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                          }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#7C3AED',
                            padding: '4px 8px', borderRadius: 6,
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ fontSize: 36, marginBottom: '0.5rem' }}>🔔</div>
                          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 20).map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                              padding: '12px 16px',
                              cursor: 'pointer',
                              background: notif.read ? 'transparent' : 'rgba(124, 58, 237, 0.04)',
                              borderLeft: notif.read ? '3px solid transparent' : '3px solid #7C3AED',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
                            onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(124, 58, 237, 0.04)'}
                          >
                            {/* Icon */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: notif.type === 'new_application'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(59, 130, 246, 0.1)',
                              color: notif.type === 'new_application' ? '#10B981' : '#3B82F6',
                              fontSize: 16,
                            }}>
                              {notif.type === 'new_application' ? '📩' : '✅'}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.4,
                                fontWeight: notif.read ? 400 : 600,
                              }}>
                                {notif.type === 'new_application'
                                  ? <><strong>{notif.data.studentName}</strong> applied to <strong>{notif.data.projectTitle}</strong></>
                                  : <><strong>{notif.data.clientName}</strong> accepted your application for <strong>{notif.data.projectTitle}</strong></>
                                }
                              </p>
                              <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'block' }}>
                                {formatNotifTime(notif.createdAt)}
                              </span>
                            </div>

                            {/* Unread dot */}
                            {!notif.read && (
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#7C3AED', flexShrink: 0, marginTop: 6,
                              }} />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            <div className="navbar-user-container" ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Profile Pill Trigger */}
              <button
                type="button"
                className="navbar-user-pill"
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 14px 6px 8px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  className="avatar avatar-sm"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #0891b2)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {getFirstName(user.name)}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role === 'client' ? 'Client' : 'Student'}
                  </span>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Enterprise Glassmorphism Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="navbar-dropdown-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 260,
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 16,
                    padding: '8px',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 8px 16px -6px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                  }}
                >
                  {/* User Profile Header Card */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(241, 245, 249, 0.7)',
                      borderRadius: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formatDisplayName(user.name)}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {user.email}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: user.role === 'client' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                          color: user.role === 'client' ? '#7C3AED' : '#0891B2',
                        }}
                      >
                        {user.role === 'client' ? 'Client Workspace' : 'Student Developer'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Link
                      to={dashboardPath}
                      className="dropdown-item-pro"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Dashboard Overview
                    </Link>

                    <Link
                      to={`/profile/${user.uid}`}
                      className="dropdown-item-pro"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Public Profile
                    </Link>

                    {user.role === 'client' && (
                      <>
                        <Link
                          to="/client/projects"
                          className="dropdown-item-pro"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          My Projects
                        </Link>
                        <Link
                          to="/client/post-project"
                          className="dropdown-item-pro"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                          Post New Project
                        </Link>
                      </>
                    )}

                    {user.role === 'student' && (
                      <>
                        <Link
                          to="/student/applications"
                          className="dropdown-item-pro"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          My Applications
                        </Link>
                        <Link
                          to="/student/profile"
                          className="dropdown-item-pro"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit Profile Settings
                        </Link>
                      </>
                    )}

                    <Link
                      to="/messages"
                      className="dropdown-item-pro"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Messages
                    </Link>

                    <div style={{ height: 1, background: 'rgba(0, 0, 0, 0.06)', margin: '4px 0' }} />

                    <button
                      type="button"
                      className="dropdown-item-pro danger"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Hamburger for Mobile */}
          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          zIndex: 999, borderTop: '1px solid var(--border-color)',
        }}>
          <Link to="/" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/browse-projects" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>Projects</Link>
          <Link to="/browse-students" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>Student</Link>
          {user && (
            <Link to="/messages" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>Messages 💬</Link>
          )}
          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary btn-lg w-full" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-lg w-full" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <Link to={dashboardPath} className="btn btn-primary btn-lg w-full" onClick={() => setMobileOpen(false)}>Dashboard Overview</Link>
          )}
        </div>
      )}
    </nav>
  )
}
