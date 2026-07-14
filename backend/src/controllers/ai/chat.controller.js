import axios from "axios";

export const chatWithProject = async (req, res) => {
  console.log("🔥 CHAT CONTROLLER STARTED");

  try {
    const { message, projectId } = req.body;

    console.log("Project:", projectId);
    console.log("Message:", message);

    const prompt = `
You are a Senior Staff Software Engineer.

Project ID:
${projectId}

Task:
${message}

IMPORTANT:

Return ONLY valid JSON.

Do NOT wrap JSON in markdown.

Do NOT write explanations.

Return exactly this structure:

{
  "files":[
    {
      "filename":"middleware/auth.js",
      "description":"JWT middleware",
      "code":"..."
    }
  ]
}
`;

    console.log("📤 Sending request to OpenRouter...");

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
        max_tokens: 3000,
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

    let content = response.data.choices[0].message.content;

    console.log("========== RAW AI ==========");
    console.log(content);
    console.log("============================");

    // Remove ```json ... ```
    content = content.replace(/```json/g, "");
    content = content.replace(/```/g, "").trim();

    // Extract JSON object if AI wrote extra text
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.log("❌ JSON PARSE FAILED");
      console.log(e);

      parsed = {
        files: [
          {
            filename: "generated.txt",
            description: "Raw AI Response",
            code: content,
          },
        ],
      };
    }

    console.log("✅ Parsed Files:", parsed.files?.length);

    return res.json(parsed);
  } catch (err) {
    console.log("❌ AI CHAT ERROR");
    console.log(err.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
};