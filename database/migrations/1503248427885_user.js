'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('fullname', 80).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.integer("posts_count")
      table.enum("role",["User","Admin","Manager"],{useNative: true, existingType: true, enumName: "role"}).notNullable()
      table.string("profile_pic").defaultTo("uploads/default.jpg")
      table.integer("comments_count")
      table.text("description",140).defaultTo("I am a user of this blog")
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
