const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  constructor(pool) {
    this.pool = pool;
  }

  async login(email, password) {
    //Find the user
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await this.pool.query(query, [email]);

    if (!rows.length) {
      throw new Error('User not found');
    }

    const user = rows[0];

    //Verifying password 
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // JWT creation 
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { token };
  }

  async register(email, password) {
    // check duplication
    const isDuplicatedQuery = 'SELECT * FROM users WHERE email = $1';
    const { rows: existingUsers } = await this.pool.query(isDuplicatedQuery, [email]);

    if (existingUsers.length) {
      throw new Error('Existing user');
    }

    // hasing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // user register
    const registerQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
    const { rows } = await this.pool.query(registerQuery, [email, hashedPassword]);

    return rows[0];
  }
}

module.exports = UserService;
