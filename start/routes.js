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

Route.post('/register','UserController.create').as('register')

Route.post("/login","UserController.store").as("login")

Route.post('/logout','UserController.logout').as("logout")

Route.post("/post",'PostController.create').as("post")

Route.get('/showposts',"PostController.showAll").as("allposts")

Route.post("/editpost/:id","PostController.edit").as("editPost")

Route.post("/deletepost/:id","PostController.delete").as("deletePost")

Route.get("/myposts","PostController.showControlled").as("myposts")

Route.post("/like","PostController.like").as("like")

Route.post("/comment/:post_id/:comment_id?","CommentController.create").as("comment")

Route.post("/editcomment/:id","CommentController.edit").as("editComment")

Route.post("/deletecomment/:id","CommentController.delete").as("deleteComment")

Route.get("/showcomments/:id","CommentController.show").as("showComment")
//--------------------------------------------------------------------------------------------------------------
//These routes below are just scecthing, they may not work properly
Route.on("/test").render("test");

Route.get('/testlike','PostController.test')

