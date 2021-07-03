'use strict'
const User = use("App/Models/User")
const Post = use("App/Models/Post")
const Helpers = use('Helpers')
const Drive = use('Drive')

class PostController {
    async create({request, response,auth}){
        //Authorizing the user 
        /*try{
            const user = await auth.getUser()
        }catch(e){
            return response.json({
                massage: "Missing or invalid token",
                error: e
            })
        }*/

        //Creating the post
        const post = await new Post

        post['writer_id'] =  7//user.id

        post['writer_name'] = 'parsa' //user.username

        post.title = "test"

        if(request.input('content')){post.content = request.input('content')}
        else{post.content = null}

        post.keys = request.input('keys')? request.input('keys'):null

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

       /* if (!profilePic.moved()) { //Checking for errors
            resopnse.json({
                massage: profilePic.error()
            }) 
        }*/

        post.image = await image_name //Finally saving the image's name in the post instance

        }

        //Determining wether the post should be approved ot not
        post['is_approved'] = true
        /*if(user['is_admin'] === true){
            post['is_approved'] = true
        }else{
            post['is_approved'] = false
        }*/

        //Returning the result 
        try{
             await post.save()
            response.json({
                massage: "Post created successfully",
                data: post
            })
        }catch(e){
            response.json({
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
        const post = Post.query().paginate(1,3)
        return post
            
    }
    
}

module.exports = PostController
