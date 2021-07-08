'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Manager {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, response }, next) {
    const user  = await auth.getUser()
    if(user.role != "Manager"){
      return response.status(401).json({
        massage: "Only managers are allowed"
      })
    }
    await next()
  }
}

module.exports = Manager
