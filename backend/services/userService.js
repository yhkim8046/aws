const bcrypt = require('bcrypt');

class UserService {
  constructor(pool) {
    this.pool = pool;
  }

  async login(email, password, req) {
    // Find the user
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await this.pool.query(query, [email]);

    if (!rows.length) {
      throw new Error('User not found');
    }

    const user = rows[0];

    // Verifying password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Save user info in session
    req.session.user = { id: user.id, email: user.email };

    return { message: 'Logged in successfully' };
  }

  async register(email, password) {
    // Check duplication
    const isDuplicatedQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows: existingUsers } = await this.pool.query(isDuplicatedQuery, [email]);

    if (existingUsers.length) {
      throw new Error('Existing user');
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // User register
    const registerQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
    const { rows } = await this.pool.query(registerQuery, [email, hashedPassword]);

    return rows[0];
  }

  async logout(req) {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          reject(new Error('Failed to log out'));
        } else {
          resolve({ message: 'Logged out successfully' });
        }
      });
    });
}
}

module.exports = UserService;
