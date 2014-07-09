/**
  Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function(req, res, next) {
  if (!req.user || (req.user && req.user.isBanned)) {
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

  if (!req.user || (req.user && req.user.isBanned)) {
    res.status(401);
    res.apiResponse(answer);
  }
  else {
    next();
  }
};

/**
  Prevents people from accessing admin pages when they're not signed in
 */
exports.requireAdmin = function(req, res, next) {
  if (!req.user || (req.user && (req.user.isBanned || req.user.isDeactivated || !req.user.isAdmin))) {
    req.flash('error', res.__('Please sign in to access this page.'));
    res.redirect('/');
  }
  else {
    next();
  }
};

/**
	Prevents access to admin API calls
 */
exports.requireAdminApi = function(req, res, next) {
  var answer = {
    success: false,
    error: false
  };

  if (!req.user || (req.user && (req.user.isBanned || req.user.isDeactivated || !req.user.isAdmin))) {
    res.status(401);
    res.apiResponse(answer);
  }
  else {
    next();
  }
};
