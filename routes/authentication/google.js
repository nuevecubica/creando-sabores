var async = require('async'),
  keystone = require('keystone');
var _logger = require(__base + 'utils/logger');

var google = require('./services/google');

exports = module.exports = function(req, res, next) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  async.series([

    function(cb) {
      if (!req.user) {
        return cb();
      }

      keystone.session.signout(req, res, function() {
        return cb();
      });
    }
  ], function(err) {

    google.authenticateUser(req, res, next, function(err, type) {

      // Define redirects for success and fail responses
      var redirects = {
        success: '/',
        fail: '/acceso'
      };

      var request = _logger.getRequest(req);

      // Redirect based on response
      if (err) {
        logger.info('[auth.google] - Google authentication failed', request);
        return res.redirect(redirects.fail);
      }
      else {
        logger.log('[auth.goole] - Google authentication was successful.', request);
        return res.redirect(redirects.success);
      }

    });
  });
};
