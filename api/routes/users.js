const express = require('express');
const router = express.Router();
const authentication = require('../middlewares/authentication');

const UsersController = require('../controllers/users.js');

//GET

router.get('/', UsersController.getUser);
router.get('/viewer', authentication, UsersController.getViewer);
router.post('/loginUser', UsersController.loginUser);
router.post('/create', UsersController.createUser);
router.post('/verify/:id', UsersController.updateUser);




module.exports = router;