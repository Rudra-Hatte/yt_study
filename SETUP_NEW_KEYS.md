# 🔐 URGENT: Setup New API Keys

## What Happened
All API keys were compromised and removed from the repository. The system now uses a 4-key rotation to prevent future rate limit issues.

## Quick Setup (5 minutes)

### Step 1: Get New API Keys

#### Gemini AI Keys (Get 4)
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Get API Key" → "Create API key in new project" (or use existing)
3. Copy the key
4. **Repeat 3 more times** (total 4 keys)

#### YouTube API Keys (Get 4)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Enable "YouTube Data API v3" if prompted
4. Copy the key
5. **Repeat 3 more times** (total 4 keys)

### Step 2: Configure Render (AI Service)

1. Go to your AI Service on Render: https://dashboard.render.com
2. Click on your `yt-study-ai-service`
3. Go to "Environment" tab
4. Add these 8 variables:

```
GEMINI_API_KEY_1 = [paste your 1st Gemini key]
GEMINI_API_KEY_2 = [paste your 2nd Gemini key]
GEMINI_API_KEY_3 = [paste your 3rd Gemini key]
GEMINI_API_KEY_4 = [paste your 4th Gemini key]

YOUTUBE_API_KEY_1 = [paste your 1st YouTube key]
YOUTUBE_API_KEY_2 = [paste your 2nd YouTube key]
YOUTUBE_API_KEY_3 = [paste your 3rd YouTube key]
YOUTUBE_API_KEY_4 = [paste your 4th YouTube key]
```

5. Click "Save Changes"
6. Service will auto-redeploy

### Step 3: Configure Render (Backend)

1. Go to your Backend on Render
2. Click on your `yt-study-backend`
3. Go to "Environment" tab
4. Add these 4 variables:

```
YOUTUBE_API_KEY_1 = [paste your 1st YouTube key]
YOUTUBE_API_KEY_2 = [paste your 2nd YouTube key]
YOUTUBE_API_KEY_3 = [paste your 3rd YouTube key]
YOUTUBE_API_KEY_4 = [paste your 4th YouTube key]
```

5. Click "Save Changes"
6. Service will auto-redeploy

### Step 4: Local Development (Optional)

Create `ai-service/.env`:
```env
PORT=5001

GEMINI_API_KEY_1=your-key-1
GEMINI_API_KEY_2=your-key-2
GEMINI_API_KEY_3=your-key-3
GEMINI_API_KEY_4=your-key-4

YOUTUBE_API_KEY_1=your-key-1
YOUTUBE_API_KEY_2=your-key-2
YOUTUBE_API_KEY_3=your-key-3
YOUTUBE_API_KEY_4=your-key-4

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret

YOUTUBE_API_KEY_1=your-key-1
YOUTUBE_API_KEY_2=your-key-2
YOUTUBE_API_KEY_3=your-key-3
YOUTUBE_API_KEY_4=your-key-4
```

## ✅ Verification

After deployment, check Render logs:

**AI Service logs should show:**
```
✅ Loaded 4 Gemini API keys
✅ Loaded 4 YouTube API keys
🔑 API Key Rotation System Initialized
```

**During requests:**
```
🔑 Using Gemini key #1/4
🔑 Using YouTube key #2/4
🔑 Using Gemini key #3/4
```

## 🎯 Benefits

### Before (1 key):
- Gemini: 60 requests/minute
- YouTube: 100 requests/hour
- Frequent rate limit errors

### After (4 keys):
- Gemini: 240 requests/minute (4x)
- YouTube: 400 requests/hour (4x)
- Automatic failover if one key fails

## ⚠️ Important Notes

1. **Never commit .env files** - They're in .gitignore
2. **Different keys for different services** - Don't reuse keys
3. **Monitor usage** - Check Google Cloud Console regularly
4. **Minimum 1 key per service** - System works with 1-4 keys

## 🆘 Troubleshooting

### "No API keys configured"
- Double-check environment variables in Render
- Ensure variable names match exactly (GEMINI_API_KEY_1, etc.)
- Redeploy service after adding variables

### "Rate limit exceeded"
- All 4 keys hit limits - wait 60 seconds for auto-recovery
- Or add more keys (scale to 8+ if needed)

### Keys not rotating
- Check Render logs for rotation messages
- Ensure keys are valid in Google Cloud Console

## 📚 Full Documentation
See [API_KEY_ROTATION_GUIDE.md](./API_KEY_ROTATION_GUIDE.md) for complete details.

---

**Time to complete:** ~5 minutes
**Status:** The app will work once you add at least 1 key per service (8 total recommended)
