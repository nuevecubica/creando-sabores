var async = require('async'),
  keystone = require('keystone');

/*
	/chef/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var Recipes = keystone.list('Recipe'),
    User = keystone.list('User'),
    query = {
      paginate: {
        page: req.query.page || 1,
        perPage: req.query.perPage || 10
      }
    },
    answer = {
      success: false,
      error: false
    };

  var getUser = function(username, cb) {
    var q = User.model.findOne({
      username: username
    });
    q.exec(function(err, result) {
      if (err || !result) {
        res.status(404);
        answer.error = true;
        return res.apiResponse(answer);
      }
      cb(result);
    });
  };

  getUser(req.params.username, function(profile) {
    async.series([

      function(next) {
        var q = Recipes.paginate(query.paginate)
          .where('author', profile._id)
          .where('state', 1)
          .where('isBanned', false)
          .sort('-rating');

        q.exec(function(err, recipes) {
          //console.log('EXEC ' + JSON.stringify(recipes));

          if (err || !recipes) {
            //console.log('ERROR ' + err);
            res.status(404);
            answer.error = true;
          }
          else if (recipes.total > 0) {
            //console.log('RECIPES ' + recipes);
            answer.success = true;
            answer.recipes = recipes;
          }
          return next(err);
        });
      }
    ], function(err) {
      return res.apiResponse(answer);
    });

  });

};
