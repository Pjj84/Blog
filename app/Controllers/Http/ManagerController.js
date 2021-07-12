'use strict'
const User = use("App/Models/User")

class ManagerController {
    async deleteUser({response, params}){
        const user = await User.find(params.id)
        if(!user){
            return response.status(404).json({massage: "User not found"})
        }
        if(user.role == "Manager"){
            return response.status(401).json({massage: "You can not kick a manager"})
        }
        try{
            await user.delete()
            return response.status(200).json({
                massage: "User deleted"
            })
            }catch(e){
            return response.status(500).json({
                massage: "Error deleting user",
                error: e
            })
            }
    }
    async allUsers({response}){
        try{
            const users = await User.query().whereNot("role","Manager").fetch()
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
    async promote({request, params, response}){
        const user = await User.find(params.id)
        if(!user){
            return response.status(404).json({massage: "User not found"})
        }
        try{
        user.role = "Admin"
        await user.save()
        return response.status(200).json({
            massage: "User promoted successfully"
        })
        }catch(e){
            return response.status(500).json({
                massage: "Error promoting user",
                error: e
            })
        }
    }
    async demote({params, response}){
        const user = await User.find(params.id)
        if(!user){
            return response.status(404).json({massage: "User not found"})
        }
        try{
            user.role = "User" 
            await user.save()
            return response.status(200).json({
                massage: "User demoted"
            })
            }catch(e){
                return response.status(500).json({
                    massage: "Error deomoting user",
                    error: e
                })
            }
    }
}

module.exports = ManagerController
