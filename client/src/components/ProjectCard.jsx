import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createConversation } from '../data/firebaseApi'
import toast from 'react-hot-toast'

export default function ProjectCard({ project }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#10B981'
      case 'in-progress': return '#F59E0B'
      case 'completed': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const parseDate = (d) => {
    if (!d) return new Date()
    if (d.toDate) return d.toDate()
    return new Date(d)
  }

  const daysLeft = Math.ceil((parseDate(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const client = project.clientData || project.client || {}
  const clientId = typeof client === 'string' ? client : (client.uid || client.id || project.client)
  const clientName = typeof client === 'string' ? 'Client' : (client.name || 'Client')
  const clientAvatar = typeof client === 'string' ? null : client.avatar

  const handleMessageClient = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to message the client')
      navigate('/login')
      return
    }
    try {
      const conv = await createConversation(user.uid, clientId, project.id)
      navigate(`/messages/${conv.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to start chat')
    }
  }

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
      <div className="card project-card glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', gap: '1rem', borderRadius: '16px', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: `${getStatusColor(project.status)}20`, color: getStatusColor(project.status), padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(project.status) }}></span>
            {project.status?.toUpperCase()}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>{project.category}</span>
        </div>

        <div style={{ flexGrow: 1 }}>
          <h3 className="project-card-title" style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '1.25rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.title}</h3>
          <p className="project-card-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>{project.description}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
          {project.techStack?.slice(0, 3).map((skill, i) => (
            <span key={i} className="skill-pill" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>{skill}</span>
          ))}
          {project.techStack?.length > 3 && <span className="skill-pill" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px' }}>+{project.techStack.length - 3}</span>}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={clientAvatar || `https://ui-avatars.com/api/?name=${clientName}&background=random`} alt="client" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>{clientName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="project-budget gradient-text" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{project.budget?.toLocaleString()}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</div>
            </div>
            {user?.uid !== clientId && (
              <button
                type="button"
                onClick={handleMessageClient}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: '#A78BFA',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)'}
              >
                💬 Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
