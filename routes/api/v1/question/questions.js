var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment'),
  modelCleaner = require(__base + 'utils/modelCleaner'),
  hideMyApi = require(__base + 'utils/hideMyApi');

/*
  /questions?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    populate: ['author', 'chef']
  };

  // If user is admin, get all questions
  if (req.user && req.user.isAdmin) {
    options.states = ['review', 'published', 'closed'];
  }

  service.questionList.get(options, function(err, questions) {
    if (err || !questions) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      questions.results.forEach(function(a, i) {
        a = a.toObject({
          virtuals: true,
          transform: modelCleaner.transformer
        });
        a = hideMyApi(a, ['slug', 'url', 'title', 'answer', 'state', 'createdDate', 'publishedDate', 'author.username', 'author.name', 'author.thumb', 'author.url', 'chef.username', 'chef.name', 'chef.thumb', 'chef.url']);
        a.formattedDate = moment(a.createdDate).format('lll');
        questions.results[i] = a;
      });
      answer.questions = questions;
    }
    return res.apiResponse(answer);
  });
};
