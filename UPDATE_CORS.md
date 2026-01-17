# Update CORS Settings for Deployed Services

## What You Need to Do

Your Vercel frontend URL is now live. You need to update the backend and AI service to allow requests from it.

---

## 🔧 Step 1: Update AI Service CORS on Render

1. Go to https://render.com/dashboard
2. Click on **yt-study-ai-service**
3. Click **"Environment"** in the left sidebar
4. Find or add these environment variables:

### Update/Add These:

**FRONTEND_URL**
```
https://yt-study-frontend.vercel.app
```
(Replace with your actual Vercel URL)

**BACKEND_URL**
```
https://yt-study-backend.onrender.com
```

**CORS_ORIGIN** (if it exists, update it; if not, add it)
```
*
```
(We'll use * for now, or you can specify your exact Vercel URL)

4. Click **"Save Changes"**
5. Service will auto-redeploy (wait 2-3 minutes)

---

## 🔧 Step 2: Update Backend CORS on Render

1. Still on Render dashboard
2. Click on **yt-study-backend**
3. Click **"Environment"** in the left sidebar
4. Find or add these environment variables:

### Update/Add These:

**FRONTEND_URL**
```
https://yt-study-frontend.vercel.app
```
(Replace with your actual Vercel URL)

**CORS_ORIGIN** (if exists, update; if not, add)
```
*
```

4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## 🔄 Step 3: Redeploy Frontend on Vercel

After backend/AI service redeploy:

1. Go to https://vercel.com/dashboard
2. Click on your **yt-study-frontend** project
3. Go to **"Deployments"** tab
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**

---

## ✅ Step 4: Test Your App

1. Open: `https://yt-study-frontend.vercel.app`
2. Register a new account
3. Create a course
4. Try generating:
   - ✅ Quiz
   - ✅ Flashcards
   - ✅ Summary

---

## 🎉 Your App is Live!

Share this link with students:
```
https://yt-study-frontend.vercel.app
```

(Replace with your actual Vercel URL)
