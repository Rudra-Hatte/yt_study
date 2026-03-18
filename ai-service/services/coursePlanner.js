const { searchYouTubeVideos, getVideoMetadata } = require('../utils/youtube');
const { chatWithFallback } = require('./modelClient');

function toTokens(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function jaccard(a = [], b = []) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const t of sa) {
    if (sb.has(t)) inter += 1;
  }
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function parseDurationToMinutes(duration = '') {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 12;
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  const total = h * 60 + m + Math.round(s / 60);
  return total > 0 ? total : 12;
}

function parseBudget(duration = '4-6 hours') {
  const normalized = String(duration).toLowerCase();
  const range = normalized.match(/(\d+)\s*-\s*(\d+)\s*hours?/);
  if (range) {
    return { minMinutes: Number(range[1]) * 60, maxMinutes: Number(range[2]) * 60 };
  }

  const single = normalized.match(/(\d+)\s*hours?/);
  if (single) {
    const mins = Number(single[1]) * 60;
    return { minMinutes: Math.max(60, mins - 30), maxMinutes: mins };
  }

  return { minMinutes: 240, maxMinutes: 360 };
}

function getTopicProfile(topic, difficulty) {
  const t = topic.toLowerCase();
  const d = String(difficulty || 'beginner').toLowerCase();

  const generic = {
    essential: ['fundamentals', 'core concepts', 'practical examples', 'best practices'],
    prerequisites: {
      'core concepts': ['fundamentals'],
      'practical examples': ['core concepts'],
      'best practices': ['practical examples']
    }
  };

  if (t.includes('javascript') || t === 'js') {
    const essentialByLevel = {
      beginner: ['variables', 'data types', 'functions', 'conditionals', 'loops', 'arrays', 'objects'],
      intermediate: ['scope', 'closures', 'this', 'prototype', 'promises', 'async await', 'event loop', 'dom', 'modules', 'error handling'],
      advanced: ['performance', 'architecture', 'patterns', 'memory management', 'testing strategy', 'bundling', 'optimization']
    };

    const prerequisites = {
      closures: ['scope', 'functions'],
      this: ['objects', 'functions'],
      prototype: ['objects'],
      'async await': ['promises'],
      'event loop': ['promises'],
      modules: ['scope'],
      'error handling': ['promises']
    };

    return {
      essential: essentialByLevel[d] || essentialByLevel.beginner,
      prerequisites
    };
  }

  return generic;
}

function buildSearchQueries(topic, difficulty) {
  const level = String(difficulty || 'beginner').toLowerCase();
  return [
    `${topic} ${level} tutorial`,
    `${topic} roadmap ${level}`,
    `${topic} complete course ${level}`,
    `${topic} practical projects`,
    `${topic} fundamentals and concepts`,
    `learn ${topic} ${level} step by step`,
    `${topic} best practices`,
    `${topic} interview and real world`
  ];
}

async function buildLearningTopics(topic, difficulty, duration) {
  const fallback = getTopicProfile(topic, difficulty).essential;

  try {
    const prompt = `Create a practical learning-topic list for this course.
Topic: ${topic}
Difficulty: ${difficulty}
Duration target: ${duration}

Return JSON only in this schema:
{"topics":["topic 1","topic 2","topic 3","topic 4","topic 5","topic 6"]}

Rules:
- Keep topics specific and beginner-friendly if difficulty is beginner.
- Order from fundamentals to practical application.
- No markdown.`;

    const response = await chatWithFallback({
      systemPrompt: 'You are an expert curriculum planner. Output strict JSON only.',
      userPrompt: prompt,
      temperature: 0.3,
      maxTokens: 700
    });

    const text = (response.text || '').trim();
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/) || text.match(/({[\s\S]*})/);
    const payload = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : text;
    const parsed = JSON.parse(payload);

    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.map((t) => String(t).trim()).filter(Boolean)
      : [];

    if (topics.length >= 3) {
      return topics.slice(0, 10);
    }
  } catch (error) {
    console.warn('⚠️ Topic planning fallback activated:', error.message);
  }

  return fallback;
}

