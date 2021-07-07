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
        try{//Dont forget to try foreach which you learned
        const current_user = await auth.getUser() //We need the user.id to find his/her likes
        const likes = await Database.from('likes').where('user_id',current_user.id) //The like objects that user has made before
        const likes_count = await Like.query().where('user_id',current_user.id).count() //The count of the likes, which is needed for the loop
        const posts = await Database.select("*").from('posts').orderBy("created_at",'desc') //getting all of the posts from the database
        const liked_posts_ids = [] //The ids of the posts liked by the user
        for(let i=0;i<likes_count[0].count;i++){
            liked_posts_ids.push(likes[i]['post_id'])
        }
        for(let i=0;i<posts.length;i++){
            if(liked_posts_ids.includes(posts[i].id)){ //If the id of the current posts exit in the ids of the liked posts by the user, set as liked
                posts[i]['is_liked'] = true
            }else{
                post[i]['is_liked'] = false
            }
            const user = await User.find(posts[i]['user_id'])
            posts[i]['user_fullname'] = user.fullname
        }   
        response.status(200).json({
            posts: posts
        })
        }catch(e){
            const posts = await Database.select("*").from('posts').orderBy("created_at",'desc')
            for(let i=0;i<posts.length;i++){ //Getting the user fullname here by query, because it might change while edit profile
                const user = await User.find(posts[i]['user_id'])
                posts[i]['user_fullname'] = user.fullname
            }  
            return response.status(200).json({
                posts: posts
            })
        }
        
    }
    async edit({request, response, params, auth}){
          //Authorizing the user 
        const user = await auth.getUser()
        if(!user){
            return response.unauthorized("Missing or invalid token")
        }

        //Editing the post
        const post = await Post.findOrFail(params.id)

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
        const user = await auth.getUser()
        const post = await Post.findOrFail(params.id)
        user.postsCount = user.postsCount - 1
        try{
            await post.delete()
            await user.save()
            return response.ok("Deleted succefully")
        }catch(e){
            return response.json({
                massage: "Error deleting post",
                error: e
            })
        }
    }
    async showControlled({request, response, auth}){
        const user = await auth.getUser()
        if(user.role == "Manager" || user.role == "Admin"){
            return response.status(200).json(await Post.all())
        }else{
            return response.status(200).json(await Post.query().where('user_id',user.id).fetch())
        }
    }
    async like({params, auth, response}){
        const post = await Post.findOrFail(params.id)
        const user = await auth.getUser()
        const like = new Like
        post.likes++;
        like['user_id'] = user.id
        like["post_id"] = post.id
        try{
        await like.save()
        await post.save()
        return response.status(200).json({
            massage: "Post liked succefully"
        })
        }catch(e){
            return response.status(500).json({
                massage: 'Error liking',
                error: e
            })
        }
    }
    async postPic({params, response}){
        const post = await Post.findOrFail(params.id)
        return response.status(200).download(Helpers.tmpPath(`posts/${post.image}`))
    }
    async singlePost({params, response, auth}){
        try{const post = await Post.query().with("comments").where("id",params.id).first()}catch(e){return response.status(500).json({massage: "Post not found"})}
        try{
        const post = await Post.query().with("comments").where("id",params.id).first()
        const user = await auth.getUser()
        const like = await Like.query().where("post_id",post.id).where("user_id",user.id).fetch()
        post["is_liked"] = true
            return response.status(200).json({
                post: post
            })
        }catch(e){
            const post = await Post.query().with("comments").where("id",params.id).first()
            post["is_liked"] = false
            return response.status(200).json({
                post: post
            })
        }
        
    }
}

module.exports = PostController
