const { PrismaClient } = require('@prisma/client')
const prisma           = new PrismaClient()

async function getAllComments(req, res){
    try{
        const allComments = await prisma.comment.findMany()
        return res.status(200).json(allComments);
    }catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
}

async function getComment(req, res)  {
    //we need both post_id and comment_id to get a comment
    const post_id    = parseInt(req.params.post_id)
    const comment_id = parseInt(req.params.comment_id)

    try{
        const comment = await prisma.comment.findUnique({
            where: {
                comment_id: comment_id,
                postId    : post_id
            },
        })
        res.status(200).json(comment);
    }catch (error) {
        console.error('Error getting comment:', error);
        res.status(500).json({ error: 'Failed to get comment' });
    }
}

async function createComment(req, res){

    //we need post_id to create a comment
    const post_id = parseInt(req.params.post_id)
    const userId = parseInt(req.body.userId)
    const content = req.body.content


    try{
        await prisma.comment.create({
            data: {
                body: content,
                userId: userId,
                postId: post_id
            },
        })
        res.status(200).json({ message: 'Comment created successfully' });
    }
    catch (error) {
        console.error('Error publishing comment:', error);
        res.status(500).json({ error: 'Failed to publish comment' });
    }
}

async function updateComment(req, res){

    //we need both post_id and comment_id to update a comment
    console.log(req.params)
    const post_id    = req.params.post_id
    const commentId = req.params.comment_id
    const content = req.body.content
    const date = req.body.date
    try{
        const updateComment = await prisma.comment.update({
            where: {
                postId      : parseInt(post_id),
                comment_id  : parseInt(commentId),
                
            },
            data: {
                body: content,
                created_at: date
            },
        })
        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
        
}

async function getCommentsUnderPost (req, res) {

    const id = parseInt(req.params.post_id);

    try{
        const comments = await prisma.comment.findMany({
            where : {
                postId : id
            },
            include : {
                User : {
                    select : {
                        username : true,
                        email    : true
                    }
                }
            }
        })
        return res.status(200).json(comments);
    }catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
}

async function deleteComment (req, res) {

    //we need both post_id and comment_id to delete a comment
    const post_id    = parseInt(req.params.post_id);
    const comment_id = parseInt(req.params.comment_id);


    try {
        // Check if the post exists
        const commentExists = await prisma.comment.findUnique({
            where: { 
                comment_id: comment_id,
                postId   : post_id
             },
        });

        if (!commentExists) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        //now to delete the comment we have to clear the junction table 
        //user_liked_comments first where comment_id is a foreign key in that table

        // await prisma.user_liked_comments.deleteMany({
        //     where: { commentId: comment_id },
        // });

        // Delete that comment
        await prisma.comment.delete({
            where: { comment_id: comment_id },
        });

    
        res.status(200).json({ message: 'Comment and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
}

module.exports = {
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
    getCommentsUnderPost
}