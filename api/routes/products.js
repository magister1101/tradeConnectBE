const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const authentication = require('../middlewares/authentication');


router.get('/', productController.getProducts);
router.post('/', authentication, productController.createProduct);
router.post('/update/:productId', productController.updateProduct);
router.delete('/:productId', productController.delete);
router.put('/:productId', productController.updateProduct);

module.exports = router;
