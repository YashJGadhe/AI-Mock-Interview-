/**
 * OpenAI Service
 * Handles AI question generation and answer analysis
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate interview questions based on setup parameters
 * @param {string} jobRole - Target job role
 * @param {string} interviewType - hr | technical | behavioral
 * @param {string} difficulty - easy | medium | hard
 * @param {number} count - Number of questions to generate
 * @returns {Array} Array of question objects
 */
const generateQuestions = async (jobRole, interviewType, difficulty, count = 5) => {
  const typeDescriptions = {
    hr: 'HR/General questions about work style, culture fit, career goals, and soft skills',
    technical: 'Technical questions about skills, coding, system design, and domain knowledge',
    behavioral: 'Behavioral STAR-method questions about past experiences and situations',
  };

  const difficultyMap = {
    easy: 'beginner-friendly, straightforward',
    medium: 'intermediate level requiring some experience',
    hard: 'advanced, senior-level, challenging',
  };

  const prompt = `You are an expert technical recruiter. Generate exactly ${count} ${difficultyMap[difficulty]} ${typeDescriptions[interviewType]} for a ${jobRole} position.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "text": "The interview question here",
    "category": "subcategory of the question",
    "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
  }
]

Requirements:
- Questions must be specific to ${jobRole}
- Mix different aspects of the role
- Be realistic and commonly asked in real interviews
- Expected key points should be concise bullet points of what a good answer covers`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content.trim();

  // Parse JSON response safely
  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: return generic questions
    console.warn('⚠️  Failed to parse OpenAI questions, using fallback');
    return generateFallbackQuestions(jobRole, interviewType, count);
  }
};

/**
 * Generate AI feedback for completed interview answers
 * @param {string} jobRole - Target job role
 * @param {string} interviewType - Type of interview
 * @param {string} difficulty - Difficulty level
 * @param {Array} answers - Array of {questionText, answerText, timeSpent}
 * @returns {Object} Detailed feedback object
 */
const generateFeedback = async (jobRole, interviewType, difficulty, answers) => {
  // Filter out skipped/empty answers
  const validAnswers = answers.filter((a) => a.answerText && a.answerText.trim().length > 10);

  if (validAnswers.length === 0) {
    return generateEmptyFeedback();
  }

  const answersText = validAnswers
    .map(
      (a, i) => `Q${i + 1}: ${a.questionText}\nAnswer: ${a.answerText}\nTime spent: ${a.timeSpent}s`
    )
    .join('\n\n---\n\n');

  const prompt = `You are an expert interview coach. Analyze these ${interviewType} interview answers for a ${jobRole} position (${difficulty} difficulty).

INTERVIEW ANSWERS:
${answersText}

Provide a comprehensive evaluation. Return ONLY valid JSON (no markdown):
{
  "overallScore": <integer 0-100>,
  "grade": <"A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F">,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "perAnswerFeedback": [
    {
      "questionText": "<question>",
      "answerText": "<brief answer summary>",
      "score": <0-100>,
      "comment": "<specific feedback on this answer>"
    }
  ]
}

Be constructive, specific, and encouraging. Score based on: clarity, relevance, depth, examples used, and communication.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2500,
  });

  const content = response.choices[0].message.content.trim();

  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn('⚠️  Failed to parse OpenAI feedback, using calculated fallback');
    return generateCalculatedFeedback(validAnswers);
  }
};

// ── Fallback Generators ───────────────────────────────────────────

const generateFallbackQuestions = (jobRole, type, count) => {
  const baseQuestions = {
    hr: [
      { text: 'Tell me about yourself and your career journey.', category: 'Introduction' },
      { text: 'Why are you interested in this position?', category: 'Motivation' },
      { text: 'Where do you see yourself in 5 years?', category: 'Career Goals' },
      { text: 'What is your greatest strength?', category: 'Self-Assessment' },
      { text: 'How do you handle work pressure and tight deadlines?', category: 'Work Style' },
    ],
    technical: [
      { text: `What are the core technical skills required for a ${jobRole}?`, category: 'Core Skills' },
      { text: 'Describe a complex technical problem you solved.', category: 'Problem Solving' },
      { text: 'How do you stay updated with industry trends?', category: 'Learning' },
      { text: 'Explain a project you are most proud of technically.', category: 'Projects' },
      { text: 'How do you approach debugging a complex issue?', category: 'Debugging' },
    ],
    behavioral: [
      { text: 'Tell me about a time you dealt with a difficult team member.', category: 'Teamwork' },
      { text: 'Describe a situation where you failed and what you learned.', category: 'Failure' },
      { text: 'Give an example of when you went above and beyond.', category: 'Initiative' },
      { text: 'Tell me about a time you had to adapt to a major change.', category: 'Adaptability' },
      { text: 'Describe a situation where you showed leadership.', category: 'Leadership' },
    ],
  };

  return (baseQuestions[type] || baseQuestions.hr).slice(0, count).map((q) => ({
    ...q,
    expectedKeyPoints: ['Clear structure', 'Specific examples', 'Positive outcome'],
  }));
};

const generateEmptyFeedback = () => ({
  overallScore: 0,
  grade: 'F',
  summary: 'No answers were provided for this interview session.',
  strengths: [],
  weaknesses: ['No answers submitted'],
  suggestions: ['Complete the interview by answering all questions', 'Practice regularly'],
  perAnswerFeedback: [],
});

const generateCalculatedFeedback = (answers) => {
  const score = Math.min(answers.length * 15 + 20, 75);
  return {
    overallScore: score,
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C',
    summary: `You completed ${answers.length} question(s). Keep practicing to improve your scores.`,
    strengths: ['Completed the interview', 'Provided written responses'],
    weaknesses: ['Answers may need more detail', 'Consider using STAR method'],
    suggestions: ['Use the STAR method for behavioral questions', 'Practice with sample answers'],
    perAnswerFeedback: answers.map((a) => ({
      questionText: a.questionText,
      answerText: a.answerText?.slice(0, 100),
      score: 60,
      comment: 'Answer received. For best results, connect to OpenAI for detailed analysis.',
    })),
  };
};

module.exports = { generateQuestions, generateFeedback };
