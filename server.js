const express = require('express');
const fs = require('fs');
const path = require('path');
const { syncAndSeedDatabase, Project, Skill, Message } = require('./backend/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// REST API ENDPOINTS
// ==========================================

// GET /api/projects - Fetch list of projects from database
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'ASC']]
    });
    return res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({ error: 'Internal server error while fetching projects.' });
  }
});

// GET /api/skills - Fetch list of skills from database
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    return res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    return res.status(500).json({ error: 'Internal server error while fetching skills.' });
  }
});

// POST /api/messages - Store a new visitor message in the database
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, content } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email ? email.trim() : null,
      content: content.trim()
    });

    // Also write to comment.txt for file-based logs (original behavior compatibility)
    const fileComment = `[${new Date().toISOString()}] Name: ${name} | Msg: ${content}\n`;
    fs.appendFile(path.join(__dirname, 'comment.txt'), fileComment, (err) => {
      if (err) console.error('Error writing backward-compatible comment file:', err);
    });

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error creating contact message:', err);
    return res.status(500).json({ error: 'Internal server error while saving message.' });
  }
});

// GET /api/messages - Retrieve public comments/messages for dynamic board
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15 // Only return recent comments
    });
    return res.json(messages);
  } catch (err) {
    console.error('Error fetching comments board:', err);
    return res.status(500).json({ error: 'Internal server error while loading comments board.' });
  }
});

// Legacy /save-comment route for backward compatibility with older pages
app.post('/save-comment', async (req, res) => {
  try {
    const rawComment = req.body.comment;
    if (!rawComment) {
      return res.status(400).send('Comment is required');
    }

    // Save to Message database model
    await Message.create({
      name: 'Anonymous Legacy Client',
      email: null,
      content: rawComment
    });

    // Save to comment.txt
    fs.appendFile(path.join(__dirname, 'comment.txt'), rawComment + '\n', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error saving comment');
      }
      return res.send('Comment saved successfully!');
    });
  } catch (err) {
    console.error('Legacy route error:', err);
    return res.status(500).send('Error saving comment');
  }
});

// Catch-all route serving the portfolio index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// DB SYNC & START SERVER
// ==========================================
async function startServer() {
  // 1. Sync database models and seed mock data if needed
  await syncAndSeedDatabase();

  // 2. Listen on Port
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Portfolio server running on http://localhost:${PORT}`);
    console.log(`📂 Serving static portfolio files from path: ${__dirname}`);
    console.log(`==================================================`);
  });
}

startServer();
