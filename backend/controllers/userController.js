class UserController {
    constructor(userService) {
      this.userService = userService;
    }
  
    async login(req, res) {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
  
      try {
        const user = await this.userService.login(email, password); // 서비스 호출
        req.session.user = user; // 세션에 저장
        return res.status(200).json({ message: 'Logged in successfully.', user });
      } catch (error) {
        console.error('Login error:', error.message);
        return res.status(401).json({ message: error.message });
      }
    }
  
    async register(req, res) {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
  
      try {
        const user = await this.userService.register(email, password); // 서비스 호출
        return res.status(201).json({ message: 'User registered successfully.', user });
      } catch (error) {
        console.error('Register error:', error.message);
        return res.status(500).json({ message: error.message });
      }
    }
  
    async logout(req, res) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err.message);
          return res.status(500).json({ message: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 제거
        return res.status(200).json({ message: 'Logged out successfully.' });
      });
    }
  }
  
  module.exports = UserController;
  