import axios from "axios";

const API = "http://localhost:5000/api/algorithms";

export const getCategories = () => axios.get(`${API}/categories`);

export const getAlgorithmsByCategory = (categoryId) =>
  axios.get(`${API}/category/${categoryId}`);

export const getAlgorithm = (algKey) =>
  axios.get(`${API}/detail/${algKey}`);
