const CustomError = require('../utils/customError');

// 세션 기반 인증 미들웨어
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return next(new CustomError('User is not logged in', 401));
  }
  next();
}

module.exports = { requireAuth };
