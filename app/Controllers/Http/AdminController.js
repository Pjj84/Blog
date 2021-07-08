'use strict'
const Post = use("App/Models/Post")
const User = use("App/Models/User")
const Comment = use("App/Models/Comment")

class AdminController {
    async pendingPosts({response}){
        try{
        const posts = await Post.query().where("is_approved",false).fetch()
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
        const posts = await Comment.query().where("is_approved",true).with("comments").fetch()
        return response.status.json({
            massage: "Posts and comments loaded succefully",
            posts: posts
        })
        }catch(e){
            return response.status.json({
                massage: "Error loading posts and comments",
                error: e
            })
        }
    }
    async approvePost({params, response}){
        try{
        const post = await Post.findOrFail(params.id)
        post["is_approved"] = true
        post.save()
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
    async approveComment({params, response}){
        try{
        const comment = await Comment.findOrFail(params.id)
        comment["is_approved"] = true
        comment.save()
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
