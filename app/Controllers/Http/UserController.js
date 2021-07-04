'use strict'
const User = use("App/Models/User");
class UserController {
    async create({ request, response}){
        const user = new User()
    if(request.input('email') && request.input('password') && request.input('email')){
        user.fullname = request.input('fullname')
        user.password = request.input('password')
        user.email = request.input('email')
        user['is_admin'] = false
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
            response.status(202).json({
                massage: "Loged in",
                token: token
            })
        }catch(e){
            if(await auth.attempt(request.input('email'), request.input('password'))){
            return 1
            }
            response.unauthorized("Wrong username or password")
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
}

module.exports = UserController
