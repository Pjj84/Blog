'use strict'
const User = use("App/Models/User")
const Post = use("App/Models/Post")

class ReadingListController {
    async load({request, response, auth}){ //Loading saved posts by user
        //try{
            const user = await auth.getUser()
            return user
            //try{
            const posts_ids = user && user["reading_list"] && user["reading_list"] != "" ? user["reading_list"].split(",") : []
            for(let i = 0; i < posts_ids.length; i++){
                posts_ids[i] = parseInt(posts_ids[i])
            }
            const posts = await Post.query().whereIn("id",posts_ids).fetch()
            return response.status(200).json({
                massage: "Posts loaded succefully",
                posts: posts                
            })
            //}catch(e){
                return response.status(500).json({
                    massage: "Error loading posts",
                    error: e
                })
            //}
        //}catch(e){
            return response.status(401).json({
                massage: "User is not authenticated"
            })
       // }
    }

    async add({request, response, auth}){ //Saveing a post in the list
        //try{
            const user = await auth.getUser()
            const query = request.get()
            const post = query.id
            try{
                await Post.findOrFail(post)
            }catch(e){
                return response.status(404).json({
                    massage: "Post doesn't exist"
                })
            }
            const posts_ids = user && user["reading_list"] && user["reading_list"] != "" ? user["reading_list"].split(",") : []
            if(!posts_ids.includes(post)){
                posts_ids.push(post)
                user["reading_list"] = posts_ids.toString()
            //try{
                await user.save()
                return response.status(200).json({
                    massag: "Post saved succesfully"
                })
            //}catch(e){
                return response.status(500).json({
                    massage: "Error saving post",
                    error: e
                })
            //}
            }else{
                return response.status(200).json({
                    massage: "Post is already saved"
                })
            }
            
        //}catch(e){
            return response.status(401).json({
                massage: "User is not authenticated"
            })
        //}

    }

    async remove({request, response, auth}){ //Removing a post from list
        //try{
            const user = await auth.getUser()
            const query = request.get()
            const post = query.id
            try{
                await Post.findOrFail(post)
            }catch(e){
                return response.status(404).json({
                    massage: "Post doesn't exist"
                })
            }
            const posts_ids = user && user["reading_list"] && user["reading_list"] != "" ? user["reading_list"].split(",") : []
            if(posts_ids.includes(post)){
                posts_ids.splice(posts_ids.indexOf(post),1)
                user["reading_list"] = posts_ids.toString()
            //try{
                await user.save()
                return response.status(200).json({
                    massage: "Post removed succefully"
                })
            //}catch(e){
                return response.status(500).json({
                    massage: "Error removing post",
                    error: e
                })
            //}
            }else{
                return response.status(404).json({
                    massage: "Post not found"
                })
            }
            
        //}catch(e){
            return response.status(401).json({
                massage: "User is not authenticated"
            })
        //}
    }
}

module.exports = ReadingListController
