var async = require('async'),
  keystone = require('keystone');

/*
  /user/email/subscribe
  /user/email/unsubscribe
*/

exports = module.exports = function(req, res) {

  var User = keystone.list('User'),
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {
      var q = User.model.findOne({
        email: req.params.email
      });

      q.exec(function(err, user) {
        if (err || !user) {
          res.status(404);
          answer.error = true;
          next(err);
        }
        else {
          answer.success = true;
          if (req.params.action === 'subscribe') {
            user.receiveNewsletter = true;
            user.save(function(err) {
              next(err);
            });
          }
          else if (req.params.action === 'unsubscribe') {
            user.receiveNewsletter = false;
            user.save(function() {
              next(err);
            });
          }
          else {
            next();
          }
        }
      });
    }
  ], function(err) {
    if (err) {
      answer.success = false;
      answer.error = true;
    }

    return res.apiResponse(answer);
  });

};
