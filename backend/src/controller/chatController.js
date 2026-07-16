// controller/chatController.js
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Bạn là AlgoBot - trợ lý AI thông minh của nền tảng Algoverse, chuyên hỗ trợ sinh viên học thuật toán và lập trình.

Quy tắc:
1. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.
2. Khi giải thích thuật toán, dùng ví dụ cụ thể với số liệu minh họa.
3. Khi được hỏi về code, cung cấp code mẫu bằng ngôn ngữ người dùng yêu cầu (mặc định là Python).
4. Nếu người dùng hỏi lời giải bài tập, hãy gợi ý hướng giải trước, KHÔNG đưa code đáp án ngay. Chỉ đưa code khi người dùng yêu cầu rõ ràng.
5. Sử dụng emoji phù hợp để câu trả lời sinh động hơn.
6. Format code bằng markdown code block với tên ngôn ngữ.
7. Nếu câu hỏi không liên quan đến lập trình/thuật toán, hãy trả lời lịch sự và hướng người dùng quay lại chủ đề.

Các chủ đề bạn giỏi: Sorting (Bubble, Selection, Insertion, Merge, Quick, Counting Sort), Searching (Linear, Binary Search), Graph (BFS, DFS), Data Structures (Stack, Queue, Linked List, Tree, Hash Table), Recursion, Dynamic Programming, Two Pointers, Greedy, và các bài tập trên Algoverse.`;

module.exports = {
  chat: async (req, res) => {
    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'GEMINI_API_KEY chưa được cấu hình trong file .env'
        });
      }

      const { message, history = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống.' });
      }

      // Build conversation contents for Gemini API
      const contents = [];

      // Add system instruction as first user-model pair
      contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Xin chào! Mình là AlgoBot, trợ lý AI của Algoverse. Mình sẵn sàng giúp bạn học thuật toán và lập trình. Hãy hỏi mình bất cứ điều gì nhé! 🚀' }]
      });

      // Add conversation history
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        return res.status(500).json({ success: false, message: 'Không nhận được phản hồi từ AI.' });
      }

      res.json({ success: true, reply: reply });

    } catch (err) {
      console.error('❌ Chat AI Error:', err.response?.data || err.message);

      if (err.response?.status === 429) {
        return res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài giây.' });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi kết nối AI. Vui lòng thử lại sau.'
      });
    }
  }
};
