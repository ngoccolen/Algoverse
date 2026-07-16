// backend/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('../config/passport');
const path = require('path'); // <--- [THÊM 1]: Import thư viện path

// ... Các import routes giữ nguyên ...
const authRoutes = require('./routes/auth');
const algorithmRoutes = require('./routes/algorithm');
const practiceRoutes = require('./routes/practiceRoutes');
const contestRoutes = require('./routes/contestRoutes');
const problemRoutes = require('./routes/problemRoutes');
const postRoutes = require('./routes/postRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const submissionController = require('./controller/submissionController'); 
const submissionRoutes = require('./routes/submissionRoutes');
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [THÊM 2]: Cấu hình để hiển thị ảnh từ thư mục uploads
// Giả sử app.js nằm trong folder src, thì uploads nằm ngoài src nên dùng '../uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/submissions', submissionRoutes);

// ... Phần session và passport giữ nguyên ...
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key_mac_dinh",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes); 

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);
app.post('/api/submissions/submit', submissionController.submitCode);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại cổng: ${PORT}`);
    console.log(`🔗 Database: ${process.env.DB_HOST || 'localhost'}`);
});