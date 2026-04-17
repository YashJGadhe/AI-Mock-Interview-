import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { interviewService } from 'services/api';
import Card from 'components/ui/Card';
import Button from 'components/ui/Button';
import { Badge, ScoreRing, Spinner, EmptyState } from 'components/ui/index';
import { formatRelativeTime, getTypeLabel, getTypeColor, getDifficultyColor, formatDuration } from 'utils/helpers';
import styles from './Dashboard.module.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <Card className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await interviewService.getHistory({ limit: 5, status: 'completed' });
        setRecentInterviews(data.interviews);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const stats = user?.stats || {};
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
          <h1 className={styles.heroTitle}>
            Ready to ace your<br />
            <span className={styles.heroAccent}>next interview?</span>
          </h1>
          <p className={styles.heroSub}>
            Practice with AI-powered mock interviews and get instant, detailed feedback.
          </p>
          <div className={styles.heroActions}>
            <Button size="lg" onClick={() => navigate('/interview/setup')} icon="🎯">
              Start New Interview
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/history')}>
              View History
            </Button>
          </div>
        </div>
        <div className={styles.heroRight}>
          {stats.totalInterviews > 0 ? (
            <div className={styles.scoreDisplay}>
              <ScoreRing score={stats.averageScore} size={140} strokeWidth={12} />
              <div>
                <div className={styles.scoreLabel}>Average Score</div>
                <div className={styles.scoreSub}>{stats.totalInterviews} interviews completed</div>
              </div>
            </div>
          ) : (
            <div className={styles.noStats}>
              <span style={{ fontSize: '3rem' }}>🚀</span>
              <p>Complete your first interview to see your stats</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className={styles.statsGrid}>
        <StatCard
          icon="🎯"
          label="Total Interviews"
          value={stats.totalInterviews || 0}
          color="var(--primary)"
        />
        <StatCard
          icon="⭐"
          label="Best Score"
          value={stats.bestScore ? `${stats.bestScore}%` : '—'}
          color="#F59E0B"
          sub={stats.bestScore ? 'Personal record' : 'No interviews yet'}
        />
        <StatCard
          icon="📈"
          label="Average Score"
          value={stats.averageScore ? `${stats.averageScore}%` : '—'}
          color="var(--secondary)"
        />
        <StatCard
          icon="⏱️"
          label="Time Practiced"
          value={formatDuration(stats.totalTime || 0)}
          color="var(--info)"
        />
      </section>

      {/* ── Interview Type Breakdown ── */}
      <div className={styles.twoCol}>
        <section>
          <h2 className={styles.sectionTitle}>Practice by Type</h2>
          <div className={styles.typeCards}>
            {[
              { type: 'hr', label: 'HR Interview', icon: '🤝', desc: 'Cultural fit, soft skills', count: stats.interviewsByType?.hr || 0 },
              { type: 'technical', label: 'Technical', icon: '💻', desc: 'Coding, system design', count: stats.interviewsByType?.technical || 0 },
              { type: 'behavioral', label: 'Behavioral', icon: '🧠', desc: 'STAR method, scenarios', count: stats.interviewsByType?.behavioral || 0 },
            ].map((t) => (
              <Card
                key={t.type}
                hover
                className={styles.typeCard}
                onClick={() => navigate('/interview/setup', { state: { type: t.type } })}
              >
                <div className={styles.typeIcon} style={{ background: `${getTypeColor(t.type)}18` }}>
                  {t.icon}
                </div>
                <div className={styles.typeInfo}>
                  <div className={styles.typeName}>{t.label}</div>
                  <div className={styles.typeDesc}>{t.desc}</div>
                </div>
                <Badge color={getTypeColor(t.type)} bg={`${getTypeColor(t.type)}15`}>
                  {t.count} done
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Recent Interviews ── */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Interviews</h2>
            <Link to="/history" className={styles.sectionLink}>View all →</Link>
          </div>
          {loading ? (
            <div className={styles.loadingWrap}><Spinner /></div>
          ) : recentInterviews.length === 0 ? (
            <Card>
              <EmptyState
                icon="📝"
                title="No interviews yet"
                description="Start your first mock interview to see your history here."
                action={
                  <Button onClick={() => navigate('/interview/setup')}>
                    Start Interview
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className={styles.historyList}>
              {recentInterviews.map((iv) => (
                <Card
                  key={iv._id}
                  hover
                  padding="sm"
                  className={styles.historyItem}
                  onClick={() => navigate(`/feedback/${iv._id}`)}
                >
                  <div className={styles.historyLeft}>
                    <div
                      className={styles.historyDot}
                      style={{ background: getTypeColor(iv.interviewType) }}
                    />
                    <div>
                      <div className={styles.historyRole}>{iv.jobRole}</div>
                      <div className={styles.historyMeta}>
                        <Badge color={getTypeColor(iv.interviewType)} bg={`${getTypeColor(iv.interviewType)}15`}>
                          {getTypeLabel(iv.interviewType)}
                        </Badge>
                        <span
                          className={styles.historyDiff}
                          style={{ color: getDifficultyColor(iv.difficulty) }}
                        >
                          {iv.difficulty}
                        </span>
                        <span className={styles.historyTime}>{formatRelativeTime(iv.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {iv.feedback?.overallScore != null && (
                    <div
                      className={styles.historyScore}
                      style={{ color: iv.feedback.overallScore >= 70 ? 'var(--secondary)' : 'var(--warning)' }}
                    >
                      {iv.feedback.overallScore}%
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Quick Tips ── */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Tips</h2>
          <Link to="/resources" className={styles.sectionLink}>More resources →</Link>
        </div>
        <div className={styles.tipsGrid}>
          {[
            { icon: '⭐', tip: 'Use the STAR method for behavioral questions', color: '#F59E0B' },
            { icon: '🔬', tip: 'Research the company before your interview', color: 'var(--primary)' },
            { icon: '💬', tip: 'Practice answers out loud to build confidence', color: 'var(--secondary)' },
            { icon: '❓', tip: 'Always prepare questions to ask your interviewer', color: '#8B5CF6' },
          ].map((t, i) => (
            <Card key={i} padding="md" className={styles.tipCard}>
              <span className={styles.tipIcon} style={{ background: `${t.color}18`, color: t.color }}>
                {t.icon}
              </span>
              <p className={styles.tipText}>{t.tip}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
