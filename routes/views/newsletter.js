var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'newsletter';

  locals.filters = {
    email: req.params.email,
    action: req.params.action
  };

  var options = {
    email: locals.filters.email
  };

  // load question
  view.on('init', function(next) {

    locals.data.email = locals.filters.email;
    locals.data.action = locals.filters.action;

    var callback = function(err, result) {
      if (!err && result) {
        locals.data.email = result.email;
        next();
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    };

    if (locals.filters.action === 'subscribe') {
      service.notifications.newsletter.subscribe(options, callback);
    }
    else if (locals.filters.action === 'unsubscribe') {
      next();
    }

  });

  // Render the view
  view.render('newsletter');
};
