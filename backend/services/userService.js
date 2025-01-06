const bcrypt = require('bcrypt');

class UserService {
  constructor(pool) {
    this.pool = pool;
  }

  async findUserByEmail(email){
    const query = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await this.pool.query(query, [email]);
    
    return rows[0] || null;
  }

  async validatePassword(password, hashedPassword){
    return bcrypt.compare(password, hashedPassword);
  }

  async login(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValidPassword = await this.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    return { id: user.id, email: user.email };
  }

  async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(email, password) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error(`User with email "${email}" already exists.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    const [result] = await this.pool.query(query, [email, hashedPassword]);

    return { id: result.insertId, email };
  }

}

module.exports = UserService;
