export const generateDocs = async (req, res) => {
  try {
    const { project } = req.body;

    return res.json({
      success: true,

      readme: `# ${project.title}

${project.description}

## Features

- Authentication
- REST APIs
- Dashboard
- AI Powered

## Installation

npm install
npm run dev

`,

      architecture: `
Frontend
   ↓
Express API
   ↓
MongoDB
`,

      database: `
User
Project
Task
Notification
Conversation
Message
`,

      api: `
POST /login
POST /register
GET /projects
POST /tasks
PUT /tasks/:id
`,

      phases: [
        "Project Setup",
        "Authentication",
        "Core Features",
        "AI Integration",
        "Deployment",
      ],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};