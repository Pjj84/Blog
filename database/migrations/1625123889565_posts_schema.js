'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostsSchema extends Schema {
  up () {
    this.create('posts', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.integer('writer_id').unsigned()
      table.string('writer_name').notNullable()
      table.foreign('writer_id').references('users.id').onDelete("CASCADE")
      table.foreign('writer_name').references('users.username').onDelete("CASCADE")
      table.boolean("is_approved").notNullable()
      table.integer("likes").defaultTo(0)
      table.text("content","longtext")
      table.string("image") 
      table.string("keys")
      table.timestamps()
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostsSchema
