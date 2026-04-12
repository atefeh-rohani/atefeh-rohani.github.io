export default async function handler(req, res) {
  // 1. Get the user's message from the request
  const { message } = req.body;

  // 2. Call the Gemini API using your secret key
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }]
    })
  });

  const data = await response.json();
  
  // 3. Send the AI's answer back to your webpage
  const aiMessage = data.candidates[0].content.parts[0].text;
  res.status(200).json({ reply: aiMessage });
}
