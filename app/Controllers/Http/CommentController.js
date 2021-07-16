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
            comment["user_fullname"] = user.fullname
            user["comments_count"] = user["comments_count"] + 1
        }catch(e){
            comment["status"] = "Pending"
            comment["user_id"] = null
            if(request.input("fullname")){
            comment["user_fullname"] = request.input("fullname")
            }else{
                return response.status(422).json({massage: "Field user fullname cannot be empty"})
            }
        }
        const post = await Post.find(params["post_id"])
        if(!post){
            return response.status(404).json({massage: "Post not found"})
        }
        comment['post_id'] = params['post_id'] //The id of the post
        if(params.name){
        comment["in_reply_to"] = params.name
        }
        if(!request.input("text")){return response.status(422).json({massage: "Field text cannot be empty"})}
            comment.text = request.input('text')
        comment["reply_to"] = params["comment_id"] || null
        comment.replies = ""
        try{
            await comment.save()
        }catch(e){
            return response.status(500).json({
                massage: "Error creating comment",
                error: e
            })
        }
        if(params['comment_id']){
            const replied_comment = await Comment.find(params['comment_id'])
            if(replied_comment["reply_to"]){
                return response.status(400).json({massage: "Cannot reply to a replying comment"})
            }
            if(!replied_comment){
                return response.status(404).json({massage: "The comment you are trying to reply does not exist"})
            }
            const array = replied_comment.replies ? replied_comment.replies.split(",") : [] 
            array.push(comment.id)
            replied_comment.replies = array.toString().substring(0,array.toString().length + 1)
            try{
                await replied_comment.save()
                return response.status(200).json({
                    massage: "Comment and relpies saved successfully"
                })
            }catch(e){
                return response.status(500).json({
                    massage: "Error saving replies",
                    error: e
                })
            }
        }else{
            return response.status(200).json({
                massage: "Comment created succefully"
            })
        }

    }
    async edit({auth, request, response, params}){
        const comment = await Comment.find(params.id)
        if(!comment){
            return response.status(404).json({massage: "Comment not found"})
        }
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
            if(request.input("fullname")){
                comment["foreign_name"] = request.input("fullname")
                }else{
                    return response.status(422).json({massage: "Fied name cannot be empty"})
                }
        }
        if(!request.input("text")){
            return response.status(422).json({message: "Comment text can not be empty"})
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
        const comment = await Comment.find(params.id)
        if(!comment){
            return response.status(404).json({masage: "Comment not found"})
        }
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
           return response.status(200).json({massage: "Comment deleted succesfully"})
        }catch(e){
            return response.status(500).json({
                massage: "Error deleting comment",
                error: e
            })
        }

    }
    async show({params, response}){
        try{
        const comments = await Database.select("*").from("comments").where("post_id",params.id).where("status","Approved").where("reply_to",null).orderBy("created_at","desc")
        let counter = comment.length
        for(let comment of comments){
            const replies = comment.replies ? comment.replies.split(",") : []
            comment["replying_comments"] = []
            for(let i=0;i<replies.length;i++){
                const partial_comment = await Comment.find(replies[i])
                if(partial_comment.status == "Approved"){
                comment["replying_comments"].push(partial_comment)
                counter++
                }
            }
        }
        return response.status(200).json({
            massage: "Comments loaded successfully" ,
            comments: comments,
            comment_counts: counter
        })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading comments",
                error: e
            })
        }
    }
}

module.exports = CommentController
