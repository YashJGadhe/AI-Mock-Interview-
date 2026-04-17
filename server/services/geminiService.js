/**
 * Google Gemini AI Service
 * Drop-in replacement for openaiService.js
 * Free tier: 15 requests/min, 1500 requests/day
 * No credit card required
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Call Gemini API with a prompt
 */
const callGemini = async (prompt) => {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini API error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

/**
 * Generate interview questions
 */
const generateQuestions = async (jobRole, interviewType, difficulty, count = 5) => {
  const typeDescriptions = {
    hr: 'HR/General questions about work style, culture fit, and soft skills',
    technical: 'Technical questions about skills, coding, and domain knowledge',
    behavioral: 'Behavioral STAR-method questions about past experiences',
  };

  const difficultyMap = {
    easy: 'beginner-friendly, straightforward',
    medium: 'intermediate level requiring some experience',
    hard: 'advanced, senior-level, challenging',
  };

  const prompt = `You are an expert recruiter. Generate exactly ${count} ${difficultyMap[difficulty]} ${typeDescriptions[interviewType]} for a ${jobRole} position.

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "text": "The interview question here",
    "category": "subcategory",
    "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
  }
]`;

  try {
    const content = await callGemini(prompt);
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('⚠️  Gemini question generation failed, using fallback:', err.message);
    return generateFallbackQuestions(jobRole, interviewType, count);
  }
};

/**
 * Generate AI feedback for completed answers
 */
const generateFeedback = async (jobRole, interviewType, difficulty, answers) => {
  const validAnswers = answers.filter((a) => a.answerText && a.answerText.trim().length > 10);

  if (validAnswers.length === 0) {
    return generateEmptyFeedback();
  }

  const answersText = validAnswers
    .map((a, i) => `Q${i + 1}: ${a.questionText}\nAnswer: ${a.answerText}`)
    .join('\n\n---\n\n');

  const prompt = `You are an expert interview coach. Analyze these ${interviewType} interview answers for a ${jobRole} position (${difficulty} difficulty).

ANSWERS:
${answersText}

Return ONLY valid JSON, no markdown:
{
  "overallScore": <integer 0-100>,
  "grade": <"A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F">,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "perAnswerFeedback": [
    {
      "questionText": "<question>",
      "answerText": "<brief summary>",
      "score": <0-100>,
      "comment": "<specific feedback>"
    }
  ]
}`;

  try {
    const content = await callGemini(prompt);
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('⚠️  Gemini feedback generation failed, using fallback:', err.message);
    return generateCalculatedFeedback(validAnswers);
  }
};

// ── Fallbacks ────────────────────────────────────────────────────

const generateFallbackQuestions = (jobRole, type, count) => {
  const base = {
    hr: [
      { text: 'Tell me about yourself and your career journey.', category: 'Introduction' },
      { text: 'Why are you interested in this position?', category: 'Motivation' },
      { text: 'Where do you see yourself in 5 years?', category: 'Career Goals' },
      { text: 'What is your greatest strength?', category: 'Self-Assessment' },
      { text: 'How do you handle pressure and tight deadlines?', category: 'Work Style' },
    ],
    technical: [
      { text: `What are the core technical skills required for a ${jobRole}?`, category: 'Core Skills' },
      { text: 'Describe a complex technical problem you solved recently.', category: 'Problem Solving' },
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
  return (base[type] || base.hr).slice(0, count).map((q) => ({
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
  suggestions: ['Complete the interview by answering all questions'],
  perAnswerFeedback: [],
});

const generateCalculatedFeedback = (answers) => {
  const score = Math.min(answers.length * 15 + 20, 75);
  return {
    overallScore: score,
    grade: score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C',
    summary: `You answered ${answers.length} question(s). Connect Gemini API for detailed AI feedback.`,
    strengths: ['Completed the interview', 'Provided written responses'],
    weaknesses: ['Detailed analysis requires Gemini API key'],
    suggestions: ['Add GEMINI_API_KEY to .env for full AI feedback', 'Practice regularly'],
    perAnswerFeedback: answers.map((a) => ({
      questionText: a.questionText,
      answerText: a.answerText?.slice(0, 100),
      score: 60,
      comment: 'Basic feedback only. Add Gemini API key for detailed analysis.',
    })),
  };
};

module.exports = { generateQuestions, generateFeedback };
