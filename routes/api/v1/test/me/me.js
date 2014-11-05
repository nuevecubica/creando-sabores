exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  if (req.user) {
    answer.success = true;
    answer.user = req.user;
  }
  else {
    res.status(401);
    answer.error = true;
  }
  return res.apiResponse(answer);
};
