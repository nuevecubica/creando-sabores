var i18n = require('i18n');
var config = require(__base + 'config');

/**
	Inits the error handler functions into `req`
*/
exports.initErrorHandlers = function(req, res, next) {

  res.err = function(err, title, message) {

    logger.fatal('error 500 on request %d %s %s: %j', process.domain.id, req.method, req.url, err, req);

    if (config.keystone.init.env !== 'production' || (req.user && req.user.isAdmin)) {
      res.status(500).render('errors/500-debug', {
        err: err,
        errorTitle: title,
        errorMsg: message
      });
    }
    else {
      res.status(500).render('errors/500', {});
    }
  };

  res.notfound = function(title, message) {
    logger.info('error 404 on request %d %s %s', process.domain.id, req.method, req.url, req);

    if (config.keystone.init.env !== 'production' || (req.user && req.user.isAdmin)) {
      res.status(404).render('errors/404-debug', {
        errorTitle: title,
        errorMsg: message
      });
    }
    else {
      res.status(404).render('errors/404', {});
    }
  };

  next();
};
