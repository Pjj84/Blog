'use strict'
const User = use("App/Models/User")
const Post = use("App/Models/Post")
const Helpers = use('Helpers')
const Drive = use('Drive')
const Like = use('App/models/Like')
const Database = use('Database')

class PostController {
    async create({request, response,auth}){
        //Authorizing the user 
        const user = await auth.getUser()
        user.postsCount = user.postsCount + 1
        //Creating the post
        const post = await new Post

        post['user_id'] =  user.id

        post.description = request.input('description') || null

        if(request.input('title')){post.title = request.input('title')}
        else{return response.noContent("Title cannot be empty")}

        if(request.input('content')){post.content = request.input('content')}
        else{return response.noContent("Content cannot be null")}

        post.keys = request.input('keys')? request.input('keys').toString():null

        if(request.file('post')){
        const pic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })
        const time = new Date()
        const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name

        await pic.move(Helpers.tmpPath('posts'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!pic.moved()) { //Checking for errors
            resopnse.status(500).json({
                massage: pic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }
        else{post.image = null}
        

        //Determining wether the post should be approved ot not
        if(user.role == 'Admin' || user.role == 'Manager'){
            post['is_approved'] = true
        }else{
            post['is_approved'] = false
        }
        
        //Returning the result 
        try{
            await post.save()
            await user.save()
            return response.status(201).json({
                massage: "Post created successfully",
                data: post
            })
        }catch(e){
            post.delete()
            return response.status(500).json({
                massage: "Error creating post",
                error: e
            })
        }
        
    }

    //Test version of download file
    /*async show(){
        const pic = await Post.findBy('writer_id',7)
        return await Drive.get(`uploads/${pic.image}`) 
    }*/ 

    async showAll({response , auth}){
       try{
        const current_user = await auth.getUser() //We need the user.id to find his/her likes
        const likes = await Database.from('likes').where('user_id',current_user.id) //The like objects that user has made before
        const posts = await Database.select("*").from('posts').orderBy("created_at",'desc') //getting all of the posts from the database
        const liked_posts_ids = [] //The ids of the posts liked by the user
        for(let like of likes){
            liked_posts_ids.push(like['post_id'])
        }
        for(let post of posts){
            if(liked_posts_ids.includes(post.id)){ //If the id of the current posts exit in the ids of the liked posts by the user, set as liked
                post['is_liked'] = true
            }else{
                post['is_liked'] = false
            }
            const user = await User.find(post['user_id'])
            post['user_fullname'] = user.fullname
        }   
        response.status(200).json({
            posts: posts
        })
        }catch(e){
            const posts = await Database.select("*").from('posts').orderBy("created_at",'desc')
            for(let post of posts){ //Getting the user fullname here by query, because it might change while edit profile
                const user = await User.find(post['user_id'])
               post['user_fullname'] = user.fullname
           }  
            return response.status(200).json({
                posts: posts
            })
         }
        
    }
    async edit({request, response, params, auth}){
          //Authorizing the user 
        const user = await auth.getUser()

        //Editing the post
        const post = await Post.findOrFail(params.id)
        if(post["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
            return response.status(401).json({
                massage: "Only the manager, admin and creator of the post can edit this post"
            })
        }
        if(request.input('title')){post.title = request.input('title')}
        else{return response.noContent("Title cannot be empty")}

        if(request.input('content')){post.content = request.input('content')}
        else{return response.noContent("Content cannot be empty")}

        post.description = request.input('description')

        post.keys = request.input('keys')? request.input('keys').toString():null

        if(request.file('post')){

        const pic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })

        const time = new Date()
        const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name

        await pic.move(Helpers.tmpPath('posts'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!pic.moved()) { //Checking for errors
            resopnse.status(500).json({
                massage: "Error saving image",
                error: profilePic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }
        else{post.image = null}

        //Determining wether the post should be approved ot not
        if(user.role == 'Admin' || user.role == "Manager"){
            post['is_approved'] = true
        }else{
            post['is_approved'] = false
        }

        //Returning the result 
        try{
            await post.save()
            response.status(201).json({
                massage: "Post edited successfully",
                data: post
            })
        }catch(e){
            await post.delete()
            return response.status(500).json({
                massage: "Error editing post",
                error: e
            })
        }
        
    
    }
    async delete({response, params, auth}){
        const post = await Post.findOrFail(params.id)
        const user = await auth.getUser()
        if(post["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
            return response.status(401).json({
                massage: "Only the manager, admin and creator of the post can delete this post"
            })
        }
        const creator = await User.findOrFail(post["user_id"])
        creator.postsCount = creator.postsCount - 1
        try{
            await post.delete()
            await creator.save()
            return response.ok("Deleted succefully")
        }catch(e){
            return response.json({
                massage: "Error deleting post",
                error: e
            })
        }
    }
    async showControlled({request, response, auth}){
        //Here $ is used for variable posts to prevent pollution within other functions and declared a const post to used the $posts value outside of its block scope
        const user = await auth.getUser()
        try{
        if(user.role == "Manager" || user.role == "Admin"){
            var $posts = await Database.select("*").from('posts').orderBy("created_at",'desc')
        }else{
            var $posts = await Database.select("*").from('posts').where("user_id",user.id).orderBy("created_at",'desc')
        }
        try{
            const posts = $posts
            for(let post of posts){
                const user = await User.find(post['user_id'])
                post["user_fullname"] = user.fullname
            }
            const likes = await Database.select("*").from("likes").where("user_id",user.id)
            const liked_posts_ids = []
            for(let like of likes){
                liked_posts_ids.push(like['post_id'])
            }
            for(let post of posts){
                if(liked_posts_ids.includes(post.id)){
                    post['is_liked'] = true
                }else{
                    post['is_liked'] = false
                }
            }
            return response.status(200).json({
                massage: "Posts loaded succefully",
                posts: posts
            })
            }catch(e){
                //const posts = $posts
                for(let post of posts){
                    post["is_liked"] = false
                }
                return response.status(200).json({
                    massage: "Posts loaded succefully",
                    posts: posts
                })
            }
        }catch(e){return response.status(500).json({massage: "Error loading posts"})}
        
    
    }
    async like({params, auth, response}){
            const user = await auth.getUser()
            const post = await Post.findOrFail(params.id)
            post.likes = post.likes - 1
            let like = await Like.query().where("user_id",user.id).where("post_id",post.id).first()
            if(like){
                
                try{
                await like.delete()
                await post.save()
                return response.status(200).json({
                    massage: "Like removed successfully"
                })
                }catch(e){
                return response.status(500).json({
                    massage: "Error removing like",
                    error: e
                })
            }
            }else{
                let like = await new Like
                like["user_id"] = user.id
                like["post_id"] = post.id
                post.likes = post.likes - 1
                try{
                    await like.save()
                    await post.save()
                    return response.status(200).json({
                        massage: "Post liked successfully"
                    })
                }catch(e){
                    return response.status(500).json({
                        massage: "Error liking",
                        error: e
                    })
                }
            }
    }
    async postPic({params, response}){
        const post = await Post.findOrFail(params.id)
        return response.status(200).download(Helpers.tmpPath(`posts/${post.image}`))
    }
    async singlePost({params, response, auth}){
        try{const post = await Post.query().with("comments").where("id",params.id).first()}catch(e){return response.status(500).json({massage: "Post not found"})}
        const post = await Post.query().with("comments").where("id",params.id).first()
        const creator = await User.findOrFail(post["user_id"])
        post["user_fullname"] = creator.fullname
        const user = await auth.getUser()
        const like = await Like.query().where("post_id",post.id).where("user_id",user.id).first()
        if(like){
            post["is_liked"] = true
        }else{
            post["is_liked"] = false
        }
        return response.status(200).json({
            massage: "Post loaded successfully",
            post: post
        })
        
    }
}

module.exports = PostController
