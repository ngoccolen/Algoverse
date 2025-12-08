const db = require('../src/db'); 

module.exports = {
  //Lấy tất cả cuộc thi 
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

  // Lấy chi tiết 1 cuộc thi theo ID
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

  //Tạo cuộc thi mới 
  create: async (data) => {
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
      data.id || null, 
      data.title,
      data.description,
      data.startTime, 
      data.endTime,   
      data.difficulty,
      data.status || 'upcoming',
      data.prize
    ];

    const [result] = await db.query(sql, params);
    
    return data.id || result.insertId;
  }
};