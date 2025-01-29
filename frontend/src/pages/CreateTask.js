import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../styles/CreateTask.css"; // ★ 스타일 파일 임포트

function CreateTask() {
  const [content, setContent] = useState("");

  const handleCreateTask = async () => {
    try {
      await axiosInstance.post("/dashboard/create", { content });
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Failed to create task. Please try again.");
    }
  };

  return (
    <div className="create-task-container">
      <div className="create-task-card">
        <h1>Create a New Task</h1>
        <textarea
          placeholder="Task"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handleCreateTask}>Create Task</button>
      </div>
    </div>
  );
}

export default CreateTask;
