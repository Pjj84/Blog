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
        if(!user){
            return response.json({
                massage: "Missing or invalid token"
            })
        }

        //Creating the post
        const post = await new Post

        post['writer_id'] =  user.id

        post['writer_name'] = user.username

        if(request.input('title')){post.title = request.input('title')}
        else{post.title = null}

        if(request.input('content')){post.content = request.input('content')}
        else{post.content = null}

        post.keys = request.input('keys')? request.input('keys').toString():null

        if(request.file('post')){

        const profilePic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })

        const image_name = `${new Date().getTime()}.${profilePic.subtype}` //Generating the image's name

        await profilePic.move(Helpers.tmpPath('uploads'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!profilePic.moved()) { //Checking for errors
            resopnse.json({
                massage: profilePic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }
        else{post.image = null}

        //Determining wether the post should be approved ot not
        if(user['is_admin'] === true){
            post['is_approved'] = true
        }else{
            post['is_approved'] = false
        }

        //Returning the result 
        try{
            await post.save()
            return response.json({
                massage: "Post created successfully",
                data: post
            })
        }catch(e){
            post.delete()
            return response.json({
                massage: "Cannot create post",
                error: e
            })
        }
        
    }

    //Test version of download file
    /*async show(){
        const pic = await Post.findBy('writer_id',7)
        return await Drive.get(`uploads/${pic.image}`) 
    }*/ 

    async show_all({request, response , auth}){
        const likes = await Database.from('likes').where('user_id',await auth.getUser().id)
        const likes_count = await Like.query().where('user_id',await auth.getUser().id).count()
        const posts = await Database.select("*").from('posts')
        const liked_posts_ids = []
        for(let i=0;i<likes_count[0].count;i++){
            liked_posts_ids.push(likes[i]['post_id'])
        }
        for(let i=0;i<liked_posts_ids.length;i++){
            if(liked_posts_ids.includes(posts[i].id)){
                posts[i]['is_liked'] = true
            }
        }   
    }
    async edit({request, response, params, auth}){
          //Authorizing the user 
        const user = await auth.getUser()
        if(!user){
            return response.json({
                massage: "Missing or invalid token"
            })
        }

        //Creating the post
        const post = await Post.findOrFail(params.id)

        if(request.input('title')){post.title = request.input('title')}
        else{post.title = null}

        if(request.input('content')){post.content = request.input('content')}
        else{post.content = null}

        post.keys = request.input('keys')? request.input('keys').toString():null

        if(request.file('post')){

        const pic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })

        const image_name = `${new Date().getTime()}.${pic.subtype}` //Generating the image's name

        await pic.move(Helpers.tmpPath('uploads'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!pic.moved()) { //Checking for errors
            resopnse.json({
                massage: "Cannot save image",
                error: profilePic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }
        else{post.image = null}

        //Determining wether the post should be approved ot not
        if(user['is_admin'] === true){
            post['is_approved'] = true
        }else{
            post['is_approved'] = false
        }

        //Returning the result 
        try{
            await post.save()
            return response.json({
                massage: "Post edited successfully",
                data: post
            })
        }catch(e){
            await post.delete()
            return response.json({
                massage: "Cannot edit post",
                error: e
            })
        }
        
    
    }
    async delete({response, params, auth}){
        try{
            await auth.check()
        }catch(e){
            return response.json({
                massage: "Missing or invalid token"
            })
        }
        const post = await Post.findOrFail(params.id)
        try{
            post.delete()
            return response.json({
                massage: "Deleted succefully!"
            })
        }catch(e){
            return response.json({
                massage: e
            })
        }
    }
}

module.exports = PostController
