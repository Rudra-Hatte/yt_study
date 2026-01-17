/**
 * API Key Rotation System
 * Rotates between multiple API keys to avoid rate limits
 */

class APIKeyRotator {
  constructor() {
    // Load all API keys from environment variables
    this.geminiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4
    ].filter(key => key && key.trim() !== '');

    this.youtubeKeys = [
      process.env.YOUTUBE_API_KEY_1,
      process.env.YOUTUBE_API_KEY_2,
      process.env.YOUTUBE_API_KEY_3,
      process.env.YOUTUBE_API_KEY_4
    ].filter(key => key && key.trim() !== '');

    // Track current index for round-robin rotation
    this.geminiIndex = 0;
    this.youtubeIndex = 0;

    // Track failed keys to temporarily skip them
    this.failedGeminiKeys = new Set();
    this.failedYoutubeKeys = new Set();

    console.log(`✅ Loaded ${this.geminiKeys.length} Gemini API keys`);
    console.log(`✅ Loaded ${this.youtubeKeys.length} YouTube API keys`);
  }

  /**
   * Get next available Gemini API key
   */
  getGeminiKey() {
    if (this.geminiKeys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }

    // Find next available key that hasn't failed recently
    let attempts = 0;
    while (attempts < this.geminiKeys.length) {
      const key = this.geminiKeys[this.geminiIndex];
      this.geminiIndex = (this.geminiIndex + 1) % this.geminiKeys.length;

      if (!this.failedGeminiKeys.has(key)) {
        console.log(`🔑 Using Gemini key #${this.geminiIndex + 1}/${this.geminiKeys.length}`);
        return key;
      }
      attempts++;
    }

    // If all keys have failed, clear failed set and start over
    console.warn('⚠️  All Gemini keys failed, resetting failure state');
    this.failedGeminiKeys.clear();
    return this.geminiKeys[this.geminiIndex];
  }

  /**
   * Get next available YouTube API key
   */
  getYoutubeKey() {
    if (this.youtubeKeys.length === 0) {
      throw new Error('No YouTube API keys configured');
    }

    // Find next available key that hasn't failed recently
    let attempts = 0;
    while (attempts < this.youtubeKeys.length) {
      const key = this.youtubeKeys[this.youtubeIndex];
      this.youtubeIndex = (this.youtubeIndex + 1) % this.youtubeKeys.length;

      if (!this.failedYoutubeKeys.has(key)) {
        console.log(`🔑 Using YouTube key #${this.youtubeIndex + 1}/${this.youtubeKeys.length}`);
        return key;
      }
      attempts++;
    }

    // If all keys have failed, clear failed set and start over
    console.warn('⚠️  All YouTube keys failed, resetting failure state');
    this.failedYoutubeKeys.clear();
    return this.youtubeKeys[this.youtubeIndex];
  }

  /**
   * Mark a Gemini key as failed (rate limited or quota exceeded)
   */
  markGeminiKeyFailed(key) {
    this.failedGeminiKeys.add(key);
    console.warn(`❌ Marked Gemini key as failed. Failed keys: ${this.failedGeminiKeys.size}/${this.geminiKeys.length}`);

    // Auto-recover after 1 minute
    setTimeout(() => {
      this.failedGeminiKeys.delete(key);
      console.log(`♻️  Recovered Gemini key after cooldown`);
    }, 60000);
  }

  /**
   * Mark a YouTube key as failed (rate limited or quota exceeded)
   */
  markYoutubeKeyFailed(key) {
    this.failedYoutubeKeys.add(key);
    console.warn(`❌ Marked YouTube key as failed. Failed keys: ${this.failedYoutubeKeys.size}/${this.youtubeKeys.length}`);

    // Auto-recover after 1 minute
    setTimeout(() => {
      this.failedYoutubeKeys.delete(key);
      console.log(`♻️  Recovered YouTube key after cooldown`);
    }, 60000);
  }

  /**
   * Get statistics about key usage
   */
  getStats() {
    return {
      gemini: {
        total: this.geminiKeys.length,
        failed: this.failedGeminiKeys.size,
        available: this.geminiKeys.length - this.failedGeminiKeys.size
      },
      youtube: {
        total: this.youtubeKeys.length,
        failed: this.failedYoutubeKeys.size,
        available: this.youtubeKeys.length - this.failedYoutubeKeys.size
      }
    };
  }
}

// Export singleton instance
module.exports = new APIKeyRotator();
