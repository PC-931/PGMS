// services/api.js
import axios from 'axios';
import { User, RegisterData } from '../types';


//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if authenticated
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;