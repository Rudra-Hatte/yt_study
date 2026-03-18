const { chatWithFallback } = require('../modelClient');

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

async function generateQuizFromLink(videoId, title, numQuestions = 10, difficulty = 'medium') {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const userPrompt = `Generate ${numQuestions} ${difficulty} MCQ questions from this video context.\nTitle: ${title}\nURL: ${videoUrl}\nReturn JSON only:\n{"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an educational assessment generator. Return strict JSON only.',
    userPrompt,
    temperature: 0.5,
    maxTokens: 1800
  });

  return normalizeQuiz(extractJson(response.text));
}

async function generateFlashcardsFromLink(videoId, title, numCards = 10) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const userPrompt = `Generate ${numCards} learning flashcards from this video context.\nTitle: ${title}\nURL: ${videoUrl}\nReturn JSON only:\n{"flashcards":[{"front":"...","back":"...","tags":["tag1","tag2"]}]}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an educational flashcard generator. Return strict JSON only.',
    userPrompt,
    temperature: 0.55,
    maxTokens: 1800
  });

  return normalizeFlashcards(extractJson(response.text));
}

async function generateSummaryFromLink(videoId, title, format = 'detailed') {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const userPrompt = `Generate a ${format} study summary from this video context.\nTitle: ${title}\nURL: ${videoUrl}\nReturn JSON only:\n{"summary":"...","mainConcepts":["..."],"keyPoints":["..."],"keywords":["..."],"practicalApplications":["..."],"nextSteps":["..."],"difficulty":"beginner|intermediate|advanced"}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are an educational summarizer. Return strict JSON only.',
    userPrompt,
    temperature: 0.45,
    maxTokens: 1600
  });

  return normalizeSummary(extractJson(response.text));
}

module.exports = {
  generateQuizFromLink,
  generateFlashcardsFromLink,
  generateSummaryFromLink
};
