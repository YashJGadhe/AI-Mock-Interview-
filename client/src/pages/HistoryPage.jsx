import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from 'services/api';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import { Badge, Spinner, EmptyState, ProgressBar } from 'components/ui/index';
import { formatDate, getTypeLabel, getTypeColor, getDifficultyColor, formatDuration, getScoreColor } from 'utils/helpers';
import styles from './HistoryPage.module.css';

const FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'hr', label: 'HR' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
];

const HistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await interviewService.getHistory({ page, limit: 10, type: typeFilter || undefined, status: 'completed' });
        setInterviews(data.interviews);
        setPagination(data.pagination);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, typeFilter]);

  const handleFilterChange = (f) => {
    setTypeFilter(f);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Interview History</h1>
          <p className={styles.subtitle}>Review your past practice sessions and track progress</p>
        </div>
        <Button onClick={() => navigate('/interview/setup')} icon="🎯">
          New Interview
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${typeFilter === f.value ? styles.filterActive : ''}`}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className={styles.loadingWrap}><Spinner size={40} /></div>
      ) : interviews.length === 0 ? (
        <Card>
          <EmptyState
            icon="📋"
            title="No interviews found"
            description={typeFilter ? `No ${typeFilter} interviews yet.` : 'Start your first mock interview to build your history.'}
            action={<Button onClick={() => navigate('/interview/setup')}>Start Interview</Button>}
          />
        </Card>
      ) : (
        <div className={styles.list}>
          {interviews.map((iv) => (
            <Card
              key={iv._id}
              hover
              className={styles.card}
              onClick={() => navigate(`/feedback/${iv._id}`)}
            >
              <div className={styles.cardLeft}>
                <div
                  className={styles.typeIndicator}
                  style={{ background: getTypeColor(iv.interviewType) }}
                />
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardRole}>{iv.jobRole}</h3>
                  <div className={styles.cardMeta}>
                    <Badge color={getTypeColor(iv.interviewType)} bg={`${getTypeColor(iv.interviewType)}15`}>
                      {getTypeLabel(iv.interviewType)}
                    </Badge>
                    <span style={{ color: getDifficultyColor(iv.difficulty), fontSize: 'var(--font-xs)', fontWeight: 500, textTransform: 'capitalize' }}>
                      {iv.difficulty}
                    </span>
                    <span className={styles.cardDate}>{formatDate(iv.createdAt)}</span>
                    {iv.duration > 0 && (
                      <span className={styles.cardDate}>⏱ {formatDuration(iv.duration)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardRight}>
                {iv.feedback?.overallScore != null ? (
                  <div className={styles.scoreWrap}>
                    <div className={styles.scoreNum} style={{ color: getScoreColor(iv.feedback.overallScore) }}>
                      {iv.feedback.overallScore}
                      <span className={styles.scoreMax}>/100</span>
                    </div>
                    <ProgressBar
                      value={iv.feedback.overallScore}
                      color={getScoreColor(iv.feedback.overallScore)}
                      height={4}
                    />
                    <span className={styles.scoreGrade}>{iv.feedback.grade}</span>
                  </div>
                ) : (
                  <Badge>No feedback</Badge>
                )}
                <span className={styles.arrow}>→</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
