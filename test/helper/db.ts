/*
 * DB exports following functions
 * connect
 * disconnect
 * insertRecords
 * removeRecords
 * initialise with sample data
 */

import mongoose, { type Connection } from 'mongoose'
import testData from './data.json' with { type: 'json' }
import { MongoMemoryServer } from 'mongodb-memory-server'
import buildModels from './models.js'

mongoose.Promise = global.Promise

export default DB()

function DB() {
  let connection: Connection | null = null
  let models: ReturnType<typeof buildModels> | null = null
  let mongoServer: MongoMemoryServer | null = null
  let readyPromise: Promise<void> | null = null

  const connect = function (done?: (err?: unknown) => void) {
    if (readyPromise) {
      if (done) {
        readyPromise.then(function () { done() }).catch(done)
      }
      return
    }

    if (!connection) {
      connection = mongoose.createConnection()
      models = buildModels(mongoose, connection)
    }

    readyPromise = (async function () {
      let uri = process.env.MONGO_URL
      if (!uri) {
        mongoServer = await MongoMemoryServer.create({
          instance: { ip: '127.0.0.1' }
        })
        uri = mongoServer.getUri()
      }
      if (connection) {
        await connection.openUri(uri, {})
        await connection.asPromise()
      }
    })()

    if (done) {
      readyPromise.then(function () { done() }).catch(done)
    }
  }

  const disconnect = function (done: (err?: unknown) => void) {
    const finish = function () {
      if (mongoServer) {
        mongoServer.stop()
          .then(function () {
            mongoServer = null
            readyPromise = null
            connection = null
            models = null
            done()
          })
          .catch(done)
      } else {
        readyPromise = null
        connection = null
        models = null
        done()
      }
    }

    if (connection) {
      connection.close(function (err) {
        if (err) return done(err)
        finish()
      })
    } else {
      finish()
    }
  }

  const getModel = function <T extends keyof ReturnType<typeof buildModels>>(modelName: T): ReturnType<typeof buildModels>[T] {
    if (!models) {
      throw new Error('Models not initialised; call connect() first.')
    }
    const model = models[modelName]
    if (!model) {
      throw new Error('Model not initialised: ' + modelName)
    }
    return model as ReturnType<typeof buildModels>[T]
  }

  const insertRecords = async function (callback?: (err: unknown, result?: unknown) => void) {
    try {
      const User = getModel('User')
      const Article = getModel('Article')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users: any = await User.create(testData.users)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const articles: any = JSON.parse(JSON.stringify(testData.articles))

      // article one
      articles[0].author = users[0]._id
      articles[0].likes = [users[1]._id, users[2]._id]
      // comment first
      articles[0].comments[0].user = users[1]._id
      articles[0].comments[0].likes = [users[0]._id, users[2]._id]
      articles[0].comments[0].replies[0].user = users[2]._id
      articles[0].comments[0].replies[0].likes = [users[0]._id, users[1]._id]
      // comment second
      articles[0].comments[1].user = users[0]._id
      articles[0].comments[1].likes = [users[1]._id, users[2]._id]
      articles[0].comments[1].replies[0].user = users[1]._id
      articles[0].comments[1].replies[0].likes = [users[2]._id, users[1]._id]
      articles[0].comments[1].replies[1].user = users[0]._id
      articles[0].comments[1].replies[1].likes = [users[0]._id, users[2]._id]

      // article two
      articles[1].author = users[1]._id
      articles[1].likes = [users[1]._id, users[2]._id]
      articles[1].comments[0].user = users[2]._id
      articles[1].comments[0].likes = [users[0]._id, users[2]._id]
      articles[1].comments[0].replies[0].user = users[0]._id
      articles[1].comments[0].replies[0].likes = [users[0]._id, users[1]._id]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdArticles: any = await Article.create(articles)

      users[0].articles.push(createdArticles[0]._id)
      await users[0].save()

      if (callback) callback(null, createdArticles)
      return createdArticles
    } catch (err) {
      if (callback) callback(err)
      throw err
    }
  }

  const removeRecords = async function (callback?: (err?: unknown) => void) {
    try {
      if (models) {
        const modelNames = Object.keys(models) as (keyof typeof models)[]
        await Promise.all(modelNames.map(async (modelName) => {
          const model = getModel(modelName)
          if (!model) throw new Error('Model not initialised: ' + modelName)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await model.deleteMany({} as any)
        }))
      }
      if (callback) callback(null)
    } catch (err) {
      if (callback) callback(err)
      throw err
    }
  }

  const initialise = function (done: (err?: unknown) => void) {
    if (!readyPromise) {
      connect(async function (err) {
        if (err) return done(err)
        try {
          await removeRecords()
          await insertRecords()
          done()
        } catch (e) {
          done(e)
        }
      })
      return
    }

    readyPromise.then(async function () {
      try {
        await removeRecords()
        await insertRecords()
        done()
      } catch (e) {
        done(e)
      }
    }).catch(done)
  }

  return {
    connect: connect,
    disconnect: disconnect,
    getModel: getModel,
    insertRecords: insertRecords,
    removeRecords: removeRecords,
    initialise: initialise
  }
}
