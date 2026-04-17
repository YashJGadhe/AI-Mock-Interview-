import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService, aiService } from 'services/api';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import { ScoreRing, GradeBadge, ProgressBar, Badge, Spinner, Alert } from 'components/ui/index';
import { getTypeLabel, getTypeColor, getDifficultyColor, formatDate, formatDuration, getScoreLabel } from 'utils/helpers';
import styles from './FeedbackPage.module.css';

const FeedbackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await interviewService.getById(id);
        setInterview(data.interview);

        // If feedback exists, show it; otherwise generate
        if (data.interview.feedback?.overallScore) {
          setFeedback(data.interview.feedback);
          setLoading(false);
        } else {
          setLoading(false);
          await generateFeedback();
        }
      } catch {
        setError('Failed to load interview results.');
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line

  const generateFeedback = async () => {
    setGenerating(true);
    try {
      const { data } = await aiService.getFeedback(id);
      setFeedback(data.feedback);
    } catch (err) {
      setError('Failed to generate AI feedback. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size={48} />
        <p>Loading your results…</p>
      </div>
    );
  }

  if (generating) {
    return (
      <div className={styles.centered}>
        <div className={styles.generatingAnim}>
          <span>🤖</span>
        </div>
        <h2 className={styles.generatingTitle}>Analyzing Your Performance</h2>
        <p className={styles.generatingSub}>Our AI is reviewing your answers…</p>
        <div className={styles.generatingDots}>
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (error && !feedback) {
    return (
      <div className={styles.centered}>
        <Alert type="error" message={error} />
        <div className={styles.centeredActions}>
          <Button onClick={generateFeedback}>Try Again</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </div>
    );
  }

  const score = feedback?.overallScore ?? 0;
  const answeredCount = interview?.answers?.filter(a => !a.isSkipped && a.answerText).length ?? 0;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Interview Complete</p>
          <h1 className={styles.title}>{interview?.jobRole}</h1>
          <div className={styles.headerMeta}>
            <Badge color={getTypeColor(interview?.interviewType)} bg={`${getTypeColor(interview?.interviewType)}15`}>
              {getTypeLabel(interview?.interviewType)}
            </Badge>
            <span style={{ color: getDifficultyColor(interview?.difficulty), fontWeight: 500, textTransform: 'capitalize', fontSize: 'var(--font-sm)' }}>
              {interview?.difficulty}
            </span>
            <span className={styles.metaDate}>{formatDate(interview?.createdAt)}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => navigate('/interview/setup')}>
            New Interview
          </Button>
          <Button variant="ghost" onClick={() => navigate('/history')}>
            View History
          </Button>
        </div>
      </div>

      {/* ── Score Overview ── */}
      <div className={styles.scoreGrid}>
        <Card className={styles.scoreMain}>
          <div className={styles.scoreInner}>
            <ScoreRing score={score} size={160} strokeWidth={14} />
            <div className={styles.scoreInfo}>
              <div className={styles.scoreLabel}>{getScoreLabel(score)}</div>
              <div className={styles.scoreSummary}>{feedback?.summary}</div>
              <div className={styles.gradeRow}>
                <GradeBadge grade={feedback?.grade || 'C'} />
                <span className={styles.gradeLabel}>Overall Grade</span>
              </div>
            </div>
          </div>
        </Card>

        <div className={styles.scoreStats}>
          {[
            { label: 'Questions Answered', value: answeredCount, total: interview?.questions?.length, icon: '📝' },
            { label: 'Duration', value: formatDuration(interview?.duration), icon: '⏱️' },
            { label: 'Score', value: `${score}/100`, icon: '⭐' },
          ].map((s, i) => (
            <Card key={i} className={styles.scoreStat}>
              <span className={styles.scoreStatIcon}>{s.icon}</span>
              <div className={styles.scoreStatValue}>
                {s.value}
                {s.total != null && <span className={styles.scoreStatTotal}> / {s.total}</span>}
              </div>
              <div className={styles.scoreStatLabel}>{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div className={styles.swGrid}>
        <Card>
          <h2 className={styles.sectionTitle}>
            <span>💪</span> Strengths
          </h2>
          <ul className={styles.swList}>
            {feedback?.strengths?.length > 0
              ? feedback.strengths.map((s, i) => (
                  <li key={i} className={`${styles.swItem} ${styles.strength}`}>
                    <span className={styles.swIcon}>✓</span>
                    {s}
                  </li>
                ))
              : <li className={styles.swEmpty}>No specific strengths noted.</li>
            }
          </ul>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>
            <span>📈</span> Areas to Improve
          </h2>
          <ul className={styles.swList}>
            {feedback?.weaknesses?.length > 0
              ? feedback.weaknesses.map((w, i) => (
                  <li key={i} className={`${styles.swItem} ${styles.weakness}`}>
                    <span className={styles.swIcon}>→</span>
                    {w}
                  </li>
                ))
              : <li className={styles.swEmpty}>No specific areas noted.</li>
            }
          </ul>
        </Card>
      </div>

      {/* ── Suggestions ── */}
      {feedback?.suggestions?.length > 0 && (
        <Card>
          <h2 className={styles.sectionTitle}><span>🎯</span> Recommendations</h2>
          <div className={styles.suggestionGrid}>
            {feedback.suggestions.map((s, i) => (
              <div key={i} className={styles.suggestionCard}>
                <span className={styles.suggestionNum}>{i + 1}</span>
                <p>{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Per-answer Feedback ── */}
      {feedback?.perAnswerFeedback?.length > 0 && (
        <Card>
          <h2 className={styles.sectionTitle}><span>📋</span> Answer-by-Answer Review</h2>
          <div className={styles.answerList}>
            {feedback.perAnswerFeedback.map((af, i) => (
              <div key={i} className={styles.answerItem}>
                <div className={styles.answerHeader}>
                  <span className={styles.answerNum}>Q{i + 1}</span>
                  <p className={styles.answerQ}>{af.questionText}</p>
                  <div className={styles.answerScore} style={{ color: af.score >= 70 ? 'var(--secondary)' : af.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                    {af.score}%
                  </div>
                </div>
                <ProgressBar value={af.score} color={af.score >= 70 ? 'var(--secondary)' : af.score >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                <p className={styles.answerComment}>{af.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── CTA ── */}
      <Card className={styles.ctaCard}>
        <div>
          <h2 className={styles.ctaTitle}>Keep Improving! 🚀</h2>
          <p className={styles.ctaSub}>Practice makes perfect. Try another interview to improve your score.</p>
        </div>
        <div className={styles.ctaActions}>
          <Button size="lg" onClick={() => navigate('/interview/setup')}>
            Practice Again
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/resources')}>
            Study Resources
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackPage;
