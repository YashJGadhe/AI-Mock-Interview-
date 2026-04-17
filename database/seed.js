/**
 * Database Seed Script
 * Populates the database with sample resources and a demo user
 * Run: node database/seed.js (from server directory)
 */

require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Adjust path for running from server/ directory
const User = require('./models/User');
const Resource = require('./models/Resource');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mock_interview';

const sampleResources = [
  // ── Tips ────────────────────────────────────────────────────────
  {
    title: 'The STAR Method for Behavioral Questions',
    description: 'Master the Situation, Task, Action, Result framework for compelling answers.',
    type: 'tip',
    category: 'behavioral',
    difficulty: 'all',
    content:
      'STAR stands for Situation, Task, Action, and Result. When answering behavioral questions:\n\n1. **Situation**: Set the scene and give context\n2. **Task**: Describe your responsibility\n3. **Action**: Explain the specific steps you took\n4. **Result**: Share the outcome with measurable impact\n\nAlways quantify results when possible. "I improved team velocity by 30%" is far stronger than "I helped the team."',
    tags: ['behavioral', 'framework', 'beginner'],
    isFeatured: true,
    order: 1,
  },
  {
    title: 'Research the Company Thoroughly',
    description: 'Know the company\'s mission, products, culture, and recent news before your interview.',
    type: 'tip',
    category: 'general',
    difficulty: 'all',
    content:
      'Before any interview:\n- Read the company\'s About page and mission statement\n- Review recent press releases and news articles\n- Understand their main products/services and target customers\n- Research the company culture on Glassdoor\n- Prepare questions that show you\'ve done your homework\n\nInterviewers appreciate candidates who show genuine interest in the company.',
    tags: ['preparation', 'research', 'general'],
    isFeatured: true,
    order: 2,
  },
  {
    title: 'Answering "Tell Me About Yourself"',
    description: 'Craft a compelling 2-minute professional narrative that sets the tone.',
    type: 'tip',
    category: 'hr',
    difficulty: 'easy',
    content:
      'Structure your answer as a 3-part story:\n1. **Present** – Your current role and key responsibilities\n2. **Past** – Relevant background that led you here\n3. **Future** – Why you\'re excited about this opportunity\n\nKeep it professional (not personal), under 2 minutes, and practice it until natural.',
    tags: ['hr', 'introduction', 'first-impression'],
    isFeatured: false,
    order: 3,
  },
  {
    title: 'Technical Interview Preparation Checklist',
    description: 'A comprehensive checklist to ace your technical interviews.',
    type: 'guide',
    category: 'technical',
    difficulty: 'medium',
    content:
      '**Data Structures**: Arrays, Linked Lists, Trees, Graphs, Hash Tables\n**Algorithms**: Sorting, Searching, Dynamic Programming, Recursion\n**System Design**: Scalability, Load Balancing, Caching, Databases\n**Language-Specific**: Know your chosen language\'s nuances\n**Coding Practice**: LeetCode Easy (master), Medium (comfortable), Hard (exposed)\n**Mock Interviews**: Practice explaining your thought process aloud',
    tags: ['technical', 'coding', 'checklist'],
    isFeatured: true,
    order: 4,
  },
  {
    title: 'Salary Negotiation Tactics',
    description: 'Negotiate confidently and get the compensation you deserve.',
    type: 'tip',
    category: 'salary',
    difficulty: 'medium',
    content:
      'Golden rules of salary negotiation:\n- Always negotiate — most offers have room\n- Let them give a number first when possible\n- Research market rates on Levels.fyi, Glassdoor, and LinkedIn\n- Negotiate the whole package: base, equity, bonus, benefits\n- Never give a single number; give a range with your target at the low end\n- Get every offer in writing',
    tags: ['salary', 'negotiation', 'offer'],
    isFeatured: false,
    order: 5,
  },

  // ── Questions ────────────────────────────────────────────────────
  {
    title: 'Where do you see yourself in 5 years?',
    description: 'A classic question about career vision and goal-setting.',
    type: 'question',
    category: 'hr',
    difficulty: 'easy',
    content:
      'This question tests alignment between your goals and the company\'s growth path.\n\n**Good Answer Framework:**\n- Show ambition but stay realistic\n- Connect your goals to the role\n- Emphasize growth within the company\n- Avoid overly specific titles\n\n**Sample Answer:** "In five years, I see myself having grown significantly in [domain], taking on more leadership responsibility, and contributing to meaningful projects. I\'m particularly excited about opportunities to develop [specific skill] at your company."',
    tags: ['hr', 'career-goals', 'classic'],
    isFeatured: false,
    order: 6,
  },
  {
    title: 'Explain a complex technical concept simply',
    description: 'Tests communication skills and depth of understanding.',
    type: 'question',
    category: 'technical',
    difficulty: 'medium',
    content:
      'Common subjects: REST vs GraphQL, SQL vs NoSQL, microservices, Docker, etc.\n\n**How to Answer:**\n1. Use an analogy from everyday life\n2. Start with the simplest possible explanation\n3. Add complexity only if the interviewer asks for more depth\n4. Check for understanding as you go\n\nThis tests both technical knowledge AND communication — a crucial engineering skill.',
    tags: ['technical', 'communication', 'concepts'],
    isFeatured: false,
    order: 7,
  },
  {
    title: 'Tell me about a time you failed',
    description: 'Classic behavioral question testing self-awareness and growth mindset.',
    type: 'question',
    category: 'behavioral',
    difficulty: 'medium',
    content:
      'Interviewers want to see honesty, accountability, and a learning mindset.\n\n**What NOT to do:**\n- Don\'t say you\'ve never failed\n- Don\'t blame others entirely\n- Don\'t choose a trivial example\n\n**Great Structure:**\n1. Describe a real, meaningful failure\n2. Take ownership (use "I", not "we" or "they")\n3. Explain what you learned specifically\n4. Show how you applied that lesson afterward',
    tags: ['behavioral', 'failure', 'growth-mindset'],
    isFeatured: true,
    order: 8,
  },

  // ── Videos ────────────────────────────────────────────────────────
  {
    title: 'Mock Interview: Software Engineer at Google',
    description: 'Watch a full technical interview simulation with expert commentary.',
    type: 'video',
    category: 'technical',
    difficulty: 'hard',
    url: 'https://www.youtube.com/watch?v=mock1',
    content: 'A complete mock technical interview covering data structures, algorithms, and system design with detailed feedback.',
    tags: ['google', 'technical', 'mock'],
    isFeatured: true,
    order: 9,
  },
  {
    title: 'How to Answer Behavioral Questions Like a Pro',
    description: 'Expert guide to mastering the STAR method in under 20 minutes.',
    type: 'video',
    category: 'behavioral',
    difficulty: 'easy',
    url: 'https://www.youtube.com/watch?v=mock2',
    content: 'Step-by-step tutorial on crafting compelling behavioral answers using the STAR framework.',
    tags: ['behavioral', 'star-method', 'tutorial'],
    isFeatured: false,
    order: 10,
  },
  {
    title: 'Salary Negotiation Master Class',
    description: 'Learn from a hiring manager how to negotiate your best offer.',
    type: 'video',
    category: 'salary',
    difficulty: 'medium',
    url: 'https://www.youtube.com/watch?v=mock3',
    content: 'Real tactics from a hiring manager\'s perspective on what works in salary negotiations.',
    tags: ['salary', 'negotiation', 'compensation'],
    isFeatured: false,
    order: 11,
  },

  // ── Articles ──────────────────────────────────────────────────────
  {
    title: '10 Questions to Ask Your Interviewer',
    description: 'Make a lasting impression by asking thoughtful, strategic questions.',
    type: 'article',
    category: 'general',
    difficulty: 'all',
    content:
      '1. What does success look like in this role after 6 months?\n2. What are the biggest challenges the team is currently facing?\n3. How would you describe the engineering culture here?\n4. What growth opportunities exist for this role?\n5. How are decisions made on your team?\n6. What do you enjoy most about working here?\n7. What does a typical day look like?\n8. What are the next steps in the interview process?\n9. How is performance evaluated?\n10. Is there anything about my background I can clarify?',
    tags: ['questions', 'preparation', 'general'],
    isFeatured: true,
    order: 12,
  },
  {
    title: 'Remote Interview Best Practices',
    description: 'Set yourself up for success in virtual interviews.',
    type: 'article',
    category: 'general',
    difficulty: 'easy',
    content:
      '**Technical Setup:**\n- Test camera, microphone, and lighting 30 minutes before\n- Use a wired internet connection if possible\n- Have a clean, professional background\n- Close unnecessary applications\n\n**During the Interview:**\n- Look at the camera, not the screen\n- Speak clearly and pause occasionally\n- Have a glass of water nearby\n- Keep notes off-screen but accessible',
    tags: ['remote', 'virtual', 'setup'],
    isFeatured: false,
    order: 13,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Resource.deleteMany({});
    console.log('🗑️  Cleared existing resources');

    // Insert resources
    await Resource.insertMany(sampleResources);
    console.log(`✅ Inserted ${sampleResources.length} resources`);

    // Create demo user
    await User.deleteOne({ email: 'demo@aiinterview.com' });
    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@aiinterview.com',
      password: 'demo123456',
      bio: 'Full-stack developer with 3 years of experience. Preparing for senior engineer roles.',
      jobTitle: 'Software Developer',
      targetRole: 'Senior Software Engineer',
      experience: '3-5 years',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      stats: {
        totalInterviews: 5,
        averageScore: 72,
        bestScore: 88,
        totalTime: 125,
        interviewsByType: { hr: 2, technical: 2, behavioral: 1 },
      },
    });

    console.log(`✅ Demo user created: ${demoUser.email} / demo123456`);
    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
