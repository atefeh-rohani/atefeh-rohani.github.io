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
    // We use the 'v1' stable endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will help us see exactly what the API is complaining about
      return res.status(200).json({ reply: `Error from Google: ${data.error.message}` });
    }

    // Checking if the response has the expected structure
    if (data.candidates && data.candidates[0].content) {
      const aiMessage = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiMessage });
    } else {
      res.status(200).json({ reply: "The AI returned an empty response. Check your API quota." });
    }

  } catch (error) {
    res.status(500).json({ reply: "Connection failed. Please try again later." });
  }
}
