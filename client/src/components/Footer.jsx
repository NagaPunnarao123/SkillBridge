import { Link } from 'react-router-dom';
import LogoIcon from './LogoIcon';

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid rgba(0,0,0,0.07)',
      background: 'rgba(248,250,252,0.88)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      padding: '4rem 0 2rem',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', marginBottom: '1.25rem', display: 'inline-block' }}>
              <LogoIcon size={48} showText={true} />
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.75, maxWidth: 280 }}>
              Connecting B.Tech developers with real projects. Build your portfolio. Grow your career.
            </p>
            <div style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              v1.0.0 · MIT License
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { to: '/browse-projects', label: 'Projects' },
                { to: '/browse-students', label: 'Student' },
                { to: '/register', label: 'Post a Project' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ color: 'var(--text-secondary)', fontSize: 13.5, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['About', 'Blog', 'Careers'].map(l => (
                <span key={l} style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['Help Center', 'Contact', 'Privacy Policy'].map(l => (
                <span key={l} style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            © {year} SkillBridge. Built for students.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Terms', 'Privacy', 'Cookies'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
