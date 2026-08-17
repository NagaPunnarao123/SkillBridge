import StarRating from './StarRating'

export default function ReviewCard({ review }) {
  const reviewer = review.reviewerData || review.reviewer || {}
  const parseDate = (d) => {
    if (!d) return new Date()
    if (d.toDate) return d.toDate()
    return new Date(d)
  }
  const dateStr = parseDate(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="card glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={reviewer.avatar || `https://ui-avatars.com/api/?name=${reviewer.name || 'User'}&background=random`} alt="reviewer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{reviewer.name || 'Anonymous User'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{dateStr}</div>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>"{review.comment}"</p>
    </div>
  )
}
