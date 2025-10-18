const { getDB } = require("../database/database");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRE = '7d';

/**
 * User Login
 *
 * Request Body:
 * - email: string (required) – Registered user email
 * - password: string (required) – User password
 *
 * Process:
 * - Validates email and password.
 * - Generates a JWT token containing user ID, email, and role if authentication succeeds.
 *
 * Response:
 * - 200: { message, user, token } – Login successful
 * - 401: Invalid email or password
 * - 500: Server error
 */
exports.login = async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email or password not valid' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email or password not valid' });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(200).json({ message: "Login Successfuly", user, token});
  } catch (error) {
    res.status(500).json({ message: error.message || "Something's wrong with the server, try again later." });
  }
};

/**
 * User Logout
 *
 * Request Header:
 * - Authorization: Bearer <token> (required) – JWT token to be invalidated
 *
 * Process:
 * - Extracts token from the Authorization header.
 * - Stores the token in a blacklist to prevent future use.
 *
 * Response:
 * - 200: { success, message } – Logout successful
 * - 400: Token not provided or invalid format
 * - 500: Server error
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'Token not found' });
    }

    const token = authHeader.split(' ')[1];
    const db = getDB();

    await db.collection('blacklist_tokens').insertOne({
      token,
      createdAt: new Date()
    });

    return res.status(200).json({
      message: 'Logout successfully.'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Something's wrong with the server, try again later."});
  }
};

/**
 * Get Current User
 *
 * Request Header:
 * - Authorization: Bearer <token> (required) – JWT token of the logged-in user
 *
 * Process:
 * - Extracts user ID from the decoded JWT (req.user.id).
 * - Retrieves the user's data from the database while excluding the password field.
 *
 * Response:
 * - 200: { user } – Returns the authenticated user's data (without password).
 * - 404: { error } – User not found.
 * - 500: { error } – Server error.
 */
exports.me = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something's wrong with the server, try again later."});
  }
};

