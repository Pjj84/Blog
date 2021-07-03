'use strict'
const User = use("App/Models/User");
class UserController {
    async create({ request, response}){
        const user = new User()
    if(request.input('username') && request.input('password')){
        user.username = request.input('username')
        user.password = request.input('password')
        user.email = request.input('email')
        user['is_admin'] = false
        await user.save();
        response.json({
            massage: "user created succefully",
            data: user
        })
    }
    else{
        response.json({
            massage: "error occured",
            data: user
        })
    }
    }
    async store({request, response, auth}){
        try{
            await auth.getUser()
            return response.json({
                massage: "You are already signed in"
            })
        }catch(error){
        try{
            const token = await auth.attempt(request.input('username'), request.input('password'))
            return response.json({
                massage: 'logedin',
                data: token
                
            })
        }catch(e){
            token.delete()
            return response.json({
                massage: e
                
            })
        }
    }
    }
    async logout({response, auth}){
        try{
            await auth.check()
        }catch(e){
            return response.json({
                massage: "Missing or invalid token"
            })
        }
        const token = auth.getAuthHeader()
        try{
            await auth.revokeTokens([token])
            response.json({
                massage: "loged out"
            })
        }catch(e){
            response.json({
                massage: e
            })
        }

    }
}

module.exports = UserController
