var async = require('async'),
  keystone = require('keystone');
var _logger = require(__base + 'utils/logger');

var facebook = require('./services/facebook');

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

    facebook.authenticateUser(req, res, next, function(err, type) {

      // Define redirects for success and fail responses
      var redirects = {
        success: '/',
        fail: '/acceso'
      };

      var request = _logger.getRequest(req);

      // Redirect based on response
      if (err) {
        request.error = err;
        logger.info('[auth.facebook] - Facebook authentication failed', request);
        return res.redirect(redirects.fail);
      }
      else {
        logger.log('[auth.facebook] - Facebook authentication was successful.', request);
        return res.redirect(redirects.success);
      }

    });
  });
};
