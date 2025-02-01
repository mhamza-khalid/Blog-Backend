const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getAllPosts(req, res) {
    try {
        const allPosts = await prisma.post.findMany({
            include: {
                User: {
                    select: {
                        username: true
                    }
                }
            }
        })
        return res.status(200).json(allPosts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
}

async function unPublishPost(req, res){
    const id = req.params.post_id
    try {
        const updateUser = await prisma.post.update({
            where: {
                post_id: parseInt(id),
            },
            data: {
                isPublished: false
            },
        })
        res.status(200).json({ message: 'Post unpublished successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to unpublish post' });
    }
}

async function publishPost(req, res){
    const id = req.params.post_id
    try {
        const updateUser = await prisma.post.update({
            where: {
                post_id: parseInt(id),
            },
            data: {
                isPublished: true
            },
        })
        res.status(200).json({ message: 'Post published successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to publish post' });
    }
}

async function getPost(req, res) {
    let id = req.params.post_id
    id = id.startsWith(':') ? id.slice(1) : id;
    try {
        const post = await prisma.post.findUnique({
            where: {
                post_id: parseInt(id),
            },
            include: {
                user_liked_posts : true
            }
        })
        res.status(200).json(post);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ error: 'Failed to get post' });
    }
}

async function likePost(req, res) {
    let postId = req.params.post_id
    let active = (req.params.active === "true" ? true : false)
    let userId = req.params.userId
    console.log(postId)
    console.log(active)
    console.log(userId)

    //now 
    if (active == false) { //user wants to add a like to a post
        try {
            console.log('Liking post')
            //check if user has already liked the post or not
            const existingLike = await prisma.user_liked_posts.findUnique({
                where: {
                    userId_postId: { // Composite ID constraint
                        userId: parseInt(userId),
                        postId: parseInt(postId)
                    }
                }
            });
            //if user has not liked the post, add a like to it
            if (!existingLike) {
                const addLike = await prisma.user_liked_posts.create({
                    data: {
                        userId: parseInt(userId),
                        postId: parseInt(postId)
                    }
                });
                const post = await prisma.post.update({
                    where: {
                        post_id: parseInt(postId),
                    },
                    data: {
                        likes: {
                            increment: 1
                        },
                    },
                })
                return res.status(200).json({ message: 'Liked Blog' });
            }


        } catch (error) {
            console.error('Error getting post:', error);
            res.status(500).json({ error: 'Failed to get post' });
        }
    }
    if (active == true) { //user wants to remove like from post
        try {
            //if user wants to unlike post we have to first check has user liked the post
            const existingLike = await prisma.user_liked_posts.findUnique({
                where: {
                    userId_postId: { // Composite ID constraint
                        userId: parseInt(userId),
                        postId: parseInt(postId)
                    }
                }
            });
            //if like exists on post by user
            if (existingLike) {

                console.log('Uniking post')
                const post = await prisma.post.update({
                    where: {
                        post_id: parseInt(postId),
                    },
                    data: {
                        likes: {
                            decrement: 1
                        },
                    },
                })

                await prisma.user_liked_posts.delete({
                    where: {
                        userId_postId: { // Composite primary key (userId, postId)
                            userId: parseInt(userId),
                            postId: parseInt(postId)
                        }
                    }
                });
                res.status(200).json({ message: 'Unliked Blog' });
            }


        } catch (error) {
            console.error('Error :', error);
            res.status(500).json({ error: 'Error while unliking post' });
        }
    }

}

async function createPost(req, res) {

    console.log('Here is req body', req.body)
    try {
        await prisma.post.create({
            data: {
                title: req.body.title,
                body: req.body.content,
                userId: req.body.id,
                imageURL: req.body.imageURL,
                readTime: parseInt(req.body.time)
            },
        })
        res.status(200).json({ message: 'Post created successfully' });
    }
    catch (error) {
        console.error('Error creating a post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
}

async function getPostsByUser(req, res) {
    const id = req.params.user_id

    try {
        let userPosts = await prisma.user.findUnique({
            where: {
                user_id: parseInt(id)
            },
            include: {
                posts: true
            }
        })
        delete userPosts.password
        res.status(200).json(userPosts);
    }
    catch (error) {
        console.error('Error creating a post:', error);
        res.status(500).json({ error: 'Failed to get posts by user id' });
    }
}

async function updatePost(req, res) {

    const id = req.params.post_id
    const data = req.body
    console.log('Update data request', data)
    try {
        const updateUser = await prisma.post.update({
            where: {
                post_id: parseInt(id),
            },
            data: {
                title: data.title,
                body: data.content,
                imageURL : data.imageURL,
                readTime : parseInt(data.time)
            },
        })
        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }

}

async function deletePost(req, res) {
    const id = parseInt(req.params.post_id);

    try {
        // Check if the post exists
        const postExists = await prisma.post.findUnique({
            where: { post_id: id },
        });

        if (!postExists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Fetch comment IDs under the post
        const commentIds = await prisma.comment.findMany({
            where: { postId: id },
            select: { comment_id: true },
        });

        const commentIdsArray = commentIds.map(comment => parseInt(comment.comment_id));

        // Delete the user liked comments rows for that post
        if (commentIdsArray.length > 0) {
            await prisma.user_liked_comments.deleteMany({
                where: { commentId: { in: commentIdsArray } },
            });
        }

        // Delete all comments under the post
        await prisma.comment.deleteMany({
            where: { postId: id },
        });

        // Delete the user liked posts rows where the post id exists
        await prisma.user_liked_posts.deleteMany({
            where: { postId: id },
        });

        // Delete the post as its FK is now removed from all tables for that post_id
        await prisma.post.delete({
            where: { post_id: id },
        });

        res.status(200).json({ message: 'Post and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
}

module.exports = {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getPostsByUser,
    likePost,
    unPublishPost,
    publishPost
}