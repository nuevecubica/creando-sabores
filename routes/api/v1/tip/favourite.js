var async = require('async'),
  keystone = require('keystone');

/*
  /me/tips/favourites/add/slug
  /me/tips/favourites/remove/slug
*/

exports = module.exports = function(req, res) {
  var Tips = keystone.list('Tip'),
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {
      var q = Tips.model.findOne({
        slug: req.params.tip
      });

      q.exec(function(err, tip) {
        if (err || !tip) {
          res.status(404);
          answer.error = true;
          next(err);
        }
        else {
          answer.success = true;
          var pos = req.user.favourites.tips.indexOf(tip._id);

          if (req.params.action === 'add') {
            if (pos === -1) {
              req.user.favourites.tips.push(tip._id);
              req.user.save(function(err) {
                next(err);
              });
            }
            else {
              next();
            }
          }
          else if (req.params.action === 'remove') {
            if (pos !== -1) {
              req.user.favourites.tips.splice(pos, 1);
              req.user.save(function() {
                next(err);
              });
            }
            else {
              next();
            }
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
