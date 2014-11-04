var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /menu/:menu/:state
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var ref = req.headers.referer;
  if (!ref || ref.split('/')[2] !== req.headers.host) {
    res.status(403);
    answer.error = true;
    answer.errorMessage = 'Missing or wrong referer.';
    return res.apiResponse(answer);
  }

  service.menu.state({
      slug: req.params.menu,
      states: ['published', 'draft'],
      authorId: req.user._id
    },
    req.params.state,
    function(err, menu) {
      if (err || !menu) {
        res.status(404);
        answer.error = true;
      }
      else {
        if (menu.state === req.params.state) {
          answer.success = true;
          answer.state = menu.state;
        }
        else {
          answer.success = false;
          answer.error = true;
        }
      }
      return res.apiResponse(answer);
    });
};
