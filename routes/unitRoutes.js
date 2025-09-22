const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { body, param } = require('express-validator');
const { validate } = require('../validators/validate')
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');


router.get('/', unitController.index);
router.post(
  '/',
  authMiddleware,
  requireRole("admin"),
  [
    body('name').notEmpty().withMessage('name is required'),
    validate
  ],
  unitController.store
);
router.patch(
  '/:id',
  authMiddleware,
  requireRole("admin"),
  [
    param('id').isMongoId().withMessage('id not valid'),
    body('name').optional().notEmpty().withMessage('name is required'),
    validate
  ],
  unitController.patch
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole("admin"),
  [
    param('id').isMongoId().withMessage('id not valid'),
    validate
  ],
  unitController.destroy
);

module.exports = router;
