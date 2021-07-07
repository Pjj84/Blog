'use strict'
const User = use("App/Models/User");
const Helpers = use("Helpers");
class UserController {
    async create({ request, response}){
        const user = new User()
    if(request.input('email') && request.input('password') && request.input('email')){
        user.fullname = request.input('fullname')
        user.password = request.input('password')
        user.email = request.input('email')
        user.postsCount = 0
        user.role = "User"
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
            else{user['profile_pic'] = null}
        await user.save();
        response.status(200).json({
            massage: "user created succefully",
            data: user
        })
    }
    else{
        response.notAcceptable("Unacceptable cridentials or empty");
    }
    }
    async store({request, response, auth}){
        try{
            await auth.getUser()
            response.ok("Already loged in")
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
            response.unauthorized("Email and password does not match any credential")
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
            response.unauthorized("You are not loged in")
        }

    }
    async profilePic({params, response}){
        const user = await User.findOrFail(params.id)
        return response.status(200).download(Helpers.tmpPath(`profiles/${user['profile_pic']}`))
    }
    async edit({request, response, auth}){
        const user = await auth.getUser()
        user.fullname = request.input('fullname')
        user.email = request.input('email')
        user.password = request.input('password')
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
            else{user['profile_pic'] = null}
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
    async allUsers({auth, response}){
        try{
            const user = await auth.getUser() //Should write a middleware for this function
            const users = await User.all()
            return response.status(200).json({
                massage: "Users loaded successfully",
                users: users
            })
        }catch(e){
            return response.status(500).json({
                massage: "Error loading users",
                error: e
            })
        }

    }
}

module.exports = UserController
