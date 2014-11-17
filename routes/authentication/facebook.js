var async = require('async'),
  keystone = require('keystone');

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

      // Redirect based on response
      if (err) {
        logger.info('[auth.facebook] - Facebook authentication failed: %j', err, req);
        return res.redirect(redirects.fail);
      }
      else {
        logger.log('[auth.facebook] - Facebook authentication was successful.', req);
        return res.redirect(redirects.success);
      }

    });
  });
};
