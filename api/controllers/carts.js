const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const Product = require('../models/product')



exports.addToCart = async (req, res) => {
    const userId = req.userData.userId
    const { productId, quantity } = req.body


    try {
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: 'Product not found' })

        const existingItemIndex = user.cart.findIndex((item) => item.product.toString() === productId)

        if (existingItemIndex !== -1) {
            user.cart[existingItemIndex].quantity += quantity
        } else {
            user.cart.push({ product: productId, quantity })
        }

        await user.save()
        res.status(200).json({ message: 'Item added to cart', cart: user.cart })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to add to cart' })
    }
};

exports.getCart = async (req, res) => {
    const user = await User.findById(req.userData.userId).populate('cart.product')
    res.json({ cart: user.cart })
}

exports.deleteFromCart = async (req, res) => {
    const user = await User.findById(req.userData.userId)
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId)
    await user.save()
    res.json({ message: 'Item removed from cart' })
}

