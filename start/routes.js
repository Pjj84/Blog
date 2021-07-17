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

Route.get("/getuser/:id","UserController.getUser").as("getUser")

Route.post("/post",'PostController.create').as("post").middleware("auth")

Route.get('/showposts',"PostController.showAll").as("allposts")

Route.put("/editpost/:id","PostController.edit").as("editPost").middleware("auth")

Route.delete("/deletepost/:id","PostController.delete").as("deletePost").middleware("auth")

Route.get("/myposts","PostController.showControlled").as("myposts").middleware("auth")

Route.post("/like/:id","PostController.like").as("like").middleware("auth")

Route.post("/comment/:post_id/:comment_id?/:name?","CommentController.create").as("comment")

Route.put("/editcomment/:id","CommentController.edit").as("editComment")

Route.delete("/deletecomment/:id","CommentController.delete").as("deleteComment")

Route.get("/showcomments/:id","CommentController.show").as("showComment")

Route.get("/pic/:id?","UserController.profilePic").as("profilePic")

Route.get("/img/:id","PostController.postPic").as("postImage")

Route.get("/singlepost/:id","PostController.singlePost").as("singlePost")

Route.get("/pendingposts","AdminController.pendingPosts").as("pendingPosts").middleware("admin").middleware("auth")

Route.get("/pendingcomments","AdminController.pendingComments").as("pendingComments").middleware("admin").middleware("auth")

Route.post("/approvepost/:id","AdminController.approvePost").as("approvePost").middleware("admin").middleware("auth")

Route.post("/approvecomment/:id","AdminController.approveComment").as("approveComment").middleware("admin").middleware("auth")

Route.delete("/kickuser/:id","ManagerController.deleteUser").as("kick").middleware("manager").middleware("auth")

Route.get("/allusers","ManagerController.allUsers").as("allUsers").middleware("manager").middleware("auth")

Route.put("/promote/:id",'ManagerController.promote').as("promote").middleware("manager").middleware("auth")

Route.put("/demote/:id",'ManagerController.demote').as("demote").middleware("manager").middleware("auth")

Route.get("/tags","TagController.populars").as("popularTags")

Route.post("/tagedposts","TagController.posts").as("tagedPosts")

Route.get("/readinglist","ReadingListController.load").as("savedPosts").middleware("auth")

Route.put("/save","ReadingListController.add").as("save").middleware("auth")

Route.put("/unsave","ReadingListController.remove").as("unsave").middleware("auth")

Route.get("/alltags","TagController.all")
