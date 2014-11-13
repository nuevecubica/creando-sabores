var keystone = require('keystone');
var _logger = require(__base + 'utils/logger');

/**
  Prevents access to protected API calls
 */
exports.requireTestApi = function(req, res, next) {
  var answer = {
    success: false,
    error: false
  };

  if (!keystone || !keystone.testMode) {
    logger.warn('Unauthorized access on %s: %s', req.method, req.url, _logger.getRequest(req));
    res.status(401);
    answer.error = true;
    answer.errorMessage = 'Unauthorized access';
    res.apiResponse(answer);
  }
  else {
    next();
  }
};
