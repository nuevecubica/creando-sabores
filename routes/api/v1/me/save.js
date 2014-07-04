var async = require('async'),
  keystone = require('keystone');

exports = module.exports = function(req, res) {
  var Users = keystone.list('User'),
    query = {
      _id: req.user._id
    },
    update = {},
    options = {
      multi: false
    },
    answer = {
      success: false,
      error: false
    };

  if (req.body.name) {
    update.name = req.body.name;
  }
  if (req.body.about) {
    update.about = req.body.about;
  }
  if (req.body.avatar) {
    update.avatars.local = req.body.avatar;
  }
  if (req.body.header) {
    update.media.header = req.body.header;
  }

  async.series([

      function(next) {
        var cb = function(err, numAffected) {
          if (err) {
            answer.error = true;
          }
          else {
            answer.success = true;
          }
          return next(!answer.success);
        };
        Users.model.update(query, update, options, cb);
      }
    ],
    function(err) {
      return res.apiResponse(answer);
    });
};
