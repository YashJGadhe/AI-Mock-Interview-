import React from 'react';
import { getScoreColor, getGradeBadgeStyle } from 'utils/helpers';

/** Colored status badge */
export const Badge = ({ children, color, bg, variant = 'default', className = '' }) => {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: bg || 'var(--primary-light)',
    color: color || 'var(--primary)',
    whiteSpace: 'nowrap',
  };
  return <span style={styles} className={className}>{children}</span>;
};

/** Grade badge (A+, B, etc.) */
export const GradeBadge = ({ grade }) => {
  const { bg, color } = getGradeBadgeStyle(grade);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 40, height: 40, borderRadius: '50%',
      backgroundColor: bg, color, fontWeight: 700, fontSize: '1rem',
    }}>
      {grade}
    </span>
  );
};

/** Circular score ring */
export const ScoreRing = ({ score, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: size * 0.1, color: 'var(--text-secondary)' }}>/ 100</span>
      </div>
    </div>
  );
};

/** Linear progress bar */
export const ProgressBar = ({ value, max = 100, color, height = 8, className = '' }) => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color || getScoreColor(pct);
  return (
    <div style={{
      width: '100%', height, backgroundColor: 'var(--border)',
      borderRadius: 9999, overflow: 'hidden',
    }} className={className}>
      <div style={{
        width: `${pct}%`, height: '100%',
        backgroundColor: barColor, borderRadius: 9999,
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
};

/** Spinner / loading indicator */
export const Spinner = ({ size = 32, color = 'var(--primary)' }) => (
  <div style={{
    width: size, height: size,
    border: `3px solid var(--border)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }} />
);

/** Empty state placeholder */
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '1rem',
  }}>
    <span style={{ fontSize: '3rem' }}>{icon}</span>
    <div>
      <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>{title}</h3>
      {description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{description}</p>}
    </div>
    {action}
  </div>
);

/** Alert / notification banner */
export const Alert = ({ type = 'info', title, message, onClose }) => {
  const types = {
    info:    { bg: 'var(--info-light)',    color: 'var(--info)',    icon: 'ℹ️' },
    success: { bg: 'var(--secondary-light)', color: 'var(--secondary-dark)', icon: '✅' },
    warning: { bg: 'var(--warning-light)', color: '#92400E',       icon: '⚠️' },
    error:   { bg: 'var(--danger-light)',  color: 'var(--danger)',  icon: '❌' },
  };
  const t = types[type];
  return (
    <div style={{
      display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem',
      backgroundColor: t.bg, borderRadius: 'var(--radius-md)',
      border: `1px solid ${t.color}30`,
    }}>
      <span>{t.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, color: t.color, fontSize: '0.875rem' }}>{title}</div>}
        {message && <div style={{ color: t.color, fontSize: '0.875rem', marginTop: '2px' }}>{message}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: t.color, fontSize: '1rem', padding: 0,
        }}>✕</button>
      )}
    </div>
  );
};
