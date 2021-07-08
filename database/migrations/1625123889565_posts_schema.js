'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostsSchema extends Schema {
  up () {
    this.create('posts', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id').onDelete("CASCADE")
      table.boolean("is_approved").notNullable()
      table.integer("likes").defaultTo(0).unsigned()
      table.text("content","longtext")
      table.text("description")
      table.string("image") 
      table.string("tags")
      table.timestamps()
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostsSchema
