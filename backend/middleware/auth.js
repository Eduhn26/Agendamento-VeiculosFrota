const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const uid = decoded.id || decoded.userId || decoded._id;

    req.user = {
      userId: uid,
      id: uid,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
