const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Product = require('../models/product');

const performUpdate = (id, updateFields, res) => {
    User.findByIdAndUpdate(id, updateFields, { new: true })
        .then((updatedData) => {
            if (!updatedData) {
                return ({ message: "Data not found" });
            }
            return updatedData;

        })
        .catch((err) => {
            return ({
                message: "Error in updating Data",
                error: err
            });
        })
};

exports.getUser = async (req, res) => {
    try {
        const { query, isArchived } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escaped = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }

            orConditions.push(
                { username: { $regex: escaped, $options: 'i' } },
                { firstName: { $regex: escaped, $options: 'i' } },
                { lastName: { $regex: escaped, $options: 'i' } },
                { middleName: { $regex: escaped, $options: 'i' } },
                { email: { $regex: escaped, $options: 'i' } },
            )

            queryConditions.push({ $or: orConditions });
        }


        if (isArchived) {
            const isArchivedBool = isArchived === 'true';
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }

        const users = await User.find(searchCriteria)
            .sort({ createdAt: -1 })
            .populate('cart.product', 'name price game code series rarity file isPreorder description');


        return res.status(200).json(users);


    }
    catch (error) {
        console.error(error.message);
        res.status(500).json('error in getUser');
    }
};

exports.getViewer = async (req, res) => {
    try {
        User.findOne({ _id: req.userData.userId })
            .exec()
            .then(user => {
                return res.status(200).json({
                    valid: true,
                    user: user
                });
            })
    }
    catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({
            message: "Error in retrieving user",
            error: error.message || error,
        });
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        message: 'Username does not exist'
                    });
                }
                if (!user[0].isArchived) {
                    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                        if (err) {
                            return res.status(401).json({
                                message: 'Incorrect Password'
                            });
                        }
                        if (result) {
                            const token = jwt.sign({
                                userId: user[0]._id,
                                username: user[0].username,
                            },
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: "24h"
                                }
                            )

                            return res.status(200).json({
                                message: 'Login Successfully',
                                token: token,
                            });
                        }
                        return res.status(401).json({
                            message: 'Login Failed'
                        });
                    })
                } else {
                    return res.status(401).json({
                        message: 'Auth Failed'
                    });
                }
            })
    }
    catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({
            message: "Error in logging in user",
            error: error.message || error,
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const existingUser = await User.find({
            $or: [{ username: req.body.username }, { email: req.body.email }]
        });

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const userId = new mongoose.Types.ObjectId();
        const user = new User({
            _id: userId,
            username: req.body.username,
            password: hashedPassword,

            firstName: req.body.firstName,
            lastName: req.body.lastName,
            middleName: req.body.middleName,

            email: req.body.email,

            address: req.body.address,

            isArchived: req.body.isArchived,
        });

        const saveUser = await user.save();

        return res.status(201).json({ saveUser });

    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            message: "Error in creating user",
            error: error.message || error,
        });
    }
};

