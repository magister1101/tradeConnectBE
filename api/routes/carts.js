const express = require('express');
const router = express.Router();
const authentication = require('../middlewares/authentication.js');

const CartsController = require('../controllers/carts.js');

//GET

router.get('/', authentication, CartsController.getCart)
router.post('/', authentication, CartsController.addToCart);
router.delete('/:productId', authentication, CartsController.deleteFromCart)




module.exports = router;