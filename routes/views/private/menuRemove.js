var async = require('async'),
  keystone = require('keystone'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

exports = module.exports = function(req, res, next) {

  var backDone = '/',
    backError = '..',
    menuSlug = req.params.menu;

  var options = {
    slug: menuSlug,
    states: ['published', 'draft'],
    fromContest: true
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  if (req.method === 'POST') {
    // Get
    service.menu.get(options, function(err, result) {
      if (err) {
        return formResponse(req, res, backError, 'Error: Unknown error', false);
      }
      else if (result) {
        var menu = result.menu._document;

        menu.state = 'removed';
        menu.save(function(err) {
          if (err) {
            return formResponse(req, res, backError, 'Error: Unknown error', false);
          }
          return formResponse(req, res, backDone, false, 'Menu removed');
        });
      }
    });
  }
  else {
    return formResponse(req, res, backError, 'Error: Unknown error', false);
  }
};
