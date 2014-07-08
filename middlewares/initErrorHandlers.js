var i18n = require('i18n');

/**
	Inits the error handler functions into `req`
*/
exports.initErrorHandlers = function(req, res, next) {
  res.err = function(err, title, message) {
    res.status(500).render('errors/500', {
      err: err,
      errorTitle: title,
      errorMsg: message
    });
  };

  res.notfound = function(title, message) {
    res.status(404).render('errors/404', {
      errorTitle: title,
      errorMsg: message
    });
  };

  next();
};
