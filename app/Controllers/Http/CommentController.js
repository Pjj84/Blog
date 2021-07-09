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
        comment["status"] = "Approved"
            comment['user_id'] = user.id
            user["comments_count"] = user["comments_count"] + 1
        }catch(e){
            comment["status"] = "Pending"
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
    async edit({auth, request, response, params}){
        const comment = await Comment.find(params.id)
        try{
        const user = await auth.getUser()
            if(comment["user_id"] == null){
                if(user.role != "Admin" && user.role != "Manager"){
                    return response.status(401).json({message: "Only manager and admin can edit this comment"})
                }
            }else{
                if(comment["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
                    return response.status(401).json({
                        massage: "Only manager, admin and creator of the comment can edit this comment"
                    })
                }
            }
            comment["user_id"] = user.id
        }catch(e){
            comment["status"] = "Pending"
            comment["user_id"] = null
        }
        if(!request.input("text")){
            return response.status(202).json({message: "Comment text can not be empty"})
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
    async delete({params, response, auth}){
        const comment = await Comment.findOrFail(params.id)
        try{
        const user = await auth.getUser()
        if(comment["user_id"] == null){
            if(user.role != "Admin" && user.role != "Manager"){
                return response.status(401).json({message: "Only manager and admin can delete this comment"})
            }
        }
        if(comment["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
            return response.status(401).json({
                massage: "Only manager, admin and creator of the comment can delete this comment"
            })
           }
        }catch(e){}
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
        const comment = await Comment.query().where("post_id",params.id).where("status","Approved").orderBy("created_at","desc").fetch()
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
