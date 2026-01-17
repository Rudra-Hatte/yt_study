# YouTube Study Application - Quick Test Script for Windows
# This script helps you test the application in development mode

Write-Host "🚀 YouTube Study Application Test Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PREREQUISITES CHECKLIST:" -ForegroundColor Yellow
Write-Host "□ MongoDB running (local or Atlas)"
Write-Host "□ Google Gemini API Key"
Write-Host "□ YouTube Data API v3 Key"
Write-Host ""

Write-Host "🔧 SETUP INSTRUCTIONS:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Copy environment files:" -ForegroundColor White
Write-Host "   Copy-Item backend/.env.example backend/.env"
Write-Host "   Copy-Item ai-service/.env.example ai-service/.env"
Write-Host ""
Write-Host "2. Edit the .env files with your API keys:" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
Write-Host "   - YOUTUBE_API_KEY: Get from https://console.developers.google.com"
Write-Host "   - MONGO_URI: Your MongoDB connection string"
Write-Host ""

Write-Host "🚦 TESTING WORKFLOW:" -ForegroundColor Green
Write-Host ""
Write-Host "STEP 1: Start MongoDB (if using local instance)" -ForegroundColor White
Write-Host "   mongod --dbpath C:\data\db" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 2: Start Backend Services (in separate PowerShell windows):" -ForegroundColor White
Write-Host ""
Write-Host "PowerShell Window 1 - Backend API:" -ForegroundColor Cyan
Write-Host "   cd backend; npm run dev" -ForegroundColor Gray
Write-Host "   Expected: 'Server running on port 5000' + 'MongoDB Connected'" -ForegroundColor Green
Write-Host ""

Write-Host "PowerShell Window 2 - AI Service:" -ForegroundColor Cyan
Write-Host "   cd ai-service; npm run dev" -ForegroundColor Gray
Write-Host "   Expected: '🤖 AI Service running on port 5001'" -ForegroundColor Green
Write-Host ""

Write-Host "PowerShell Window 3 - Frontend:" -ForegroundColor Cyan
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "   Expected: 'Local: http://localhost:5173'" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 TEST SCENARIOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "A. Basic Health Checks:" -ForegroundColor White
Write-Host "   • Backend: http://localhost:5000/api/auth"
Write-Host "   • AI Service: http://localhost:5001/health"
Write-Host "   • Frontend: http://localhost:5173"
Write-Host ""

Write-Host "B. User Authentication Flow:" -ForegroundColor White
Write-Host "   1. Register new account at /register"
Write-Host "   2. Login with credentials at /login"
Write-Host "   3. Navigate to dashboard"
Write-Host ""

Write-Host "C. Course Creation (Manual):" -ForegroundColor White
Write-Host "   1. Go to 'Create Course' page"
Write-Host "   2. Fill in course details"
Write-Host "   3. Add YouTube video URLs"
Write-Host "   4. Test course creation"
Write-Host ""

Write-Host "D. Automated Course Generation:" -ForegroundColor White
Write-Host "   1. Go to 'Automated Course Generator'"
Write-Host "   2. Enter topic (e.g., 'JavaScript Basics')"
Write-Host "   3. Add 3-5 YouTube video URLs"
Write-Host "   4. Test full pipeline: transcript → structure → assessments"
Write-Host ""

Write-Host "E. AI Features Testing:" -ForegroundColor White
Write-Host "   • Summary generation: POST /api/ai/summary"
Write-Host "   • Quiz generation: POST /api/ai/quiz"
Write-Host "   • Flashcard creation: POST /api/ai/flashcards"
Write-Host "   • Course structuring: POST /api/ai/generate-course"
Write-Host ""

Write-Host "⚠️  COMMON ISSUES:" -ForegroundColor Red
Write-Host ""
Write-Host "• 'GEMINI_API_KEY not configured' → Check .env files"
Write-Host "• 'YouTube API key not configured' → Add YOUTUBE_API_KEY"
Write-Host "• 'MongoDB connection error' → Check MONGO_URI and database status"
Write-Host "• 'Failed to fetch transcript' → Video may not have captions"
Write-Host "• CORS errors → Ensure all services are running on correct ports"
Write-Host ""

Write-Host "🎯 RECOMMENDED TEST VIDEOS:" -ForegroundColor Blue
Write-Host "Use these YouTube videos for testing (have good transcripts):"
Write-Host "• JavaScript Crash Course: https://youtube.com/watch?v=hdI2bqOjy3c"
Write-Host "• React Tutorial: https://youtube.com/watch?v=Ke90Tje7VS0" 
Write-Host "• Node.js Basics: https://youtube.com/watch?v=fBNz5xF-Kx4"
Write-Host ""

Write-Host "✅ SUCCESS INDICATORS:" -ForegroundColor Green
Write-Host "□ All 3 services start without errors"
Write-Host "□ Frontend loads and navigation works"
Write-Host "□ User registration/login successful"
Write-Host "□ Course creation completes"
Write-Host "□ AI services generate summaries/quizzes"
Write-Host "□ Automated course generation pipeline works"
Write-Host ""

Write-Host "Happy testing! 🎉" -ForegroundColor Green