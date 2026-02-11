import type { Mongoose, Connection } from 'mongoose'

export default function buildModels(mongoose: Mongoose, connection: Connection) {
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    name: String,
    age: Number,
    email: String,
    articles: [{
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }],
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    }
  })

  UserSchema.virtual('info').get(function () {
    return this.name + ' is ' + this.age + ' years old'
  })

  UserSchema.set('toJSON', { virtuals: true })

  UserSchema.path('email').validate(function (email: string) {
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return emailRegex.test(email)
  }, 'Invalid email address')

  const LocationSchema = new Schema({
    streetOne: String,
    streetTwo: String,
    state: String,
    city: String,
    zip: String,
    date: {
      type: Date,
      default: Date.now
    }
  })

  const ReplySchema = new Schema({
    name: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    body: String,
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    date: {
      type: Date,
      default: Date.now
    }
  })

  const CommentSchema = new Schema({
    name: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    body: String,
    replies: [ReplySchema],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    date: {
      type: Date,
      default: Date.now
    }
  })

  const ArticleSchema = new Schema({
    name: String,
    title: String,
    body: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: [CommentSchema],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    hidden: Boolean,
    date: {
      type: Date,
      default: Date.now
    }
  })

  return {
    User: connection.model('User', UserSchema),
    Comment: connection.model('Comment', CommentSchema),
    Article: connection.model('Article', ArticleSchema),
    Reply: connection.model('Reply', ReplySchema),
    Location: connection.model('Location', LocationSchema)
  }
}

