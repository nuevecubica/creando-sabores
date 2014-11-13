var async = require('async'),
  keystone = require('keystone'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js');

var _logger = require(__base + 'utils/logger');

exports = module.exports = function(req, res, next) {

  var backDone = '/',
    backError = '..',
    Users = keystone.list('User');

  if (req.method === 'POST') {

    Users.model.findById(req.user._id).exec(function(err, user) {
      // Error ocurred
      if (err || !user) {
        logger.error('profileRemove: Error removing profile: %j', err, user, _logger.getRequest(req));
        return formResponse(req, res, backError, 'Error removing profile', false);
      }

      user.isDeactivated = true;
      user.save(function(err) {
        if (err) {
          logger.error('profileRemove: Error removing profile: %j', err, _logger.getRequest(req));
          return formResponse(req, res, backError, 'Error removing profile', false);
        }

        keystone.session.signout(req, res, function() {
          return formResponse(req, res, backDone, false, 'Profile removed');
        });
      });

    });
  }
  else {
    return formResponse(req, res, backError, false, false);
  }
};
