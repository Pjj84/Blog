'use strict'
const User = use("App/Models/User");
const Post = use("App/Models/Post");
const Helpers = use("Helpers");
const Database = use("Database");
const Comment = use("App/Models/Comment")
class UserController {
    async create({ request, response}){
        const user = new User()
        if(request.input('email') && request.input('password') && request.input('email')){
            user.fullname = request.input('fullname')
            user.password = request.input('password')
            user.email = request.input('email')
            user["posts_count"] = 0
            user["comments_count"] = 0
            user.role = "Manager"
            user.description = request.input('description')

        if(request.file('pic')){
            const pic = request.file('pic', { //Getting the image from request
                types: ['image'],
                size: '2mb'
            })
            const time = new Date()
            const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name
            await pic.move(Helpers.tmpPath('profiles'), { //Moving the image to a specific directory
                name: image_name,
                overwrite: true
             })        
            if (!pic.moved()) { //Checking for errors
                resopnse.status(500).json({
                    massage: "Error saving image",
                    error: profilePic.error()
                }) 
            }
            user['profile_pic'] = image_name //Finally saving the image's name in the post instance
            }

            const registered_user = await User.query().where("email",user.email).first()
            if(registered_user){
                return response.status(500).json({massage: "User already registered"})
            }

            await user.save();
            response.status(200).json({
                massage: "user created succefully",
                data: user
            })

        }else{
            response.status(406).json({massage: "Unacceptable cridentials or empty"})
        }
    }
    async store({request, response, auth}){
        try{
            await auth.getUser()
            response.status(200).json({massage: "Already loged in"})
        }catch(error){
        try{
            const token = await auth.attempt(request.input('email'), request.input('password'))
            const user = await User.query().where("email",request.input('email')).first()
           return response.status(202).json({
                massage: "Loged in",
                user: user,
                token: token
            })
       }catch(e){
            response.status(401).json({massage: "Email and password does not match any credential"})
       }
    }
    }
    async logout({response, auth}){
        try{
            await auth.check()
            const token = auth.getAuthHeader()
            try{
                await auth.revokeTokens([token])
                response.status(200).json({
                    massage: "loged out"
                })
            }catch(e){
                response.status(500).json({
                    massage: "Error  loging out",
                    error: e
                })
            }
        }catch(e){
            response.status(401).json({massage: "You are not loged in"})
        }

    }
    async profilePic({params, response}){
        const user = await User.find(params.id)
        const pic = user && user["profile_pic"] ? user["profile_pic"] : "default.jpg"
        return response.status(200).download(Helpers.tmpPath(`profiles/${pic}`))
    }
    async edit({request, response, auth}){
        const user = await auth.getUser()
        if(request.input("fullname") && request.input("fullname") != user.fullname){
        await Comment.query().where("user_id",user.id).update({ user_fullname: request.input("fullname")})
        await Post.query().where("user_id",user.id).update({ user_fullname: request.input("fullname")})
        }
        user.fullname = request.input('fullname') || user.fullname
        user.email = request.input('email') || user.email
        user.password = request.input('password') || user.password
        user.description = request.input('description') || user.description
        if(request.file('pic')){
            const pic = request.file('pic', { //Getting the image from request
                types: ['image'],
                size: '2mb'
            })
            const time = new Date()
            const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name
            //Generating the image's name
            await pic.move(Helpers.tmpPath('profiles'), { //Moving the image to a specific directory
                name: image_name,
                overwrite: true
             })        
            if (!pic.moved()) { //Checking for errors
                resopnse.status(500).json({
                    massage: "Error saving image",
                    error: profilePic.error()
                }) 
            }
            user['profile_pic'] = image_name //Finally saving the image's name in the post instance
            }
            if(!user['profile_pic']){user['profile_pic'] = "uploads/default.jpg"}
            try{
                await user.save()
                return response.status(200).json({
                    massage: "Profile edited succefully",
                    user: user
                })
            }catch(e){
                return response.status(500).json({
                    massage: "Eror editing profile",
                    error: e
                })
            }
        
    }
    async delete(){
        const user = await auth.getUser()
        try{
            await user.delete()
            return response.status(200).json({
                massage: "User deleted successfully"
            })
        }catch(e){
            return response.status(500).json({
                massage: "Eror deleting profile",
                error: e
            })
        }
    }
    async getUser({params, response}){
            try{
                const user = await User.query().where("id",params.id).first()
                const posts = await Database.select("*").from('posts').where("user_id",user.id).where("status","Approved").orderBy("created_at").limit(5)
                for(let post of posts){
                    post["user_fullname"] = user.fullname
                }
                return response.status(200).json({
                    massage: "User loaded succefully",
                    user: user,
                    posts: posts
                })
            }catch(e){
                return response.status(500).json({
                    massage: "Error loading user",
                    error: e
                })
            }
    }
}

module.exports = UserController
