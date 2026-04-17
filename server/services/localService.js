/**
 * No-API Interview Service
 * Works 100% offline with a built-in question bank.
 * No API key needed. Basic scoring via keyword analysis.
 */

// ── Question Bank ────────────────────────────────────────────────

const QUESTION_BANK = {
  hr: {
    easy: [
      { text: 'Tell me about yourself and your professional background.', category: 'Introduction', expectedKeyPoints: ['Current role', 'Relevant experience', 'Career goals'] },
      { text: 'Why are you interested in this position?', category: 'Motivation', expectedKeyPoints: ['Company research', 'Role alignment', 'Growth opportunity'] },
      { text: 'What are your greatest strengths?', category: 'Self-Assessment', expectedKeyPoints: ['Specific strength', 'Evidence/example', 'Relevance to role'] },
      { text: 'Where do you see yourself in 5 years?', category: 'Career Goals', expectedKeyPoints: ['Realistic goals', 'Growth mindset', 'Alignment with company'] },
      { text: 'Why are you leaving your current job?', category: 'Motivation', expectedKeyPoints: ['Positive framing', 'Growth focus', 'No negativity'] },
    ],
    medium: [
      { text: 'Describe your ideal work environment.', category: 'Culture Fit', expectedKeyPoints: ['Team collaboration', 'Communication style', 'Work-life balance'] },
      { text: 'How do you handle constructive criticism?', category: 'Self-Awareness', expectedKeyPoints: ['Open mindset', 'Example of improvement', 'Positive attitude'] },
      { text: 'What motivates you in your work?', category: 'Motivation', expectedKeyPoints: ['Intrinsic motivation', 'Achievement focus', 'Passion alignment'] },
      { text: 'How do you prioritize tasks when you have multiple deadlines?', category: 'Organization', expectedKeyPoints: ['Prioritization method', 'Communication', 'Stress management'] },
      { text: 'Tell me about a time you worked with a difficult colleague.', category: 'Interpersonal', expectedKeyPoints: ['Empathy shown', 'Steps taken', 'Positive resolution'] },
    ],
    hard: [
      { text: 'Describe a time you disagreed with your manager. How did you handle it?', category: 'Leadership', expectedKeyPoints: ['Professional approach', 'Data-driven argument', 'Respectful resolution'] },
      { text: 'How do you influence people who do not report to you?', category: 'Influence', expectedKeyPoints: ['Relationship building', 'Persuasion techniques', 'Concrete example'] },
      { text: 'Tell me about a time you had to make an unpopular decision.', category: 'Decision Making', expectedKeyPoints: ['Context given', 'Reasoning explained', 'Outcome and learnings'] },
    ],
  },

  technical: {
    easy: [
      { text: 'What programming languages are you most comfortable with and why?', category: 'Core Skills', expectedKeyPoints: ['Language proficiency', 'Use cases', 'Learning attitude'] },
      { text: 'Explain the difference between frontend and backend development.', category: 'Fundamentals', expectedKeyPoints: ['Client vs server', 'Technologies', 'Communication via API'] },
      { text: 'What is version control and why is it important?', category: 'Tools', expectedKeyPoints: ['Git basics', 'Collaboration benefits', 'History tracking'] },
      { text: 'What is the difference between SQL and NoSQL databases?', category: 'Databases', expectedKeyPoints: ['Structured vs unstructured', 'Use cases', 'Scalability'] },
      { text: 'What is an API and how does it work?', category: 'APIs', expectedKeyPoints: ['Definition', 'Request/response cycle', 'REST example'] },
    ],
    medium: [
      { text: 'Explain RESTful API design principles.', category: 'APIs', expectedKeyPoints: ['HTTP methods', 'Statelessness', 'Resource naming'] },
      { text: 'What is the difference between authentication and authorization?', category: 'Security', expectedKeyPoints: ['Identity vs permissions', 'JWT/OAuth examples', 'Real-world use'] },
      { text: 'Describe your approach to debugging a production issue.', category: 'Problem Solving', expectedKeyPoints: ['Systematic approach', 'Logging/monitoring', 'Communication'] },
      { text: 'What are the SOLID principles in software design?', category: 'Architecture', expectedKeyPoints: ['Each principle explained', 'Why they matter', 'Example applied'] },
      { text: 'Explain the concept of caching and when you would use it.', category: 'Performance', expectedKeyPoints: ['What is caching', 'Cache invalidation', 'Redis/CDN examples'] },
    ],
    hard: [
      { text: 'Design a URL shortener service like bit.ly. Walk me through your approach.', category: 'System Design', expectedKeyPoints: ['Scale estimation', 'Database design', 'Hashing algorithm', 'Caching'] },
      { text: 'How would you design a rate limiting system for an API?', category: 'System Design', expectedKeyPoints: ['Algorithms (token bucket)', 'Distributed approach', 'Storage strategy'] },
      { text: 'Explain CAP theorem and how it applies to distributed systems.', category: 'Distributed Systems', expectedKeyPoints: ['Consistency, Availability, Partition tolerance', 'Trade-offs', 'Real examples'] },
      { text: 'How do you approach performance optimization in a slow web application?', category: 'Performance', expectedKeyPoints: ['Profiling first', 'Frontend vs backend', 'Caching, CDN, DB indexes'] },
    ],
  },

  behavioral: {
    easy: [
      { text: 'Tell me about a time you successfully completed a project under a tight deadline.', category: 'Time Management', expectedKeyPoints: ['Context', 'Actions taken', 'Result achieved'] },
      { text: 'Describe a situation where you had to learn something new quickly.', category: 'Learning Agility', expectedKeyPoints: ['Urgency shown', 'Learning method', 'Successful outcome'] },
      { text: 'Give an example of when you received feedback and how you responded.', category: 'Growth Mindset', expectedKeyPoints: ['Specific feedback', 'Action taken', 'Improvement shown'] },
    ],
    medium: [
      { text: 'Tell me about a time you failed. What did you learn from it?', category: 'Failure & Learning', expectedKeyPoints: ['Honest failure described', 'Personal accountability', 'Concrete lesson learned'] },
      { text: 'Describe a time you had to work with a team to solve a complex problem.', category: 'Collaboration', expectedKeyPoints: ['Your specific role', 'Collaboration shown', 'Successful outcome'] },
      { text: 'Tell me about a time you had to persuade others to see your point of view.', category: 'Influence', expectedKeyPoints: ['Situation context', 'Persuasion approach', 'Outcome'] },
      { text: 'Give an example of a time you proactively identified and solved a problem.', category: 'Initiative', expectedKeyPoints: ['Problem spotted proactively', 'Action without being asked', 'Impact created'] },
    ],
    hard: [
      { text: 'Describe a time you had to deliver difficult news to a stakeholder or team.', category: 'Communication', expectedKeyPoints: ['Empathy shown', 'Clear communication', 'Constructive framing'] },
      { text: 'Tell me about a time you had to manage conflict within your team.', category: 'Conflict Resolution', expectedKeyPoints: ['Root cause identified', 'Fair mediation', 'Resolution achieved'] },
      { text: 'Describe a situation where you had to make a critical decision with incomplete information.', category: 'Decision Making', expectedKeyPoints: ['Risk assessed', 'Decision framework used', 'Outcome and reflection'] },
    ],
  },
};

