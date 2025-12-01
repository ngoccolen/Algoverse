const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../src/db"); // Đường dẫn đã sửa
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName;

        // Kiểm tra user trong database
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        let user;

        // Nếu chưa có user -> tạo mới
        if (rows.length === 0) {
          const [insert] = await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, '')",
            [username, email]
          );

          user = {
            id: insert.insertId,
            username,
            email,
          };
        } else {
          user = rows[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize
passport.deserializeUser(async (id, done) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  done(null, rows[0]);
});

module.exports = passport;
