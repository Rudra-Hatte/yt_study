const PrimarySDK = require('groq-sdk');
const { GoogleGenerativeAI: BackupSDK } = require('@google/generative-ai');
const apiKeyRotator = require('../config/apiKeyRotator');

const DEFAULT_PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_BACKUP_MODEL = 'gemini-2.5-flash';

function getPrimaryModel() {
  return String(process.env.PRIMARY_MODEL || '').trim() || DEFAULT_PRIMARY_MODEL;
}

function getBackupModel() {
  return String(process.env.BACKUP_MODEL || '').trim() || DEFAULT_BACKUP_MODEL;
}

function shouldMarkKeyAsFailed(error) {
  const msg = (error?.message || '').toLowerCase();
  return error?.status === 429 || msg.includes('rate limit') || msg.includes('quota');
}

async function chatPrimary({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000 }) {
  const apiKey = apiKeyRotator.getPrimaryKey();
  const client = new PrimarySDK({ apiKey });
  const model = getPrimaryModel();

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    if (shouldMarkKeyAsFailed(error)) {
      apiKeyRotator.markPrimaryKeyFailed(apiKey);
    }
    throw error;
  }
}

async function chatBackup({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000 }) {
  const apiKey = apiKeyRotator.getBackupKey();
  const client = new BackupSDK(apiKey);
  const modelName = getBackupModel();

  try {
    const model = client.getGenerativeModel({
      model: modelName
    });

    const result = await model.generateContent([
      `System Instructions:\n${systemPrompt}`,
      `User Prompt:\n${userPrompt}`
    ]);

    const text = result?.response?.text?.() || '';
    return text;
  } catch (error) {
    if (shouldMarkKeyAsFailed(error)) {
      apiKeyRotator.markBackupKeyFailed(apiKey);
    }
    throw error;
  }
}

async function chatWithFallback({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000 }) {
  let primaryError;

  try {
    const text = await chatPrimary({ systemPrompt, userPrompt, temperature, maxTokens });
    return { text, source: 'primary', model: getPrimaryModel() };
  } catch (error) {
    primaryError = error;
    console.warn('⚠️ Primary model call failed:', error?.message || 'Unknown error');
  }

  const backupAvailable = apiKeyRotator.getStats().backup.available > 0;
  if (!backupAvailable) {
    throw primaryError;
  }

  const text = await chatBackup({ systemPrompt, userPrompt, temperature, maxTokens });
  return { text, source: 'backup', model: getBackupModel() };
}

module.exports = {
  chatWithFallback
};