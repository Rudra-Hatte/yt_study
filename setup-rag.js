#!/usr/bin/env node

/**
 * RAG Setup and Initialization Script
 * Run this script to set up and test your RAG implementation
 */

const path = require('path');
const fs = require('fs');

console.log('🎯 RAG Setup and Initialization Script');
console.log('=====================================\n');

// Check if running from correct directory
const currentDir = process.cwd();
const expectedFiles = [
  'ai-service/package.json',
  'backend/package.json',
  'frontend/package.json'
];

const allFilesExist = expectedFiles.every(file => 
  fs.existsSync(path.join(currentDir, file))
);

if (!allFilesExist) {
  console.error('❌ Please run this script from the project root directory.');
  console.error('   Expected structure: ai-service/, backend/, frontend/');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Check for environment files
const envFiles = [
  'ai-service/.env',
  'backend/.env'
];

console.log('\n📋 Environment Configuration Check:');

envFiles.forEach(envFile => {
  const fullPath = path.join(currentDir, envFile);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${envFile} exists`);
    
    // Check for RAG-specific variables
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasOpenAI = content.includes('OPENAI_API_KEY');
    const hasGroq = content.includes('GROQ_API_KEY');
    const hasMongo = content.includes('MONGODB_URI');
    
    console.log(`   - OpenAI API Key: ${hasOpenAI ? '✅' : '⚠️  Missing'}`);
    console.log(`   - Groq API Key: ${hasGroq ? '✅' : '⚠️  Missing'}`);
    console.log(`   - MongoDB URI: ${hasMongo ? '✅' : '⚠️  Missing'}`);
    
    if (!hasOpenAI) {
      console.log('   📝 Add: OPENAI_API_KEY=your_openai_api_key_here');
    }
  } else {
    console.log(`⚠️  ${envFile} not found`);
    console.log(`   📝 Copy from ${envFile}.example and configure`);
  }
});

// Check package.json dependencies
console.log('\n📦 Dependency Check:');

const requiredDeps = {
  'ai-service': [
    'openai',
    'cosine-similarity', 
    'natural',
    'chromadb'
  ],
  'backend': [
    'openai',
    'cosine-similarity',
    'natural'
  ]
};

Object.entries(requiredDeps).forEach(([service, deps]) => {
  const packagePath = path.join(currentDir, service, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log(`\n${service}:`);
    deps.forEach(dep => {
      const isInstalled = installedDeps[dep];
      console.log(`  ${dep}: ${isInstalled ? '✅ ' + isInstalled : '❌ Missing'}`);
    });
  }
});

// Generate setup commands
console.log('\n🚀 Setup Commands:');
console.log('==================');

console.log('\n1. Install dependencies:');
console.log('   cd ai-service && npm install');
console.log('   cd ../backend && npm install');

console.log('\n2. Configure environment variables:');
console.log('   # Add to ai-service/.env and backend/.env:');
console.log('   OPENAI_API_KEY=your_openai_api_key_here');
console.log('   RAG_ENABLED=true');

console.log('\n3. Start services:');
console.log('   # Terminal 1: Backend');
console.log('   cd backend && npm run dev');
console.log('');
console.log('   # Terminal 2: AI Service');
console.log('   cd ai-service && npm run dev');
console.log('');
console.log('   # Terminal 3: Frontend');
console.log('   cd frontend && npm run dev');

console.log('\n4. Test RAG functionality:');
console.log('   # Health check');
console.log('   curl http://localhost:3001/api/rag/health');
console.log('');
console.log('   # Index sample content');
console.log('   curl -X POST http://localhost:3001/api/rag/index \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"videoId":"test123","title":"Sample Video","transcript":"Sample content for testing"}\'');
console.log('');
console.log('   # Search content');
console.log('   curl -X POST http://localhost:3001/api/rag/search \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"query":"sample content"}\'');

console.log('\n📚 API Endpoints:');
console.log('=================');
const endpoints = [
  'GET  /api/rag/health         - Service health check',
  'GET  /api/rag/stats          - RAG statistics',
  'POST /api/rag/index          - Index video content',
  'POST /api/rag/search         - Semantic search',
  'POST /api/rag/related        - Find related content',
  'POST /api/rag/recommend      - Learning recommendations',
  'POST /api/summary            - Enhanced summaries (enableRAG: true)',
  'POST /api/quiz               - Enhanced quizzes (enableRAG: true)',
  'POST /api/flashcards         - Enhanced flashcards (enableRAG: true)'
];

endpoints.forEach(endpoint => {
  console.log(`   ${endpoint}`);
});

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Configure OpenAI API key for embeddings');
console.log('2. Install missing dependencies');
console.log('3. Start all services');
console.log('4. Test RAG endpoints');
console.log('5. Index existing video content');
console.log('6. Enjoy enhanced AI-powered learning! 🚀');

console.log('\n📖 For detailed documentation, see:');
console.log('   - RAG_IMPLEMENTATION.md');
console.log('   - ai-service/services/rag/ (source code)');
console.log('   - backend/models/ (updated database models)');

console.log('\n✨ RAG Implementation Complete!');
console.log('   Your YouTube study platform now has enterprise-grade');
console.log('   retrieval-augmented generation capabilities! 🎉');

console.log('\n💡 Pro Tips:');
console.log('   - Start with small batches when indexing content');  
console.log('   - Monitor /api/rag/stats for indexing progress');
console.log('   - Use courseId to scope searches to specific courses');
console.log('   - Adjust similarity thresholds based on your content');

// Save setup log
const setupLog = {
  timestamp: new Date().toISOString(),
  projectRoot: currentDir,
  ragImplementationComplete: true,
  nextSteps: [
    'Configure OpenAI API key',
    'Install dependencies', 
    'Start services',
    'Test RAG functionality',
    'Index existing content'
  ]
};

fs.writeFileSync(
  path.join(currentDir, 'rag-setup.json'),
  JSON.stringify(setupLog, null, 2)
);

console.log('\n📄 Setup log saved to: rag-setup.json');
console.log('');