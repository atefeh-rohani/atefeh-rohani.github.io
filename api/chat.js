export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. Parse the body safely
  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      body = {};
    }
  } else {
    body = req.body || {};
  }

  const message = body.message;

  if (!message) {
    return res.status(400).json({ reply: "Wait, I didn't catch that. What was your question?" });
  }

 try {
    // This calls the "ListModels" command the error mentioned
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const listData = await listResponse.json();
    
    // This will print the list of available models directly in your chat box
    if (listData.models) {
        const modelNames = listData.models.map(m => m.name.replace('models/', '')).join(', ');
        return res.status(200).json({ reply: "Available models: " + modelNames });
    } else {
        return res.status(200).json({ reply: "Could not list models. Check API Key." });
    }
} catch (err) {
    res.status(500).json({ reply: "Scanner failed." });
}

