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
        user['is_admin'] = false
        if(request.file('pic')){
            const pic = request.file('pic', { //Getting the image from request
                types: ['image'],
                size: '2mb'
            })
            const image_name = `${new Date().getTime()}.${pic.subtype}` //Generating the image's name
            await pic.move(Helpers.tmpPath('uploads'), { //Moving the image to a specific directory
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
            const user = await User.query().where("email",request.input('email')).fetch()
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
        return response.download(Helpers.tmpPath(`uploads/${user['profile_pic']}`))
    }
}

module.exports = UserController
