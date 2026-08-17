import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProjectById, getProjectApplications, getProjectReviews, createApplication, acceptApplication, rejectApplication, deleteProject, createConversation } from '../data/firebaseApi'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [applications, setApplications] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applying, setApplying] = useState(false)
  const [proposal, setProposal] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [proj, apps, revs] = await Promise.all([
          getProjectById(id),
          getProjectApplications(id),
          getProjectReviews(id),
        ])
        setProject(proj)
        setApplications(apps)
        setReviews(revs)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const parseDate = (d) => {
    if (!d) return new Date()
    if (typeof d === 'object' && d.toDate) return d.toDate()
    return new Date(d)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!proposal || !bidAmount || !estimatedDays) {
      toast.error('Please fill all fields')
      return
    }
    setApplying(true)
    try {
      await createApplication({
        project: id,
        student: user.uid,
        proposal,
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
      })
      toast.success('Application submitted! The client has been notified 🔔')
      setShowApplyModal(false)
      setProposal('')
      setBidAmount('')
      setEstimatedDays('')
      // Refresh applications list
      const apps = await getProjectApplications(id)
      setApplications(apps)
    } catch (err) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleAccept = async (app) => {
    try {
      const result = await acceptApplication(app.id, app.project, app.student)
      toast.success('Application accepted! Conversation started 💬')
      if (result.conversationId) {
        navigate(`/messages/${result.conversationId}`)
      }
    } catch (err) {
      toast.error('Failed to accept application')
    }
  }

  const handleReject = async (app) => {
    try {
      await rejectApplication(app.id)
      toast.success('Application rejected')
      // Refresh
      const apps = await getProjectApplications(id)
      setApplications(apps)
    } catch (err) {
      toast.error('Failed to reject application')
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project listing?')) return
    try {
      await deleteProject(id)
      toast.success('Project deleted successfully')
      navigate('/client/projects')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete project')
    }
  }

  const handleMessageUser = async (targetUserId) => {
    if (!user) {
      toast.error('Please login to send a message')
      navigate('/login')
      return
    }
    try {
      const conv = await createConversation(user.uid, targetUserId, id)
      navigate(`/messages/${conv.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to start chat')
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  if (!project) return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: 56, marginBottom: '1rem' }}>🔍</div>
      <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Project Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This project may have been removed or doesn't exist.</p>
      <Link to="/browse-projects" className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 24px' }}>Browse Projects</Link>
    </div>
  )

  const client = project.clientData || {}
  const daysLeft = Math.ceil((parseDate(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const statusColors = { open: '#10B981', 'in-progress': '#F59E0B', completed: '#3B82F6' }
  const statusColor = statusColors[project.status] || '#6B7280'
  const hasApplied = applications.some(a => a.student === user?.uid)
  const canApply = user?.role === 'student' && project.status === 'open' && !hasApplied

  return (
    <div className="page-wrapper">
      {/* Project Hero Header */}
      <div style={{
        position: 'relative',
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginTop: '-1rem',
      }}>
        <div style={{ position: 'absolute', top: '50%', right: '5%', width: 400, height: 400, background: `radial-gradient(circle, ${statusColor}15 0%, transparent 70%)`, filter: 'blur(60px)', transform: 'translateY(-50%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/browse-projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, marginBottom: '1.5rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ← Back to Projects
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: `${statusColor}20`, color: statusColor, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor }} />
              {project.status?.toUpperCase().replace('-', ' ')}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 999, fontSize: 13, color: 'var(--text-secondary)' }}>{project.category}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>{project.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={client.avatar || `https://ui-avatars.com/api/?name=${client.name}&background=random`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <span>{client.name || 'Client'}</span>
            </div>
            <span>•</span>
            <span>Posted {parseDate(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>•</span>
            <span>{project.applicantCount || applications.length} applicant{(project.applicantCount || applications.length) !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Main content */}
          <div>
            {/* Description */}
            <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>📋 Description</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.description}</p>
            </section>

            {/* Requirements */}
            {project.requirements && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>✅ Requirements</h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.requirements}</div>
              </section>
            )}

            {/* Deliverables */}
            {project.deliverables && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>📦 Deliverables</h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.deliverables}</div>
              </section>
            )}

            {/* Tech Stack */}
            <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>🛠️ Tech Stack</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.techStack?.map((tech, i) => (
                  <span key={i} style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#22D3EE', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>{tech}</span>
                ))}
              </div>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>⭐ Reviews</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              </section>
            )}

            {/* Applicants — visible only to the project's client */}
            {user?.uid === project.client && applications.length > 0 && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📬 Applicants ({applications.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {applications.map(app => {
                    const s = app.studentData || {}
                    const isPending = app.status === 'pending'
                    const statusColors = {
                      pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
                      accepted: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
                      rejected: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
                    }
                    const sc = statusColors[app.status] || statusColors.pending
                    return (
                      <div key={app.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16, padding: '1.25rem',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          {/* Applicant info */}
                          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <Link to={`/profile/${s.uid || app.student}`}>
                              <img
                                src={s.avatar || `https://ui-avatars.com/api/?name=${s.name || 'S'}&background=random`}
                                alt={s.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            </Link>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <Link to={`/profile/${s.uid || app.student}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', textDecoration: 'none' }}>
                                  {s.name || 'Student'}
                                </Link>
                                <span style={{
                                  background: sc.bg, color: sc.text,
                                  padding: '2px 8px', borderRadius: 999,
                                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                }}>
                                  {app.status}
                                </span>
                              </div>
                              {s.college && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{s.college}</div>}
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {app.proposal}
                              </p>
                            </div>
                          </div>

                          {/* Bid info + actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                                ₹{app.bidAmount?.toLocaleString()}
                              </div>
                              {app.estimatedDays && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>in {app.estimatedDays} days</div>
                              )}
                            </div>
                            {isPending && project.status === 'open' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => handleMessageUser(s.uid || app.student)}
                                  style={{
                                    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    background: 'rgba(124,58,237,0.15)', color: '#A78BFA',
                                    border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.3)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
                                >
                                  💬 Chat
                                </button>
                                <button
                                  onClick={() => handleAccept(app)}
                                  style={{
                                    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    color: 'white', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => handleReject(app)}
                                  style={{
                                    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                                    border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Budget card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Budget</div>
              <div className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800 }}>₹{project.budget?.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{project.budgetType || 'Fixed Price'}</div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Deadline</span>
                  <span style={{ fontWeight: 600, color: daysLeft > 0 ? 'var(--text-primary)' : '#EF4444' }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Applicants</span>
                  <span style={{ fontWeight: 600 }}>{project.applicantCount || applications.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ fontWeight: 600, color: statusColor }}>{project.status?.toUpperCase()}</span>
                </div>
              </div>

              {canApply && (
                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, marginTop: '0.5rem', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                  Apply Now 🚀
                </button>
              )}
              {hasApplied && (
                <div style={{ marginTop: '0.5rem', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                  ✅ You've already applied
                </div>
              )}
              {!user && (
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, marginTop: '0.5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Login to Apply
                </Link>
              )}
              {user && user?.uid !== project.client && (
                <button
                  type="button"
                  onClick={() => handleMessageUser(project.client)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  💬 Message Client
                </button>
              )}
              {user?.uid === project.client && (
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: '0.75rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#EF4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                  🗑️ Delete Project Listing
                </button>
              )}
            </div>

            {/* Client card */}
            <Link to={`/profile/${client.uid || client.id}`} style={{ textDecoration: 'none', display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img src={client.avatar || `https://ui-avatars.com/api/?name=${client.name}&background=random`} alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{client.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{client.company || 'Client'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>⭐ {client.rating || 'N/A'}</span>
                <span>•</span>
                <span>{client.completedProjects || 0} projects</span>
              </div>
            </Link>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div onClick={() => setShowApplyModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 540,
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: '24px 24px 0 0', background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: '0.5rem' }}>Apply to this Project</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '2rem' }}>{project.title}</p>

            <form onSubmit={handleApply}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Your Proposal *</label>
                <textarea
                  value={proposal}
                  onChange={e => setProposal(e.target.value)}
                  rows={5}
                  placeholder="Explain why you're the best fit for this project. Mention relevant experience, approach, and timeline."
                  className="form-input-styled"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Your Bid (₹) *</label>
                  <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="25000" className="form-input-styled" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Days *</label>
                  <input type="number" value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} placeholder="14" className="form-input-styled" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 12, fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applying} style={{ flex: 2, padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                  {applying ? 'Submitting...' : 'Submit Application 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
