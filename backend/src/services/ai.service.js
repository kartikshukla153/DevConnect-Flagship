export const generateWithAI = async (prompt) => {
  try {
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
              content: `
You are a Senior Software Architect.

Return ONLY valid JSON.

Never use markdown.
Never use code blocks.
Never explain anything.

Generate software project architecture.

The JSON MUST include ALL of these fields:

{
"title":"",
"description":"",
"overview":"",
"techStack":[],
"estimatedWeeks":0,
"difficulty":"",
"githubRepo":"https://github.com/<owner>/<repo>",
"liveLink":"",
"rolesNeeded":[],
"tasks":[]
}

Rules:

1. githubRepo MUST ALWAYS contain a realistic GitHub URL.

Example:

https://github.com/facebook/react

or

https://github.com/vercel/next.js

or

https://github.com/your-org/project-name

Never leave githubRepo empty.

Never omit githubRepo.
              `,
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.3,
          max_tokens: 1800,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};