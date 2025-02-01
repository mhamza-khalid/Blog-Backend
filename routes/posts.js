const { Router } = require('express');

const post = Router();

const postController    = require('../controllers/postController')
const commentController = require('../controllers/commentController')
const isAuthenticated = require('../authentication/auth')
//comments are a child of posts
//so to follow RESTFUL API design we should use /posts/comments
//when accessing comments


//base root url path: posts/
//get all the posts
post.get('/', postController.getAllPosts);

//get a specific post
post.get('/:post_id', postController.getPost);

//handle like/unlike of specific post
post.post('/:post_id/:active/:userId/like/', postController.likePost);

//create a new post (protected route, must be signed in)
post.post('/',  postController.createPost)

//update a post (protected route, must be signed in)
post.put('/:post_id', postController.updatePost)

//unpublish a post (protected route, must be signed in)
post.put('/:post_id/unpublish', postController.unPublishPost)

//publish a post (protected route, must be signed in)
post.put('/:post_id/publish', postController.publishPost)

//get all posts of a user
post.get('/user/:user_id', postController.getPostsByUser);


//delete a post, we first have to clear it form junction tables
//and then the comments table and at last the post table itself

//(protected route, must be signed in)
post.delete('/:post_id', postController.deletePost);


//now we shall include handlers for the comments under posts


//get all comments under a post
post.get('/:post_id/comments', commentController.getCommentsUnderPost)

//get a comment
post.get('/:post_id/comments/:comment_id', commentController.getComment)

//create a comment 
//(protected route, must be signed in)
post.post('/:post_id/comments' ,commentController.createComment)

//update a comment
//(protected route, must be signed in)
post.put('/:post_id/comments/:comment_id', commentController.updateComment)

//delete a comment
//(protected route, must be signed in)
post.delete('/:post_id/comments/:comment_id', commentController.deleteComment)

module.exports = post