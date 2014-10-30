var keystone = require('keystone');

/**
  Prevents access to protected API calls
 */
exports.requireTestApi = function(req, res, next) {
  var answer = {
    success: false,
    error: false
  };

  if (!keystone || !keystone.testMode) {
    console.log(keystone);
    res.status(401);
    answer.error = true;
    answer.errorMessage = 'Unauthorized access';
    res.apiResponse(answer);
  }
  else {
    next();
  }
};
