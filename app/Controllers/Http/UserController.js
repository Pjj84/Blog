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
            const token = await auth.attempt(request.input('username'), request.input('password'))
            return atob(token)
            return response.json({
                massage: 'logedin',
                data: token,
                decoded: atob(token)
            })
        }catch(e){
            return response.json({
                massage: e,
                data: decode_base64(token)
            })
        }
    }
    async logout({response, auth}){
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
