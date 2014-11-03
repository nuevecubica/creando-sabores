var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'question';

  locals.filters = {
    question: req.params.question || null
  };

  var options = {
    slug: locals.filters.question,
    populate: [
      ['author', 'username name about thumb url'],
      ['chef', 'username name about thumb url']
    ]
  };

  // load question
  view.on('init', function(next) {

    service.question.get(options, function(err, result) {
      if (!err && result) {
        locals.data.question = result;
        locals.data.formattedDate = moment(result.createdDate).format('lll');
        locals.title = result.title.substr(0, 10) + '...';
        next();
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  });

  // Render the view
  view.render('question');
};
