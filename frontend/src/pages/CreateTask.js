import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function CreateTask() {
  const [content, setContent] = useState("");

  const handleCreateTask = async () => {
    try {
      await axiosInstance.post("/dashboard/create", { content});
      //alert("Task created successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Failed to create task. Please try again.");
    }
  };

  return (
    <div>
      <h1>Create a New Task</h1>
      <textarea
        placeholder="Task"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleCreateTask}>Create Task</button>
    </div>
  );
}

export default CreateTask;
