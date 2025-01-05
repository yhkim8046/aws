class TaskServices {
    constructor(pool) {
        this.pool = pool;
    }

    async createTask(title, content, priority, req) {
        const userId = req.session?.user?.id;
        if (!userId) {
            throw new Error('User is not logged in');
        }

        const currentDate = new Date();

        // 오늘의 작업 가져오기
        const getTodayTasksQuery = `SELECT * FROM tasks WHERE date = ? AND userId = ?`;
        const [todayTasks] = await this.pool.query(getTodayTasksQuery, [currentDate, userId]);

        if (todayTasks.length >= 10) {
            throw new Error('Tasks cannot exceed 10 per day');
        }

        // 새로운 작업 추가
        const postTaskQuery = `
            INSERT INTO tasks (title, content, priority, date, userId)
            VALUES (?, ?, ?, ?, ?)
        `;
        await this.pool.query(postTaskQuery, [title, content, priority, currentDate, userId]);

        // 방금 추가한 작업 반환
        const [newTask] = await this.pool.query(
            `SELECT * FROM tasks WHERE userId = ? ORDER BY taskId DESC LIMIT 1`,
            [userId]
        );

        return newTask[0];
    }

    async completeTask(taskId, isFinished, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const updateTaskQuery = `
            UPDATE tasks 
            SET isFinished = ? 
            WHERE taskId = ? AND userId = ?
        `;
        const [result] = await this.pool.query(updateTaskQuery, [isFinished, taskId, userId]);

        if (result.affectedRows === 0) {
            throw new Error('Task not found or not authorized to update');
        }

        const [updatedTask] = await this.pool.query(
            `SELECT * FROM tasks WHERE taskId = ? AND userId = ?`,
            [taskId, userId]
        );

        return updatedTask[0];
    }

    async deleteTask(taskId, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const deleteQuery = `
            DELETE FROM tasks 
            WHERE taskId = ? AND userId = ?
        `;
        const [result] = await this.pool.query(deleteQuery, [taskId, userId]);

        if (result.affectedRows === 0) {
            throw new Error('Task not found or not authorized to delete');
        }

        return { message: 'Task deleted successfully' };
    }

    async getOneTask(taskId, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const getOneQuery = `
            SELECT *
            FROM tasks
            WHERE taskId = ? AND userId = ?
        `;
        const [rows] = await this.pool.query(getOneQuery, [taskId, userId]);

        if (rows.length === 0) {
            throw new Error('Task not found or not authorized to access');
        }

        return rows[0];
    }

    async getAllTasks(req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const getAllTasksQuery = `
            SELECT *
            FROM tasks
            WHERE userId = ?
        `;
        const [rows] = await this.pool.query(getAllTasksQuery, [userId]);

        return rows;
    }

    async getAllDailyTasks(date, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const getAllDailyTasksQuery = `
            SELECT *
            FROM tasks
            WHERE userId = ? AND date = ?
        `;
        const [rows] = await this.pool.query(getAllDailyTasksQuery, [userId, date]);

        return rows;
    }

    async updateTask(taskId, updates, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const fields = [];
        const values = [];

        Object.keys(updates).forEach((key) => {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(taskId, userId);

        const updateQuery = `
            UPDATE tasks
            SET ${fields.join(', ')}
            WHERE taskId = ? AND userId = ?
        `;
        const [result] = await this.pool.query(updateQuery, values);

        if (result.affectedRows === 0) {
            throw new Error('Task not found or not authorized to update');
        }

        const [updatedTask] = await this.pool.query(
            `SELECT * FROM tasks WHERE taskId = ? AND userId = ?`,
            [taskId, userId]
        );

        return updatedTask[0];
    }

    async sortByPriority(date, req) {
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const tasks = await this.getAllDailyTasks(date, req);

        const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);

        return sortedTasks;
    }
}

module.exports = TaskServices;
