const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');

async function getAllUsersEmails(req, res){
    
    try {
      const allUsers = await prisma.user.findMany()
      console.log(allUsers)
      let userEmails = allUsers.map((user)=> user.email)
      return res.status(200).json(userEmails);
    }
    catch (error){
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get all users' });
    }
}

async function getLikedPosts(req, res){
  try{
    const userId = req.params.user_id
    console.log(userId)
    let likedPosts = await prisma.user.findUnique({
          where:{
            user_id : parseInt(userId)
          },
          include : {
              user_liked_posts : true
          }
    })
    delete likedPosts.password
    console.log(likedPosts)
    return res.status(200).json(likedPosts)
  }
  catch (error){
    console.error('Error getting user liked posts:', error);
    res.status(500).json({ error: 'Failed to get user likes posts' });
  }
}

async function getUser(req, res){
    try{
      const id = req.params.user_id
      let user = await prisma.user.findUnique({
          where: {
            user_id: parseInt(id),
          },
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
              },
            },
          },
      })

      delete user.password //we don't want to send user's password to the client
      console.log('User here', user)
      return res.status(200).json(user)
    }
    catch (error){
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
}


async function createUser(req, res) {
    console.log(req.body)
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password

    try{
      const user = await prisma.user.create({
          data: {
            username: username,
            email   : email,
            password: password //need to use bcrypt to encrypt password 
          },
      })
      return res.status(200).json({message: 'User created successfully'})
    }
    catch (error){
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  
}

async function updateUser (req, res) {
    try{
      const id = req.params.user_id
      const updateUser = await prisma.user.update({
          where: {
            user_id: parseInt(id),
          },
          data: {
            email: 'jhon12@gmail.com',
          },
      })
      res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error){
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  
  
}

module.exports = {
    getAllUsersEmails,
    getUser,
    createUser,
    updateUser,
    getLikedPosts
}