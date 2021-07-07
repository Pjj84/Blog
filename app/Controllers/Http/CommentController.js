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
        try{
            const user = await auth.getUser()
            comment["is_approved"] = true
            comment['user_id'] = user.id
        }catch(e){
            comment["is_approved"] = false
            comment["user_id"] = null
        }
        comment['post_id'] = params['post_id'] //The id of the post
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
        const comment = await Comment.find(params.id)
        try{
            const user = await auth.getUser()
            comment["user_id"] = usr.id
        }catch(e){
            comment["is_approved"] = false
            comment["user_id"] = null
        }
        comment.text = request.input('text')
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
    async delete({params, response}){
        const comment = await Comment.findOrFail(params.id)
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
    async show({params, response}){
        try{
        const comment = await Comment.query().where("post_id",params.id).fetch()
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
