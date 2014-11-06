var async = require('async'),
  keystone = require('keystone'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

var menuPublish = function(req, res) {
  var slug = req.params.menu,
    state = req.params.state,
    back = '..';

  var options = {
    slug: slug
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  service.menu.state(options, state, function(err, menu) {
    if (err && !menu) {
      console.error('menuPublish:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else {
      return formResponse(req, res, back, false, 'Menu ' + menu.state);
    }
  });
};

exports = module.exports = menuPublish;
