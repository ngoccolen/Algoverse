import API_BASE_URL from '../config';

const getHeaders = (includeJson = false) => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/learning-path${path}`, {
    ...options,
    headers: { ...getHeaders(Boolean(options.body)), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Không thể kết nối đến máy chủ.');
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
};

export const saveSurvey = (profile) => request('/survey', {
  method: 'POST',
  body: JSON.stringify({ profile })
});

export const generateLearningPath = (profile) => request('/generate', {
  method: 'POST',
  body: JSON.stringify({ profile })
});

export const getMyLearningPath = () => request('/me');

export const updateLearningPathStep = (stepId, status) => request(`/steps/${stepId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status })
});
