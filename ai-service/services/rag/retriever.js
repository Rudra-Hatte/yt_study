const KnowledgeChunk = require('../../models/KnowledgeChunk');
const { tokenize, jaccardScore } = require('./textUtils');

async function findRelevantChunks(query, options = {}) {
  const {
    limit = 6,
    minScore = 0.04,
    videoId = null
  } = options;

  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const filter = {};
  if (videoId) filter.videoId = videoId;

  let docs = [];

  try {
    docs = await KnowledgeChunk.find(
      { ...filter, $text: { $search: queryTokens.join(' ') } },
      { score: { $meta: 'textScore' }, videoId: 1, videoTitle: 1, chunkIndex: 1, content: 1, tags: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 10)
      .lean();
  } catch (error) {
    const regex = new RegExp(queryTokens.slice(0, 6).join('|'), 'i');
    docs = await KnowledgeChunk.find(
      { ...filter, content: regex },
      { videoId: 1, videoTitle: 1, chunkIndex: 1, content: 1, tags: 1 }
    )
      .limit(limit * 10)
      .lean();
  }

  const rescored = docs
    .map((doc) => {
      const contentTokens = tokenize(doc.content);
      const lexicalScore = jaccardScore(queryTokens, contentTokens);
      const textScore = typeof doc.score === 'number' ? doc.score / 20 : 0;
      const finalScore = (0.7 * lexicalScore) + (0.3 * textScore);
      return { ...doc, finalScore };
    })
    .filter((d) => d.finalScore >= minScore)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);

  return rescored;
}

module.exports = {
  findRelevantChunks
};