const KnowledgeChunk = require('../../models/KnowledgeChunk');
const { getVideoTranscript, getVideoMetadata } = require('../../utils/youtube');
const { chunkText, tokenize, unique } = require('./textUtils');
const { findRelevantChunks } = require('./retriever');
const { chatWithFallback } = require('../modelClient');

async function maybeExtractTags(title = '', transcript = '') {
  const words = tokenize(`${title} ${transcript}`)
    .filter((w) => w.length >= 4)
    .slice(0, 80);

  return unique(words).slice(0, 12);
}

async function indexVideo(videoId, videoTitle) {
  if (!videoId) {
    throw new Error('videoId is required for indexing');
  }

  const existingCount = await KnowledgeChunk.countDocuments({ videoId });
  if (existingCount > 0) {
    return { indexed: false, reason: 'already-indexed', chunks: existingCount };
  }

  const [transcript, metadata] = await Promise.all([
    getVideoTranscript(videoId),
    getVideoMetadata(videoId).catch(() => ({}))
  ]);

  if (!transcript || transcript.length < 120) {
    throw new Error('Transcript not available or too short for indexing');
  }

  const chunks = chunkText(transcript, Number(process.env.RAG_CHUNK_SIZE || 1200), Number(process.env.RAG_CHUNK_OVERLAP || 200));
  const tags = await maybeExtractTags(videoTitle || metadata.title || '', transcript);

  const docs = chunks.map((chunk, i) => ({
    videoId,
    videoTitle: videoTitle || metadata.title || 'Untitled Video',
    chunkIndex: i,
    content: chunk,
    tokenCount: tokenize(chunk).length,
    tags,
    metadata: {
      channelTitle: metadata.channelTitle,
      publishedAt: metadata.publishedAt,
      language: 'en'
    }
  }));

  if (!docs.length) {
    throw new Error('No chunks created during indexing');
  }

  await KnowledgeChunk.insertMany(docs, { ordered: false });
  return { indexed: true, chunks: docs.length };
}

async function ensureIndexed(videoId, videoTitle) {
  const count = await KnowledgeChunk.countDocuments({ videoId });
  if (count > 0) return { indexed: false, reason: 'already-indexed', chunks: count };
  return indexVideo(videoId, videoTitle);
}

function buildContext(chunks = []) {
  return chunks
    .map((c, idx) => `Context ${idx + 1} (videoId=${c.videoId}, chunk=${c.chunkIndex}):\n${c.content}`)
    .join('\n\n');
}

async function retrieveContext(query, options = {}) {
  const chunks = await findRelevantChunks(query, options);
  const context = buildContext(chunks);
  return { chunks, context };
}

async function generateWithRAG({ query, task, schemaHint, temperature = 0.6, maxTokens = 2200, videoId = null }) {
  const { chunks, context } = await retrieveContext(query, {
    limit: Number(process.env.RAG_TOP_K || 6),
    minScore: Number(process.env.RAG_MIN_SCORE || 0.04),
    videoId
  });

  const prompt = `You are an educational AI assistant. Use ONLY the provided context where possible.
Task: ${task}
User Query: ${query}

Retrieved Context:
${context || 'No external context found. Use safe assumptions and stay concise.'}

Return ONLY valid JSON. No markdown.
Expected JSON schema: ${schemaHint}`;

  const response = await chatWithFallback({
    systemPrompt: 'You are a strict JSON output assistant for educational content.',
    userPrompt: prompt,
    temperature,
    maxTokens
  });

  const text = (response.text || '{}').trim();
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/) || text.match(/({[\s\S]*})/);
  const payload = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : text;

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    parsed = { raw: text };
  }

  return {
    data: parsed,
    rag: {
      used: chunks.length > 0,
      chunkCount: chunks.length,
      chunks: chunks.map((c) => ({ videoId: c.videoId, chunkIndex: c.chunkIndex, score: Number(c.finalScore?.toFixed(4)) }))
    }
  };
}

async function getStats() {
  const [totalChunks, totalVideos] = await Promise.all([
    KnowledgeChunk.countDocuments({}),
    KnowledgeChunk.distinct('videoId').then((ids) => ids.length)
  ]);

  return {
    totalChunks,
    totalVideos,
    ragEnabled: String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false'
  };
}

module.exports = {
  indexVideo,
  ensureIndexed,
  retrieveContext,
  generateWithRAG,
  getStats
};