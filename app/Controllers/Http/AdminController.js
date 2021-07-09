'use strict'
const Post = use("App/Models/Post")
const User = use("App/Models/User")
const Comment = use("App/Models/Comment")

class AdminController {
    async pendingPosts({response}){
        try{
        const posts = await Post.query().where("status","Pending").fetch()
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
        const comments = await Comment.query().where("status","Pending").fetch()
        return response.status.json({
            massage: "Posts and comments loaded succefully",
            comments: comments
        })
        }catch(e){
            return response.status.json({
                massage: "Error loading posts and comments",
                error: e
            })
        }
    }
    async approvePost({request, params, response}){
        try{
        const post = await Post.findOrFail(params.id)
        post["status"] = request.input("approvement")
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
    async approveComment({request, params, response}){
        try{
        const comment = await Comment.findOrFail(params.id)
        comment["status"] = request.input("approvement")
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
