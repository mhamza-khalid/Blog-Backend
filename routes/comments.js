const { Router } = require('express');

const comment = Router();

const commentController = require('../controllers/commentController')

//base root url path: comments

//get all the comments
comment.get('/', commentController.getAllComments);


module.exports = comment