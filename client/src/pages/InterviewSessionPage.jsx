import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewService } from 'services/api';
import Button from 'components/ui/Button';
import { ProgressBar, Alert, Spinner } from 'components/ui/index';
import { useTimer, useVoiceRecorder } from 'hooks/index';
import { getTypeLabel } from 'utils/helpers';
import styles from './InterviewSession.module.css';

const SECONDS_PER_QUESTION = 180; // 3 minutes per question

const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [interview, setInterview] = useState(location.state?.interview || null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(!location.state?.interview);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeSpentPerQ, setTimeSpentPerQ] = useState([]);

  const { isRecording, transcript, isSupported, startRecording, stopRecording, clearTranscript } =
    useVoiceRecorder();

  // ── Timer ──────────────────────────────────────────────────────
  const handleTimeExpire = useCallback(() => {
    handleNext(true);
  }, []); // eslint-disable-line

  const timer = useTimer(SECONDS_PER_QUESTION, handleTimeExpire);

  // ── Load interview if not in state ────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await interviewService.getById(id);
        setInterview(data.interview);
        setQuestions(data.interview.questions);
      } catch {
        setError('Could not load interview session.');
      } finally {
        setLoading(false);
      }
    };
    if (!interview) {
      load();
    } else {
      setQuestions(interview.questions || []);
      setLoading(false);
    }
  }, [id]); // eslint-disable-line

  // ── Start timer when questions load ───────────────────────────
  useEffect(() => {
    if (questions.length > 0) {
      timer.reset(SECONDS_PER_QUESTION);
      timer.start();
    }
    return () => {};
  }, [questions.length]); // eslint-disable-line

  // ── Sync voice transcript into answer ─────────────────────────
  useEffect(() => {
    if (transcript) {
      setCurrentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  const recordTimeSpent = () => {
    const spent = SECONDS_PER_QUESTION - timer.seconds;
    setTimeSpentPerQ((prev) => [...prev, spent]);
    return spent;
  };

  const handleNext = useCallback((autoSkip = false) => {
    const spent = recordTimeSpent();
    timer.pause();
    stopRecording();

    const answer = {
      questionId: questions[currentIdx]?._id,
      questionText: questions[currentIdx]?.text,
      answerText: autoSkip ? '' : currentAnswer.trim(),
      timeSpent: spent,
      isSkipped: autoSkip || !currentAnswer.trim(),
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    clearTranscript();

    if (currentIdx + 1 >= questions.length) {
      submitInterview(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
      timer.reset(SECONDS_PER_QUESTION);
      timer.start();
    }
  }, [currentAnswer, currentIdx, questions, answers, timer]); // eslint-disable-line

  const submitInterview = async (finalAnswers) => {
    setSubmitting(true);
    try {
      await interviewService.submit(id, finalAnswers);
      navigate(`/feedback/${id}`);
    } catch (err) {
      setError('Failed to submit interview. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Spinner size={48} />
        <p>Loading your interview session…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingPage}>
        <Alert type="error" title="Error" message={error} />
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const question = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;
  const timerPct = (timer.seconds / SECONDS_PER_QUESTION) * 100;
  const timerColor = timer.seconds < 30 ? 'var(--danger)' : timer.seconds < 60 ? 'var(--warning)' : 'var(--secondary)';

  if (submitting) {
    return (
      <div className={styles.loadingPage}>
        <Spinner size={48} />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>
          Submitting your answers… ✨
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{interview?.jobRole}</h1>
          <div className={styles.meta}>
            <span className={styles.metaBadge}>{getTypeLabel(interview?.interviewType)}</span>
            <span className={styles.metaBadge} style={{ textTransform: 'capitalize' }}>
              {interview?.difficulty}
            </span>
          </div>
        </div>
        <button className={styles.exitBtn} onClick={() => setShowConfirm(true)}>
          ✕ Exit
        </button>
      </div>

      {/* ── Progress ── */}
      <div className={styles.progress}>
        <div className={styles.progressInfo}>
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <ProgressBar value={currentIdx} max={questions.length} color="var(--primary)" />
      </div>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.qNumber}>Q{currentIdx + 1}</div>
          <p className={styles.qText}>{question?.text}</p>
          {question?.expectedKeyPoints?.length > 0 && (
            <details className={styles.hints}>
              <summary className={styles.hintToggle}>💡 View hints</summary>
              <ul className={styles.hintList}>
                {question.expectedKeyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* Timer */}
        <div className={styles.timerRow}>
          <div className={styles.timer} style={{ color: timerColor }}>
            ⏱ {timer.formatTime()}
          </div>
          <div className={styles.timerBar}>
            <ProgressBar value={timer.seconds} max={SECONDS_PER_QUESTION} color={timerColor} height={6} />
          </div>
        </div>

        {/* Answer textarea */}
        <div className={styles.answerSection}>
          <label className={styles.answerLabel}>Your Answer</label>
          <textarea
            className={styles.textarea}
            placeholder="Type your answer here… Be clear, concise, and use examples where relevant."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={8}
          />
          <div className={styles.answerFooter}>
            <span className={styles.charCount}>{currentAnswer.length} characters</span>
            {isSupported && (
              <button
                className={`${styles.voiceBtn} ${isRecording ? styles.recording : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? '🔴 Stop Recording' : '🎙️ Voice Input'}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => handleNext(true)}
            disabled={submitting}
          >
            Skip Question
          </Button>
          <Button
            size="lg"
            onClick={() => handleNext(false)}
            disabled={!currentAnswer.trim() || submitting}
            icon={currentIdx + 1 === questions.length ? '🏁' : '→'}
            iconPosition="right"
          >
            {currentIdx + 1 === questions.length ? 'Submit Interview' : 'Next Question'}
          </Button>
        </div>
      </div>

      {/* ── Confirm Exit Modal ── */}
      {showConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalBox}>
            <h2>Exit Interview?</h2>
            <p>Your progress will be lost. Are you sure you want to exit?</p>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Continue Interview
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await interviewService.abandon(id).catch(() => {});
                  navigate('/dashboard');
                }}
              >
                Exit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSessionPage;
