// src/controller/ContestController.js
const Contest = require('../../models/Contest'); 
const Problem = require('../../models/Problem');
const db = require('../db'); 
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer'); 

// --- [MỚI] Import Judge0 để chạy code ---
const { runSubmission, LANGUAGE_MAPPING } = require('../utils/judge0');

let isCrawling = false;

// ============================================================
// 1. CRAWLER: CÀO ĐỀ TỪ CODEFORCES (Bypass Cloudflare)
// ============================================================
async function crawlAndSaveProblems(cfContestId, localContestId) {
  if (isCrawling) return;
  isCrawling = true;
  console.log(`🚀 [CRAWLER] Bắt đầu cào contest ${cfContestId}...`);
  
  let browser = null;
  try {
    // Lấy danh sách bài từ API
    const { data: cfData } = await axios.get(
        `https://codeforces.com/api/contest.standings?contestId=${cfContestId}&from=1&count=1`
    );
    
    if (cfData.status !== 'OK') return;
    const problems = cfData.result.problems;
    console.log(`📦 [CRAWLER] Tìm thấy ${problems.length} bài. Đang mở Chrome...`);

    // Khởi động Puppeteer
    browser = await puppeteer.launch({
        headless: false, 
        args: ['--start-maximized'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    
    for (const p of problems) {
      const problemUrl = `https://codeforces.com/contest/${cfContestId}/problem/${p.index}`;
      let contentHtml = "";
      
      try {
        console.log(`   ⏳ Đang vào bài ${p.index}...`);
        await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Chờ Bypass Cloudflare
        let retries = 0;
        while (retries < 20) {
            const title = await page.title();
            if (!title.includes("Just a moment") && !title.includes("Attention Required")) break;
            console.log(`      ⚠️ Đang bị chặn. Vui lòng BẤM CAPTCHA trên cửa sổ Chrome!`);
            await new Promise(r => setTimeout(r, 2000));
            retries++;
        }

        const pageContent = await page.content();
        const $ = cheerio.load(pageContent);

        if ($('.problem-statement').length > 0) {
            $('.problem-statement .header').remove();
            $('img').each((i, el) => {
                const src = $(el).attr('src');
                if (src && !src.startsWith('http')) $(el).attr('src', `https://codeforces.com${src}`);
                $(el).css('max-width', '100%');
            });
            contentHtml = $('.problem-statement').html();
            console.log(`   ✅ LẤY THÀNH CÔNG bài ${p.index}`);
        } else {
            throw new Error("Không lấy được nội dung HTML");
        }

        const externalId = `${cfContestId}${p.index}`;
        const problemId = await Problem.createOrUpdate({
            title: p.name,
            difficulty: p.rating ? (p.rating >= 1600 ? 'Hard' : 'Medium') : 'Easy',
            contentHtml: contentHtml,
            sampleInput: "", 
            sampleOutput: "",
            externalId: externalId,
            externalLink: problemUrl
        });

        await Problem.linkToContest(localContestId, problemId, p.index);
        
      } catch (err) {
        console.error(`   ❌ Lỗi bài ${p.index}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }

  } catch (err) {
    console.error("❌ Lỗi tổng Crawler:", err.message);
  } finally {
    isCrawling = false;
    if (browser) await browser.close();
  }
}

// ============================================================
// 2. MAIN CONTROLLER
// ============================================================
module.exports = {
  
  // --- PUBLIC: Lấy danh sách Contest ---
  getAll: async (req, res) => {
    try {
        const contests = await Contest.getAll();
        res.json({ success: true, contests });
    } catch (e) { 
        res.status(500).json({ error: "Lỗi lấy danh sách contest" }); 
    }
  },

  // --- PUBLIC: Lấy chi tiết Contest (Kèm Logic Auto-Crawl) ---
  getDetail: async (req, res) => {
    try {
      const contestId = req.params.id;
      let contest = await Contest.getById(contestId);

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

      if (problems.length === 0 && contest.source === 'codeforces') {
          crawlAndSaveProblems(contestId, contestId);
      }

      res.json({ success: true, contest, problems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  },

  // --- USER: Đăng ký tham gia ---
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

  // --- USER: Kiểm tra trạng thái đăng ký ---
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

  // --- USER: Xem Bảng Xếp Hạng ---
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

  // --- [MỚI] USER: Chạy Thử Code (Run Code) ---
  runContestCode: async (req, res) => {
    try {
        const { language, source, problemId } = req.body;
        
        // 1. Lấy Sample Input/Output từ DB
        const [rows] = await db.query(
            `SELECT sample_input, sample_output FROM problems WHERE id = ?`, 
            [problemId]
        );
        
        if (rows.length === 0) return res.status(404).json({ message: "Bài toán không tồn tại" });
        const problem = rows[0];

        // 2. Validate Ngôn ngữ
        const languageId = LANGUAGE_MAPPING[language];
        if (!languageId) return res.status(400).json({ message: "Ngôn ngữ không hỗ trợ" });

        // 3. Gửi sang Judge0 chấm (Chỉ chạy test mẫu)
        const result = await runSubmission(source, languageId, problem.sample_input || "");

        // 4. Trả về kết quả
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

  // --- ADMIN: Tạo Contest thủ công ---
  createContest: async (req, res) => {
    try {
        const { title, description, startTime, durationMinutes } = req.body;
        
        if (!title || !startTime || !durationMinutes) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        const [result] = await db.query(
            "INSERT INTO contests (title, description, start_time, end_time, status, source) VALUES (?, ?, ?, ?, 'upcoming', 'system')",
            [title, description, start, end]
        );

        res.json({ success: true, message: "Tạo cuộc thi thành công!", contestId: result.insertId });
    } catch (err) {
        console.error("Create Contest Error:", err);
        res.status(500).json({ message: "Lỗi tạo contest" });
    }
  },

  // --- ADMIN: Thêm bài tập vào Contest ---
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

  importFromCodeforces: async (req, res) => { 
      res.json({success: true, message: "Tính năng này đã được tích hợp vào getDetail (Auto-Crawl)"}); 
  },
  
  create: async (req, res) => {
      module.exports.createContest(req, res);
  }
};