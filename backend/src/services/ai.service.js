export const generateWithAI = async (prompt) => {
  try {
    console.log("======================================");
    console.log("OPENROUTER KEY:");
    console.log(process.env.OPENROUTER_API_KEY?.substring(0, 20) + "...");
    console.log("======================================");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "DevConnect",
        },

        body: JSON.stringify({
  model: "qwen/qwen3-coder",

  messages: [
    {
      role: "system",
      content: `You are a Senior Software Architect.

Always respond ONLY with valid JSON.

Never use markdown.

Never use code fences.

Generate detailed software project roadmaps.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ],

  temperature: 0.3,
  max_tokens: 1000
}),
           
      }
    );

    const data = await response.json();

    console.log("========== OPENROUTER STATUS ==========");
    console.log(response.status);

    console.log("========== OPENROUTER RESPONSE ==========");
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(
        JSON.stringify(data.error || data)
      );
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.log("========== OPENROUTER ERROR ==========");
    console.error(err);
    throw err;
  }
};