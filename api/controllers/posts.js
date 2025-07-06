const Post = require('../models/post')
const User = require('../models/user')

exports.getPosts = async (req, res) => {
    const posts = await Post.find().populate('user', 'username')
    res.json({ posts })
}

exports.createPost = async (req, res) => {
    const { content } = req.body
    const { userId, username } = req.userData

    const post = new Post({
        user: userId,
        username,
        content,
    })

    await post.save()
    res.status(201).json({ post })
}
exports.likePost = async (req, res) => {
    const post = await Post.findById(req.params.id)
    post.likes += 1
    await post.save()
    res.json(post)
}

exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const { content } = req.body
        const userId = req.userData.userId // Assuming userId is set by your auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await User.findById(userId).select('username')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const comment = {
            username: user.username, // use `username` instead of `user`
            content,
        }

        post.comments.push(comment)
        await post.save()
        res.status(201).json({ comment })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error adding comment' })
    }
}