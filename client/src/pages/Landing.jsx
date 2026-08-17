import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getStudents, getProjects } from '../data/firebaseApi'
import { useAuth } from '../context/AuthContext'
import LogoIcon from '../components/LogoIcon'

const SKILLS = ['React', 'Node.js', 'Python', 'Flutter', 'TensorFlow', 'AWS', 'PostgreSQL', 'TypeScript', 'Docker', 'Figma', 'Next.js', 'MongoDB']


const FEATURES = [
  { tag: '01', title: 'Real project experience',      desc: 'Students work on production-grade projects, not dummy assignments. Clients get developers who are invested in the outcome.' },
  { tag: '02', title: 'Skill-matched hiring',         desc: 'Filter by tech stack, college, rating, and availability. Find a Python ML engineer or a React full-stack dev in minutes.' },
  { tag: '03', title: 'Budget-conscious pricing',     desc: 'Work with talented developers at 60–70% lower cost than agencies, without compromising on code quality.' },
  { tag: '04', title: 'Structured workflow',          desc: 'Built-in messaging, milestone tracking, and reviews keep projects on track from kick-off to delivery.' },
  { tag: '05', title: 'Portfolio-building',           desc: 'Each completed project becomes a verified portfolio entry. Students build credibility while earning real income.' },
  { tag: '06', title: 'Transparent ratings',          desc: 'Mutual review system with honest scores. Know exactly who you are hiring and what to expect.' },
]

const CATEGORY_LIST = [
  'Web Development',
  'Mobile Apps',
  'UI / UX Design',
  'Data Science',
  'Machine Learning',
  'Backend APIs',
  'DevOps / Cloud',
  'Game Dev',
]

const TESTIMONIALS = [
  {
    text: 'SkillBridge provided an amazing platform to find engineering projects and connect with companies looking for talented student developers.',
    name: 'Student Developer', role: 'B.Tech CS Student', initials: 'SD',
  },
  {
    text: 'Posting our technical requirements here allowed us to hire motivated student talent quickly with zero friction.',
    name: 'Tech Founder', role: 'Startup Client', initials: 'TF',
  },
]

