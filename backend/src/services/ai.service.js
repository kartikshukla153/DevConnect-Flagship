import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async (prompt) => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are DevConnect AI, an expert software engineer who helps developers write, debug, optimize and explain code. Keep answers concise, accurate and practical.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    throw new Error("AI request failed");
  }
};