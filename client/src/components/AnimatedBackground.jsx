import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const TECH_LABELS = [
  'React', 'Node.js', 'Python', 'Flutter', 'TypeScript',
  'AWS', 'Docker', 'MongoDB', 'ML/AI', 'Next.js',
  'PostgreSQL', 'TensorFlow', 'Firebase', 'GraphQL', 'Redis',
  'Vue.js', 'DevOps', 'UI/UX',
]

const NODE_COLORS = [
  { r: 99,  g: 102, b: 241 },
  { r: 8,   g: 145, b: 178 },
  { r: 124, g: 58,  b: 237 },
]

const ROUTE_IMAGES = {
  '/': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2072&q=80',
  '/browse-projects': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2070&q=80',
  '/browse-students': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2070&q=80',
  '/login': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=2070&q=80',
  '/register': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=2070&q=80',
  '/client': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2015&q=80',
  '/student': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2070&q=80',
  '/messages': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=2070&q=80',
}

function getBgImage(pathname) {
  if (ROUTE_IMAGES[pathname]) return ROUTE_IMAGES[pathname]
  if (pathname.startsWith('/projects/')) return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=2070&q=80'
  if (pathname.startsWith('/client/')) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2015&q=80'
  if (pathname.startsWith('/student/')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2070&q=80'
  if (pathname.startsWith('/profile/')) return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2070&q=80'
  return ROUTE_IMAGES['/']
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const location = useLocation()
  const currentImage = getBgImage(location.pathname)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w = (canvas.width  = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const onResize = () => {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    let scrollY = 0
    const onScroll = () => { scrollY = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    const COUNT = Math.min(70, Math.floor((w * h) / 18000) + 30)
    const MAX_DIST = 170

    const particles = Array.from({ length: COUNT }, (_, i) => {
      const hasLabel = i < TECH_LABELS.length
      const colorIdx = Math.floor(Math.random() * NODE_COLORS.length)
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: hasLabel ? Math.random() * 2.5 + 2.5 : Math.random() * 2 + 1,
        label: hasLabel ? TECH_LABELS[i] : null,
        color: NODE_COLORS[colorIdx],
        depth: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.02,
      }
    })

    let animId
    let prevTime = performance.now()

    function draw(now) {
      const dt = Math.min((now - prevTime) / 16, 3)
      prevTime = now

      ctx.clearRect(0, 0, w, h)

      particles.forEach(p => {
        p.x     += p.vx * dt
        p.y     += p.vy * dt
        p.phase += p.phaseSpeed * dt

        if (p.x < -80)     p.x = w + 60
        if (p.x > w + 80)  p.x = -60
        if (p.y < -80)     p.y = h + 60
        if (p.y > h + 80)  p.y = -60
      })

      for (let i = 0; i < particles.length - 1; i++) {
        const a  = particles[i]
        const ay = a.y - scrollY * a.depth * 0.06

        for (let j = i + 1; j < particles.length; j++) {
          const b  = particles[j]
          const by = b.y - scrollY * b.depth * 0.06

          const dx   = a.x - b.x
          const dy   = ay - by
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MAX_DIST) {
            const alpha      = (1 - dist / MAX_DIST) * 0.14
            const { r, g, b: bv } = a.color
            ctx.beginPath()
            ctx.moveTo(a.x, ay)
            ctx.lineTo(b.x, by)
            ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha})`
            ctx.lineWidth   = 1
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        const py     = p.y - scrollY * p.depth * 0.06
        const pulse  = 0.88 + Math.sin(p.phase) * 0.12
        const radius = p.r * pulse
        const { r, g, b } = p.color

        const grd = ctx.createRadialGradient(p.x, py, 0, p.x, py, radius * 5)
        grd.addColorStop(0, `rgba(${r},${g},${b},0.14)`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(p.x, py, radius * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`
        ctx.fill()

        if (p.label) {
          ctx.font      = `500 10.5px 'JetBrains Mono', monospace`
          ctx.fillStyle = `rgba(${r},${g},${b},0.50)`
          ctx.fillText(p.label, p.x + radius + 5, py + 4)
        }
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      {/* ── Dynamic Route Realistic Background Image ── */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundImage: `url("${currentImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -11,
          opacity: 0.65,
          transition: 'background-image 0.6s ease-in-out, opacity 0.6s ease-in-out',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: -10,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, 0.81)',
          zIndex: -9,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

