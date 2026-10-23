export function validateConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('\n⚠️  WARNING: GEMINI_API_KEY is not set in server/.env.');
    console.warn('   The server will start, but AI test case generation will require an API key.');
    console.warn('   Get a key for free at: https://aistudio.google.com/app/apikey\n');
    return;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  console.log('✅ Config OK - using model:', model);
}