function estimateLevelFromText(text = '') {
  const t = text.toLowerCase();
  const beginnerHits = ['beginner', 'intro', 'introduction', 'basics', 'fundamentals'].filter((k) => t.includes(k)).length;
  const advancedHits = ['advanced', 'expert', 'deep dive', 'architecture', 'optimization'].filter((k) => t.includes(k)).length;
  const intermediateHits = ['intermediate', 'practical', 'real world', 'patterns', 'project'].filter((k) => t.includes(k)).length;

  if (advancedHits > beginnerHits && advancedHits >= intermediateHits) return 'advanced';
  if (intermediateHits > beginnerHits) return 'intermediate';
  return 'beginner';
}

function levelMatchScore(target, videoLevel) {
  const map = { beginner: 1, intermediate: 2, advanced: 3 };
  const t = map[target] || 1;
  const v = map[videoLevel] || 1;
  const diff = Math.abs(t - v);
  if (diff === 0) return 1;
  if (diff === 1) return 0.65;
  return 0.2;
}

function qualityScore(video) {
  const views = Number(video.viewCount || 0);
  const likes = Number(video.likeCount || 0);
  const logViews = Math.log10(views + 1) / 7;
  const likeRatio = views > 0 ? Math.min(1, likes / views * 20) : 0;

  let freshness = 0.5;
  if (video.publishedAt) {
    const months = Math.max(0, (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
    freshness = Math.max(0.2, 1 - months / 72);
  }

  return 0.55 * logViews + 0.15 * likeRatio + 0.3 * freshness;
}

function scoreCandidates(candidates, topic, difficulty, profile) {
  const topicTokens = toTokens(topic);
  const essentialTokens = profile.essential.map((e) => toTokens(e)).flat();

  return candidates.map((video) => {
    const text = `${video.title || ''} ${video.description || ''} ${(video.tags || []).join(' ')}`;
    const textTokens = toTokens(text);

    const topicRel = jaccard(topicTokens, textTokens);

    const matchedConcepts = profile.essential.filter((concept) => {
      const cTokens = toTokens(concept);
      return cTokens.some((t) => textTokens.includes(t));
    });

    const coverage = profile.essential.length ? matchedConcepts.length / profile.essential.length : 0;
    const estimatedLevel = estimateLevelFromText(text);
    const levelScore = levelMatchScore(String(difficulty || 'beginner').toLowerCase(), estimatedLevel);
    const quality = qualityScore(video);

    const durationMinutes = video.durationMinutes || 12;
    const tooShortPenalty = durationMinutes < 12 ? 0.55 : 1;
    const finalScore = ((0.4 * topicRel) + (0.25 * coverage) + (0.2 * levelScore) + (0.15 * quality)) * tooShortPenalty;

    return {
      ...video,
      estimatedLevel,
      matchedConcepts,
      topicRel,
      coverage,
      levelScore,
      quality,
      finalScore,
      durationMinutes,
      _tokens: textTokens
    };
  });
}

function mmrSelect(scored, count = 20, lambda = 0.75) {
  const selected = [];
  const pool = [...scored].sort((a, b) => b.finalScore - a.finalScore);

  while (selected.length < count && pool.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      let diversityPenalty = 0;

      if (selected.length > 0) {
        const sims = selected.map((s) => jaccard(candidate._tokens, s._tokens));
        diversityPenalty = Math.max(...sims);
      }

      const mmr = lambda * candidate.finalScore - (1 - lambda) * diversityPenalty;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIndex = i;
      }
    }

    selected.push(pool.splice(bestIndex, 1)[0]);
  }

  return selected;
}

function selectWithinBudget(candidates, profile, budget) {
  const selected = [];
  let used = 0;

  // Phase 1: ensure concept coverage by selecting best per concept.
  for (const concept of profile.essential) {
    const best = candidates
      .filter((c) => !selected.find((s) => s.videoId === c.videoId))
      .filter((c) => c.matchedConcepts.includes(concept))
      .sort((a, b) => b.finalScore - a.finalScore)[0];

    if (!best) continue;
    if (used + best.durationMinutes <= budget.maxMinutes) {
      selected.push(best);
      used += best.durationMinutes;
    }
  }

  // Phase 2: fill with highest score-per-minute.
  const remaining = candidates
    .filter((c) => !selected.find((s) => s.videoId === c.videoId))
    .sort((a, b) => (b.finalScore / Math.max(6, b.durationMinutes)) - (a.finalScore / Math.max(6, a.durationMinutes)));

  for (const c of remaining) {
    if (used + c.durationMinutes > budget.maxMinutes) continue;
    selected.push(c);
    used += c.durationMinutes;
    if (used >= budget.minMinutes) break;
  }

  return { selected, usedMinutes: used };
}

