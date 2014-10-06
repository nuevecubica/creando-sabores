var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Question = keystone.list('Question'),
  service = require('./index');

var addQuestion = function(req, callback) {
  var question = {
    title: req.query.title,
    author: req.query.author
  };

  Question.model().getUpdateHandler(req).process(question, {
      fields: 'title,author'
    },
    function(err) {
      if (err) {
        console.error('questionNew:', err);
        callback(err, {});
      }
      else {
        callback(null, question);
      }
    });
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
