/**
 * Test dependencies.
 */

var Router = require('../lib/router'),
  DB = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express(),
  router = new Router(app);


describe('router', function() {

  var db = new DB();

  app.use(express.bodyParser());

  beforeEach(function(done) {
    db.connect();
    db.initialize(done);
  });

  afterEach(function(done) {
    db.disconnect(done);
  });

  it('find with sorting - must create proper get route', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost',
      model: data.userModel
    };
    router.find(config);
    request(app)
      .get('/localhost')
      .set('accept', 'application/json')
      .query({
        sort: 'name',
        order: 'desc'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.length.should.equal(2);
        res.body[0].name.should.equal('xyz');
        res.body[1].name.should.equal('abc');
        done();
      });
  });

  it('findOne - must create proper get route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost',
      model: data.userModel
    };
    router.findOne(config);
    request(app)
      .get('/localhost/' + data.userid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('abc');
        done();
      });
  });

  it('findOne - must create proper get route when name pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost/name',
      model: data.userModel,
      idAttribute: 'name'
    };
    router.findOne(config);
    request(app)
      .get('/localhost/name/abc')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('abc');
        done();
      });
  });

  it('create - must create proper post route', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost',
      model: data.userModel
    };
    var record = {
      name: 'Ryan',
      age: 26
    };
    router.create(config);
    request(app)
      .post('/localhost')
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Ryan');
        res.body.age.should.equal(26);
        done();
      });
  });

  it('update - must create proper put route', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost',
      model: data.userModel
    };
    var record = {
      'name': 'Scott'
    };
    router.update(config);
    request(app)
      .put('/localhost/' + data.userid)
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Scott');
        done();
      });
  });

  it('remove - must create proper delete route', function(done) {
    var data = db.getData();
    var config = {
      path: '/localhost',
      model: data.userModel
    };
    router.remove(config);
    request(app)
      .del('/localhost/' + data.userid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.should.have.status(200);
        done();
      });
  });

  it('subDoc findOne - must create proper get route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments'
      }
    };
    router.findOne(config);
    request(app)
      .get('/article/' + data.articleid + '/comment/' + data.commentid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('How to create nested sub-docs on route ?');
        done();
      });
  });

  it('subDoc Create - must create proper get route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments'
      }
    };
    var record = {
      body: 'nice article'
    };
    router.create(config);
    request(app)
      .post('/article/' + data.articleid + '/comment')
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('nice article');
        done();
      });
  });

  it('subDoc update - must create proper put route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments'
      }
    };
    var record = {
      'body': 'updated comment'
    };
    router.update(config);
    request(app)
      .put('/article/' + data.articleid + '/comment/' + data.commentid)
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('updated comment');
        done();
      });
  });

  it('subDoc remove - must create proper delete route', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments'
      }
    };
    router.remove(config);
    request(app)
      .del('/article/' + data.articleid + '/comment/' + data.commentid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.should.have.status(200);
        done();
      });
  });


  it('subSubDoc findOne - must create proper get route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment/:cid/reply',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments',
        idParam: 'cid',
        subDoc: {
          path: 'replies'
        }
      }
    };
    router.findOne(config);
    request(app)
      .get('/article/' + data.articleid + '/comment/' + data.commentid + '/reply/' + data.replyid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('you can add sub-doc inside sub-doc in config');
        done();
      });
  });

  it('subSubDoc Create - must create proper get route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment/:cid/reply',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments',
        idParam: 'cid',
        subDoc: {
          path: 'replies'
        }
      }
    };
    var record = {
      body: 'thanks!'
    };
    router.create(config);
    request(app)
      .post('/article/' + data.articleid + '/comment/' + data.commentid + '/reply')
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('thanks!');
        done();
      });
  });

  it('subSubDoc update - must create proper put route when id pass', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment/:cid/reply',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments',
        idParam: 'cid',
        subDoc: {
          path: 'replies'
        }
      }
    };
    var record = {
      body: 'updated reply'
    };
    router.update(config);
    request(app)
      .put('/article/' + data.articleid + '/comment/' + data.commentid + '/reply/' + data.replyid)
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.body.should.equal('updated reply');
        done();
      });
  });

  it('subSubDoc remove - must create proper delete route', function(done) {
    var data = db.getData();
    var config = {
      path: '/article/:aid/comment/:cid/reply',
      model: data.articleModel,
      idParam: 'aid',
      subDoc: {
        path: 'comments',
        idParam: 'cid',
        subDoc: {
          path: 'replies'
        }
      }
    };
    router.remove(config);
    request(app)
      .del('/article/' + data.articleid + '/comment/' + data.commentid + '/reply/' + data.replyid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.should.have.status(200);
        done();
      });
  });


});