const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, ordersController.index);
router.post('/', authMiddleware, ordersController.store);

module.exports = router;
