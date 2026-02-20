import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { type Connection } from 'mongoose';

import testData from './data.json' with { type: 'json' };
import buildModels, { type TestModels } from './models';

mongoose.Promise = global.Promise;

type Callback<T = void> = (err: Error | null, result?: T) => void;

async function callCallback<T>(operation: () => Promise<T>, callback?: Callback<T>) {
  try {
    const result = await operation();
    if (callback) {
      callback(null, result);
      return undefined;
    }
    return result;
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unexpected database error');
    if (callback) {
      callback(error);
      return undefined;
    }
    throw error;
  }
}

function DB() {
  let connection: Connection | null = null;
  let models: TestModels | null = null;
  let mongoServer: MongoMemoryServer | null = null;
  let readyPromise: Promise<void> | null = null;

  const connect = async (done?: Callback<void>) =>
    callCallback(async () => {
      if (readyPromise) {
        await readyPromise;
        return;
      }

      if (!connection) {
        connection = mongoose.createConnection();
        models = buildModels(mongoose, connection);
      }

      readyPromise = (async () => {
        let uri = process.env.MONGO_URL;
        if (!uri) {
          mongoServer = await MongoMemoryServer.create({
            instance: { ip: '127.0.0.1' },
          });
          uri = mongoServer.getUri();
        }

        if (connection) {
          await connection.openUri(uri);
          await connection.asPromise();
        }
      })();

      await readyPromise;
    }, done);

  const disconnect = async (done?: Callback<void>) =>
    callCallback(async () => {
      if (connection) {
        await connection.close();
      }

      if (mongoServer) {
        await mongoServer.stop();
      }

      connection = null;
      models = null;
      mongoServer = null;
      readyPromise = null;
    }, done);

  const getModel = <TModelName extends keyof TestModels>(
    modelName: TModelName,
  ): TestModels[TModelName] => {
    if (!models) {
      throw new Error('Models not initialised; call connect() first.');
    }

    const model = models[modelName];
    if (!model) {
      throw new Error(`Model not initialised: ${String(modelName)}`);
    }

    return model;
  };

  const removeRecords = async (done?: Callback<void>) =>
    callCallback(async () => {
      if (!models) {
        return;
      }

      const modelNames = Object.keys(models) as (keyof TestModels)[];
      await Promise.all(
        modelNames.map(async (modelName) => {
          await getModel(modelName).collection.deleteMany({});
        }),
      );
    }, done);

  const insertRecords = async (done?: Callback<void>) =>
    callCallback(async () => {
      const User = getModel('User');
      const Article = getModel('Article');

      const users = await User.create(testData.users);
      const articles = JSON.parse(JSON.stringify(testData.articles));
      const articleOne = articles[0];
      const articleTwo = articles[1];
      const userOne = users[0];
      const userTwo = users[1];
      const userThree = users[2];

      if (!articleOne || !articleTwo || !userOne || !userTwo || !userThree) {
        throw new Error('Unable to initialise seed records');
      }

      const articleOneCommentOne = articleOne.comments[0];
      const articleOneCommentTwo = articleOne.comments[1];
      const articleTwoCommentOne = articleTwo.comments[0];
      const articleOneCommentOneReplyOne = articleOneCommentOne?.replies[0];
      const articleOneCommentTwoReplyOne = articleOneCommentTwo?.replies[0];
      const articleOneCommentTwoReplyTwo = articleOneCommentTwo?.replies[1];
      const articleTwoCommentOneReplyOne = articleTwoCommentOne?.replies[0];

      if (
        !articleOneCommentOne ||
        !articleOneCommentTwo ||
        !articleTwoCommentOne ||
        !articleOneCommentOneReplyOne ||
        !articleOneCommentTwoReplyOne ||
        !articleOneCommentTwoReplyTwo ||
        !articleTwoCommentOneReplyOne
      ) {
        throw new Error('Unable to initialise nested seed records');
      }

      articleOne.author = userOne._id;
      articleOne.likes = [userTwo._id, userThree._id];
      articleOneCommentOne.user = userTwo._id;
      articleOneCommentOne.likes = [userOne._id, userThree._id];
      articleOneCommentOneReplyOne.user = userThree._id;
      articleOneCommentOneReplyOne.likes = [userOne._id, userTwo._id];
      articleOneCommentTwo.user = userOne._id;
      articleOneCommentTwo.likes = [userTwo._id, userThree._id];
      articleOneCommentTwoReplyOne.user = userTwo._id;
      articleOneCommentTwoReplyOne.likes = [userThree._id, userTwo._id];
      articleOneCommentTwoReplyTwo.user = userOne._id;
      articleOneCommentTwoReplyTwo.likes = [userOne._id, userThree._id];

      articleTwo.author = userTwo._id;
      articleTwo.likes = [userTwo._id, userThree._id];
      articleTwoCommentOne.user = userThree._id;
      articleTwoCommentOne.likes = [userOne._id, userThree._id];
      articleTwoCommentOneReplyOne.user = userOne._id;
      articleTwoCommentOneReplyOne.likes = [userOne._id, userTwo._id];

      const createdArticles = await Article.insertMany(articles);
      const createdArticleOne = createdArticles[0];
      if (!createdArticleOne) {
        throw new Error('Unable to create seed article');
      }

      userOne.articles.push(createdArticleOne._id);
      await userOne.save();

      return undefined;
    }, done);

  const initialise = async (done?: Callback<void>) =>
    callCallback(async () => {
      await connect();
      await removeRecords();
      await insertRecords();
    }, done);

  return {
    connect,
    disconnect,
    getModel,
    insertRecords,
    removeRecords,
    initialise,
  };
}

export default DB();
