const mongoose = require('mongoose');
const { ref } = require('process');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },

    email: { type: String },

    address: { type: String },
    zone: { type: String },

    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],

    isAdmin: { type: Boolean, default: false },

    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);