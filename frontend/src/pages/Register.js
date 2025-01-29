import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../styles/Register.css"; // ★ Register.css 임포트

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    // 간단 유효성 검사
    if (!email || !password || !confirm) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 회원가입 요청
      const response = await axiosInstance.post(
        "http://localhost:8080/user/register",
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        alert("회원가입 성공!");
        // 회원가입 후 로그인 페이지로 이동
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(error.response.data.message || "회원가입 실패");
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="register-container">
      {/* 카드 형태 박스 */}
      <div className="register-card">
        <h1>회원가입</h1>

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

        <div className="input-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button className="register-button" onClick={handleRegister}>
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Register;
