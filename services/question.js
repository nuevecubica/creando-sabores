var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Question = keystone.list('Question'),
  service = require('./index');

var addQuestion = function(req, callback) {

  var title = (req.query.title || req.body.title);

  if (title && req.user) {
    var question = {
      title: title,
      author: req.user._id
    };

    Question.model().getUpdateHandler(req).process(question, {
        fields: 'title,author'
      },
      function(err, res) {
        if (err) {
          console.error('questionNew:', err);
          callback(err, {});
        }
        else {
          callback(null, res.item);
        }
      });
  }
  else {
    callback('Some params not found', {});
  }
};

var getQuestion = function(options, callback) {
  service.questionList.get(options, callback);
};

var getChangeState = function(options, state, callback) {
  service.questionList.get(options, function(err, question) {

    if (!err && question) {
      question.state = state;
      question.save(function(err, doc) {
        callback(err, doc);
      });
    }
    else {
      if (err) {
        console.error('Error service.question.read find', err);
      }
      return callback(err || 'Not found', {});
    }
  });
};

/*
  Set exportable object
 */
var _service = {
  add: addQuestion,
  get: getQuestion,
  state: getChangeState
};

exports = module.exports = _service;
