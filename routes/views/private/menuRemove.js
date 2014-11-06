var async = require('async'),
  keystone = require('keystone'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

exports = module.exports = function(req, res, next) {
  var slug = req.params.menu,
    state = 'removed',
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
      console.error('menuRemoved:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else {
      return formResponse(req, res, back, false, 'Menu ' + menu.state);
    }
  });
};
