var Coral = require('../../lib/coral'),
  express = require('express'),
  User = require('./models/user'),
  Article = require('./models/article'),
  Comment = require('./models/comment'),
  Reply = require('./models/reply'),
  mongoose = require('mongoose'),
  config = require('../../config'),
  app = express();


app.configure(function() {
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

//connect to db
mongoose.connect(config.dbUrl);

var coral = new Coral(app);

coral.route({
  path: '/user',
  model: User
});

coral.route({
  path: '/article',
  model: Article
});

coral.route({
  path: '/article/:aid/comment',
  model: Article,
  idParam: 'aid',
  subDoc: {
    path: 'comments'
  }
});

coral.route({
  path: '/article/:aid/comment/:cid/reply',
  model: Article,
  idParam: 'aid',
  subDoc: {
    path: 'comments',
    idParam: 'cid',
    subDoc: {
      path: 'replies'
    }
  }
});

app.listen(3000);