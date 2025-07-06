const express = require('express')
const router = express.Router()
const postController = require('../controllers/posts')
const authentication = require('../middlewares/authentication') // your JWT middleware

// Get all posts
router.get('/', postController.getPosts)

// Create a new post (requires authentication)
router.post('/', authentication, postController.createPost)

// Like a post (requires authentication)
router.post('/:id/like', authentication, postController.likePost)

// Add a comment to a post (requires authentication)
router.post('/:id/comments', authentication, postController.addComment)

module.exports = router
