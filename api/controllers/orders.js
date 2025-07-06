const mongoose = require('mongoose')
const Product = require('../models/product')
const Order = require('../models/order')
const User = require('../models/user')

exports.placeOrder = async (req, res) => {
    try {
        const userId = req.userData.userId

        // Fetch user with populated cart
        const user = await User.findById(userId).populate('cart.product')

        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or user not found.' })
        }

        // Group items by seller
        const sellerGroups = {}

        user.cart.forEach(item => {
            const sellerId = item.product.seller.toString()
            if (!sellerGroups[sellerId]) {
                sellerGroups[sellerId] = []
            }
            sellerGroups[sellerId].push(item)
        })

        const createdOrders = []

        // Create separate orders per seller
        for (const sellerId in sellerGroups) {
            const itemsForSeller = sellerGroups[sellerId]

            const items = itemsForSeller.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
            }))

            const total = itemsForSeller.reduce(
                (sum, item) => sum + ((item.product?.price || 0) * item.quantity),
                0
            )

            const order = new Order({
                user: user._id,
                seller: sellerId,
                items,
                total,
            })

            await order.save()
            createdOrders.push(order)
        }

        // Clear user's cart
        user.cart = []
        await user.save()

        res.status(201).json({ message: 'Orders placed successfully', orders: createdOrders })
    } catch (err) {
        console.error('[placeOrder Error]', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}


// Get all orders where the logged-in user is the seller
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.userData.userId
        const orders = await Order.find({ seller: sellerId })
            .populate('user', 'username email')
            .populate('items.product')

        res.status(200).json({ orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch seller orders' })
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const { status } = req.body

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' })

        res.status(200).json({ message: 'Order status updated', order: updatedOrder })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to update order status' })
    }
}
