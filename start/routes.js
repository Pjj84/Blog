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

Route.post('/register','UserController.create')

Route.post("/login","UserController.store").as("login")

Route.post('/logout','UserController.logout')

Route.post("/post",'PostController.create').as("post")
//--------------------------------------------------------------------------------------------------------------
//These routes below are just scracthing
Route.on("/test").render("test");

Route.get('/file','PostController.show').as('file')

Route.get('/page',"PostController.show_all")