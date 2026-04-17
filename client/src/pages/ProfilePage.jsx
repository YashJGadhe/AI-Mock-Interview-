import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { authService, profileService } from 'services/api';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Card from 'components/ui/Card';
import { Alert, ProgressBar, ScoreRing } from 'components/ui/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, getTypeColor } from 'utils/helpers';
import styles from './ProfilePage.module.css';

const EXPERIENCE_OPTIONS = ['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'];
const SKILLS_SUGGESTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL', 'AWS',
  'Docker', 'TypeScript', 'Go', 'MongoDB', 'PostgreSQL', 'Kubernetes', 'Rust',
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    targetRole: user?.targetRole || '',
    experience: user?.experience || 'fresher',
    skills: user?.skills || [],
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (tab === 'analytics') loadAnalytics();
  }, [tab]); // eslint-disable-line

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await profileService.getAnalytics();
      setAnalytics(data);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await authService.updateProfile(form);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', resumeFile);
    try {
      const { data } = await profileService.uploadResume(fd);
      updateUser({ resumeUrl: data.resumeUrl });
      setSuccess('Resume uploaded successfully!');
      setResumeFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const stats = user?.stats || {};

  return (
    <div className={styles.page}>
      {/* ── Profile Hero ── */}
      <div className={styles.hero}>
        <div className={styles.avatarCircle}>
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            : <span className={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{user?.name}</h1>
          <p className={styles.heroRole}>{user?.jobTitle || <em>Add your job title</em>}</p>
          {user?.targetRole && (
            <p className={styles.heroTarget}>🎯 Targeting: {user.targetRole}</p>
          )}
          <div className={styles.skillPills}>
            {(user?.skills || []).slice(0, 6).map((s) => (
              <span key={s} className={styles.skillPill}>{s}</span>
            ))}
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{stats.totalInterviews || 0}</span>
            <span className={styles.heroStatLbl}>Interviews</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{stats.averageScore || 0}%</span>
            <span className={styles.heroStatLbl}>Avg Score</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{stats.bestScore || 0}%</span>
            <span className={styles.heroStatLbl}>Best Score</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key: 'profile', label: '👤 Profile' },
          { key: 'resume', label: '📄 Resume' },
          { key: 'analytics', label: '📊 Analytics' },
        ].map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Profile Tab ── */}
      {tab === 'profile' && (
        <div className={styles.twoCol}>
          <div className={styles.formCol}>
            <Card>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.formGrid}>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Current Job Title"
                  placeholder="e.g. Software Engineer"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
                <Input
                  label="Target Role"
                  placeholder="e.g. Senior Software Engineer"
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                />
                <div>
                  <label className={styles.selectLabel}>Experience Level</label>
                  <select
                    className={styles.select}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  >
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.bioWrap}>
                <label className={styles.selectLabel}>Bio / Professional Summary</label>
                <textarea
                  className={styles.bioArea}
                  rows={4}
                  placeholder="Write a short professional bio…"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
            </Card>

            <Card>
              <h2 className={styles.sectionTitle}>Social Links</h2>
              <div className={styles.formGrid}>
                <Input
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.linkedIn}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                />
                <Input
                  label="GitHub URL"
                  placeholder="https://github.com/yourusername"
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                />
              </div>
            </Card>

            <Button isLoading={saving} onClick={handleSave} fullWidth size="lg">
              Save Changes
            </Button>
          </div>

          {/* ── Skills Sidebar ── */}
          <div>
            <Card>
              <h2 className={styles.sectionTitle}>Skills</h2>
              <div className={styles.skillInputRow}>
                <input
                  className={styles.skillInput}
                  placeholder="Type a skill and press Enter…"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); }
                  }}
                />
                <button className={styles.addSkillBtn} onClick={() => addSkill(skillInput)}>+</button>
              </div>

              <p className={styles.skillsHint}>Quick add:</p>
              <div className={styles.skillSuggestions}>
                {SKILLS_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 8).map((s) => (
                  <button key={s} className={styles.skillSuggestion} onClick={() => addSkill(s)}>
                    + {s}
                  </button>
                ))}
              </div>

              <div className={styles.skillTags}>
                {form.skills.length === 0 ? (
                  <p className={styles.noSkills}>No skills added yet. Use the field above to add skills.</p>
                ) : (
                  form.skills.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                      <button className={styles.removeSkill} onClick={() => removeSkill(skill)}>✕</button>
                    </span>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Resume Tab ── */}
      {tab === 'resume' && (
        <Card className={styles.resumeCard}>
          <h2 className={styles.sectionTitle}>Upload Resume</h2>
          <p className={styles.resumeDesc}>
            Keep your resume on file for quick reference during interviews.
            Accepted formats: PDF, DOC, DOCX (max 5MB).
          </p>

          {user?.resumeUrl && (
            <div className={styles.currentResume}>
              <span>✅ Resume on file</span>
              <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                View Current ↗
              </a>
            </div>
          )}

          <div className={styles.dropzone}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="resume-upload"
              className={styles.fileInput}
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <label htmlFor="resume-upload" className={styles.dropzoneLabel}>
              <span className={styles.dropzoneIcon}>📂</span>
              <span className={styles.dropzoneName}>
                {resumeFile ? resumeFile.name : 'Click to select a file'}
              </span>
              <span className={styles.dropzoneHint}>PDF, DOC, DOCX up to 5MB</span>
            </label>
          </div>

          {resumeFile && (
            <Button isLoading={uploading} onClick={handleResumeUpload} icon="⬆️">
              Upload Resume
            </Button>
          )}
        </Card>
      )}

      {/* ── Analytics Tab ── */}
      {tab === 'analytics' && (
        <div className={styles.analyticsWrap}>
          {analyticsLoading ? (
            <div className={styles.analyticsLoading}>Loading analytics…</div>
          ) : !analytics ? (
            <Card>
              <div className={styles.analyticsEmpty}>
                <span style={{ fontSize: '2.5rem' }}>📊</span>
                <p>No analytics data yet. Complete interviews to see your progress.</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Score over time */}
              <Card className={styles.chartCard}>
                <h2 className={styles.sectionTitle}>Score Progress Over Time</h2>
                {analytics.scoreOverTime?.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={[...analytics.scoreOverTime].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => formatDate(d, { month: 'short', day: 'numeric' })}
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontFamily: 'var(--font-family)',
                          fontSize: '13px',
                        }}
                        formatter={(v, n) => [`${v}%`, 'Score']}
                        labelFormatter={(d) => formatDate(d)}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        dot={{ fill: 'var(--primary)', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.noDataMsg}>Complete at least 2 interviews to see your score trend.</p>
                )}
              </Card>

              <div className={styles.analyticsTwoCol}>
                {/* Avg by type */}
                <Card>
                  <h2 className={styles.sectionTitle}>Score by Interview Type</h2>
                  <div className={styles.typeScores}>
                    {Object.entries(analytics.avgByType || {}).map(([type, avg]) => (
                      <div key={type} className={styles.typeScoreItem}>
                        <div className={styles.typeScoreRow}>
                          <span
                            className={styles.typeScoreLabel}
                            style={{ color: getTypeColor(type) }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                          <span className={styles.typeScoreVal}>{avg}%</span>
                        </div>
                        <ProgressBar value={avg} color={getTypeColor(type)} height={6} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Overall summary */}
                <Card>
                  <h2 className={styles.sectionTitle}>Summary</h2>
                  <div className={styles.overallRow}>
                    <ScoreRing score={stats.averageScore || 0} size={110} strokeWidth={10} />
                    <div className={styles.overallStats}>
                      {[
                        { label: 'Total Sessions', value: stats.totalInterviews || 0 },
                        { label: 'Best Score', value: `${stats.bestScore || 0}%` },
                        { label: 'HR', value: stats.interviewsByType?.hr || 0 },
                        { label: 'Technical', value: stats.interviewsByType?.technical || 0 },
                        { label: 'Behavioral', value: stats.interviewsByType?.behavioral || 0 },
                      ].map((s, i) => (
                        <div key={i} className={styles.overallStat}>
                          <span className={styles.overallStatVal}>{s.value}</span>
                          <span className={styles.overallStatLbl}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
