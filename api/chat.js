export default async function handler(req, res) {
  // 1. Setup Security Headers (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. Check if the message exists
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ reply: "No message received." });
  }

  try {
    // 3. Call Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    // 4. Handle Gemini Errors (like invalid API key)
    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(500).json({ reply: `Gemini Error: ${data.error.message}` });
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't think of a response.";
    res.status(200).json({ reply: aiMessage });

  } catch (error) {
    console.error("Vercel Crash:", error);
    res.status(500).json({ reply: "The server crashed. Check Vercel logs." });
  }
}
