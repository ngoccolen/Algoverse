const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before importing controllers and routes.
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');

const authRoutes = require('./routes/auth');
const algorithmRoutes = require('./routes/algorithm');
const practiceRoutes = require('./routes/practiceRoutes');
const contestRoutes = require('./routes/contestRoutes');
const problemRoutes = require('./routes/problemRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progress');
const learningPathRoutes = require('./routes/learningPathRoutes');
const chatRoutes = require('./routes/chatRoutes');
const submissionController = require('./controller/submissionController');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key_mac_dinh',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'algoverse-backend',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/submissions', submissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/chat', chatRoutes);
app.post('/api/submissions/submit', submissionController.submitCode);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_HOST || 'localhost'}`);
});

module.exports = app;
