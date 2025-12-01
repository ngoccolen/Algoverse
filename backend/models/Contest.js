const db = require('../src/db'); 

module.exports = {
  // 1. Lấy tất cả cuộc thi (Sắp xếp mới nhất lên đầu)
  getAll: async () => {
    const sql = `
      SELECT 
        id, 
        title, 
        description, 
        difficulty, 
        status, 
        participants, 
        prize, 
        start_time AS startTime, 
        end_time AS endTime
      FROM contests 
      ORDER BY start_time DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 2. Lấy chi tiết 1 cuộc thi theo ID
  getById: async (id) => {
    const sql = `
      SELECT 
        id, 
        title, 
        description, 
        difficulty, 
        status, 
        participants, 
        prize,
        start_time AS startTime, 
        end_time AS endTime
      FROM contests 
      WHERE id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  // 3. Tạo cuộc thi mới (Hỗ trợ cả ID thủ công từ CF hoặc ID tự tăng)
  create: async (data) => {
    // Logic: Nếu bạn truyền data.id vào (ví dụ 2062) -> Nó dùng ID đó.
    // Nếu bạn KHÔNG truyền data.id -> MySQL tự sinh ID mới (1, 2, 3...)
    const sql = `
      INSERT INTO contests 
        (id, title, description, start_time, end_time, difficulty, status, prize)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        status = VALUES(status),
        start_time = VALUES(start_time),
        end_time = VALUES(end_time)
    `;

    const params = [
      data.id || null, // Quan trọng: Null thì tự tăng, có số thì lấy số đó
      data.title,
      data.description,
      data.startTime, 
      data.endTime,   
      data.difficulty,
      data.status || 'upcoming',
      data.prize
    ];

    const [result] = await db.query(sql, params);
    
    // Trả về ID để Controller sử dụng
    return data.id || result.insertId;
  }
};