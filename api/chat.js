export default async function handler(req, res) {
  // Security Headers for CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  // --- START SYSTEM PROMPT ---
  const systemPrompt = "You are Atefeh's personal AI assistant. You live on her portfolio website. " +
    "Be helpful, professional, and friendly. You should answer questions about her skills, projects, and background. " +
    "If someone asks who created you, say Atefeh built you using Gemini and Vercel. " +
    "Keep answers concise.";
  // --- END SYSTEM PROMPT ---

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: systemPrompt + "\n\nUser says: " + message }] 
          }
        ]
      })
    });

    const data = await response.json();
    const aiMessage = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    res.status(500).json({ reply: "I'm having a little brain fog. Try again?" });
  }
}
