export default async function handler(req, res) {
  // 1. Mandatory Headers for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Safely get the message
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const userMessage = body?.message || "Hi";

    // 3. The 2026 Stable URL (v1beta with the flash-latest suffix)
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();

    // 4. Detailed Error Reporting
    if (data.error) {
      return res.status(200).json({ 
        reply: `Google says: ${data.error.message} (Code: ${data.error.code})` 
      });
    }

    // 5. Send back the response
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm online, but I have no words!";
    res.status(200).json({ reply: aiText });

  } catch (error) {
    // If it hits here, something is wrong with the code itself
    console.error(error);
    res.status(200).json({ reply: "Bridge Error: " + error.message });
  }
}
