import mongoose, { type Connection } from 'mongoose'
import testData from './data.json' with { type: 'json' }
import { MongoMemoryServer } from 'mongodb-memory-server'
import buildModels, { type TestModels } from './models.js'

mongoose.Promise = global.Promise

type Callback<T = void> = (err?: unknown, result?: T) => void

async function callCallback<T>(
  operation: () => Promise<T>,
  callback?: Callback<T>
) {
  try {
    const result = await operation()
    if (callback) {
      callback(undefined, result)
      return undefined
    }
    return result
  } catch (err) {
    if (callback) {
      callback(err)
      return undefined
    }
    throw err
  }
}

function DB() {
  let connection: Connection | null = null
  let models: TestModels | null = null
  let mongoServer: MongoMemoryServer | null = null
  let readyPromise: Promise<void> | null = null

  const connect = async function (done?: Callback<void>) {
    return callCallback(async () => {
      if (readyPromise) {
        await readyPromise
        return
      }

      if (!connection) {
        connection = mongoose.createConnection()
        models = buildModels(mongoose, connection)
      }

      readyPromise = (async () => {
        let uri = process.env.MONGO_URL
        if (!uri) {
          mongoServer = await MongoMemoryServer.create({
            instance: { ip: '127.0.0.1' }
          })
          uri = mongoServer.getUri()
        }

        if (connection) {
          await connection.openUri(uri)
          await connection.asPromise()
        }
      })()

      await readyPromise
    }, done)
  }

  const disconnect = async function (done?: Callback<void>) {
    return callCallback(async () => {
      if (connection) {
        await connection.close()
      }

      if (mongoServer) {
        await mongoServer.stop()
      }

      connection = null
      models = null
      mongoServer = null
      readyPromise = null
    }, done)
  }

  const getModel = function <T extends keyof TestModels>(modelName: T) {
    if (!models) {
      throw new Error('Models not initialised; call connect() first.')
    }

    const model = models[modelName]
    if (!model) {
      throw new Error(`Model not initialised: ${String(modelName)}`)
    }

    return model
  }

  const removeRecords = async function (done?: Callback<void>) {
    return callCallback(async () => {
      if (!models) {
        return
      }

      const modelNames = Object.keys(models) as (keyof TestModels)[]
      await Promise.all(modelNames.map(async (modelName) => {
        await getModel(modelName).collection.deleteMany({})
      }))
    }, done)
  }

  const insertRecords = async function (done?: Callback<unknown>) {
    return callCallback(async () => {
      const User = getModel('User')
      const Article = getModel('Article')

      const users = await User.create(testData.users)
      const articles = JSON.parse(JSON.stringify(testData.articles))

      articles[0].author = users[0]._id
      articles[0].likes = [users[1]._id, users[2]._id]
      articles[0].comments[0].user = users[1]._id
      articles[0].comments[0].likes = [users[0]._id, users[2]._id]
      articles[0].comments[0].replies[0].user = users[2]._id
      articles[0].comments[0].replies[0].likes = [users[0]._id, users[1]._id]
      articles[0].comments[1].user = users[0]._id
      articles[0].comments[1].likes = [users[1]._id, users[2]._id]
      articles[0].comments[1].replies[0].user = users[1]._id
      articles[0].comments[1].replies[0].likes = [users[2]._id, users[1]._id]
      articles[0].comments[1].replies[1].user = users[0]._id
      articles[0].comments[1].replies[1].likes = [users[0]._id, users[2]._id]

      articles[1].author = users[1]._id
      articles[1].likes = [users[1]._id, users[2]._id]
      articles[1].comments[0].user = users[2]._id
      articles[1].comments[0].likes = [users[0]._id, users[2]._id]
      articles[1].comments[0].replies[0].user = users[0]._id
      articles[1].comments[0].replies[0].likes = [users[0]._id, users[1]._id]

      const createdArticles = await Article.create(articles)

      users[0].articles.push(createdArticles[0]._id)
      await users[0].save()

      return createdArticles
    }, done)
  }

  const initialise = async function (done?: Callback<void>) {
    return callCallback(async () => {
      await connect()
      await removeRecords()
      await insertRecords()
    }, done)
  }

  return {
    connect,
    disconnect,
    getModel,
    insertRecords,
    removeRecords,
    initialise
  }
}

export default DB()
