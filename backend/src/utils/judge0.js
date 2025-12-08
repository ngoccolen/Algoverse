const axios = require('axios');
require('dotenv').config();

// Mapping ngôn ngữ từ Frontend sang ID của Judge0
const LANGUAGE_MAPPING = {
  javascript: 63, // Node.js 12.14.0
  python: 71,     // Python 3.8.1
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62        // Java (OpenJDK 13.0.1)
};

const DEFAULT_API_KEY = process.env.JUDGE0_API_KEY || '8e5927c3e8msh6836437a34657b9p127533jsn9e530d243506';
const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";

// Hàm giải mã Base64 
const decode = (str) => {
  if (!str) return "";
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch (e) {
    return str;
  }
};

// Hàm mã hóa Base64 
const encode = (str) => {
  if (!str) return "";
  try {
    return Buffer.from(str).toString('base64');
  } catch (e) {
    return str;
  }
};

/**
 * Gửi code lên Judge0 để chấm 
 */
const runSubmission = async (sourceCode, languageId, stdin = "") => {
  const headers = {
    'content-type': 'application/json',
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': DEFAULT_API_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  };

  try {
    // Gửi code để lấy Token
    const options = {
      method: 'POST',
      url: `${JUDGE0_API_URL}/submissions`,
      params: { base64_encoded: 'true', fields: '*' },
      headers: headers,
      data: {
        language_id: languageId,
        source_code: encode(sourceCode),
        stdin: encode(stdin),
        cpu_time_limit: 5, 
        memory_limit: 128000
      }
    };

    const response = await axios.request(options);
    const token = response.data.token;

    let result = null;
    let attempts = 0;
    
    while (attempts < 10) { 
      const checkOptions = {
        method: 'GET',
        url: `${JUDGE0_API_URL}/submissions/${token}`,
        params: { base64_encoded: 'true', fields: '*' }, 
        headers: headers
      };

      const checkResponse = await axios.request(checkOptions);
      result = checkResponse.data;

      if (result.status.id <= 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        continue;
      } else {
        break; 
      }
    }

    // Giải mã kết quả Base64 trả về
    return {
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      time: result.time,
      memory: result.memory,
      status: {
        id: result.status.id,
        description: result.status.description
      }
    };

  } catch (error) {
    console.error("❌ Judge0 Error Details:", error.response?.data || error.message);
    
    return {
      stdout: null,
      stderr: "Lỗi kết nối đến Judge0. Vui lòng thử lại sau.",
      status: { id: 13, description: "System Error" }
    };
  }
};

module.exports = { runSubmission, LANGUAGE_MAPPING };