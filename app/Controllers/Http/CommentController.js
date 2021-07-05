'use strict'
const User = use("App/Models/User")
const Post = use("App/Models/Post")
const Helpers = use('Helpers')
const Drive = use('Drive')
const Like = use('App/models/Like')
const Database = use('Database')
const Comment = use('App/Models/Comment')

class CommentController {
    async create({request, response, auth, params}){
        const comment = new Comment
        const user = await auth.getUser()
        comment['post_id'] = params['post_id'] //The id of the post
        comment['user_id'] = user.id
        comment.text = request.input('text')
        comment['reply_to'] = params['comment_id'] || null //The id of the comment
        try{
            comment.save()
            return response.status(200).json({
                massage: "Comment created successfully",
                comment: comment
            })
        }catch(e){
            return response.status(500).json({
                massage: "Error creating comment",
                error: e
            })
        }
    }
    async edit({request, response, params}){
        return 1
        const comment = Comment.findOrFail(params.id)
        comment.text = request.input('text')
        return comment.text
        try{
            comment.save()
            return response.status(200).json({
                massage: "Comment eidted successfully",
                comment: comment
            })
        }catch(e){
            return response.status(500).json({
                massage: "Error editing comment",
                error: e
            })
        }
    }
    async delete({params}){
        const comment = Comment.findOrFail(params.id)
        try{
           comment.delete()
           return response.ok("Comment deleted succesfully")
        }catch(e){
            return response.status(500).json({
                massage: "Error deleting comment",
                error: e
            })
        }

    }
    async show({params}){
        try{
        const comment = Comment.query().where("post_id",params.id).fetch()
        return response.status(200).json(comment)
        }catch(e){
            return response.status(500).json({
                massage: "Error loading comments",
                error: e
            })
        }
    }
}

module.exports = CommentController