/* Shared section style helpers */
const sectionLight = { padding: '100px 0', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
const sectionAlt   = { padding: '100px 0', background: 'rgba(248,250,252,0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
const cardStyle    = {
  background: 'rgba(255,255,255,0.88)',
  border: '1px solid rgba(0,0,0,0.07)',
  borderRadius: 14, padding: '1.5rem',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  transition: 'box-shadow 0.22s, transform 0.22s, border-color 0.22s',
}

/* Animated counter */
function Counter({ target }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const num = parseInt(String(target).replace(/[^0-9]/g, ''), 10) || 0
    if (num === 0) {
      setCount(0)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const step = Math.max(1, Math.ceil(num / 30))
        let curr = 0
        const timer = setInterval(() => {
          curr += step
          if (curr >= num) { setCount(num); clearInterval(timer) }
          else setCount(curr)
        }, 20)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  const raw = String(target)
  const suffix = raw.replace(/[0-9,.]/g, '')

  return (
    <span ref={ref} style={{ fontFamily: 'var(--font-mono)' }}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('client')
  const [categoryCounts, setCategoryCounts] = useState({})
  const [statsData, setStatsData] = useState({
    developers: 0,
    projects: 0,
    completed: 0,
    totalValue: 0
  })

  useEffect(() => {
    let isMounted = true
    async function loadStats() {
      try {
        const [students, projects] = await Promise.all([
          getStudents(),
          getProjects()
        ])
        if (!isMounted) return

        const devCount = Array.isArray(students) ? students.length : 0
        const projList = Array.isArray(projects) ? projects : []
        const projCount = projList.length
        const compCount = projList.filter(p => p.status === 'completed').length
        const sumValue = projList.reduce((acc, p) => acc + (Number(p.budget) || 0), 0)

        const counts = {}
        CATEGORY_LIST.forEach(cat => {
          counts[cat] = projList.filter(p => p.category === cat).length
        })
        setCategoryCounts(counts)

        setStatsData({
          developers: devCount,
          projects: projCount,
          completed: compCount,
          totalValue: sumValue
        })
      } catch (err) {
        console.error('Error loading live platform stats:', err)
      }
    }
    loadStats()
    const handleStorage = () => loadStats()
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(loadStats, 3000)
    return () => {
      isMounted = false
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  const clientSteps = [
    { n: '01', title: 'Post your project', desc: 'Describe the scope, required tech stack, budget, and deadline. Takes about 5 minutes.' },
    { n: '02', title: 'Review proposals',  desc: 'Browse student profiles, GitHub portfolios, past reviews, and tailored proposals.' },
    { n: '03', title: 'Hire and ship',     desc: 'Pick the right developer, collaborate via built-in chat, and track milestones.' },
  ]
  const studentSteps = [
    { n: '01', title: 'Build your profile', desc: 'List your skills, GitHub, college, and portfolio. The more detail, the better your match.' },
    { n: '02', title: 'Apply to projects',  desc: 'Write a focused proposal, set your bid, and explain why you are the right fit.' },
    { n: '03', title: 'Deliver and grow',   desc: 'Complete the project, earn a review, and add it as verified work to your portfolio.' },
  ]
  const steps = activeTab === 'client' ? clientSteps : studentSteps

  const devCountFormatted = statsData.developers.toLocaleString()
  const projCountFormatted = statsData.projects.toLocaleString()
  const successFormatted = statsData.projects > 0
    ? `${Math.round((statsData.completed / statsData.projects) * 100)}%`
    : '0%'
  const valFormatted = `₹${statsData.totalValue.toLocaleString()}`

  const dynamicStatsBand = [
    { val: devCountFormatted, label: 'Student Developers Registered' },
    { val: projCountFormatted, label: 'Projects Posted' },
    { val: successFormatted, label: 'Completion Rate' },
    { val: valFormatted, label: 'Total Value Generated' },
  ]

  return (
    <div>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        paddingTop: 'var(--navbar-height)',
        background: 'transparent',
      }}>
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="fade-in-up" style={{ maxWidth: 840, margin: '0 auto' }}>
            
            {/* Featured Official Brand Logo Emblem */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
              <LogoIcon size={80} showText={true} layout="stacked" />
            </div>

            {/* Live badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
              color: '#059669',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              borderRadius: '9999px',
              padding: '5px 16px', marginBottom: '1.75rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'pulse 2s infinite' }} />
              platform is live · {devCountFormatted} student developers
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(42px, 5.5vw, 68px)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
              color: '#0f172a',
            }}>
              Where student developers{' '}
              <span className="gradient-text">meet real projects</span>
            </h1>

            <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 640, margin: '0 auto 2.5rem' }}>
              SkillBridge connects India's B.Tech developers with startups and businesses that need reliable, high-quality engineering talent.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              {!user ? (
                <>
                  <Link to="/register?role=client" className="btn btn-primary btn-xl">Post a Project</Link>
                  <Link to="/browse-projects" className="btn btn-secondary btn-xl">Browse Projects</Link>
                </>
              ) : (
                <>
                  {user.role === 'client' ? (
                    <Link to="/client/post-project" className="btn btn-primary btn-xl">Post a Project</Link>
                  ) : (
                    <Link to="/browse-projects" className="btn btn-primary btn-xl">Browse Projects</Link>
                  )}
                  <Link to="/messages" className="btn btn-secondary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    💬 Open Messages
                  </Link>
                  <Link to={user.role === 'client' ? '/client/dashboard' : '/student/dashboard'} className="btn btn-ghost btn-xl">
                    Dashboard →
                  </Link>
                </>
              )}
            </div>

            {/* Tech Stack Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: '3.5rem' }}>
              {SKILLS.map(skill => (
                <span key={skill} className="skill-pill" style={{ fontSize: 12, padding: '5px 12px' }}>{skill}</span>
              ))}
            </div>

            {/* Stat row */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}>
              {[
                { val: devCountFormatted, label: 'Student Developers' },
                { val: projCountFormatted, label: 'Projects Posted' },
                { val: successFormatted, label: 'Success Rate' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 26, color: '#0f172a' }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(248,250,252,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '56px 0',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {dynamicStatsBand.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 4 }}>
                  <Counter target={s.val} />
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={sectionLight}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">// how it works</div>
            <h2 className="section-title">Simple, structured process</h2>
            <p className="section-subtitle">Three steps — whether you are hiring a developer or looking for your next project.</p>
          </div>

          {/* Tab toggle */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            background: 'rgba(241,245,249,0.9)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 10, padding: 4,
            width: 'fit-content', margin: '0 auto 3rem',
            gap: 4,
          }}>
            {['client', 'student'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '9px 26px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: activeTab === tab ? '#6366f1' : 'transparent',
                color: activeTab === tab ? 'white' : '#475569',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              }}>
                {tab === 'client' ? 'For clients' : 'For students'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.22)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6366f1', opacity: 0.7, marginBottom: '1rem' }}>{step.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.75rem', color: '#0f172a' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={sectionAlt}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">// platform features</div>
            <h2 className="section-title">Why teams choose SkillBridge</h2>
            <p className="section-subtitle">Built for developers who want real work, and for businesses that want real results.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.22)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6366f1', opacity: 0.55, marginBottom: '0.75rem' }}>{f.tag}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.6rem', color: '#0f172a' }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={sectionLight}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">// categories</div>
            <h2 className="section-title">Browse by category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {CATEGORY_LIST.map((catName, i) => (
              <Link
                key={i}
                to={`/browse-projects?category=${encodeURIComponent(catName)}`}
                style={{
                  display: 'block',
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(255,255,255,0.88)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 14,
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.22s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                  e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.88)'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.01em' }}>{catName}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94a3b8' }}>{categoryCounts[catName] || 0} project{(categoryCounts[catName] || 0) === 1 ? '' : 's'}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={sectionAlt}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">// from the community</div>
            <h2 className="section-title">What people say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Quote mark */}
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#6366f1', opacity: 0.18, lineHeight: 1, marginBottom: -8 }}>"</div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, flex: 1 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #0891b2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, color: 'white',
                    flexShrink: 0,
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '120px 0',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        position: 'relative',
      }}>
        {/* Subtle indigo glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="section-badge">// get started</div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(30px, 4vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: '#0f172a',
          }}>
            Ready to build something?
          </h2>
          <p style={{ color: '#475569', fontSize: 17, maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Join thousands of developers finding real projects and clients discovering reliable engineering talent.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=client" className="btn btn-primary btn-xl">Post a Project</Link>
            <Link to="/register?role=student" className="btn btn-secondary btn-xl">Join as Developer</Link>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            free to join · no credit card required
          </p>
        </div>
      </section>

    </div>
  )
}
