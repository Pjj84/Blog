'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.alter('users', (table) => {
      table.boolean("is_admin")
      table.string("profile_pic")
    })
  }

  down () {
    this.alter('users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = UserSchema