function orderByPrerequisites(videos, profile) {
  if (videos.length <= 1) return videos;

  const conceptOwner = new Map();
  for (const v of videos) {
    for (const c of v.matchedConcepts) {
      if (!conceptOwner.has(c)) conceptOwner.set(c, v.videoId);
    }
  }

  const indegree = new Map(videos.map((v) => [v.videoId, 0]));
  const edges = new Map(videos.map((v) => [v.videoId, new Set()]));

  for (const v of videos) {
    for (const concept of v.matchedConcepts) {
      const prereqs = profile.prerequisites[concept] || [];
      for (const p of prereqs) {
        const owner = conceptOwner.get(p);
        if (owner && owner !== v.videoId && !edges.get(owner).has(v.videoId)) {
          edges.get(owner).add(v.videoId);
          indegree.set(v.videoId, indegree.get(v.videoId) + 1);
        }
      }
    }
  }

  const queue = videos
    .filter((v) => indegree.get(v.videoId) === 0)
    .sort((a, b) => b.finalScore - a.finalScore);

  const ordered = [];
  while (queue.length > 0) {
    const node = queue.shift();
    ordered.push(node);
    for (const nei of edges.get(node.videoId)) {
      indegree.set(nei, indegree.get(nei) - 1);
      if (indegree.get(nei) === 0) {
        const video = videos.find((v) => v.videoId === nei);
        if (video) queue.push(video);
      }
    }
    queue.sort((a, b) => b.finalScore - a.finalScore);
  }

  if (ordered.length !== videos.length) {
    return [...videos].sort((a, b) => b.finalScore - a.finalScore);
  }

  return ordered;
}

function buildModules(ordered) {
  if (ordered.length === 0) return [];
  const chunk = Math.max(2, Math.ceil(ordered.length / 3));
  const modules = [
    { title: 'Foundation', description: 'Core concepts and base skills', lessons: ordered.slice(0, chunk) },
    { title: 'Application', description: 'Practical implementation and patterns', lessons: ordered.slice(chunk, chunk * 2) },
    { title: 'Mastery', description: 'Advanced usage and real-world integration', lessons: ordered.slice(chunk * 2) }
  ].filter((m) => m.lessons.length > 0);

  return modules.map((m, i) => ({
    module: i + 1,
    title: m.title,
    description: m.description,
    lessons: m.lessons
  }));
}

async function enrichMetadata(videos, maxEnrich = 30) {
  const slice = videos.slice(0, maxEnrich);
  const enriched = [];

  for (const v of slice) {
    try {
      const meta = await getVideoMetadata(v.videoId);
      enriched.push({
        ...v,
        ...meta,
        videoId: v.videoId,
        durationMinutes: parseDurationToMinutes(meta.duration)
      });
    } catch (error) {
      enriched.push({ ...v, durationMinutes: 12 });
    }
  }

  // Keep non-enriched candidates as fallback
  for (const v of videos.slice(maxEnrich)) {
    enriched.push({ ...v, durationMinutes: 12 });
  }

  return enriched;
}

async function getCandidateVideos(topic, difficulty, limit = 60) {
  const queries = buildSearchQueries(topic, difficulty);
  const perQuery = Math.max(8, Math.ceil(limit / queries.length));

  const all = [];
  for (const q of queries) {
    const results = await searchYouTubeVideos(q, perQuery);
    all.push(...results);
  }

  const deduped = Array.from(new Map(all.map((v) => [v.videoId, v])).values());
  return deduped.slice(0, limit);
}

async function getCandidateVideosFromTopics(topic, difficulty, learningTopics, limit = 90) {
  const level = String(difficulty || 'beginner').toLowerCase();
  const queryPool = [];

  for (const subtopic of learningTopics) {
    queryPool.push(`${topic} ${subtopic} ${level} tutorial`);
    queryPool.push(`${topic} ${subtopic} explained`);
  }

  queryPool.push(...buildSearchQueries(topic, difficulty));

  const uniqueQueries = Array.from(new Set(queryPool.map((q) => q.trim()).filter(Boolean))).slice(0, 24);
  const perQuery = Math.max(4, Math.ceil(limit / uniqueQueries.length));
  const all = [];

  for (const query of uniqueQueries) {
    const videos = await searchYouTubeVideos(query, perQuery, {
      videoDuration: 'any',
      requireCaptions: false,
      order: 'relevance'
    });
    all.push(...videos);
  }

  const deduped = Array.from(new Map(all.map((v) => [v.videoId, v])).values());
  return deduped.slice(0, limit);
}

