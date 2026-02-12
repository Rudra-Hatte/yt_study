const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({ apiKey });
};

// Chat with AI Study Buddy using Groq
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message, context, courseId } = req.body;
    
    console.log('Chat request received:', { message, context, courseId });
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const client = getGroqClient();

    // Create context-aware system prompt
    let systemPrompt = `You are an AI Study Buddy - a helpful, encouraging, and knowledgeable learning assistant. Your role is to help students learn effectively by:

1. Providing clear explanations and examples
2. Breaking down complex topics into digestible parts
3. Suggesting study strategies and techniques
4. Motivating and encouraging learners
5. Answering questions about course content
6. Helping with learning difficulties

Guidelines:
- Be conversational and friendly
- Provide practical, actionable advice
- Use examples when explaining concepts
- Encourage active learning
- Keep responses concise but helpful (max 200 words)
- If you don't know something specific, be honest but still helpful

Context: ${context || 'General study help'}`;

    if (courseId) {
      systemPrompt += `\nCourse Context: Student is currently working on course ID ${courseId}`;
    }

    console.log('🤖 Calling Groq AI (Llama 3.3) for chat...');
    
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq chat response received successfully');

    res.json({ 
      success: true, 
      data: { 
        response: aiResponse,
        timestamp: new Date().toISOString()
      } 
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.status
    });
    
    // Check if it's a Groq API error
    let errorMessage = 'Failed to generate response';
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key configuration error. Please check your Groq API key.';
      statusCode = 503;
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'API rate limit exceeded. Please try again in a moment.';
      statusCode = 429;
    } else if (error.status === 400) {
      errorMessage = 'Invalid request to AI service.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};