import axios from "axios";

export const reviewCode = async (req, res) => {
  try {
    const { filename, code } = req.body;

    if (!filename || !code) {
      return res.status(400).json({
        success: false,
        message: "filename and code are required",
      });
    }

    const prompt = `
You are a Google Staff Software Engineer.

Review the following production code.

Filename:
${filename}

Code:
${code}

Return ONLY valid JSON.

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "issues": [],
  "improvements": [],
  "improvedCode": ""
}
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
        max_tokens: 2500,
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

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        score: 0,
        summary: content,
        strengths: [],
        issues: [],
        improvements: [],
        improvedCode: "",
      };
    }

    res.json(parsed);
  } catch (err) {
    console.log(err.response?.data || err);

    res.status(500).json({
      success: false,
      message: "AI Review failed",
    });
  }
};