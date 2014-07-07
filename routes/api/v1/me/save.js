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

  var handler = req.user.getUpdateHandler(req);

  handler.process(req.body, {
    fields: 'name,about,avatars.local,media.avatar.origin,media.header'
  }, function(err) {
    // Error ocurred
    if (err) {
      answer.error = true;
      return res.apiResponse(answer);
    }
    else {
      // New avatar uploaded? Change avatar
      if (req.body['avatars.local_upload']) {
        handler.process({
          'media.avatar.origin': 'local'
        }, {
          fields: 'media.avatar.origin'
        }, function(err) {
          // Error ocurred
          if (err) {
            answer.error = true;
          }
          // Update success
          else {
            answer.success = true;
          }
          return res.apiResponse(answer);
        });
      }
      // Same avatar found
      else {
        answer.success = true;
        return res.apiResponse(answer);
      }
    }
  });
};
