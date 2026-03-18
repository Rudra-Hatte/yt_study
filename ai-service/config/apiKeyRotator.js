/**
 * API Key Rotation System
 * Rotates between multiple API keys to avoid rate limits
 */

class APIKeyRotator {
  constructor() {
    this.primaryKeys = [
      process.env.PRIMARY_API_KEY_1,
      process.env.PRIMARY_API_KEY_2,
      process.env.PRIMARY_API_KEY_3,
      process.env.PRIMARY_API_KEY_4,
      process.env.PRIMARY_API_KEY
    ].filter(key => key && key.trim() !== '');

    this.backupKeys = [
      process.env.BACKUP_API_KEY_1,
      process.env.BACKUP_API_KEY_2,
      process.env.BACKUP_API_KEY_3,
      process.env.BACKUP_API_KEY_4,
      process.env.BACKUP_API_KEY
    ].filter(key => key && key.trim() !== '');

    this.youtubeKeys = [
      process.env.YOUTUBE_API_KEY_1,
      process.env.YOUTUBE_API_KEY_2,
      process.env.YOUTUBE_API_KEY_3,
      process.env.YOUTUBE_API_KEY_4
    ].filter(key => key && key.trim() !== '');

    // Track current index for round-robin rotation
    this.primaryIndex = 0;
    this.backupIndex = 0;
    this.youtubeIndex = 0;

    // Track failed keys to temporarily skip them
    this.failedPrimaryKeys = new Set();
    this.failedBackupKeys = new Set();
    this.failedYoutubeKeys = new Set();

    console.log(`✅ Loaded ${this.primaryKeys.length} primary model API keys`);
    console.log(`✅ Loaded ${this.backupKeys.length} backup model API keys`);
    console.log(`✅ Loaded ${this.youtubeKeys.length} YouTube API keys`);
  }

  /**
   * Get next available primary model API key
   */
  getPrimaryKey() {
    if (this.primaryKeys.length === 0) {
      throw new Error('No primary model API keys configured');
    }

    let attempts = 0;
    while (attempts < this.primaryKeys.length) {
      const key = this.primaryKeys[this.primaryIndex];
      this.primaryIndex = (this.primaryIndex + 1) % this.primaryKeys.length;

      if (!this.failedPrimaryKeys.has(key)) {
        return key;
      }
      attempts++;
    }

    console.warn('⚠️  All primary model keys failed, resetting failure state');
    this.failedPrimaryKeys.clear();
    return this.primaryKeys[this.primaryIndex];
  }

  /**
   * Get next available backup model API key
   */
  getBackupKey() {
    if (this.backupKeys.length === 0) {
      throw new Error('No backup model API keys configured');
    }

    let attempts = 0;
    while (attempts < this.backupKeys.length) {
      const key = this.backupKeys[this.backupIndex];
      this.backupIndex = (this.backupIndex + 1) % this.backupKeys.length;

      if (!this.failedBackupKeys.has(key)) {
        console.log(`🔑 Using backup model key #${this.backupIndex + 1}/${this.backupKeys.length}`);
        return key;
      }
      attempts++;
    }

    console.warn('⚠️  All backup model keys failed, resetting failure state');
    this.failedBackupKeys.clear();
    return this.backupKeys[this.backupIndex];
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
   * Mark a backup model key as failed (rate limited or quota exceeded)
   */
  markBackupKeyFailed(key) {
    this.failedBackupKeys.add(key);
    console.warn(`❌ Marked backup model key as failed. Failed keys: ${this.failedBackupKeys.size}/${this.backupKeys.length}`);

    setTimeout(() => {
      this.failedBackupKeys.delete(key);
      console.log('♻️  Recovered backup model key after cooldown');
    }, 60000);
  }

  /**
   * Mark a primary model key as failed (rate limited or quota exceeded)
   */
  markPrimaryKeyFailed(key) {
    this.failedPrimaryKeys.add(key);
    console.warn(`❌ Marked primary model key as failed. Failed keys: ${this.failedPrimaryKeys.size}/${this.primaryKeys.length}`);

    setTimeout(() => {
      this.failedPrimaryKeys.delete(key);
      console.log('♻️  Recovered primary model key after cooldown');
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
      primary: {
        total: this.primaryKeys.length,
        failed: this.failedPrimaryKeys.size,
        available: this.primaryKeys.length - this.failedPrimaryKeys.size
      },
      backup: {
        total: this.backupKeys.length,
        failed: this.failedBackupKeys.size,
        available: this.backupKeys.length - this.failedBackupKeys.size
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
