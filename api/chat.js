export default async function handler(req, res) {
  // 1. Headers for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Safety check for the message (Prevents "Unexpected end of input")
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(200).json({ reply: "I'm connected! Type something to start." });
    }

    const userMessage = req.body.message || "Hi";

    // 3. 2026 Model Name (Gemini 3 Flash)
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const systemInstruction = `
  You are the personal AI assistant for Atefeh Rohani. 
  Your goal is to answer questions about her career, research, and interests 
  using the following verified information:
  
  [START OF CV/WEBSITE DATA]
  ${process.env.MY_DATA} 
  [END OF DATA]

  Rules:
  1. Be professional and friendly.
  2. If a question is asked about something not in the data, say you don't know but offer to help them contact Atefeh.
  3. Keep answers concise.
`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  system_instruction: {
    parts: [{ text: systemInstruction }]
  },
  contents: [{ 
    parts: [{ text: userMessage }] 
  }]
})
    });

    const data = await response.json();

    if (data.error) {
      // If gemini-3 fails, we try the 2.5 stable fallback
      return res.status(200).json({ reply: `Google Error: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm thinking, but I can't find the words.";
    res.status(200).json({ reply: aiText });

  } catch (error) {
    res.status(200).json({ reply: "Bridge Error: " + error.message });
  }
}
