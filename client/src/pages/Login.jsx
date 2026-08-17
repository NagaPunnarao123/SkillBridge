import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success('Logged in successfully!')
      const from = location.state?.from?.pathname || (user?.role === 'client' ? '/client/dashboard' : '/student/dashboard')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'client') {
      setEmail('client@demo.com')
      setPassword('demo123')
    } else {
      setEmail('student@demo.com')
      setPassword('demo123')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Left: Decorative Panel */}
      <div style={{
        flex: '1 1 50%',
        background: `linear-gradient(135deg, rgba(10,15,30,0.9) 0%, rgba(26,10,62,0.85) 50%, rgba(10,26,46,0.95) 100%), url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2852&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 400 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
            <span style={{ fontSize: 48 }}>🌉</span>
            <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>SkillBridge</h2>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
            India's premier marketplace connecting B.Tech students with startups seeking affordable, quality development talent.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            {[
              { val: '5,000+', label: 'Students' },
              { val: '1,200+', label: 'Projects' },
              { val: '98%', label: 'Success' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#A78BFA' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Demo credentials banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '2rem',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 0.75rem', fontWeight: 600 }}>🎯 Quick Demo Login:</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => fillDemo('client')} style={{
                flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.3)',
                background: 'rgba(124,58,237,0.1)', color: '#A78BFA', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                🏢 Client Demo
              </button>
              <button onClick={() => fillDemo('student')} style={{
                flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(6,182,212,0.3)',
                background: 'rgba(6,182,212,0.1)', color: '#22D3EE', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                🎓 Student Demo
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: 14 }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input-styled"
                required
              />
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input-styled"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: 38, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}
            >
              {loading ? <LoadingSpinner size={22} /> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
