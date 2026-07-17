const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.post('/remove', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);
router.post('/merge', cartController.mergeCart);

module.exports = router;
