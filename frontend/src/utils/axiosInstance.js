import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://13.124.78.206:8080', // Express 서버 URL
  withCredentials: true, // 쿠키를 포함하기 위한 설정
  timeout: 5000, // 요청 제한 시간 (ms)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
