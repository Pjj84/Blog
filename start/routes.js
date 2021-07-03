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

Route.get('/show',"PostController.show_all").as("show_all")

Route.post("/edit/:id","PostController.edit").as("edit")

Route.post("/delete/:id","PostController.delete").as("delete")
//--------------------------------------------------------------------------------------------------------------
//These routes below are just scecthing, they may not work properly
Route.on("/test").render("test");

Route.get('/testlike','PostController.test')