/**
 * Content preprocessing utilities for transcript cleaning and segmentation
 */

/**
 * Clean and preprocess raw video transcript
 * @param {string} rawTranscript - Raw transcript text
 * @returns {Object} Cleaned transcript with segments and metadata
 */
function preprocessTranscript(rawTranscript) {
  try {
    if (!rawTranscript || typeof rawTranscript !== 'string') {
      throw new Error('Invalid transcript provided');
    }

    // Remove timestamps and artifacts
    let cleanedText = rawTranscript
      // Remove timestamp markers like [00:01:23] or (00:01:23)
      .replace(/\[[0-9]{1,2}:[0-9]{2}:[0-9]{2}\]/g, '')
      .replace(/\([0-9]{1,2}:[0-9]{2}:[0-9]{2}\)/g, '')
      // Remove common transcript artifacts
      .replace(/\[Music\]/gi, '')
      .replace(/\[Applause\]/gi, '')
      .replace(/\[Laughter\]/gi, '')
      .replace(/\[Inaudible\]/gi, '')
      .replace(/\[.*?\]/g, '') // Remove any other bracketed content
      // Remove repetitive filler words and phrases
      .replace(/\b(um|uh|er|ah|like|you know)\b/gi, '')
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Normalize text
    cleanedText = normalizeText(cleanedText);

    // Segment the content into meaningful chunks
    const segments = segmentContent(cleanedText);

    // Extract metadata
    const metadata = extractContentMetadata(cleanedText, segments);

    return {
      originalLength: rawTranscript.length,
      cleanedLength: cleanedText.length,
      cleanedText,
      segments,
      metadata,
      processingStats: {
        artifactsRemoved: rawTranscript.length - cleanedText.length,
        segmentCount: segments.length,
        averageSegmentLength: segments.reduce((sum, seg) => sum + seg.text.length, 0) / segments.length
      }
    };
  } catch (error) {
    console.error('Error preprocessing transcript:', error);
    throw new Error(`Transcript preprocessing failed: ${error.message}`);
  }
}

/**
 * Normalize text for consistent processing
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  return text
    // Fix common encoding issues
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â€"/g, '—')
    // Standardize quotation marks
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Fix spacing around punctuation
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    // Remove excessive punctuation
    .replace(/\.{2,}/g, '.')
    .replace(/\?{2,}/g, '?')
    .replace(/!{2,}/g, '!')
    // Ensure proper sentence spacing
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2');
}

/**
 * Segment content into meaningful chunks for better processing
 * @param {string} text - Cleaned text to segment
 * @returns {Array} Array of content segments
 */
function segmentContent(text) {
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
  const segments = [];
  let currentSegment = '';
  const targetSegmentLength = 500; // Target length for each segment

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if (!trimmedSentence) continue;

    // If adding this sentence would make segment too long, start a new one
    if (currentSegment.length + trimmedSentence.length > targetSegmentLength && currentSegment.length > 0) {
      segments.push({
        text: currentSegment.trim(),
        sentenceCount: (currentSegment.match(/[.!?]/g) || []).length,
        wordCount: currentSegment.split(/\s+/).length,
        topics: extractTopicsFromSegment(currentSegment),
        type: classifySegmentType(currentSegment)
      });
      currentSegment = trimmedSentence;
    } else {
      currentSegment += (currentSegment ? ' ' : '') + trimmedSentence;
    }
  }

  // Add the last segment if it has content
  if (currentSegment.trim()) {
    segments.push({
      text: currentSegment.trim(),
      sentenceCount: (currentSegment.match(/[.!?]/g) || []).length,
      wordCount: currentSegment.split(/\s+/).length,
      topics: extractTopicsFromSegment(currentSegment),
      type: classifySegmentType(currentSegment)
    });
  }

  return segments;
}

/**
 * Extract topics/keywords from a text segment
 * @param {string} text - Text segment to analyze
 * @returns {Array} Array of extracted topics/keywords
 */
