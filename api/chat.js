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
    // 3. The most stable URL for 2026
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `Google Error: ${data.error.message}` });
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";
    res.status(200).json({ reply: aiMessage });

  } catch (error) {
    res.status(500).json({ reply: "My circuits are a bit fried. Can you try again?" });
  }
}
