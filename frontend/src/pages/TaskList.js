import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../styles/taskList.css";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  // 할 일 가져오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("dashboard/");
        setTasks(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");
          window.location.href = "/home";
        } else {
          console.error("할 일 목록을 가져오는 데 실패했습니다:", error);
        }
      }
    };
    fetchTasks();
  }, []);

  // 완료 상태 토글
  const toggleComplete = async (taskId) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;

    try {
      // 서버에서는 isFinished 필드를 참조하므로 이것에 맞춤
      await axiosInstance.put(`/dashboard/complete/${taskId}`, {
        isFinished: !task.isFinished,
      });

      // 프론트엔드 상태도 isFinished로 반영
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.taskId === taskId ? { ...t, isFinished: !t.isFinished } : t
        )
      );
    } catch (error) {
      console.error("완료 상태 업데이트 실패:", error);
    }
  };

  // 할 일 삭제
  const deleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/dashboard/delete/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((t) => t.taskId !== taskId));
    } catch (error) {
      console.error("할 일 삭제 실패:", error);
    }
  };

  // 할 일 수정
  const updateTask = async (taskId) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;

    try {
      const updatedContent = prompt("새로운 할 일 내용을 입력하세요:", task.content);
      if (!updatedContent) return;

      // 서버가 수정된 전체 task 객체를 반환한다고 가정
      const response = await axiosInstance.put(`/dashboard/update/${taskId}`, {
        content: updatedContent,
      });

      // response.data 그대로가 수정된 할 일 정보
      const updatedTask = response.data;

      // 기존 상태에서 해당 task만 수정
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.taskId === taskId ? { ...t, content: updatedTask.content } : t
        )
      );
    } catch (error) {
      console.error("할 일 수정 실패:", error);
    }
  };

  return (
    <div className="todo-container">
      <h2 className="todo-title">Todo List</h2>
      {tasks.length > 0 ? (
        <ul className="todo-list">
          {tasks.map((task) => (
            <li
              key={task.taskId}
              className={`todo-item ${task.isFinished ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                checked={task.isFinished || false}
                onChange={() => toggleComplete(task.taskId)}
              />
              <span>{task.content}</span>
              <button className="delete-button" onClick={() => deleteTask(task.taskId)}>
                ❌
              </button>
              <button className="update-button" onClick={() => updateTask(task.taskId)}>
                Update
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>현재 할 일이 없습니다.</p>
      )}
    </div>
  );
}

export default TaskList;
