# API Key Rotation System

## Overview
This system automatically rotates between multiple API keys to prevent rate limit exhaustion. It's implemented for both Gemini AI and YouTube Data API.

## Features
- ✅ **Round-robin rotation**: Cycles through all available keys
- ✅ **Automatic failure detection**: Temporarily skips failed keys
- ✅ **Auto-recovery**: Failed keys recover after 1 minute cooldown
- ✅ **Flexible**: Works with 1-4 keys per service
- ✅ **Logging**: Detailed console output for monitoring

## Setup

### 1. Get Your API Keys

#### Gemini AI Keys (4 recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create 4 separate API keys
3. Copy each key

#### YouTube API Keys (4 recommended)
1. Go to [Google Cloud Console](https://console.developers.google.com)
2. Create 4 separate projects (or use same project)
3. Enable YouTube Data API v3 for each
4. Create API keys
5. Copy each key

### 2. Configure Environment Variables

#### AI Service (.env file)
```env
# Gemini API Keys
GEMINI_API_KEY_1=AIzaSy...first-key
GEMINI_API_KEY_2=AIzaSy...second-key
GEMINI_API_KEY_3=AIzaSy...third-key
GEMINI_API_KEY_4=AIzaSy...fourth-key

# YouTube API Keys
YOUTUBE_API_KEY_1=AIzaSy...first-key
YOUTUBE_API_KEY_2=AIzaSy...second-key
YOUTUBE_API_KEY_3=AIzaSy...third-key
YOUTUBE_API_KEY_4=AIzaSy...fourth-key
```

#### Backend (.env file)
```env
# YouTube API Keys
YOUTUBE_API_KEY_1=AIzaSy...first-key
YOUTUBE_API_KEY_2=AIzaSy...second-key
YOUTUBE_API_KEY_3=AIzaSy...third-key
YOUTUBE_API_KEY_4=AIzaSy...fourth-key
```

### 3. Deploy to Render

For each Render service:
1. Go to service dashboard
2. Navigate to "Environment" tab
3. Add all 8 environment variables (4 Gemini + 4 YouTube for AI service, 4 YouTube for backend)
4. Save and redeploy

## How It Works

### Rotation Logic
1. System loads all configured keys at startup
2. Cycles through keys in order (1 → 2 → 3 → 4 → 1...)
3. If a key fails (rate limit), it's marked as failed
4. Failed keys are skipped for 60 seconds
5. After cooldown, failed keys are automatically recovered

### Example Flow
```
Request 1: Uses GEMINI_API_KEY_1 ✅
Request 2: Uses GEMINI_API_KEY_2 ✅
Request 3: Uses GEMINI_API_KEY_3 ❌ (rate limited)
Request 4: Uses GEMINI_API_KEY_4 ✅
Request 5: Uses GEMINI_API_KEY_1 ✅
Request 6: Uses GEMINI_API_KEY_2 ✅
... (after 60 seconds)
Request N: Uses GEMINI_API_KEY_3 ✅ (recovered)
```

## Console Output

### Startup
```
✅ Loaded 4 Gemini API keys
✅ Loaded 4 YouTube API keys
🔑 API Key Rotation System Initialized
{
  gemini: { total: 4, failed: 0, available: 4 },
  youtube: { total: 4, failed: 0, available: 4 }
}
```

### During Runtime
```
🔑 Using Gemini key #1/4
🔑 Using YouTube key #2/4
❌ Marked Gemini key as failed. Failed keys: 1/4
♻️  Recovered Gemini key after cooldown
```

## Benefits

### Without Rotation (1 key)
- **Gemini**: 60 requests/minute = ~3,600/hour
- **YouTube**: 10,000 quota/day ≈ 100 requests/hour

### With Rotation (4 keys)
- **Gemini**: 240 requests/minute = ~14,400/hour (4x capacity)
- **YouTube**: 40,000 quota/day ≈ 400 requests/hour (4x capacity)

## Monitoring

Check stats programmatically:
```javascript
const apiKeyRotator = require('./config/apiKeyRotator');
console.log(apiKeyRotator.getStats());
```

## Minimum Configuration

You can start with just 1 key per service:
```env
GEMINI_API_KEY_1=your-only-gemini-key
YOUTUBE_API_KEY_1=your-only-youtube-key
```

The system will work with any number of keys (1-4). More keys = better rate limit handling.

## Security Notes

- ✅ Never commit .env files to git
- ✅ Use Render's environment variables for production
- ✅ Rotate compromised keys immediately
- ✅ Set up Google Cloud alerts for unusual usage
- ✅ Review API usage regularly in Google Cloud Console

## Troubleshooting

### "No Gemini API keys configured"
- Check that at least `GEMINI_API_KEY_1` is set
- Verify .env file exists in ai-service directory
- On Render, check Environment tab has the variable

### "All keys failed"
- All 4 keys hit rate limits simultaneously
- System will auto-recover after 60 seconds
- Consider adding more keys or reducing request frequency

### Keys rotating too fast
- This is normal - rotation happens on every request
- Check console logs to verify keys are working

## Files Modified

### AI Service
- `/ai-service/config/apiKeyRotator.js` - Main rotation logic
- `/ai-service/config/gemini.js` - Updated to use rotation
- `/ai-service/controllers/chatController.js` - Updated for rotation
- `/ai-service/utils/youtube.js` - Updated for rotation
- `/ai-service/index.js` - Added rotation initialization

### Backend
- `/backend/config/apiKeyRotator.js` - YouTube key rotation
- `/backend/utils/youtube.js` - Updated for rotation
- `/backend/middleware/auth.js` - Updated for rotation

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify all API keys are valid
3. Check Google Cloud Console quota usage
4. Review Render deployment logs
