'use strict'
const Post = use("App/Models/Post")
const User = use("App/Models/User")
const Comment = use("App/Models/Comment")
const Database = use("Database")

class AdminController {
    async pendingPosts({response}){
        try{
        const posts = await Database.select("*").from('posts').where("status","Pending").orderBy("created_at", "asc")
        for(let post of posts){
            const user = await User.query().where("id",post["user_id"]).first()
            post["user_fullname"] = user.fullname
        }
        return response.status(200).json({
            massage: "Posts loaded succefully",
            posts: posts
        })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading posts",
                error: e
            })
        }
    }
    async pendingComments({response}){
        try{
        const comments = await Database.select("*").from("comments").where("status","Pending").orderBy("created_at","asc")
        for(let comment of comments){
            const user = await User.query().where("id",comment["user_id"]).first()
            if(user){
            comment["user_fullname"] = user.fullname
            }
        }
        return response.status(200).json({
            massage: "Comments loaded succefully",
            comments: comments
        })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading posts and comments",
                error: e
            })
        }
    }
    async approvePost({request, params, response}){
        try{
        const post = await Post.find(params.id)
        if(!post){
            return response.status(404).json({massage: "Post not found"})
        }
        post["status"] = request.body.approvement
        await post.save()
        return response.status(200).json({
            massage: "Post approved"
        })
        }catch(e){
        return response.status(500).json({
            massage: "Error approving post",
            error: e
        })
        }
    }
    async approveComment({request, params, response}){
        try{
        const comment = await Comment.find(params.id)
        if(!comment){
            return response.status(404).json({massage: "Comment not found"})
        }
        comment["status"] = request.body.approvement
        await comment.save()
        return response.status(200).json({
            massage: "Comment Approved"
        })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading posts",
                error: e
            })
        }
    }
}
module.exports = AdminController
