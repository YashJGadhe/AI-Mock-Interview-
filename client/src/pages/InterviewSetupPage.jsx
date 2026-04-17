import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewService } from 'services/api';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import { Alert } from 'components/ui/index';
import { JOB_ROLES } from 'utils/helpers';
import styles from './InterviewSetup.module.css';

const TYPES = [
  { value: 'hr', label: 'HR Interview', icon: '🤝', desc: 'Cultural fit, work style & career goals' },
  { value: 'technical', label: 'Technical', icon: '💻', desc: 'Coding, system design & domain knowledge' },
  { value: 'behavioral', label: 'Behavioral', icon: '🧠', desc: 'Situational STAR-method scenarios' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', icon: '🌱', desc: 'Beginner-friendly questions', color: 'var(--secondary)' },
  { value: 'medium', label: 'Medium', icon: '🔥', desc: 'Intermediate level, 1-3 yrs exp', color: '#F59E0B' },
  { value: 'hard', label: 'Hard', icon: '⚡', desc: 'Senior-level, challenging depth', color: 'var(--danger)' },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    jobRole: '',
    interviewType: location.state?.type || 'technical',
    difficulty: 'medium',
    questionCount: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleQuery, setRoleQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = roleQuery.length > 1
    ? JOB_ROLES.filter(r => r.toLowerCase().includes(roleQuery.toLowerCase())).slice(0, 6)
    : [];

  const handleStart = async () => {
    if (!form.jobRole.trim()) { setError('Please enter a job role.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await interviewService.start(form);
      navigate(`/interview/${data.interview.id}`, { state: { interview: data.interview } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Set Up Your Interview</h1>
        <p className={styles.subtitle}>Configure your mock interview session</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className={styles.steps}>
        {/* ── Step 1: Job Role ── */}
        <Card className={styles.stepCard}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>1</span>
            <div>
              <h2 className={styles.stepTitle}>Target Job Role</h2>
              <p className={styles.stepDesc}>What position are you applying for?</p>
            </div>
          </div>
          <div className={styles.roleInputWrap}>
            <input
              className={styles.roleInput}
              placeholder="e.g. Software Engineer, Product Manager…"
              value={form.jobRole || roleQuery}
              onChange={(e) => {
                setRoleQuery(e.target.value);
                setForm({ ...form, jobRole: e.target.value });
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className={styles.suggestionItem}
                    onMouseDown={() => {
                      setForm({ ...form, jobRole: s });
                      setRoleQuery(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ── Step 2: Interview Type ── */}
        <Card className={styles.stepCard}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>2</span>
            <div>
              <h2 className={styles.stepTitle}>Interview Type</h2>
              <p className={styles.stepDesc}>Select the type of interview to practice</p>
            </div>
          </div>
          <div className={styles.optionGrid}>
            {TYPES.map((t) => (
              <button
                key={t.value}
                className={`${styles.optionCard} ${form.interviewType === t.value ? styles.selected : ''}`}
                onClick={() => setForm({ ...form, interviewType: t.value })}
              >
                <span className={styles.optionIcon}>{t.icon}</span>
                <div>
                  <div className={styles.optionLabel}>{t.label}</div>
                  <div className={styles.optionDesc}>{t.desc}</div>
                </div>
                {form.interviewType === t.value && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Step 3: Difficulty ── */}
        <Card className={styles.stepCard}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>3</span>
            <div>
              <h2 className={styles.stepTitle}>Difficulty Level</h2>
              <p className={styles.stepDesc}>Choose the question complexity</p>
            </div>
          </div>
          <div className={styles.diffGrid}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                className={`${styles.diffCard} ${form.difficulty === d.value ? styles.diffSelected : ''}`}
                style={form.difficulty === d.value ? { borderColor: d.color, background: `${d.color}0D` } : {}}
                onClick={() => setForm({ ...form, difficulty: d.value })}
              >
                <span className={styles.diffIcon}>{d.icon}</span>
                <span className={styles.diffLabel} style={form.difficulty === d.value ? { color: d.color } : {}}>
                  {d.label}
                </span>
                <span className={styles.diffDesc}>{d.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* ── Step 4: Question Count ── */}
        <Card className={styles.stepCard}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>4</span>
            <div>
              <h2 className={styles.stepTitle}>Number of Questions</h2>
              <p className={styles.stepDesc}>How many questions do you want?</p>
            </div>
          </div>
          <div className={styles.countRow}>
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                className={`${styles.countBtn} ${form.questionCount === n ? styles.countSelected : ''}`}
                onClick={() => setForm({ ...form, questionCount: n })}
              >
                {n}
              </button>
            ))}
          </div>
          <p className={styles.countHint}>
            Estimated time: ~{form.questionCount * 3}–{form.questionCount * 5} minutes
          </p>
        </Card>
      </div>

      {/* ── Summary & Start ── */}
      <Card className={styles.summaryCard}>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Role</span>
            <span className={styles.summaryValue}>{form.jobRole || '—'}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Type</span>
            <span className={styles.summaryValue}>{TYPES.find(t => t.value === form.interviewType)?.label}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Difficulty</span>
            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>{form.difficulty}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Questions</span>
            <span className={styles.summaryValue}>{form.questionCount}</span>
          </div>
        </div>
        <Button
          size="lg"
          onClick={handleStart}
          isLoading={loading}
          disabled={!form.jobRole}
          icon="🚀"
        >
          Start Interview
        </Button>
      </Card>
    </div>
  );
};

export default InterviewSetupPage;
