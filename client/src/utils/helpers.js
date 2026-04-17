/**
 * Utility Helper Functions
 */

// ── Format date ───────────────────────────────────────────────────
export const formatDate = (dateStr, options = {}) => {
  const date = new Date(dateStr);
  const defaults = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', { ...defaults, ...options });
};

export const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

// ── Score helpers ─────────────────────────────────────────────────
export const getScoreColor = (score) => {
  if (score >= 85) return 'var(--secondary)';
  if (score >= 70) return 'var(--info)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
};

export const getGradeBadgeStyle = (grade) => {
  const styles = {
    'A+': { bg: '#DCFCE7', color: '#15803D' },
    'A':  { bg: '#DCFCE7', color: '#16A34A' },
    'B+': { bg: '#DBEAFE', color: '#1D4ED8' },
    'B':  { bg: '#DBEAFE', color: '#2563EB' },
    'C+': { bg: '#FEF9C3', color: '#A16207' },
    'C':  { bg: '#FEF9C3', color: '#CA8A04' },
    'D':  { bg: '#FEE2E2', color: '#B91C1C' },
    'F':  { bg: '#FEE2E2', color: '#DC2626' },
  };
  return styles[grade] || styles['C'];
};

// ── Interview type labels ─────────────────────────────────────────
export const getTypeLabel = (type) => {
  const labels = { hr: 'HR Interview', technical: 'Technical', behavioral: 'Behavioral' };
  return labels[type] || type;
};

export const getTypeColor = (type) => {
  const colors = {
    hr: '#8B5CF6',
    technical: '#3B82F6',
    behavioral: '#22C55E',
  };
  return colors[type] || 'var(--primary)';
};

export const getDifficultyColor = (level) => {
  const colors = { easy: '#22C55E', medium: '#F59E0B', hard: '#EF4444' };
  return colors[level] || 'var(--text-secondary)';
};

// ── Duration formatter ────────────────────────────────────────────
export const formatDuration = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ── Truncate text ─────────────────────────────────────────────────
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
};

// ── Capitalize ────────────────────────────────────────────────────
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// ── Job role suggestions ──────────────────────────────────────────
export const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'Product Manager', 'UX Designer', 'DevOps Engineer',
  'Cloud Architect', 'QA Engineer', 'Mobile Developer',
  'Data Analyst', 'Cybersecurity Engineer', 'Business Analyst',
  'Marketing Manager', 'Sales Representative', 'Project Manager',
  'HR Manager', 'Financial Analyst',
];
