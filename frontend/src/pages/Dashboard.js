import React from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TaskList from "./TaskList";

function Dashboard() {
  const navigate = useNavigate();

  const handleCreateTask = () => {
    navigate("/tasks/create"); // 할 일 생성 페이지로 이동
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/user/logout", {}, { withCredentials: true });
      if (response.status === 200) {
        alert("로그아웃 성공!");
        navigate("/home");
      }
    } catch (error) {
      console.error(error);
      alert("로그아웃 실패");
    }
  };

  return (
    <div className="container">
      <button onClick={handleCreateTask}>할 일 생성</button>
      <button onClick={handleLogout}>로그아웃</button>
      <TaskList /> {/* 할 일 목록을 표시 */}
    </div>
  );
}

export default Dashboard;
