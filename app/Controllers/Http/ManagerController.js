'use strict'
const User = use("App/Models/User")

class ManagerController {
    async deleteUser({response, params}){
        //try{
            const user = await User.findOrFail(params.id)
            await user.delete()
            return response.status(200).json({
                massage: "User deleted"
            })
         //   }catch(e){
          //  return response.status(500).json({
           //     massage: "Error deleting user",
           //     error: e
           // })
            //}
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
        try{
        const user = await User.findOrFail(params.id)
        user.role = "Admin"
        user.save()
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
        try{
            const user = await User.findOrFail(params.id)
            user.role = "User" 
            user.save()
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
