class taskServices{

    constructor(pool) {
        this.pool = pool;
    }

    async createTask(title, content, priority, req) {
        const userId = req.session?.user?.id;
        if (!userId) {
            throw new Error('User is not logged in');
        }
        
        const currentDate = new Date(); 
        const postTaskQuery = `
        INSERT INTO tasks (title, content, priority, date, userId)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`;
        const { rows } = await this.pool.query(postTaskQuery, [title, content, priority, currentDate, userId]);

    
        return rows[0]; // 반환값 수정
    }
    
    async completeTask(taskId, isFinished, req){
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const updateTaskQuery = 'UPDATE tasks SET isFinished = $1 WHERE taskId = $2 AND userId = $3 RETURNING *';

        const { rows } = await this.pool.query(updateTaskQuery, [isFinished, taskId, userId]);

        if (!rows.length) {
            throw new Error('Task not found or not authorized to update');
        }

        return rows[0];
    }

    async deleteTask(taskId, req){
        const userId = req.session?.user?.id;

        if (!userId) {
            throw new Error('User is not logged in');
        }

        const deleteQuery = 'DELETE from tasks where taskId = $1 AND userId =$2  RETURNING *`;';

        const {rows} = await this.pool.query(deleteQuery,[taskId,userId]);
        
        if (!rows.length) {
            throw new Error('Task not found or not authorized to delete');
        }

        return rows[0];
    }

    async getOneTask(taskId, req) {
        const userId = req.session?.user?.id;
    
        if (!userId) {
            throw new Error('User is not logged in');
        }
    
        // 단일 작업 가져오기
        const getOneQuery = `
            SELECT * 
            FROM tasks 
            WHERE taskId = $1 AND userId = $2`;
    
        const { rows } = await this.pool.query(getOneQuery, [taskId, userId]);
    
        if (!rows.length) {
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
            WHERE userId = $1`;
    
        const { rows } = await this.pool.query(getAllTasksQuery, [userId]);
    
        return rows; 
    }
    
    async updateTask(taskId, updates, req) {
        const userId = req.session?.user?.id;
    
        // 로그인 확인
        if (!userId) {
            throw new Error('User is not logged in');
        }
    
        // 업데이트할 필드를 동적으로 처리
        const fields = [];
        const values = [];
    
        Object.keys(updates).forEach((key, index) => {
            fields.push(`${key} = $${index + 1}`); // key = $1, key = $2 ...
            values.push(updates[key]); // 업데이트할 값 추가
        });
    
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
    
        values.push(taskId, userId); // taskId와 userId는 WHERE 절에 사용
    
        // 업데이트 쿼리 생성
        const updateQuery = `
            UPDATE tasks 
            SET ${fields.join(', ')} 
            WHERE taskId = $${fields.length + 1} AND userId = $${fields.length + 2}
            RETURNING *`;
    
        const { rows } = await this.pool.query(updateQuery, values);
    
        if (!rows.length) {
            throw new Error('Task not found or not authorized to update');
        }
    
        return rows[0]; // 업데이트된 작업 반환
    }
    
}

module.export = taskServices; 