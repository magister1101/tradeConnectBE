const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orders')
const authentication = require('../middlewares/authentication')

router.post('/', authentication, orderController.placeOrder)
router.get('/seller', authentication, orderController.getSellerOrders)
router.put('/:id', authentication, orderController.updateOrderStatus)



module.exports = router
