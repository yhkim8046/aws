const UserService = require('../services/userService');
const bcrypt = require('bcryptjs');

describe('UserService', () => {
  let userService;
  let mockPool;

  beforeEach(() => {
    // 데이터베이스 쿼리를 모킹할 fake pool
    mockPool = {
      query: jest.fn()
    };
    userService = new UserService(mockPool);
  });

  test('findUserByEmail() should return a user when found', async () => {
    const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
    mockPool.query.mockResolvedValue([[mockUser]]);

    const user = await userService.findUserByEmail('test@example.com');

    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['test@example.com']);
    expect(user).toEqual(mockUser);
  });

  test('findUserByEmail() should return null when user not found', async () => {
    mockPool.query.mockResolvedValue([[]]);

    const user = await userService.findUserByEmail('notfound@example.com');

    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['notfound@example.com']);
    expect(user).toBeNull();
  });

  test('validatePassword() should return true for correct password', async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const result = await userService.validatePassword('password123', 'hashedPassword');

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(result).toBe(true);
  });

  test('validatePassword() should return false for incorrect password', async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const result = await userService.validatePassword('wrongPassword', 'hashedPassword');

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    expect(result).toBe(false);
  });

  test('login() should return user details for valid credentials', async () => {
    const mockUser = { id: 1, email: 'user@example.com', password: 'hashedPassword' };
    mockPool.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const user = await userService.login('user@example.com', 'password123');

    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['user@example.com']);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(user).toEqual({ id: 1, email: 'user@example.com' });
  });

  test('login() should throw an error for incorrect password', async () => {
    const mockUser = { id: 1, email: 'user@example.com', password: 'hashedPassword' };
    mockPool.query.mockResolvedValue([[mockUser]]);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    await expect(userService.login('user@example.com', 'wrongPassword'))
      .rejects.toThrow('Invalid email or password.');
  });

  test('login() should throw an error for non-existent user', async () => {
    mockPool.query.mockResolvedValue([[]]);

    await expect(userService.login('notfound@example.com', 'password123'))
      .rejects.toThrow('Invalid email or password.');
  });

  test('register() should insert a new user and return user details', async () => {
    mockPool.query
      .mockResolvedValueOnce([[]]) // 첫 번째 쿼리: 사용자 없음
      .mockResolvedValueOnce([{ insertId: 1 }]); // 두 번째 쿼리: 삽입 성공

    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

    const user = await userService.register('newuser@example.com', 'password123');

    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['newuser@example.com']);
    expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO users (email, password) VALUES (?, ?)', ['newuser@example.com', 'hashedPassword']);
    expect(user).toEqual({ id: 1, email: 'newuser@example.com' });
  });

  test('register() should throw an error if user already exists', async () => {
    const mockUser = { id: 1, email: 'existing@example.com', password: 'hashedPassword' };
    mockPool.query.mockResolvedValue([[mockUser]]);

    await expect(userService.register('existing@example.com', 'password123'))
      .rejects.toThrow('User with email "existing@example.com" already exists.');
  });
});
