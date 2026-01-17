# 🚀 YT Study - Complete Deployment Guide

## 📋 Overview
This guide will walk you through deploying your YouTube Study web application completely free using:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **AI Service**: Render (free tier)
- **Database**: MongoDB Atlas (free tier)

**Total Cost: $0/month** ✨

---

## 🎯 Deployment Steps

### Step 1: Set Up MongoDB Atlas (Database)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/GitHub or email
   - Select "Free Shared" tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select closest region (e.g., AWS Mumbai/Singapore)
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `ytstudy-admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copy connection string (looks like):
     ```
     mongodb+srv://ytstudy-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name at end: `...mongodb.net/yt-study?retryWrites=true&w=majority`

**✅ Save this connection string - you'll need it!**

---

### Step 2: Deploy AI Service to Render

1. **Prepare Repository**
   - Go to https://github.com and sign in
   - Create new repository: `yt-study-deployment`
   - Make it public
   - Don't initialize with README

2. **Push Code to GitHub**
   Open PowerShell in `d:\yt_study` and run:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/yt-study-deployment.git
   git push -u origin main
   ```

3. **Deploy on Render**
   - Go to https://render.com and sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your `yt-study-deployment` repository
   - Configure service:
     - **Name**: `yt-study-ai-service`
     - **Region**: Singapore/Oregon (closest to you)
     - **Root Directory**: `ai-service`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node index.js`
     - **Instance Type**: Free

4. **Set Environment Variables**
   Click "Advanced" → Add these environment variables:
   ```
   GEMINI_API_KEY=AIzaSyA3JAhU5b-luS2hWolFc5ASe4km1ioY1Wg
   YOUTUBE_API_KEY=AIzaSyAgWk_cPh4uKEUppYW_YiqzKrePPq0NFhg
   PORT=5001
   NODE_ENV=production
   FRONTEND_URL=(leave blank for now, will update later)
   BACKEND_URL=(leave blank for now, will update later)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your service URL: `https://yt-study-ai-service.onrender.com`

**✅ Save AI Service URL!**

---

### Step 3: Deploy Backend to Render

1. **Create Another Web Service**
   - On Render dashboard, click "New +" → "Web Service"
   - Select same `yt-study-deployment` repository
   - Configure:
     - **Name**: `yt-study-backend`
     - **Region**: Same as AI service
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free

2. **Set Environment Variables**
   ```
   MONGO_URI=mongodb+srv://ytstudy-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/yt-study?retryWrites=true&w=majority
   JWT_SECRET=super-secret-jwt-key-change-this-in-production-2024
   GEMINI_API_KEY=AIzaSyA3JAhU5b-luS2hWolFc5ASe4km1ioY1Wg
   YOUTUBE_API_KEY=AIzaSyAgWk_cPh4uKEUppYW_YiqzKrePPq0NFhg
   AI_SERVICE_URL=https://yt-study-ai-service.onrender.com/api/ai
   FRONTEND_URL=(leave blank for now)
   PORT=5000
   NODE_ENV=production
   ```
   ⚠️ Replace `MONGO_URI` with YOUR actual MongoDB connection string!

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy your backend URL: `https://yt-study-backend.onrender.com`

**✅ Save Backend URL!**

---

### Step 4: Update CORS Settings

1. **Update AI Service Environment Variables**
   - Go to AI Service dashboard on Render
   - Settings → Environment
   - Update these variables:
     ```
     FRONTEND_URL=https://your-app-name.vercel.app
     BACKEND_URL=https://yt-study-backend.onrender.com
     ```
   - Save changes (service will auto-redeploy)

2. **Update Backend Environment Variables**
   - Go to Backend dashboard on Render
   - Settings → Environment
   - Update:
     ```
     FRONTEND_URL=https://your-app-name.vercel.app
     ```
   - Save changes

---

### Step 5: Deploy Frontend to Vercel

1. **Install Vercel CLI** (Optional but recommended)
   ```powershell
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (Recommended)
   - Go to https://vercel.com and sign up with GitHub
   - Click "Add New" → "Project"
   - Import `yt-study-deployment` repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     
3. **Set Environment Variables**
   Before deploying, add these in Vercel:
   ```
   VITE_API_URL=https://yt-study-backend.onrender.com
   VITE_AI_SERVICE_URL=https://yt-study-ai-service.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://yt-study-deployment.vercel.app`

