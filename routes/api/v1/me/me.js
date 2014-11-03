exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  if (req.user) {
    answer.success = true;
    answer.user = {
      name: req.user.name,
      username: req.user.username,
      about: req.user.about,
      thumb: req.user.thumb
    };
  }
  else {
    res.status(401);
    answer.error = true;
  }
  return res.apiResponse(answer);
};
