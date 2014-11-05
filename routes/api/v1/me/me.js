var hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  if (req.user) {
    answer.success = true;
    answer.user = hideMyApi(req.user, safe.user);
  }
  else {
    res.status(401);
    answer.error = true;
  }
  return res.apiResponse(answer);
};
