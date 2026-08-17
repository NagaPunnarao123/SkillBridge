import React from 'react';

export default function LoadingSpinner({ fullPage, size = 40 }) {
  const spinner = <div className="spinner" style={{ width: size, height: size, border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
  if (fullPage) return <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{spinner}</div>;
  return <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>{spinner}</div>;
}
