import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/Login.css"; // CSS 파일 임포트

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 서버와 통신하여 로그인
  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("user/login", { email, password });
      if (response.status === 200) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(error.response.data.message || "로그인 실패");
      } else {
        alert("로그인 도중 에러가 발생했습니다.");
      }
    }
  };

  return (
    <div className="login-container">
      {/* 카드 형태의 박스 */}
      <div className="login-card">
        <h1>로그인</h1>
        
        <div className="input-group">
          <label>이메일</label>
          <input
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button className="login-button" onClick={handleLogin}>
          로그인
        </button>
        
        <div className="link-group">
          <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
