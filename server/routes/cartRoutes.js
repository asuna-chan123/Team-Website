const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart Routes
router.get('/:userId', cartController.getCart);
router.post('/:userId/add', cartController.addToCart);
router.post('/:userId/decrease', cartController.decreaseQuantity);
router.delete('/:userId/remove/:productId', cartController.removeFromCart);

// Checkout Route
router.post('/:userId/checkout', cartController.checkout);

module.exports = router;
