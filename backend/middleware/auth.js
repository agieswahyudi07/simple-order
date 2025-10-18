const jwt = require('jsonwebtoken');
const { getDB } = require('../database/database');
const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware  = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token not found' });

  const token = authHeader.split(' ')[1];
    const db = getDB();

    const blacklisted = await db.collection('blacklist_tokens').findOne({ token });
    if (blacklisted) {
        return res.status(401).json({ message: 'Token not valid or expired' });
    }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token not valid or expired' });
  }
};
