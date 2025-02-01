const { Router } = require('express');

const user = Router();

const userController = require('../controllers/userController')

const isAuthenticated = require('../authentication/auth')

//base root url path: users
//get all the users

user.get('/', userController.getAllUsersEmails);

//get a specific user
user.get('/:user_id', userController.getUser);


//get user liked posts
user.get('/:user_id/liked', userController.getLikedPosts)

//create a new user (when user signs up)
user.post('/', userController.createUser)

//update a user (protected route, msut be signed in to update themselves)
user.put('/:user_id', isAuthenticated ,userController.updateUser)


module.exports = user