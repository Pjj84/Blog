'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LikesSchema extends Schema {
  up () {
    this.create('likes', (table) => {
      table.increments()
      table.integer('user_id')
      table.integer("post_id")
      table.foreign('user_id').references("users.id").onDelete("CASCADE")
      table.foreign('post_id').references("posts.id").onDelete("CASCADE")
      table.timestamps()
    })
  }

  down () {
    this.drop('likes')
  }
}

module.exports = LikesSchema
