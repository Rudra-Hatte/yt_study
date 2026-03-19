const { chatWithFallback } = require('../modelClient');

// Extract the main technical topic from a video title
// e.g., "JavaScript Tutorial for Beginners - Learn in 15 Minutes" → "JavaScript"
function extractMainTopic(title = '') {
  const titleStr = String(title || '').trim();
  
  // Remove common non-topic suffixes
  let cleaned = titleStr
    .replace(/\s*[\|\-\–]\s*(learn|tutorial|course|crash|beginners|guide|basics|part \d+|episode \d+|#\d+|2024|2025|2026)/gi, '')
    .replace(/\s*[\(\[].*?[\)\]]/g, '') // Remove parentheses/brackets content
    .trim();

  // Extract first meaningful noun/term (usually the topic)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  if (words.length > 0) {
    return words[0]; // e.g., "JavaScript"
  }
  
  return cleaned || 'the topic covered';
}

function extractJson(text = '') {
  const trimmed = String(text || '').trim();
  const jsonMatch = trimmed.match(/```json\n?([\s\S]*?)\n?```/) || trimmed.match(/```\n?([\s\S]*?)\n?```/) || trimmed.match(/({[\s\S]*})/);
  const payload = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : trimmed;
  return JSON.parse(payload);
}

function normalizeQuiz(parsed) {
  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('Invalid quiz payload from link-only generator');
  }
  return parsed;
}

function normalizeFlashcards(parsed) {
  if (!parsed || !Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
    throw new Error('Invalid flashcards payload from link-only generator');
  }
  return parsed;
}

function normalizeSummary(parsed) {
  if (!parsed || typeof parsed.summary !== 'string' || !parsed.summary.trim()) {
    throw new Error('Invalid summary payload from link-only generator');
  }
  return {
    summary: parsed.summary,
    mainConcepts: Array.isArray(parsed.mainConcepts) ? parsed.mainConcepts : [],
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    practicalApplications: Array.isArray(parsed.practicalApplications) ? parsed.practicalApplications : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    difficulty: parsed.difficulty || 'beginner'
  };
}

async function generateQuizFromLink(videoId, title, numQuestions = 10, difficulty = 'medium', focusTopic = null) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const topic = String(focusTopic || '').trim() || extractMainTopic(title);
  
  const userPrompt = `You are generating a ${difficulty} quiz for a tutorial video about "${topic}".
Video: ${videoUrl}
Title: ${title}

Generate ${numQuestions} MCQ questions that test understanding of ${topic} concepts. Focus on:
- What ${topic} is and fundamental concepts
- Why ${topic} matters and when to use it
- Common use cases and applications
- Best practices and avoid common mistakes
- Practical examples

Do NOT ask about the title, "tutorial", "beginners", "learning", or the course name.
DO ask about the actual ${topic} topic content and skills.

Return ONLY valid JSON (no markdown, no backticks):
{"questions":[{"question":"What is...","options":["option A","option B","option C","option D"],"correctAnswer":0,"explanation":"Detailed explanation"}]}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an expert educational assessment generator. Generate concept-focused quiz questions. Return strict JSON only, no markdown.',
    userPrompt,
    temperature: 0.5,
    maxTokens: 2000
  });

  return normalizeQuiz(extractJson(response.text));
}

async function generateFlashcardsFromLink(videoId, title, numCards = 10, focusTopic = null) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const topic = String(focusTopic || '').trim() || extractMainTopic(title);
  
  const userPrompt = `Create ${numCards} learning flashcards for a tutorial about "${topic}".
Video: ${videoUrl}
Title: ${title}

Generate flashcards that teach core ${topic} concepts:
- Front: "What is X" or "Why does X matter" or "How do you use X" (conceptual questions)
- Back: Definition, explanation, when/why to use it, common use cases (detailed answer with practical example)

Examples of GOOD flashcards:
- Front: "What is ${topic}?"
  Back: "${topic} is... [definition]. It's used for... [use cases]. Example: [practical example]"
- Front: "When should you use ${topic}?"
  Back: "Use ${topic} when... [scenarios]. Common use cases include... [examples]"

Do NOT create cards about "tutorial", "beginners", "learning", or the course structure.
DO focus on actual ${topic} concepts and skills.

Return ONLY valid JSON (no markdown, no backticks):
{"flashcards":[{"front":"What is...?","back":"[Definition and practical explanation]","tags":["concept","fundamental"]}]}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an expert educational flashcard designer. Create concept-focused learning cards. Return strict JSON only, no markdown.',
    userPrompt,
    temperature: 0.55,
    maxTokens: 2000
  });

  return normalizeFlashcards(extractJson(response.text));
}

async function generateSummaryFromLink(videoId, title, format = 'detailed') {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const topic = extractMainTopic(title);
  
  const userPrompt = `Create a ${format} study summary for a tutorial about "${topic}".
Video: ${videoUrl}
Title: ${title}

Write a summary focused on ${topic} concepts and practical knowledge:
- Main concepts: Core ideas and principles of ${topic}
- Key points: Essential takeaways (5-7 important facts)
- Keywords: Core terminology in ${topic}
- Practical applications: Real-world uses and examples
- Next steps: What students should learn/build next with ${topic}

Assume the video teaches ${topic} fundamentals to beginners. Focus on:
✓ What ${topic} is and why it matters
✓ Core concepts and terminology
✓ Practical use cases and examples
✓ Best practices and when to use it

Avoid discussing: The course structure, "learning", "tutorial", or training methodology.

Return ONLY valid JSON (no markdown, no backticks):
{"summary":"[Concise overview of what ${topic} is and why it matters]","mainConcepts":["concept1","concept2",...],"keyPoints":["point1","point2",...],"keywords":["keyword1","keyword2",...],"practicalApplications":["use1","use2",...],"nextSteps":["step1","step2",...],"difficulty":"beginner"}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an expert educational summarizer. Create concept-focused, practical summaries. Return strict JSON only, no markdown.',
    userPrompt,
    temperature: 0.45,
    maxTokens: 1800
  });

  return normalizeSummary(extractJson(response.text));
}

module.exports = {
  generateQuizFromLink,
  generateFlashcardsFromLink,
  generateSummaryFromLink
};
