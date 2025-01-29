const CustomError = require('../utils/customError');

class TaskServices {
  constructor(pool) {
    this.pool = pool;
  }

  // 할일 생성
  async createTask(content, userId) {
    const getAllTasksQuery = `
      SELECT * FROM tasks
      WHERE userId = ?
    `;
    const [tasks] = await this.pool.query(getAllTasksQuery, [userId]);

    if (tasks.length >= 10) {
      throw new CustomError('Tasks cannot exceed 10 per day', 400);
    }

    // 새로운 할일 추가
    const postTaskQuery = `
      INSERT INTO tasks (content, userId)
      VALUES (?, ?)
    `;
    const [insertResult] = await this.pool.query(postTaskQuery, [
      content, userId
    ]);

    // 방금 추가한 할일을 SELECT
    const [newTask] = await this.pool.query(
      `SELECT * FROM tasks WHERE taskId = ?`,
      [insertResult.insertId]
    );

    return newTask[0];
  }

  // 할일 완료 여부 업데이트
  async completeTask(taskId, isFinished, userId) {
  
    const updateTaskQuery = `
      UPDATE tasks
      SET isFinished = ?
      WHERE taskId = ? AND userId = ?
    `;
    const [result] = await this.pool.query(updateTaskQuery, [isFinished, taskId, userId]);

    if (result.affectedRows === 0) {
      throw new CustomError('Task not found or not authorized to update', 404);
    }

    const [updatedTask] = await this.pool.query(
      `SELECT * FROM tasks WHERE taskId = ? AND userId = ?`,
      [taskId, userId]
    );
    return updatedTask[0];
  }

  // 할일 삭제
  async deleteTask(taskId, userId) {
    const deleteQuery = `
      DELETE FROM tasks
      WHERE taskId = ? AND userId = ?
    `;
    const [result] = await this.pool.query(deleteQuery, [taskId, userId]);

    if (result.affectedRows === 0) {
      throw new CustomError('Task not found', 404);
    }

    return { message: 'Task deleted successfully' };
  }

  // 특정 할일 조회
  async getOneTask(taskId, userId) {
    const getOneQuery = `
      SELECT * FROM tasks
      WHERE taskId = ? AND userId = ?
    `;
    const [rows] = await this.pool.query(getOneQuery, [taskId, userId]);

    if (rows.length === 0) {
      throw new CustomError('Task not found or not authorized to access', 404);
    }

    return rows[0];
  }

  // 모든 할일 조회
  async getAllTasks(userId) {
    const getAllTasksQuery = `
      SELECT * FROM tasks
      WHERE userId = ?
    `;
    const [rows] = await this.pool.query(getAllTasksQuery, [userId]);
    return rows;
  }

  // 할일 수정(여러 필드 업데이트)
  async updateTask(taskId, content, userId) {
      const updateTaskQuery = `
        UPDATE tasks
        SET content = ?
        WHERE taskId = ? AND userId = ?`;
  
      const [result] = await this.pool.query(updateTaskQuery, [content, taskId, userId]);
  
      if (result.affectedRows === 0) {
        throw new CustomError('Task not found or not authorized to update', 404);
      }
  
      const [updatedTask] = await this.pool.query(
        `SELECT * FROM tasks WHERE taskId = ? AND userId = ?`,
        [taskId, userId]
      );
  
      if (updatedTask.length === 0) {
        throw new CustomError('Updated task not found', 404);
      }
  
      return updatedTask[0];
  }
}

module.exports = TaskServices;
