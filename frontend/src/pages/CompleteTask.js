import React from "react";
import axiosInstance from "../axiosInstance";

function CompleteTask({ taskId }) {
  const handleCompleteTask = async () => {
    try {
      await axiosInstance.put(`dashboard/task/complete/${taskId}`, { isFinished: true });
      alert("Task marked as complete!");
    } catch (error) {
      alert("Failed to complete task. Please try again.");
    }
  };

  return <button onClick={handleCompleteTask}>Mark as Complete</button>;
}

export default CompleteTask;
