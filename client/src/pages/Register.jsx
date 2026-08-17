import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: '',
    college: '', graduationYear: '', skills: '',
  })

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.role) { toast.error('Please select a role'); return }
    }
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill all required fields'); return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match'); return
      }
      if (formData.password.length < 3) {
        toast.error('Password must be at least 3 characters'); return
      }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await register(formData)
      toast.success('Account created successfully!')
      navigate(user.role === 'client' ? '/client/dashboard' : '/student/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const p = formData.password
    if (!p) return { level: 0, text: '', color: '' }
    if (p.length < 4) return { level: 1, text: 'Weak', color: '#EF4444' }
    if (p.length < 8) return { level: 2, text: 'Fair', color: '#F59E0B' }
    if (p.length < 12) return { level: 3, text: 'Good', color: '#10B981' }
    return { level: 4, text: 'Strong', color: '#06B6D4' }
  }

  const strength = getPasswordStrength()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{
        flex: '1 1 50%',
        background: `linear-gradient(135deg, rgba(10,15,30,0.9) 0%, rgba(26,10,62,0.85) 50%, rgba(10,26,46,0.95) 100%), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '15%', right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 420 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
            <span style={{ fontSize: 48 }}>🌉</span>
            <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>SkillBridge</h2>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: '3rem' }}>
            Join the fastest-growing community of student developers and innovative startups in India.
          </p>

          {/* Benefits list */}
          <div style={{ textAlign: 'left' }}>
            {[
              { icon: '🚀', text: 'Get hired on real projects from day one' },
              { icon: '💰', text: 'Earn while you learn — average ₹18K per project' },
              { icon: '⭐', text: 'Build a verified portfolio with 5-star reviews' },
              { icon: '🤝', text: 'Connect with 850+ startups and agencies' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 999,
                background: s <= step
                  ? 'linear-gradient(90deg, #7C3AED, #06B6D4)'
                  : 'rgba(255,255,255,0.06)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
            {step === 1 ? 'Choose Your Role' : step === 2 ? 'Create Account' : 'Almost Done!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: 14 }}>
            Step {step} of 3 • {step === 1 ? 'How will you use SkillBridge?' : step === 2 ? 'Set up your credentials' : 'Tell us more about yourself'}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { role: 'client', icon: '🏢', title: 'I\'m a Client', desc: 'Post projects and hire student developers' },
                  { role: 'student', icon: '🎓', title: 'I\'m a Student', desc: 'Find projects and build your portfolio' },
                ].map(option => (
                  <div
                    key={option.role}
                    onClick={() => setFormData({ ...formData, role: option.role })}
                    style={{
                      padding: '2rem',
                      border: formData.role === option.role
                        ? '2px solid rgba(124,58,237,0.6)'
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 20,
                      background: formData.role === option.role
                        ? 'rgba(124,58,237,0.08)'
                        : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex', alignItems: 'center', gap: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: 40 }}>{option.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>{option.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{option.desc}</div>
                    </div>
                    {formData.role === option.role && (
                      <span style={{ marginLeft: 'auto', color: '#10B981', fontSize: 20 }}>✓</span>
                    )}
                  </div>
                ))}
                <button type="button" onClick={nextStep} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: '1rem' }}>
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Credentials */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Arjun Mehta" className="form-input-styled" required />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="arjun@example.com" className="form-input-styled" required />
                </div>
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Password *</label>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="form-input-styled" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: 38, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  {/* Password strength */}
                  {formData.password && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${strength.level * 25}%`, height: '100%', borderRadius: 999, background: strength.color, transition: 'all 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.text}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="form-input-styled" required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 12, fontWeight: 600 }}>← Back</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 2, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div>
                {formData.role === 'student' && (
                  <>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>College / University</label>
                      <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. IIT Delhi" className="form-input-styled" />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Graduation Year</label>
                      <select name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="form-input-styled">
                        <option value="">Select year</option>
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Skills (comma-separated)</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python" className="form-input-styled" />
                    </div>
                  </>
                )}
                {formData.role === 'client' && (
                  <div style={{
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>🎉</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '0.5rem' }}>You're all set!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Post your first project after signing up and start receiving proposals from talented student developers.</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 12, fontWeight: 600 }}>← Back</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
                    {loading ? 'Creating...' : 'Create Account 🚀'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
