'use strict'

const Tag = use("App/Models/Tag")
const Post = use("App/Models/Post")
const Database = use("Database")

class TagController {
    async populars({response}){
        try{
            const tags = await Tag.query().where("posts_count",">=","10").fetch()
            return response.status(200).json({
                massage: "Tags loaded successfully",
                tags: tags
            })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading tags",
                error: e
            })
        }
    }
    async posts({response, params}){
        try{
            const tag = await Tag.findOrFail(params.id)
            const posts_ids = tag["posts_id"].split(",")
            const posts = await Post.query().whereIn("id", posts_ids).fetch()
            return response.status(200).json({
                massage: "Posts loaded successfully",
                posts: posts
            })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading posts",
                error: e
            })
        }
    }
}

module.exports = TagController
