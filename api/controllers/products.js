const mongoose = require('mongoose');
const Product = require('../models/product');


// GET Products with optional filters
exports.getProducts = async (req, res) => {
    try {
        const { query, category, isArchived, isForSale, isForTrade } = req.query;

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const queryConditions = [];

        if (query) {
            const escaped = escapeRegex(query);
            queryConditions.push({
                $or: [
                    { name: { $regex: escaped, $options: 'i' } },
                    { description: { $regex: escaped, $options: 'i' } }
                ]
            });
        }

        if (category) queryConditions.push({ category });
        if (isArchived) queryConditions.push({ isArchived: isArchived === 'true' });
        if (isForSale) queryConditions.push({ isForSale: isForSale === 'true' });
        if (isForTrade) queryConditions.push({ isForTrade: isForTrade === 'true' });

        const filter = queryConditions.length ? { $and: queryConditions } : {};

        const products = await Product.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(products);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to get products' });
    }
};

// CREATE Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity, category, file, isForSale, isForTrade } = req.body;

        const seller = req.userData.userId;

        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            seller,
            name,
            description,
            price,
            quantity,
            category,
            file,
            isForSale,
            isForTrade
        });

        const savedProduct = await product.save();
        return res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to create product' });
    }
};

// UPDATE Product
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const updateFields = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Failed to update product' });
    }
};

exports.delete = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.productId)
        res.json({ message: 'Product deleted' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

