// controllers/ContestController.js

const Contest = require('../../models/Contest'); 
const Problem = require('../../models/Problem');
const db = require('../db'); 
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer'); 

const { runSubmission, LANGUAGE_MAPPING } = require('../utils/judge0');

// Hàm crawl dữ liệu (giữ nguyên nếu bạn đã có, hoặc comment lại nếu chưa dùng)
const crawlAndSaveProblems = async (contestId, externalId) => {
    // Logic crawl Codeforces của bạn ở đây...
    // Nếu chưa có, bạn có thể để trống hoặc bổ sung sau.
    console.log("Crawling problems for contest:", contestId);
};

module.exports = {
  
  getAll: async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contests ORDER BY start_time DESC");
        res.json({ success: true, contests: rows });
    } catch (e) { 
        res.status(500).json({ error: "Lỗi lấy danh sách contest" }); 
    }
  },

  // --- [UPDATED] Lấy chi tiết cuộc thi + Trạng thái bài làm ---
  getDetail: async (req, res) => {
    try {
      const contestId = req.params.id;
      // Lấy ID người dùng hiện tại (nếu đã đăng nhập)
      const userId = req.user ? req.user.id : null; 

      let contest = await Contest.getById(contestId);

      // Logic tự động import từ Codeforces (nếu chưa có trong DB)
      if (!contest) {
         try {
            const { data } = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
            if (data.status === 'OK') {
                await Contest.create({
                    id: data.result.contest.id,
                    title: data.result.contest.name,
                    startTime: new Date(data.result.contest.startTimeSeconds * 1000),
                    endTime: new Date((data.result.contest.startTimeSeconds + data.result.contest.durationSeconds) * 1000),
                    status: "finished",
                    description: "Imported from Codeforces",
                    source: "codeforces"
                });
                contest = await Contest.getById(contestId);
            }
         } catch(e) { 
             return res.status(404).json({error: "Contest not found"}); 
         }
      }

      let problems = await Problem.getByContest(contestId);

      // Auto-crawl nếu là contest Codeforces và chưa có bài
      if (problems.length === 0 && contest.source === 'codeforces') {
          // Lưu ý: Đảm bảo hàm này đã được định nghĩa hoặc import
          if (typeof crawlAndSaveProblems === 'function') {
              await crawlAndSaveProblems(contestId, contestId);
              problems = await Problem.getByContest(contestId); // Load lại sau khi crawl
          }
      }

      // --- [NEW LOGIC] Map trạng thái làm bài của User ---
      if (userId && problems.length > 0) {
          // Lấy tất cả submission của user trong contest này
          const [submissions] = await db.query(`
              SELECT problem_id, status, source_code 
              FROM submissions 
              WHERE user_id = ? AND contest_id = ?
              ORDER BY id DESC
          `, [userId, contestId]);

          problems = problems.map(prob => {
              // 1. Tìm xem đã Accepted bài này chưa?
              const solvedSub = submissions.find(s => s.problem_id === prob.id && s.status === 'Accepted');
              
              // 2. Nếu chưa, lấy bài nộp mới nhất (để hiện code dở dang)
              const latestSub = submissions.find(s => s.problem_id === prob.id);
              
              let status = null;
              let user_code = null;

              if (solvedSub) {
                  status = 'Accepted';
                  user_code = solvedSub.source_code;
              } else if (latestSub) {
                  status = latestSub.status;
                  user_code = latestSub.source_code;
              }

              return {
                  ...prob,
                  status: status,      // 'Accepted', 'Wrong Answer', ...
                  user_code: user_code // Code để fill vào editor
              };
          });
      }
      // ----------------------------------------------------

      res.json({ success: true, contest, problems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  },

  registerContest: async (req, res) => {
    try {
        const { contestId } = req.body;
        const userId = req.user.id; 

        const [existing] = await db.query(
            "SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?", 
            [contestId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Bạn đã đăng ký rồi!" });
        }

        await db.query(
            "INSERT INTO contest_participants (contest_id, user_id) VALUES (?, ?)", 
            [contestId, userId]
        );

        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  checkRegistration: async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?", 
            [req.params.id, req.user.id]
        );
        res.json({ registered: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: "Error checking registration" });
    }
  },

  // Xem Bảng Xếp Hạng ---
  getLeaderboard: async (req, res) => {
    try {
        const { id } = req.params; 

        const [rows] = await db.query(`
            SELECT u.username, u.avatar, p.score, p.penalty
            FROM contest_participants p
            JOIN users u ON p.user_id = u.id
            WHERE p.contest_id = ?
            ORDER BY p.score DESC, p.penalty ASC
        `, [id]);

        res.json({ success: true, leaderboard: rows });
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ success: false, message: "Lỗi tải BXH" });
    }
  },

  // Chạy Thử Code 
  runCode: async (req, res) => {
    try {
        const { language, source, problemId } = req.body;
        // Lấy Sample Input/Output từ DB
        const [rows] = await db.query(
            `SELECT sample_input, sample_output FROM problems WHERE id = ?`, 
            [problemId]
        );
        
        if (rows.length === 0) return res.status(404).json({ message: "Bài toán không tồn tại" });
        const problem = rows[0];
        const languageId = LANGUAGE_MAPPING[language];
        if (!languageId) return res.status(400).json({ message: "Ngôn ngữ không hỗ trợ" });
        // Gửi sang Judge0 chấm 
        const result = await runSubmission(source, languageId, problem.sample_input || "");
        // Trả về kết quả
        res.json({
            success: true,
            status: result.status.description,
            stdout: result.stdout ? result.stdout.trim() : "",
            stderr: result.stderr,
            compile_output: result.compile_output,
            expected_output: problem.sample_output ? problem.sample_output.trim() : "",
            time: result.time,
            memory: result.memory
        });

    } catch (error) {
        console.error("Run Code Error:", error);
        res.status(500).json({ message: "Lỗi server khi chạy thử code" });
    }
  },

  createContest: async (req, res) => {
    try {
        const { title, description, startTime, durationMinutes } = req.body;
        
        if (!title || !startTime || !durationMinutes) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        const [result] = await db.query(
            "INSERT INTO contests (title, description, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)",
            [title, description, start, end, 'upcoming']
        );

        res.json({ success: true, message: "Tạo cuộc thi thành công!", contestId: result.insertId });
    } catch (err) {
        console.error("Create Contest Error:", err);
        res.status(500).json({ message: "Lỗi tạo contest" });
    }
  },

  addProblemToContest: async (req, res) => {
    try {
        const { contestId, problemId, index, points } = req.body;
        
        if (!contestId || !problemId || !index) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }

        const [exists] = await db.query(
            "SELECT * FROM contest_problems WHERE contest_id = ? AND problem_id = ?",
            [contestId, problemId]
        );

        if (exists.length > 0) {
            return res.status(400).json({ message: "Bài tập này đã có trong cuộc thi!" });
        }
        
        await db.query(
            "INSERT INTO contest_problems (contest_id, problem_id, problem_index, points) VALUES (?, ?, ?, ?)",
            [contestId, problemId, index, points || 100]
        );

        res.json({ success: true, message: "Đã thêm bài vào contest" });
    } catch (err) {
        console.error("Add Problem Error:", err);
        res.status(500).json({ message: "Lỗi thêm bài tập" });
    }
  },
  
  update: async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startTime, durationMinutes, status } = req.body;
        
        if (!id) return res.status(400).json({ message: "Thiếu Contest ID" });

        let query = "UPDATE contests SET title=?, description=?, status=?";
        let params = [title, description, status];
        
        if (startTime) {
            const start = new Date(startTime);
            params.push(start);
            query += ", start_time=?";
            
            if (durationMinutes) {
                const end = new Date(start.getTime() + durationMinutes * 60000);
                params.push(end);
                query += ", end_time=?";
            }
        }
        
        query += " WHERE id=?";
        params.push(id);

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Contest không tồn tại hoặc không có gì thay đổi." });
        }
        
        res.json({ success: true, message: "Đã cập nhật Contest thành công." });
    } catch (err) {
        console.error("Update Contest Error:", err);
        res.status(500).json({ message: "Lỗi cập nhật Contest" });
    }
  },

  deleteContest: async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query("DELETE FROM contest_problems WHERE contest_id = ?", [id]);
        await db.query("DELETE FROM contest_participants WHERE contest_id = ?", [id]);

        const [result] = await db.query("DELETE FROM contests WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Contest không tồn tại." });
        }
        
        res.json({ success: true, message: "Đã xóa Contest thành công." });
    } catch (err) {
        console.error("Delete Contest Error:", err);
        res.status(500).json({ message: "Lỗi xóa Contest" });
    }
  },

  importFromCodeforces: async (req, res) => { 
      res.json({success: true, message: "Tính năng này đã được tích hợp vào getDetail (Auto-Crawl)"}); 
  },
  
  create: async (req, res) => {
      module.exports.createContest(req, res);
  }
};