// ── Keyword scoring dictionary ───────────────────────────────────

const POSITIVE_KEYWORDS = [
  'example', 'specifically', 'result', 'outcome', 'achieved', 'improved',
  'increased', 'reduced', 'implemented', 'led', 'managed', 'collaborated',
  'learned', 'solved', 'resolved', 'successful', 'team', 'communicated',
  'analyzed', 'delivered', 'measured', 'percent', '%', 'project', 'impact',
  'challenge', 'overcame', 'solution', 'approach', 'strategy', 'process',
];

const NEGATIVE_KEYWORDS = [
  'i don\'t know', 'never done', 'not sure', 'can\'t think', 'no experience',
  'i guess', 'maybe', 'probably not', 'i forget',
];

// ── Generate Questions ────────────────────────────────────────────

const generateQuestions = async (jobRole, interviewType, difficulty, count = 5) => {
  const bank = QUESTION_BANK[interviewType]?.[difficulty] || QUESTION_BANK[interviewType]?.medium || [];

  // Shuffle and pick `count` questions
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we need more questions than the bank has, cycle through with slight variations
  while (selected.length < count) {
    const extra = bank[selected.length % bank.length];
    selected.push({ ...extra, text: extra.text }); // could customize further
  }

  console.log(`✅ Generated ${selected.length} ${interviewType}/${difficulty} questions from local bank`);
  return selected.slice(0, count);
};

// ── Generate Feedback ─────────────────────────────────────────────

