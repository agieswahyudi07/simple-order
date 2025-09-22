const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { createBookingRules, updateBookingRules } = require('../validators/bookingValidator');
const { validate } = require('../validators/validate')
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');


router.get('/',   
    authMiddleware,
    requireRole("user"),
    bookingController.index
);
router.post('/', 
    authMiddleware,
    requireRole("user"),
    createBookingRules,
    validate,
    bookingController.store);

router.patch('/:id',
    authMiddleware,
    requireRole("user"),
    updateBookingRules,
    validate,
    bookingController.patch
);
router.delete('/:id',
    authMiddleware,
    requireRole("user"),
    bookingController.destroy
);

module.exports = router;
