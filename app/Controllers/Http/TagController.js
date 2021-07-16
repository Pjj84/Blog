'use strict'

const Tag = use("App/Models/Tag")
const Post = use("App/Models/Post")
const Database = use("Database")

class TagController {
    async populars({response}){
        try{
            const tags = await Tag.query().where("posts_count",">=","1").orderBy("posts_count","desc").fetch()
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
    async posts({request, response}){
        //try{
            const query = request.get()
            const text = query.tag
            const tag = await Tag.query().where("text",text).first()
            const posts_ids = tag && tag["posts_id"] && tag["posts_id"] != "" ? tag["posts_id"].split(",") : []
            for(let i=0;i<posts_ids.length;i++){
                posts_ids[i] = parseInt(posts_ids[i])
            }
            const posts = await Post.query().whereIn("id", posts_ids).where("status","Approved").fetch()
            return response.status(200).json({
                massage: "Posts loaded successfully",
                posts: posts
            })
        //}catch(e){
            return response.status(500).json({
                massage: "Error loading posts",
                error: e
            })
        //}
    }
}

module.exports = TagController
