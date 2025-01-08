const CustomError = require('../utils/customError');

class TaskServices {
  constructor(pool) {
    this.pool = pool;
  }

  // 할일 생성
  async createTask(title, content, priority, userId) {
    // 날짜(오늘) 기준으로 일일 10개 제한 예시
    const currentDate = new Date();

    const getTodayTasksQuery = `
      SELECT * FROM tasks
      WHERE date = ? AND userId = ?
    `;
    const [todayTasks] = await this.pool.query(getTodayTasksQuery, [currentDate, userId]);

    if (todayTasks.length >= 10) {
      throw new CustomError('Tasks cannot exceed 10 per day', 400);
    }

    // 새로운 할일 추가
    const postTaskQuery = `
      INSERT INTO tasks (title, content, priority, date, userId)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [insertResult] = await this.pool.query(postTaskQuery, [
      title, content, priority, currentDate, userId
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
    // 해당 taskId가 현재 user의 것인지 확인 & 업데이트
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
      throw new CustomError('Task not found or not authorized to delete', 404);
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
      ORDER BY date DESC, priority ASC
    `;
    const [rows] = await this.pool.query(getAllTasksQuery, [userId]);
    return rows;
  }

  // 특정 날짜의 할일 조회
  async getAllDailyTasks(date, userId) {
    const getAllDailyTasksQuery = `
      SELECT * FROM tasks
      WHERE userId = ? AND date = ?
      ORDER BY priority ASC
    `;
    const [rows] = await this.pool.query(getAllDailyTasksQuery, [userId, date]);
    return rows;
  }

  // 할일 수정(여러 필드 업데이트)
  async updateTask(taskId, updates, userId) {
    const fields = [];
    const values = [];

    // { title: '...', content: '...', priority: 3 } 처럼 들어온다고 가정
    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });

    if (fields.length === 0) {
      throw new CustomError('No fields to update', 400);
    }

    // WHERE 조건에 쓰일 파라미터도 추가
    values.push(taskId, userId);

    const updateQuery = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE taskId = ? AND userId = ?
    `;
    const [result] = await this.pool.query(updateQuery, values);

    if (result.affectedRows === 0) {
      throw new CustomError('Task not found or not authorized to update', 404);
    }

    const [updatedTask] = await this.pool.query(
      `SELECT * FROM tasks WHERE taskId = ? AND userId = ?`,
      [taskId, userId]
    );

    return updatedTask[0];
  }

  // 작업 우선순위 정렬 예시
  async sortByPriority(date, userId) {
    // 특정 날짜의 작업 가져와서 JS에서 소팅
    const tasks = await this.getAllDailyTasks(date, userId);
    return tasks.sort((a, b) => a.priority - b.priority);
  }
}

module.exports = TaskServices;