const generateFeedback = async (jobRole, interviewType, difficulty, answers) => {
  const validAnswers = answers.filter((a) => a.answerText && a.answerText.trim().length > 10);

  if (validAnswers.length === 0) {
    return {
      overallScore: 0,
      grade: 'F',
      summary: 'No answers were submitted for this interview.',
      strengths: [],
      weaknesses: ['No answers provided'],
      suggestions: ['Answer all questions to receive feedback'],
      perAnswerFeedback: [],
    };
  }

  // Score each answer by keyword analysis
  const perAnswerFeedback = validAnswers.map((a) => {
    const text = a.answerText.toLowerCase();
    const wordCount = a.answerText.trim().split(/\s+/).length;

    let score = 40; // base score

    // Length bonus (ideal: 80–300 words)
    if (wordCount >= 50 && wordCount <= 400) score += 15;
    else if (wordCount >= 20) score += 7;

    // Positive keyword hits
    const positiveHits = POSITIVE_KEYWORDS.filter((kw) => text.includes(kw)).length;
    score += Math.min(positiveHits * 4, 30);

    // Negative keyword penalty
    const negativeHits = NEGATIVE_KEYWORDS.filter((kw) => text.includes(kw)).length;
    score -= negativeHits * 8;

    // STAR method bonus (behavioral)
    if (interviewType === 'behavioral') {
      const hasSituation = /situation|context|when i|there was/i.test(text);
      const hasAction = /i did|i took|i decided|my approach|i implemented/i.test(text);
      const hasResult = /result|outcome|achieved|improved|led to|because of/i.test(text);
      if (hasSituation) score += 5;
      if (hasAction) score += 5;
      if (hasResult) score += 5;
    }

    score = Math.max(10, Math.min(100, score));

    const comment = generatePerAnswerComment(score, wordCount, positiveHits, interviewType);

    return {
      questionText: a.questionText,
      answerText: a.answerText.slice(0, 120) + (a.answerText.length > 120 ? '…' : ''),
      score,
      comment,
    };
  });

  // Overall score = weighted average
  const avgScore = Math.round(
    perAnswerFeedback.reduce((sum, a) => sum + a.score, 0) / perAnswerFeedback.length
  );

  const grade = avgScore >= 90 ? 'A+' : avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B+' :
                avgScore >= 60 ? 'B' : avgScore >= 50 ? 'C+' : avgScore >= 40 ? 'C' : 'D';

  const { strengths, weaknesses, suggestions } = generateSwS(validAnswers, avgScore, interviewType);

  return {
    overallScore: avgScore,
    grade,
    summary: generateSummary(avgScore, validAnswers.length, jobRole),
    strengths,
    weaknesses,
    suggestions,
    perAnswerFeedback,
  };
};

// ── Helper generators ─────────────────────────────────────────────

const generatePerAnswerComment = (score, wordCount, keywordHits, type) => {
  if (score >= 80) return 'Excellent answer — well-structured with clear examples and strong detail.';
  if (score >= 65) return 'Good answer. You covered the main points. Consider adding more specific measurable results.';
  if (score >= 50) {
    if (wordCount < 30) return 'Answer was too brief. Expand with context, specific actions, and outcomes.';
    if (keywordHits < 2) return 'Try to include concrete examples and measurable outcomes to strengthen your answer.';
    return 'Decent answer, but could benefit from a clearer structure (e.g. STAR method for behavioral questions).';
  }
  return 'This answer needs more depth. Use specific examples and quantify your impact where possible.';
};

const generateSummary = (score, count, jobRole) => {
  if (score >= 80) return `Strong performance across ${count} questions for the ${jobRole} role. You demonstrated clear communication and well-structured answers with relevant examples.`;
  if (score >= 65) return `Solid effort on ${count} questions for the ${jobRole} role. Your answers show good foundational knowledge. Focus on adding more specific examples and measurable outcomes.`;
  if (score >= 50) return `You completed ${count} questions for the ${jobRole} role with room for improvement. Work on structuring answers using the STAR method and including specific, quantifiable examples.`;
  return `You attempted ${count} questions. To improve significantly, practice answering with detailed examples, clear structure, and measurable results.`;
};

const generateSwS = (answers, score, type) => {
  const allText = answers.map((a) => a.answerText).join(' ').toLowerCase();
  const avgWords = Math.round(
    answers.reduce((sum, a) => sum + a.answerText.split(/\s+/).length, 0) / answers.length
  );

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  // Strengths
  if (score >= 70) strengths.push('Good overall communication and answer quality');
  if (avgWords >= 80) strengths.push('Detailed responses that provide sufficient context');
  if (/example|specifically|instance/i.test(allText)) strengths.push('Used specific examples to support answers');
  if (/result|outcome|achieved|improved/i.test(allText)) strengths.push('Referenced outcomes and results effectively');
  if (type === 'behavioral' && /team|collaborated|together/i.test(allText)) strengths.push('Demonstrated teamwork and collaboration');
  if (strengths.length === 0) strengths.push('Completed all interview questions');

  // Weaknesses
  if (avgWords < 40) weaknesses.push('Answers were too brief — interviewers want more detail');
  if (!/result|outcome|achieved|improved|percent|%/i.test(allText)) weaknesses.push('Lacked quantifiable results and measurable impact');
  if (type === 'behavioral' && !/when i|situation|context/i.test(allText)) weaknesses.push('Behavioral answers lacked situational context (STAR method)');
  if (score < 60) weaknesses.push('Answers need more structure and specificity');
  if (weaknesses.length === 0) weaknesses.push('Minor improvements possible in answer depth and precision');

  // Suggestions
  suggestions.push('Use the STAR method for all behavioral questions: Situation → Task → Action → Result');
  if (avgWords < 80) suggestions.push('Aim for 100–200 words per answer — enough detail without rambling');
  suggestions.push('Quantify your impact wherever possible (e.g. "improved performance by 30%")');
  if (type === 'technical') suggestions.push('Back up technical claims with specific tools, languages, or frameworks you used');
  suggestions.push('Research common questions for your target role and practice out loud');

  return { strengths, weaknesses, suggestions };
};

module.exports = { generateQuestions, generateFeedback };
