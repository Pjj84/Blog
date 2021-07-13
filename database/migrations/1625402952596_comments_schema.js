'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentsSchema extends Schema {
  up () {
    this.create('comments', (table) => {
      table.increments()
      table.integer("user_id").nullable()
      table.foreign("user_id").references("users.id").onDelete("CASCADE")
      table.string("user_fullname",30).notNullable()
      table.integer("post_id")
      table.foreign("post_id").references("posts.id").onDelete("CASCADE")
      table.text("text").notNullable()
      table.integer("reply_to").nullable()
      table.foreign("reply_to").references("comments.id").onDelete("CASCADE")
      table.enum("status",["Pending","Approved","Disapproved"],{useNative: true, existingType: true, enumName: "status"}).notNullable()
      table.string("replies")
      table.string("in_reply_to").nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('comments')
  }
}

module.exports = CommentsSchema
