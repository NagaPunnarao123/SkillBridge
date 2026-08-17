import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getUserProfile, getUserReviews, createConversation } from '../data/firebaseApi'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import ReviewCard from '../components/ReviewCard'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Please login to start a conversation')
      navigate('/login')
      return
    }
    setMessaging(true)
    try {
      const conv = await createConversation(user.uid, profile.uid || profile.id)
      navigate(`/messages/${conv.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to start conversation')
    } finally {
      setMessaging(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userData, userReviews] = await Promise.all([
          getUserProfile(id),
          getUserReviews(id),
        ])
        setProfile(userData)
        setReviews(userReviews)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <LoadingSpinner fullPage />

  if (!profile) return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: 56, marginBottom: '1rem' }}>👤</div>
      <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>User Not Found</h2>
      <Link to="/browse-students" className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 24px', marginTop: '1rem' }}>Browse Students</Link>
    </div>
  )

  const isStudent = profile.role === 'student'

  return (
    <div className="page-wrapper">
      {/* Cover Hero */}
      <div style={{
        position: 'relative',
        padding: '100px 0 80px',
        background: isStudent
          ? 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(124,58,237,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(16,185,129,0.06) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginTop: '-1rem',
      }}>
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=7C3AED&color=fff&size=150`}
            alt={profile.name}
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800 }}>{profile.name}</h1>
              {profile.availability === 'available' && (
                <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✓ Available</span>
              )}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: '0.75rem' }}>
              {isStudent ? `${profile.college || 'University Student'}` : `${profile.company || 'Client'}`}
              {profile.location && ` • ${profile.location}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <StarRating rating={profile.rating || 0} size="md" />
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profile.completedProjects || 0} projects completed</span>
              {profile.graduationYear && (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>🎓 Class of {profile.graduationYear}</span>
              )}
            </div>
          </div>

          {user?.uid !== (profile.uid || profile.id) ? (
            <button
              onClick={handleStartChat}
              disabled={messaging}
              className="btn btn-primary"
              style={{
                borderRadius: 14,
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 'auto',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
              }}
            >
              💬 {messaging ? 'Opening Chat...' : `Message ${isStudent ? 'Developer' : 'Client'}`}
            </button>
          ) : (
            <Link
              to="/student/profile"
              className="btn btn-secondary"
              style={{
                borderRadius: 14,
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 'auto',
                textDecoration: 'none',
              }}
            >
              ✏️ Edit Profile & Settings
            </Link>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Main */}
          <div>
            {/* Bio */}
            {profile.bio && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>About</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{profile.bio}</p>
              </section>
            )}

            {/* Skills */}
            {isStudent && profile.skills?.length > 0 && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.skills.map((skill, i) => (
                    <span key={i} style={{
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      color: '#A78BFA',
                      padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                    }}>{skill}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Reviews ({reviews.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick stats */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Quick Stats</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { label: 'Rating', val: profile.rating ? `${profile.rating}/5 ⭐` : 'No ratings' },
                  { label: 'Projects', val: `${profile.completedProjects || 0} completed` },
                  { label: 'Member since', val: new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600 }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {isStudent && (profile.github || profile.linkedin || profile.portfolio) && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      color: 'var(--text-secondary)', textDecoration: 'none',
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s', fontSize: 14,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = '#A78BFA' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      🐙 GitHub
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      color: 'var(--text-secondary)', textDecoration: 'none',
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s', fontSize: 14,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.color = '#22D3EE' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      💼 LinkedIn
                    </a>
                  )}
                  {profile.portfolio && (
                    <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      color: 'var(--text-secondary)', textDecoration: 'none',
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s', fontSize: 14,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.color = '#10B981' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      🌐 Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
