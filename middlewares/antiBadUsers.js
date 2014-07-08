var keystone = require('keystone');

/**
  Prevents access from banned accounts
 */
exports.antiBanned = function(req, res, next) {
  if (req.user && req.user.isBanned) {
    req.flash('error', res.__('Access disallowed'));
    keystone.session.signout(req, res, function() {
      res.redirect('/');
    });
  }
  else {
    next();
  }
};

/**
  Prevents access from deactivated accounts
 */
exports.antiDeactivated = function(req, res, next) {
  if (req.user && req.user.isDeactivated) {
    req.flash('error', res.__('Access disallowed'));
    keystone.session.signout(req, res, function() {
      res.redirect('/');
    });
  }
  else {
    next();
  }
};

/**
	Prevents access from banned or deactivated accounts
 */
exports.antiBadUsers = function(req, res, next) {
  if (req.user && (req.user.isBanned || req.user.isDeactivated)) {
    req.flash('error', res.__('Access disallowed'));
    keystone.session.signout(req, res, function() {
      res.redirect('/');
    });
  }
  else {
    next();
  }
};
