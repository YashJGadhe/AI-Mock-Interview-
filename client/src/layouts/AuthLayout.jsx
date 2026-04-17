import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AuthLayout = () => (
  <div className={styles.wrapper}>
    <div className={styles.left}>
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>
          <span>🎯</span>
          <span>AI <strong>Interview</strong></span>
        </Link>
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Ace Your Next<br />
          <span className={styles.heroAccent}>Job Interview</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Practice with AI-powered mock interviews, get instant feedback, and land your dream job.
        </p>
        <div className={styles.features}>
          {[
            { icon: '🤖', text: 'AI-generated questions tailored to your role' },
            { icon: '📊', text: 'Instant scoring and detailed feedback' },
            { icon: '🎯', text: 'Track progress across 3 interview types' },
            { icon: '🏆', text: 'Improve with personalized suggestions' },
          ].map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.stats}>
        {[
          { value: '10K+', label: 'Interviews Practiced' },
          { value: '95%', label: 'User Satisfaction' },
          { value: '50+', label: 'Job Roles' },
        ].map((s, i) => (
          <div key={i} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
    <div className={styles.right}>
      <div className={styles.formContainer}>
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
