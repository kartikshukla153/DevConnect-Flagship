import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const reviewCode = async (req, res) => {
  try {
    const { code, language, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const prompt = `
You are a Senior Staff Software Engineer.

Review the following ${language || "code"}.

Filename:
${fileName || "Unknown"}

Return ONLY valid JSON.

Required JSON format:

{
  "score": 0,
  "summary": "",
  "bugs": [],
  "security": [],
  "performance": [],
  "readability": [],
  "bestPractices": [],
  "suggestions": [],
  "improvedCode": "",
  "verdict": ""
}

Code:

${code}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer. Always return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const review = JSON.parse(
      completion.choices[0].message.content
    );

    return res.json({
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "AI review failed",
    });
  }
};