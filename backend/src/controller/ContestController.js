// src/controller/ContestController.js
const Contest = require('../../models/Contest'); 
const Problem = require('../../models/Problem');
const db = require('../db'); // Thêm db để query bảng contest_participants
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer'); 

let isCrawling = false;

// =============================================
// CRAWLER (Hỗ trợ Bypass Cloudflare thủ công)
// =============================================
async function crawlAndSaveProblems(cfContestId, localContestId) {
  if (isCrawling) return;
  isCrawling = true;
  console.log(`🚀 [CRAWLER] Bắt đầu cào contest ${cfContestId}...`);
  
  let browser = null;
  try {
    const { data: cfData } = await axios.get(
        `https://codeforces.com/api/contest.standings?contestId=${cfContestId}&from=1&count=1`
    );
    
    if (cfData.status !== 'OK') return;
    const problems = cfData.result.problems;
    console.log(`📦 [CRAWLER] Tìm thấy ${problems.length} bài. Đang mở Chrome...`);

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
        console.log(`   ⏳ Đang vào bài ${p.index}... (HÃY NHÌN CỬA SỔ CHROME VỪA BẬT)`);
        await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });

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
            throw new Error("Không tìm thấy đề (Vẫn bị chặn hoặc trang lỗi)");
        }

        // Lưu DB
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
    console.error("❌ Lỗi tổng:", err.message);
  } finally {
    isCrawling = false;
    if (browser) await browser.close();
  }
}

// =============================================
// MAIN CONTROLLER
// =============================================
module.exports = {
  
  // 1. Lấy danh sách Contest
  getAll: async (req, res) => {
    try {
        const contests = await Contest.getAll();
        res.json({ success: true, contests });
    } catch (e) { 
        res.status(500).json({ error: "Lỗi lấy danh sách contest" }); 
    }
  },
  
  // 2. Tạo Contest mới
  create: async (req, res) => {
      try { 
          const id = await Contest.create(req.body); 
          res.json({success: true, id}); 
      } catch(e) { 
          res.status(500).json({ error: "Lỗi tạo contest" });
      }
  },

  // 3. Import từ Codeforces (API này để gọi thủ công nếu cần)
  importFromCodeforces: async (req, res) => { 
      // Logic import có thể viết sau, hiện tại để trống để tránh lỗi
      res.json({success: true, message: "Đang phát triển"}); 
  },

  // 4. Lấy chi tiết Contest (Kèm Logic Auto-Crawl)
  getDetail: async (req, res) => {
    try {
      const contestId = req.params.id;
      let contest = await Contest.getById(contestId);

      // Nếu chưa có contest trong DB -> Thử gọi Codeforces API để tạo vỏ
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

      // Lấy danh sách bài tập
      let problems = await Problem.getByContest(contestId);

      // [AUTO-CRAWL]: Nếu contest Codeforces mà chưa có bài -> Gọi cào
      if (problems.length === 0 && contest.source === 'codeforces') {
          crawlAndSaveProblems(contestId, contestId);
      }

      res.json({ success: true, contest, problems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  },

  // =============================================
  // CÁC HÀM MỚI CHO TÍNH NĂNG CONTEST THỰC TẾ
  // =============================================

  // 5. Đăng ký tham gia (Register)
  registerContest: async (req, res) => {
    try {
        const { contestId } = req.body;
        const userId = req.user.id; // Lấy từ verifyToken

        // Kiểm tra đã đăng ký chưa
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

  // 6. Kiểm tra trạng thái đăng ký
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

  // 7. Lấy Bảng Xếp Hạng (Leaderboard)
  getLeaderboard: async (req, res) => {
    try {
        const { id } = req.params; // contestId

        // Query lấy username, avatar, điểm, penalty
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
  }
};