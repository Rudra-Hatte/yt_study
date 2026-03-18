const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true, index: true },
    videoTitle: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    source: { type: String, default: 'transcript' },
    tokenCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    metadata: {
      channelTitle: String,
      publishedAt: String,
      language: String
    }
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ videoId: 1, chunkIndex: 1 }, { unique: true });
knowledgeChunkSchema.index({ videoTitle: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);