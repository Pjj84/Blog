'use strict'
const User = use("App/Models/User")
const Post = use("App/Models/Post")
const Helpers = use('Helpers')
const Drive = use('Drive')
const Like = use('App/Models/Like')
const Database = use('Database')
const Comment = use('App/Models/Comment')
const Tag = use("App/Models/Tag")

class PostController {
    async create({request, response,auth}){
        //Authorizing the user 
        const user = await auth.getUser()
        user["posts_count"] = user["posts_count"] + 1
        //Creating the post
        const post = await new Post

        post['user_id'] =  user.id

        post["user_fullname"] = user.fullname

        post.description = request.input('description') || null

        if(request.input('title')){post.title = request.input('title')}
        else{return response.status(422).json({massage: "Title can not be empty"})}

        if(request.input('content')){post.content = request.input('content')}
        else{return response.status(422).json({massage: "Content can not be empty"})}

        if(!request.input('tags') || request.input('tags').length == 0){return response.status(422).json({massage: "Tags can not be empty"})}
        post.tags = ""
        for(let tag of request.input('tags').split(",")){
            post.tags += `,${tag.trim()}`
        }
        post.tags = post.tags.substring(1,post.tags.length)
        //.toString().substring(1,request.input('tags').length-1)
                                          //The code commented above must be added to code because the request... is an array
        if(request.file('post')){
        const pic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })
        const time = new Date()
        const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name

