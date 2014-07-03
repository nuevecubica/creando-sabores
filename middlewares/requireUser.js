var i18n = require('i18n');

/**
  Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function(req, res, next) {
  if (!req.user) {
    req.flash('error', res.__('Please sign in to access this page.'));
    res.redirect('/');
  }
  else {
    next();
  }
};

/**
	Prevents access to protected API calls
 */
exports.requireUserApi = function(req, res, next) {
  var answer = {
    success: false,
    error: false
  };

  if (!req.user) {
    res.status(401);
    res.apiResponse(answer);
    next(true);
  }
  else {
    next();
  }
};
