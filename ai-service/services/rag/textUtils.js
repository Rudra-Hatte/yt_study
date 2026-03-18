function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function unique(arr = []) {
  return [...new Set(arr)];
}

function chunkText(text, chunkSize = 1200, overlap = 200) {
  if (!text || typeof text !== 'string') return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const raw = text.slice(start, end).trim();
    if (raw.length > 40) {
      chunks.push(raw);
    }

    if (end >= text.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

function jaccardScore(aTokens = [], bTokens = []) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);

  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection += 1;
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

module.exports = {
  tokenize,
  unique,
  chunkText,
  jaccardScore
};