        await pic.move(Helpers.tmpPath('posts'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!pic.moved()) { //Checking for errors
            resopnse.status(500).json({
                massage: pic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }
        else{post.image = null}
        

        //Determining wether the post should be approved ot not
        if(user.role == 'Admin' || user.role == 'Manager'){
            post['status'] = "Approved"
        }else{
            post['status'] = "Pending"
        }

        try{
            await post.save()
            await user.save()
        }catch(e){
            post.delete()
            return response.status(500).json({
                massage: "Error creating post",
                error: e
            })
        }
        //handling the tags
        for(let single_tag of request.input("tags").split(",")){//The split here must be removed because the request... is an array
            const tag = await Tag.query().where("text",single_tag).first()
            if(tag){
                const ids = tag["posts_id"].split(",")
                ids.push(post.id.toString())
                tag["posts_id"] = ids.toString().substring(0,ids.toString().length + 1)
                tag["posts_count"] = tag["posts_count"] + 1
            }else{
            var $tag = new Tag
                $tag.text = single_tag
            //const $post = await Post.last()
                $tag["posts_id"] = post.id.toString() //$post.id + 1
                $tag["posts_count"] = 1
            }
            const helper_var = $tag || tag
            try{
                await helper_var.save()
            }catch(e){
                return response.status(500).json({
                    massage: "Error saving tag",
                    error:e
                })
            }
        }
        return response.status(200).json({
            massage: "Post created successfully"
        })
    }

    async showAll({response , auth}){
       try{
        const current_user = await auth.getUser() //We need the user.id to find his/her likes
        const likes = await Database.select("*").from('likes').where('user_id',current_user.id) //The like objects that user has made before
        const posts = await Database.select("*").from('posts').where("status","Approved").orderBy("created_at",'desc') //getting all of the posts from the database
        const liked_posts_ids = [] //The ids of the posts liked by the user
        for(let like of likes){
            liked_posts_ids.push(like['post_id'])
        }
        for(let post of posts){
            if(liked_posts_ids.includes(post.id)){ //If the id of the current posts exit in the ids of the liked posts by the user, set as liked
                post['is_liked'] = true
            }else{
                post['is_liked'] = false
            }
            const user = await User.find(post['user_id'])
            post['user_fullname'] = user.fullname
        }   
        response.status(200).json({
            posts: posts
        })
        }catch(e){
            const posts = await Database.select("*").from('posts').where("status","Approved").orderBy("created_at",'desc')
            for(let post of posts){ //Getting the user fullname here by query, because it might change while edit profile
                const user = await User.find(post['user_id'])
               post['user_fullname'] = user.fullname
           }  
            return response.status(200).json({
                posts: posts
            })
         }
        
    }
    async edit({request, response, params, auth}){
          //Authorizing the user 
        const user = await auth.getUser()

        //Editing the post
        const post = await Post.find(params.id)
        if(!post){
            return response.status(404).json({massage: "Post not found"})
        }
        if(post["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
            return response.status(401).json({
                massage: "Only the manager, admin and creator of the post can edit this post"
            })
        }
        if(request.input('title')){post.title = request.input('title')}

        if(request.input('content')){post.content = request.input('content')}
        
        if(request.input('description')){post.description = request.input('description')}

        const tag_holder = post.tags //We need to keep the previous tags of the post for later use in tag handler
        post.tags = ""
        for(let tag of request.input('tags').split(",")){ //the split should be commented
            tag = tag.trim()
            post.tags += `,${tag}`
        }
        post.tags = post.tags.substring(1,post.tags.length)
        //The code commented above must be added to code because the request... is an array
        if(request.file('post')){

        const pic = request.file('post', { //Getting the image from request
            types: ['image'],
            size: '2mb'
        })

        const time = new Date()
        const image_name = `${time.getFullYear()}-${time.getMonth()}/${new Date().getTime()}.${pic.subtype}` //Generating the image's name

        await pic.move(Helpers.tmpPath('posts'), { //Moving the image to a specific directory
            name: image_name,
            overwrite: true
         })

        
        if (!pic.moved()) { //Checking for errors
            resopnse.status(500).json({
                massage: "Error saving image",
                error: profilePic.error()
            }) 
        }

        post.image = await image_name //Finally saving the image's name in the post instance

        }

        //Determining wether the post should be approved ot not
        if(user.role == 'Admin' || user.role == "Manager"){
            post['status'] = "Approved"
        }else{
            post['status'] = "Pending"
        }

        //Returning the result 
        try{
            await post.save()
        }catch(e){
            return response.status(500).json({
                massage: "Error editing post",
                error: e
            })
        }

        //handling the tags
                for(let holder of post.tags.split(",")){//The split here must be removed because the request... is an array
                if(!tag_holder.includes(holder)){ //Check if the prevoius tags include this new tag or not
                    const tag = await Tag.query().where("text",holder).first()
                    if(tag){
                        const ids = tag["posts_id"].split(",")
                        ids.push(post.id)
                        tag["posts_id"] = ids.toString().substring(0,ids.toString().length + 1)
                        tag["posts_count"] = tag["posts_count"] + 1
                    }else{
                    var $tag = new Tag
                        $tag.text = holder.trim()
                    //const $post = await Post.last()
                        $tag["posts_id"] = post.id.toString() //$post.id + 1
                        $tag["posts_count"] = 1
                    }
                    const helper_var = $tag || tag
                    try{
                        await helper_var.save()
                    }catch(e){
                        return response.status(500).json({
                            massage: "Error saving tag",
                            error:e
                        })
                    }
                    }
                }
                for(let holder of tag_holder.split(",")){
                    if(!post.tags.includes(holder)){ //Check if the previous tag is still or not 
                        const tag = await Tag.query().where("text", holder).first()
                        const helper_var = tag["posts_id"].split(",")
                        const id_index = helper_var.indexOf(post.id.toString())
                        helper_var.splice(id_index,1)
                        tag["posts_id"] = helper_var.toString()
                        tag["posts_count"] = tag["posts_count"] - 1
                        try{
                            await tag.save()
                        }catch(e){
                            return response.status(500).json({
                                massage: "Error editing tags"
                            })
                        }
                    }
                }
                return response.status(200).json({
                    massage: "Post edited successfully"
                })
    }
    async delete({response, params, auth}){
        const post = await Post.find(params.id)
        if(!post){
            return response.status(404).json({massage: "Post not found"})
        }
        const user = await auth.getUser()
        if(post["user_id"] != user.id && user.role != "Admin" && user.role != "Manager"){
            return response.status(401).json({
                massage: "Only the manager, admin and creator of the post can delete this post"
            })
        }
        const creator = await User.find(post["user_id"])
        if(!creator){
            return response.status(404).json({massage: "The creator of the post not found"})
        }
        creator["posts_count"] = creator["posts_count"] - 1
        for(let holder of post.tags.split(",")){
            const tag = await Tag.query().where("text", holder).first()
            const helper_var = tag["posts_id"].split(",")
            const id_index = helper_var.indexOf(post.id.toString())
            helper_var.splice(id_index,1)
            tag["posts_id"] = helper_var.toString()
            tag["posts_count"] = tag["posts_count"] - 1
            try{
                await tag.save()
            }catch(e){
                return response.status(500).json({
                     massage: "Error editing tags"
                })
            }
        }
        try{
            await post.delete()
            await creator.save()
            return response.status(200).json({mssage: "Deleted succefully"})
        }catch(e){
            return response.status(500).json({
                massage: "Error deleting post",
                error: e
            })
        }
    }
    async showControlled({request, response, auth}){
        //Here $ is used for variable posts to prevent pollution within other functions and declared a const post to used the $posts value outside of its block scope
        const user = await auth.getUser()
        try{
            var $posts = await Database.select("*").from('posts').where("user_id",user.id).orderBy("created_at",'desc')
        try{
            const posts = $posts
            for(let post of posts){
                const user = await User.find(post['user_id'])
                post["user_fullname"] = user.fullname
            }
            const likes = await Database.select("*").from("likes").where("user_id",user.id).orderBy("created_at")
            const liked_posts_ids = []
            for(let like of likes){
                liked_posts_ids.push(like['post_id'])
            }
            for(let post of posts){
                if(liked_posts_ids.includes(post.id)){
                    post['is_liked'] = true
                }else{
                    post['is_liked'] = false
                }
            }
            return response.status(200).json({
                massage: "Posts loaded succefully",
                posts: posts
            })
            }catch(e){
                const posts = $posts
                for(let post of posts){
                    post["is_liked"] = false
                }
                return response.status(200).json({
                    massage: "Posts loaded succefully",
                    posts: posts
                })
            }
        }catch(e){return response.status(500).json({massage: "Error loading posts"})}  
    
    }
    async like({params, auth, response}){
            const user = await auth.getUser()
            const post = await Post.find(params.id)
            if(!post){
                return response.status(404).json({massage: "Post not found"})
            }
            let like = await Like.query().where("user_id",user.id).where("post_id",post.id).first()
            if(like){
                post.likes = post.likes - 1
                try{
                await like.delete()
                await post.save()
                return response.status(200).json({
                    massage: "Like removed successfully"
                })
                }catch(e){
                return response.status(500).json({
                    massage: "Error removing like",
                    error: e
                })
            }
            }else{
                let like = await new Like
                like["user_id"] = user.id
                like["post_id"] = post.id
                post.likes = post.likes + 1
                try{
                    await like.save()
                    await post.save()
                    return response.status(200).json({
                        massage: "Post liked successfully"
                    })
                }catch(e){
                    return response.status(500).json({
                        massage: "Error liking",
                        error: e
                    })
                }
            }
    }
    async postPic({params, response}){
        const post = await Post.find(params.id)
        if(!post){
            return response.status(404).json({massage: "Post not found"})
        }
        return response.status(200).download(Helpers.tmpPath(`posts/${post.image}`))
    }
    async singlePost({params, response, auth}){
        const post = await Post.query().where("id",params.id).first()
        if(!post){
            return response.status(404).json({
                message:"Post not found"
            })
        }
        try{
        const user = await auth.getUser()
        const comments = await Database.select("*").from("comments").where("post_id",post.id).where("status","Approved").where("reply_to",null).orderBy("created_at")
        let counter = comments.length
        for(let comment of comments){
            const replies = comment.replies ? comment.replies.split(",") : []
            comment["replying_comments"] = []
            for(let i=0;i<replies.length;i++){
                const partial_comment = await Comment.find(replies[i])
                if(partial_comment && partial_comment.status == "Approved"){
                comment["replying_comments"].push(partial_comment)
                counter++
                }
            }
        }
        const creator = await User.find(post["user_id"])
        if(!creator){
            return response.status(404).json({massage: "The creator of the post not found"})
        }
        post["user_fullname"] = creator.fullname
        const like = await Like.query().where("post_id",post.id).where("user_id",user.id).first()
        if(like){
            post["is_liked"] = true
        }else{
            post["is_liked"] = false
        }
        post.comments = comments
        post["comment_count"] = counter
        return response.status(200).json({
            massage: "Post loaded successfully",
            post: post
        })
        }catch(e){
            const comments = await Database.select("*").from("comments").where("post_id",post.id).where("status","Approved").where("reply_to",null).orderBy("created_at")
            let counter = comments.length
            for(let comment of comments){
                const replies = comment.replies ? comment.replies.split(",") : []
                comment["replying_comments"] = []
                for(let i=0;i<replies.length;i++){
                    const partial_comment = await Comment.find(replies[i])
                    if(partial_comment && partial_comment.status == "Approved"){
                    comment["replying_comments"].push(partial_comment)
                    counter++
                    }
                }
            }
            const creator = await User.find(post["user_id"])
            if(!creator){
                return response.status(404).json({massage: "The creator of the post not found"})
            }
            post["user_fullname"] = creator.fullname
            post.comments = comments
            post["comment_count"] = counter
            return response.status(200).json({
                massage: "Post loaded successfully",
                post: post
            })
        }
        
    }
}

module.exports = PostController
