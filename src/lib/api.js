import axios from 'axios';
import { API_BASE } from './config';

const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export const errMsg = (err, fallback = 'Something went wrong') => err?.response?.data?.message || err?.message || fallback;

export default api;
