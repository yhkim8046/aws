const bcrypt = require('bcrypt');

class UserService {
  constructor(pool) {
    this.pool = pool;
  }

  async login(email, password, req) {
    // Find the user
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await this.pool.query(query, [email]);

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
    let registerQuery;
    try {
      console.log('Starting registration for:', email);

      const isDuplicatedQuery = 'SELECT * FROM users WHERE email = ?';
      console.log('Running duplication query:', isDuplicatedQuery, [email]);
      const [existingUsers] = await this.pool.query(isDuplicatedQuery, [email]);
      console.log('Duplicate check result:', existingUsers);

      if (existingUsers.length) {
        console.error('Duplicate user found:', email);
        throw new Error(`User with email "${email}" already exists.`);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed:', hashedPassword);

      registerQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
      console.log('Inserting user with query:', registerQuery, [email, hashedPassword]);

      const [result] = await this.pool.query(registerQuery, [email, hashedPassword]);
      console.log('User registered successfully with ID:', result.insertId);

      return { id: result.insertId, email };
    } catch (err) {
      console.error('Error during registration:', err.message);
      console.error('Query:', registerQuery);
      throw err;
    }
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
