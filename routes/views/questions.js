var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'questions';
  locals.subsection = req.params.section || 'recientes';


  // load questions
  view.on('init', function(next) {

    var myOptions = {
      sort: '-createdDate',
      populate: ['author'],
      authorId: req.user._id || null,
      states: ['review']
    };

    var options = {
      page: req.query.page || 1,
      perPage: 5,
      populate: ['author']
    };

    service.questionList.get(options, function(err, results) {
      if (!err) {
        locals.data.questions = results.results;
        locals.data.questions.map(function(a, i) {
          a.formattedDate = moment(a.createdDate).format('lll');
        });
        if (req.user) {
          service.questionList.get(myOptions, function(err, results) {
            if (!err) {
              locals.data.myQuestions = results.results;
              locals.data.myQuestions.map(function(a, i) {
                a.formattedDate = moment(a.createdDate).format('lll');
              });
            }
            next(err);
          });
        }
        else {
          next(err);
        }
      }
      else {
        next(err);
      }
    });
  });

  // Render the view
  view.render('questions');
};
