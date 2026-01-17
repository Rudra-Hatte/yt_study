/**
 * API Key Rotation System for Backend
 * Rotates between multiple YouTube API keys to avoid rate limits
 */

class APIKeyRotator {
  constructor() {
    // Load all YouTube API keys from environment variables
    this.youtubeKeys = [
      process.env.YOUTUBE_API_KEY_1,
      process.env.YOUTUBE_API_KEY_2,
      process.env.YOUTUBE_API_KEY_3,
      process.env.YOUTUBE_API_KEY_4
    ].filter(key => key && key.trim() !== '');

    // Track current index for round-robin rotation
    this.youtubeIndex = 0;

    // Track failed keys to temporarily skip them
    this.failedYoutubeKeys = new Set();

    console.log(`✅ Backend: Loaded ${this.youtubeKeys.length} YouTube API keys`);
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
        console.log(`🔑 Using YouTube key #${this.youtubeIndex}/${this.youtubeKeys.length}`);
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
