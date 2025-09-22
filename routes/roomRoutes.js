const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { body, param } = require('express-validator');
const { validate } = require('../validators/validate')
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', roomController.index);
router.post(
  '/',
  authMiddleware,
  requireRole("admin"),
  [
    body('unitId').notEmpty().withMessage('unitId is required'),
    body('name').notEmpty().withMessage('name is required'),
    body('capacity').isInt({ gt: 0 }).withMessage('capacity must be an integer and > 0'),
    validate
  ],
  roomController.store
);
router.patch(
  '/:id',
  authMiddleware,
  requireRole("admin"),
  [
    param('id').isMongoId().withMessage('id not valid'),
    body('unitId').optional().isMongoId().withMessage('unitId must an ObjectId'),
    body('name').optional().notEmpty().withMessage('name is required'),
    body('capacity').optional().isInt({ gt: 0 }).withMessage('capacity must be an integer and > 0'),
    validate
  ],
  roomController.patch
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole("admin"),
  [
    param('id').isMongoId().withMessage('id not valid'),
    validate
  ],
  roomController.destroy
);


module.exports = router;
