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
        // THIS CODE IS BULLSHIT YOU HAVE TO FIX IT AS SOON AS YOU CAN
        //try{
            const tag = await Tag.findOrFail(params.id)
            const posts = await Database.select("*").from('posts').orderBy("created_at",'desc')
            const chosen_posts = []
            for(let post of posts){
                const array = post.tags.split(",")
                if(array.includes(tag.text)){
                    chosen_posts.push(post)
                }
            }
            return response.status(200).json({
                massage: "Posts loaded successfully",
                posts: chosen_posts
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
