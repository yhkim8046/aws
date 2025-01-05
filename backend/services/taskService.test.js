const TaskServices = require('./taskService');
const { Pool } = require('pg');

jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
    };
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(() => mClient),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('TaskServices', () => {
    let taskServices;
    let mockPool;
    let mockReq;

    beforeEach(() => {
        mockPool = new Pool();
        taskServices = new TaskServices(mockPool);

        mockReq = {
            session: {
                user: {
                    id: 'user123',
                },
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createTask should insert a new task and return the created task', async () => {
        const taskData = {
            title: 'Test Task',
            content: 'This is a test task',
            priority: 1,
        };
        const mockTask = { ...taskData, taskId: 1, date: new Date(), userId: 'user123' };

        mockPool.query.mockResolvedValueOnce({ rows: [mockTask] });

        const result = await taskServices.createTask(taskData.title, taskData.content, taskData.priority, mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO tasks'),
            expect.any(Array)
        );
        expect(result).toEqual(mockTask);
    });

    test('completeTask should update task status and return the updated task', async () => {
        const mockTask = { taskId: 1, isFinished: true };
        mockPool.query.mockResolvedValueOnce({ rows: [mockTask] });

        const result = await taskServices.completeTask(1, true, mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE tasks SET isFinished'),
            [true, 1, 'user123']
        );
        expect(result).toEqual(mockTask);
    });

    test('deleteTask should remove the task and return the deleted task', async () => {
        const mockTask = { taskId: 1, title: 'Task to delete' };
        mockPool.query.mockResolvedValueOnce({ rows: [mockTask] });

        const result = await taskServices.deleteTask(1, mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM tasks'), // 수정된 문자열 비교
            [1, 'user123']
        );
        expect(result).toEqual(mockTask);
    });

    test('getOneTask should return the task if it exists', async () => {
        const mockTask = { taskId: 1, title: 'Test Task', userId: 'user123' };
        mockPool.query.mockResolvedValueOnce({ rows: [mockTask] });

        const result = await taskServices.getOneTask(1, mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE taskId = $1 AND userId = $2'), // 수정된 문자열 비교
            [1, 'user123']
        );
        expect(result).toEqual(mockTask);
    });

    test('getAllTasks should return all tasks for the user', async () => {
        const mockTasks = [
            { taskId: 1, title: 'Task 1', userId: 'user123' },
            { taskId: 2, title: 'Task 2', userId: 'user123' },
        ];
        mockPool.query.mockResolvedValueOnce({ rows: mockTasks });

        const result = await taskServices.getAllTasks(mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE userId = $1'), // 수정된 문자열 비교
            ['user123']
        );
        expect(result).toEqual(mockTasks);
    });

    test('getAllDailyTasks should return tasks for a specific date', async () => {
        const mockTasks = [
            { taskId: 1, title: 'Task 1', date: '2024-12-30', userId: 'user123' },
            { taskId: 2, title: 'Task 2', date: '2024-12-30', userId: 'user123' },
        ];
        const date = '2024-12-30';
        
        // 반환값 수정
        mockPool.query.mockResolvedValueOnce({ rows: mockTasks });
    
        const result = await taskServices.getAllDailyTasks(date, mockReq);
    
        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE userId = $1 AND date = $2'), 
            ['user123', date]
        );
        expect(result).toEqual(mockTasks); // mockTasks와 동일한지 확인
    });
    

    test('updateTask should modify the task and return the updated task', async () => {
        const updates = { title: 'Updated Task', priority: 2 };
        const mockTask = { taskId: 1, title: 'Updated Task', priority: 2, userId: 'user123' };
        mockPool.query.mockResolvedValueOnce({ rows: [mockTask] });

        const result = await taskServices.updateTask(1, updates, mockReq);

        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE tasks'), // 수정된 문자열 비교
            [updates.title, updates.priority, 1, 'user123']
        );
        expect(result).toEqual(mockTask);
    });

    test('sortByPriority should return tasks sorted by priority for a specific date', async () => {
        const mockTasks = [
            { taskId: 1, title: 'Task 1', priority: 3, date: '2024-12-30' },
            { taskId: 2, title: 'Task 2', priority: 1, date: '2024-12-30' },
            { taskId: 3, title: 'Task 3', priority: 2, date: '2024-12-30' },
        ];
        const sortedTasks = [
            { taskId: 2, title: 'Task 2', priority: 1, date: '2024-12-30' },
            { taskId: 3, title: 'Task 3', priority: 2, date: '2024-12-30' },
            { taskId: 1, title: 'Task 1', priority: 3, date: '2024-12-30' },
        ];
        const date = '2024-12-30';

        jest.spyOn(taskServices, 'getAllDailyTasks').mockResolvedValueOnce(mockTasks);

        const result = await taskServices.sortByPriority(date, mockReq);

        expect(taskServices.getAllDailyTasks).toHaveBeenCalledWith(date, mockReq);
        expect(result).toEqual(sortedTasks);
    });
});
