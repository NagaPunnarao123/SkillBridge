import React from 'react';

export default function StarRating({ rating = 0, max = 5, size = 'md', interactive = false, onChange }) {
  const sizes = { sm: 14, md: 18, lg: 22 };
  const fontSize = sizes[size] || 18;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{ fontSize, cursor: interactive ? 'pointer' : 'default', color: i < Math.round(rating) ? '#FBBF24' : '#334155', transition: 'color 0.2s' }}
          onClick={() => interactive && onChange && onChange(i + 1)}
        >★</span>
      ))}
      {rating > 0 && <span style={{ fontSize: fontSize - 4, color: 'var(--text-secondary)', marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>}
    </div>
  );
}
