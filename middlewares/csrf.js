var keystone = require('keystone'),
  csrf = require('csurf');

/**
 * Prevents access from banned accounts
 */
exports.csrf = function(req, res, next) {
  if (keystone.security.csrf) {
    csrf()(req, res, function() {
      res.locals.csrftoken = req.csrfToken();
      next();
    });
  }
  else {
    next();
  }
};
