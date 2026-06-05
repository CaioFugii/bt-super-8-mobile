import axios from 'axios';
import { API_URL } from '../config';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../storage/tokenStorage';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function setAccessToken(token: string | null) {
  if (token) {
    await setStoredToken(token);
  } else {
    await clearStoredToken();
  }
}

export async function getAccessToken() {
  return getStoredToken();
}