function formatFinalVideos(ordered) {
  return ordered.map((v, idx) => ({
    id: String(idx + 1),
    order: idx + 1,
    youtubeId: v.videoId,
    title: v.title,
    duration: `${v.durationMinutes} min`,
    estimatedMinutes: v.durationMinutes,
    description: v.description,
    channelTitle: v.channelTitle,
    thumbnailUrl: v.thumbnailUrl,
    difficulty: v.estimatedLevel,
    concepts: v.matchedConcepts,
    rationale: `Selected for relevance, level match, and concept progression. Covers: ${v.matchedConcepts.slice(0, 3).join(', ') || 'core topic concepts'}`,
    score: Number(v.finalScore.toFixed(4))
  }));
}

async function buildPersonalizedCourse(topic, difficulty = 'beginner', duration = '4-6 hours') {
  const profile = getTopicProfile(topic, difficulty);
  const budget = parseBudget(duration);
  const learningTopics = await buildLearningTopics(topic, difficulty, duration);

  let candidates = await getCandidateVideosFromTopics(topic, difficulty, learningTopics, 96);
  if (candidates.length < 20) {
    const fallbackCandidates = await getCandidateVideos(topic, difficulty, 64);
    candidates = Array.from(new Map([...candidates, ...fallbackCandidates].map((v) => [v.videoId, v])).values());
  }

  const enriched = await enrichMetadata(candidates, 60);
  const scored = scoreCandidates(enriched, topic, difficulty, profile);

  const diverseTop = mmrSelect(scored, 24, 0.75);
  let { selected, usedMinutes } = selectWithinBudget(diverseTop, profile, budget);

  // If time budget is still too low, force-fill with longer high-scoring videos.
  if (usedMinutes < budget.minMinutes) {
    const remaining = diverseTop
      .filter((c) => !selected.find((s) => s.videoId === c.videoId))
      .filter((c) => c.durationMinutes >= 12)
      .sort((a, b) => b.finalScore - a.finalScore);

    for (const candidate of remaining) {
      if (usedMinutes >= budget.minMinutes) break;
      if (usedMinutes + candidate.durationMinutes > budget.maxMinutes) continue;
      selected.push(candidate);
      usedMinutes += candidate.durationMinutes;
    }
  }

  const ordered = orderByPrerequisites(selected, profile);
  const videos = formatFinalVideos(ordered);
  const learningPath = buildModules(videos);

  const totalMinutes = videos.reduce((sum, v) => sum + (v.estimatedMinutes || 0), 0);

  return {
    title: `Complete ${topic} Course - ${String(difficulty).charAt(0).toUpperCase() + String(difficulty).slice(1)} Level`,
    description: `A curated ${difficulty}-level learning path for ${topic}, optimized for concept coverage and time budget (${duration}).`,
    topic,
    difficulty,
    duration,
    totalLessons: videos.length,
    estimatedHours: `${(totalMinutes / 60).toFixed(1)} hours`,
    videos,
    learningPath,
    roadmap: {
      prerequisites: learningTopics.slice(0, 3),
      outcomes: [
        `Understand essential ${topic} concepts for ${difficulty} level`,
        `Follow a prerequisite-safe ordered learning path`,
        `Build practical understanding within the chosen time budget`
      ]
    },
    metadata: {
      generatedBy: 'Hybrid Retrieval + Ranking + Prerequisite Sequencing',
      generatedAt: new Date().toISOString(),
      algorithm: {
        retrieval: 'query expansion + YouTube search',
        ranking: 'hybrid weighted score + MMR diversity',
        sequencing: 'concept prerequisite topological order',
        budgeting: 'coverage-first + score/min fill'
      },
      candidateCount: candidates.length,
      selectedCount: videos.length,
      usedMinutes,
      budgetMinutes: budget,
      plannedTopics: learningTopics
    }
  };
}

module.exports = {
  buildPersonalizedCourse
};