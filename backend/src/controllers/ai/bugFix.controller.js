import axios from "axios";

export const fixBug = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const prompt = `
You are a Senior Software Engineer.

Analyze the following code.

Return ONLY valid JSON.

Format:

{
  "bugs":[
    "..."
  ],
  "explanation":"...",
  "fixedCode":"...",
  "bestPractices":[
    "...",
    "..."
  ]
}

Code:

${code}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen3-coder",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "DevConnect",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    try {
      return res.json(JSON.parse(content));
    } catch {
      return res.json({
        bugs: ["AI returned non-JSON response"],
        explanation: content,
        fixedCode: content,
        bestPractices: [],
      });
    }
  } catch (err) {
    console.log(err.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "Bug fixing failed",
    });
  }
};