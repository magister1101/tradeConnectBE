const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const authentication = require('../middlewares/authentication');


router.get('/', productController.getProducts);
router.post('/create', authentication, productController.createProduct);
router.post('/upddate/:productId', productController.updateProduct);

module.exports = router;
