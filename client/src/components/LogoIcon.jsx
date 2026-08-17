export default function LogoIcon({ size = 44, showText = true, darkBackground = false }) {
  const textColor = darkBackground ? '#FFFFFF' : '#0F172A'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0, userSelect: 'none' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        {/* "Skill" Text */}
        <span style={{
          fontFamily: 'var(--font-heading), system-ui, sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: Math.max(20, Math.round(size * 0.58)),
          color: textColor,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Skill
        </span>

        {/* Briefcase Icon with Checkmark & Swoosh */}
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.65)}
          viewBox="0 0 60 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', flexShrink: 0, margin: '0 1px' }}
        >
          {/* Briefcase handle */}
          <path d="M 22 10 C 22 6, 38 6, 38 10 L 38 14 L 22 14 Z" fill="#00A8FF" />
          <rect x="25" y="8" width="10" height="4" rx="1.5" fill={darkBackground ? "#0D1B2A" : "#FFFFFF"} />

          {/* Briefcase body */}
          <rect x="10" y="14" width="40" height="30" rx="6" fill="#00A8FF" />

          {/* Dark Checkmark cut through */}
          <path
            d="M 12 28 L 24 38 L 52 10"
            stroke={darkBackground ? "#0D1B2A" : "#0F172A"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cyan checkmark inner */}
          <path
            d="M 12 28 L 24 38 L 52 10"
            stroke="#00A8FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Swoosh Extension Tail */}
          <path d="M 44 14 Q 50 7 56 3" stroke="#00A8FF" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* "Bridge" Text */}
        <span style={{
          fontFamily: 'var(--font-heading), system-ui, sans-serif',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: Math.max(20, Math.round(size * 0.58)),
          color: '#00A8FF',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginLeft: -2,
        }}>
          Bridge
        </span>
      </div>

      {/* Subtitle "Employment Services" */}
      {showText && (
        <span style={{
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: Math.max(10, Math.round(size * 0.24)),
          color: darkBackground ? 'rgba(255,255,255,0.92)' : '#475569',
          letterSpacing: '0.03em',
          marginTop: 1,
          paddingLeft: 2,
          lineHeight: 1.1,
        }}>
          Employment Services
        </span>
      )}
    </div>
  )
}