function extractTopicsFromSegment(text) {
  // Simple keyword extraction - in a real implementation, you might use NLP libraries
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Classify the type of content segment
 * @param {string} text - Text segment to classify
 * @returns {string} Segment type
 */
function classifySegmentType(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('example') || lowerText.includes('for instance') || lowerText.includes('such as')) {
    return 'example';
  } else if (lowerText.includes('definition') || lowerText.includes('means') || lowerText.includes('is defined as')) {
    return 'definition';
  } else if (lowerText.includes('step') || lowerText.includes('first') || lowerText.includes('then') || lowerText.includes('next')) {
    return 'procedure';
  } else if (lowerText.includes('concept') || lowerText.includes('idea') || lowerText.includes('theory')) {
    return 'concept';
  } else if (lowerText.includes('summary') || lowerText.includes('conclusion') || lowerText.includes('in summary')) {
    return 'summary';
  } else {
    return 'general';
  }
}

/**
 * Extract metadata from the processed content
 * @param {string} text - Cleaned text
 * @param {Array} segments - Content segments
 * @returns {Object} Content metadata
 */
function extractContentMetadata(text, segments) {
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = (text.match(/[.!?]/g) || []).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Analyze segment types
  const segmentTypes = segments.reduce((acc, segment) => {
    acc[segment.type] = (acc[segment.type] || 0) + 1;
    return acc;
  }, {});

  // Extract all topics
  const allTopics = segments.flatMap(segment => segment.topics);
  const uniqueTopics = [...new Set(allTopics)];

  return {
    wordCount,
    sentenceCount,
    estimatedReadingTime: readingTime,
    segmentTypes,
    primaryTopics: uniqueTopics.slice(0, 10),
    contentComplexity: calculateContentComplexity(text, segments),
    language: detectLanguage(text)
  };
}

/**
 * Calculate content complexity score
 * @param {string} text - Text to analyze
 * @param {Array} segments - Content segments
 * @returns {Object} Complexity analysis
 */
function calculateContentComplexity(text, segments) {
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const avgSentenceLength = words.length / ((text.match(/[.!?]/g) || []).length || 1);
  
  // Simple complexity scoring
  let complexityScore = 0;
  if (avgWordLength > 5) complexityScore += 1;
  if (avgSentenceLength > 15) complexityScore += 1;
  if (segments.some(seg => seg.type === 'definition')) complexityScore += 1;
  if (segments.some(seg => seg.type === 'procedure')) complexityScore += 1;

  return {
    score: complexityScore,
    level: complexityScore <= 1 ? 'beginner' : complexityScore <= 2 ? 'intermediate' : 'advanced',
    avgWordLength: avgWordLength.toFixed(2),
    avgSentenceLength: avgSentenceLength.toFixed(2),
    technicalTerms: identifyTechnicalTerms(text)
  };
}

/**
 * Identify technical terms in the content
 * @param {string} text - Text to analyze
 * @returns {Array} Array of technical terms
 */
function identifyTechnicalTerms(text) {
  // Simple technical term identification based on patterns
  const technicalPatterns = [
    /\b[A-Z]{2,}\b/g, // Acronyms
    /\b\w*(?:ing|tion|sion|ness|ment|able|ible)\b/g, // Complex suffixes
    /\b\w{8,}\b/g // Long words that might be technical
  ];

  const terms = new Set();
  technicalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (match.length > 5 && !match.match(/^[a-z]/)) {
          terms.add(match.toLowerCase());
        }
      });
    }
  });

  return Array.from(terms).slice(0, 10);
}

/**
 * Simple language detection
 * @param {string} text - Text to analyze
 * @returns {string} Detected language
 */
function detectLanguage(text) {
  // Very simple language detection - in production, use a proper library
  const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
  const sampleWords = text.toLowerCase().split(/\s+/).slice(0, 100);
  const englishCount = sampleWords.filter(word => englishWords.includes(word)).length;
  
  return englishCount > 5 ? 'en' : 'unknown';
}

module.exports = {
  preprocessTranscript,
  normalizeText,
  segmentContent,
  extractTopicsFromSegment,
  classifySegmentType,
  extractContentMetadata,
  calculateContentComplexity
};