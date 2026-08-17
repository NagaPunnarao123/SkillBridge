import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createConversation } from '../data/firebaseApi'
import StarRating from './StarRating'
import toast from 'react-hot-toast'

export default function StudentCard({ student }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAvailable = student.availability === 'available'

  const handleMessage = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to send a message')
      navigate('/login')
      return
    }
    try {
      const conv = await createConversation(user.uid, student.id || student.uid)
      navigate(`/messages/${conv.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to start chat')
    }
  }

  return (
    <Link to={`/profile/${student.id || student.uid}`} style={{ textDecoration: 'none' }}>
      <div className="card student-card glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', gap: '1rem', borderRadius: '16px', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>

        <div className="student-card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random&size=64`} alt={student.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>{student.name}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>{student.college || 'University Student'}</div>
            <StarRating rating={student.rating || 0} size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isAvailable ? '#10B981' : '#EF4444', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            {isAvailable ? 'Available' : 'Busy'}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            {student.completedProjects || 0} projects done
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
          {student.bio || 'This student has not provided a bio yet. Check out their skills below!'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {student.skills?.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-pill" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#A78BFA', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>{skill}</span>
            ))}
          </div>
          {user?.uid !== (student.id || student.uid) && (
            <button
              onClick={handleMessage}
              style={{
                padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA', border: '1px solid rgba(124, 58, 237, 0.3)',
                cursor: 'pointer', transition: 'all 0.2s', marginLeft: 'auto'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)'}
            >
              💬 Chat
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