**✅ Copy your Vercel URL!**

---

### Step 6: Final CORS Update

Now go back to Render and update the URLs you left blank:

1. **AI Service** → Environment Variables:
   ```
   FRONTEND_URL=https://yt-study-deployment.vercel.app
   ```

2. **Backend** → Environment Variables:
   ```
   FRONTEND_URL=https://yt-study-deployment.vercel.app
   ```

Both services will auto-redeploy (takes 2-3 minutes).

---

## 🎉 Your App is Live!

### Access Your Application:
**🌐 Main URL: `https://yt-study-deployment.vercel.app`**

This is your single link for students and users!

### Service URLs (for reference):
- Frontend: `https://yt-study-deployment.vercel.app`
- Backend: `https://yt-study-backend.onrender.com`
- AI Service: `https://yt-study-ai-service.onrender.com`
- Database: MongoDB Atlas (managed)

---

## ⚙️ Testing Your Deployment

1. **Open your Vercel URL**
2. **Register a new account**
3. **Log in**
4. **Try creating an automated course**:
   - Topic: "Python Programming"
   - Difficulty: Beginner
   - Videos: 5
5. **Test AI features**:
   - Generate quiz
   - Generate flashcards
   - Generate summary

---

## 🔍 Troubleshooting

### Common Issues:

1. **"Failed to fetch" errors**
   - Check if all services are running on Render
   - Verify environment variables are set correctly
   - Check Render logs for errors

2. **CORS errors**
   - Ensure FRONTEND_URL is set correctly in backend/AI service
   - Make sure URLs don't have trailing slashes

3. **Database connection errors**
   - Verify MongoDB connection string is correct
   - Check if IP whitelist includes 0.0.0.0/0
   - Ensure database user has correct permissions

4. **AI features not working**
   - Check Gemini API key is valid
   - Check YouTube API key is valid
   - Verify AI service is running

### View Logs:
- Render: Dashboard → Service → Logs tab
- Vercel: Dashboard → Project → Deployments → Function logs

---

## 📊 Free Tier Limits

### Render (Free Tier):
- ✅ 750 hours/month (enough for 2 services)
- ⚠️ Services spin down after 15 min of inactivity
- ⚠️ First request after inactivity takes 30-60 seconds
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from GitHub

### Vercel (Free Tier):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL certificates
- ✅ Instant cache invalidation
- ✅ Automatic preview deployments

### MongoDB Atlas (Free Tier):
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Good for small-medium projects

---

## 🔄 Updating Your App

When you make changes:

1. **Commit and push to GitHub**:
   ```powershell
   git add .
   git commit -m "Update: description of changes"
   git push
   ```

2. **Automatic Deployments**:
   - Vercel: Auto-deploys on every push
   - Render: Auto-deploys on every push

---

## 🎓 Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your domain (e.g., `ytstudy.com`)
3. Update DNS records as instructed
4. Update FRONTEND_URL in Render services

---

## 🔐 Security Recommendations

1. **Change JWT_SECRET** to a strong random string
2. **Enable rate limiting** (future enhancement)
3. **Monitor API usage** (Gemini/YouTube quotas)
4. **Backup MongoDB** regularly (Atlas has automated backups)

---

## 📈 Monitoring

### Check Service Health:
- **AI Service**: `https://yt-study-ai-service.onrender.com/health`
- **Backend**: `https://yt-study-backend.onrender.com/health`

Should return: `{"status":"ok"}`

---

## 💡 Tips

1. **Keep Services Awake**: Use a service like UptimeRobot to ping your services every 5 minutes
2. **Monitor Logs**: Check Render logs regularly for errors
3. **API Quotas**: Monitor Gemini API usage in Google Cloud Console
4. **Database**: Keep an eye on MongoDB Atlas storage usage

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password saved
- [ ] Connection string obtained
- [ ] Code pushed to GitHub repository
- [ ] AI Service deployed to Render with env variables
- [ ] Backend deployed to Render with env variables
- [ ] Frontend deployed to Vercel with env variables
- [ ] CORS settings updated with frontend URL
- [ ] All services tested and working
- [ ] Main Vercel URL shared with users

---

**🎉 Congratulations! Your YT Study app is now live and accessible to students worldwide!**

**Share this link: `https://yt-study-deployment.vercel.app`**

(Replace with your actual Vercel URL once deployed)
