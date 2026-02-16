import type {
  Connection,
  HydratedDocument,
  Model,
  Mongoose,
  Types
} from 'mongoose'

export interface Reply {
  name: string
  user: Types.ObjectId
  body: string
  likes: Types.ObjectId[]
  date: Date
}

export interface Comment {
  name: string
  user: Types.ObjectId
  body: string
  replies: Reply[]
  likes: Types.ObjectId[]
  date: Date
}

export interface Article {
  name: string
  title: string
  body: string
  author: Types.ObjectId
  comments: Comment[]
  likes: Types.ObjectId[]
  hidden: boolean
  date: Date
}

export interface Location {
  streetOne: string
  streetTwo: string
  state: string
  city: string
  zip: string
  date: Date
}

export interface User {
  name: string
  age: number
  email: string
  articles: Types.ObjectId[]
  location?: Types.ObjectId
  info?: string
}

export type UserDocument = HydratedDocument<User>
export type ArticleDocument = HydratedDocument<Article>
export type CommentDocument = HydratedDocument<Comment>
export type ReplyDocument = HydratedDocument<Reply>
export type LocationDocument = HydratedDocument<Location>

export interface TestModels {
  User: Model<User>
  Comment: Model<Comment>
  Article: Model<Article>
  Reply: Model<Reply>
  Location: Model<Location>
}

export default function buildModels(
  mongoose: Mongoose,
  connection: Connection
): TestModels {
  const Schema = mongoose.Schema

  const UserSchema = new Schema<User>({
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

  UserSchema.virtual('info').get(function (this: User) {
    return `${this.name} is ${this.age} years old`
  })

  UserSchema.set('toJSON', { virtuals: true })

  UserSchema.path('email').validate(function (email: string) {
    const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return emailRegex.test(email)
  }, 'Invalid email address')

  const LocationSchema = new Schema<Location>({
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

  const ReplySchema = new Schema<Reply>({
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

  const CommentSchema = new Schema<Comment>({
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

  const ArticleSchema = new Schema<Article>({
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
    User: connection.model<User>('User', UserSchema),
    Comment: connection.model<Comment>('Comment', CommentSchema),
    Article: connection.model<Article>('Article', ArticleSchema),
    Reply: connection.model<Reply>('Reply', ReplySchema),
    Location: connection.model<Location>('Location', LocationSchema)
  }
}
