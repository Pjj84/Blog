'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

const Helpers = use('Helpers');

const Drive = use('Drive');

Route.on('/').render('welcome');

Route.post('/register','UserController.create').as('register').middleware("guest")

Route.post("/login","UserController.store").as("login").middleware("guest")

Route.post('/logout','UserController.logout').as("logout").middleware("auth")

Route.put("/edituser","UserController.edit").as("editUser").middleware("auth")

Route.delete("/deleteuser","UserController.delete").as("deleteUser").middleware("auth")

Route.get("/getuser","UserController.getUser").as("getUser").middleware("auth")

Route.post("/post",'PostController.create').as("post").middleware("auth")

Route.get('/showposts',"PostController.showAll").as("allposts")

Route.put("/editpost/:id","PostController.edit").as("editPost").middleware("auth")

Route.delete("/deletepost/:id","PostController.delete").as("deletePost").middleware("auth")

Route.get("/myposts","PostController.showControlled").as("myposts").middleware("auth")

Route.post("/like/:id","PostController.like").as("like").middleware("auth")

Route.post("/comment/:post_id/:comment_id?","CommentController.create").as("comment")

Route.put("/editcomment/:id","CommentController.edit").as("editComment")

Route.delete("/deletecomment/:id","CommentController.delete").as("deleteComment")

Route.get("/showcomments/:id","CommentController.show").as("showComment")

Route.get("/pic/:id","UserController.profilePic").as("profilePic")

Route.get("/img/:id","PostController.postPic").as("postImage")

Route.get("/singlepost/:id","PostController.singlePost").as("singlePost").middleware("auth")

Route.get("/pendingposts","AdminController.pendingPosts").as("pendingPosts").middleware("admin").middleware("auth")

Route.get("/pendingcomments","AdminController.pendingComments").as("pendingComments").middleware("admin").middleware("auth")

Route.post("/approvepost","AdminController.approvePost").as("approvePost").middleware("admin").middleware("auth")

Route.post("/approvecomment","AdminController.approveComment").as("approveComment").middleware("admin").middleware("auth")

Route.delete("/kickuser","ManagerController.deleteUser").as("kick").middleware("manager").middleware("auth")

Route.get("/allusers","ManagerController.allUsers").as("allUsers").middleware("manager").middleware("auth")

Route.put("/promote",'ManagerController.promote').as("promote").middleware("manager").middleware("auth")

Route.put("/demote",'ManagerController.demote').as("demote").middleware("manager").middleware("auth")
//--------------------------------------------------------------------------------------------------------------
//These routes below are just scecthing, they may not work properly
Route.get("/test",value => {const time =  new Date()
const local = `${time.getFullYear()}/${time.getMonth()}`
return local})

