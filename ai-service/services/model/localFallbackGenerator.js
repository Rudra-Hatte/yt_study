function splitKeywords(title = '') {
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'about', 'part', 'video', 'tutorial']);
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w))
    .slice(0, 8);
}

function pickDifficulty(title = '') {
  const t = String(title).toLowerCase();
  if (t.includes('advanced') || t.includes('deep dive')) return 'advanced';
  if (t.includes('intermediate')) return 'intermediate';
  return 'beginner';
}

function buildFallbackQuiz(videoId, title, numQuestions = 10, difficulty = 'medium', focusTopic = null) {
  const topic = String(focusTopic || '').trim() || title || `Video ${videoId}`;
  const keywords = splitKeywords(topic);
  const skill = keywords[0] || 'core concept';
  const items = [];

  for (let i = 0; i < Math.max(3, Number(numQuestions) || 10); i += 1) {
    const k = keywords[i % Math.max(1, keywords.length)] || skill;
    items.push({
      question: `Which statement best explains ${k} in the context of ${topic}?`,
      options: [
        `${k} is used only for styling and has no logic impact.`,
        `${k} helps structure the solution and improves maintainability when applied correctly.`,
        `${k} replaces all other programming concepts automatically.`,
        `${k} is unrelated to building practical projects.`
      ],
      correctAnswer: 1,
      explanation: `${k} is typically important for building reliable and maintainable solutions in practical workflows.`
    });
  }

  return {
    questions: items,
    rag: { used: false, fallback: true, mode: 'local-heuristic' },
    metadata: {
      source: 'local-fallback',
      topic,
      difficulty
    }
  };
}

function buildFallbackFlashcards(videoId, title, numCards = 10, focusTopic = null) {
  const topic = String(focusTopic || '').trim() || title || `Video ${videoId}`;
  const keywords = splitKeywords(topic);
  const cards = [];
  const count = Math.max(5, Number(numCards) || 10);

  for (let i = 0; i < count; i += 1) {
    const k = keywords[i % Math.max(1, keywords.length)] || 'core concept';
    cards.push({
      front: `What is ${k} and why does it matter in ${topic}?`,
      back: `${k} is a key idea in ${topic}. Focus on definition, when to use it, common mistakes, and one practical example.`,
      tags: [k, 'fundamentals', 'practice']
    });
  }

  return {
    flashcards: cards,
    rag: { used: false, fallback: true, mode: 'local-heuristic' },
    metadata: {
      source: 'local-fallback',
      topic
    }
  };
}

function buildFallbackSummary(videoId, title, format = 'detailed') {
  const topic = title || `Video ${videoId}`;
  const keywords = splitKeywords(topic);
  const level = pickDifficulty(topic);

  const summaryText = format === 'brief'
    ? `${topic} introduces essential concepts and practical usage patterns. Focus on core ideas, apply them in small exercises, and review mistakes to strengthen understanding.`
    : `${topic} covers key ideas, practical implementation patterns, and common pitfalls. A good learning path is to understand the fundamentals first, then practice with small hands-on tasks, and finally apply the concepts in a mini-project. Track what each concept solves, when to use it, and how it interacts with related tools.`;

  return {
    summary: summaryText,
    mainConcepts: keywords.slice(0, 6),
    keyPoints: [
      'Understand the core concept and its purpose.',
      'Learn practical usage through examples.',
      'Identify common mistakes and how to avoid them.',
      'Apply learning in a small project task.'
    ],
    keywords: keywords.slice(0, 8),
    practicalApplications: [
      `Build a small ${keywords[0] || 'concept'} demo`,
      `Refactor an existing snippet using ${keywords[1] || 'best practices'}`
    ],
    nextSteps: [
      'Review notes and summarize each concept in your own words.',
      'Solve 2-3 practical exercises using the covered concepts.',
      'Build one mini-project to consolidate understanding.'
    ],
    difficulty: level,
    rag: { used: false, fallback: true, mode: 'local-heuristic' },
    metadata: {
      source: 'local-fallback',
      topic
    }
  };
}

module.exports = {
  buildFallbackQuiz,
  buildFallbackFlashcards,
  buildFallbackSummary
};
