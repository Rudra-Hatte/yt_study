# Quick Deployment Commands

## Prerequisites
- GitHub account
- Render account (sign up with GitHub)
- Vercel account (sign up with GitHub)
- MongoDB Atlas account

---

## Step 1: Push to GitHub

```powershell
# Navigate to project root
cd d:\yt_study

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create main branch
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/yt-study-deployment.git

# Push
git push -u origin main
```

---

## Step 2: MongoDB Connection String Format

After creating MongoDB Atlas cluster, your connection string should look like:

```
mongodb+srv://ytstudy-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/yt-study?retryWrites=true&w=majority
```

**Save this - you'll need it for backend deployment!**

---

## Step 3: Render Environment Variables

### AI Service (.env):
```
GEMINI_API_KEY=AIzaSyA3JAhU5b-luS2hWolFc5ASe4km1ioY1Wg
YOUTUBE_API_KEY=AIzaSyAgWk_cPh4uKEUppYW_YiqzKrePPq0NFhg
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://YOUR_APP.vercel.app
BACKEND_URL=https://yt-study-backend.onrender.com
```

### Backend (.env):
```
MONGO_URI=mongodb+srv://ytstudy-admin:PASSWORD@cluster.mongodb.net/yt-study?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-in-production-2024
GEMINI_API_KEY=AIzaSyA3JAhU5b-luS2hWolFc5ASe4km1ioY1Wg
YOUTUBE_API_KEY=AIzaSyAgWk_cPh4uKEUppYW_YiqzKrePPq0NFhg
AI_SERVICE_URL=https://yt-study-ai-service.onrender.com/api/ai
FRONTEND_URL=https://YOUR_APP.vercel.app
PORT=5000
NODE_ENV=production
```

---

## Step 4: Vercel Environment Variables

```
VITE_API_URL=https://yt-study-backend.onrender.com
VITE_AI_SERVICE_URL=https://yt-study-ai-service.onrender.com
```

---

## Render Configuration

### AI Service:
- **Root Directory**: `ai-service`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

### Backend:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

---

## Vercel Configuration

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## Order of Deployment

1. ✅ Create MongoDB Atlas cluster → Get connection string
2. ✅ Deploy AI Service to Render
3. ✅ Deploy Backend to Render (with MongoDB URI)
4. ✅ Deploy Frontend to Vercel (with backend/AI URLs)
5. ✅ Update CORS in AI Service and Backend with Vercel URL

---

## Final URLs

After deployment, you'll have:

- **Main App**: `https://YOUR_APP.vercel.app` ← Share this link!
- **Backend**: `https://yt-study-backend.onrender.com`
- **AI Service**: `https://yt-study-ai-service.onrender.com`

---

## Health Check

Test your services:
- AI Service: `https://yt-study-ai-service.onrender.com/health`
- Backend: `https://yt-study-backend.onrender.com/health`

Should return: `{"status":"ok"}`

---

## Common Issues

1. **CORS Error**: Update FRONTEND_URL in Render env variables
2. **500 Error**: Check Render logs, verify MongoDB connection
3. **Slow First Load**: Render free tier spins down - wait 30-60 seconds
4. **Build Failed**: Check package.json scripts and dependencies
