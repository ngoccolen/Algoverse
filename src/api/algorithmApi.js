import axios from "axios";
import API_BASE_URL from "../config";

const API = `${API_BASE_URL}/api/algorithms`;

export const getCategories = () => axios.get(`${API}/categories`);

export const getAlgorithmsByCategory = (categoryId) =>
  axios.get(`${API}/category/${categoryId}`);

export const getAlgorithm = (algKey) =>
  axios.get(`${API}/detail/${algKey}`);
