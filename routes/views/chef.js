var keystone = require('keystone'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../utils/formResponse.js');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var getPublicRecipes = function(userId, cb) {
    var back = '..';

    // Get
    var q = Recipe
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('author', userId)
      .sort('-rating')
      .exec(function(err, recipes) {
        if (err) {
          console.error('chefRecipes:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          cb(recipes.results);
        }
      });
  };

  var getUser = function(username, cb) {
    var q = User.model.findOne({
      username: req.params.username
    });
    q.exec(function(err, result) {
      if (!err && result) {
        locals.profile = result;
      }
      else {
        return res.notfound(res.__('Not found'));
      }
      cb(result);
    });
  };


  locals.section = 'publicProfile';

  getUser(req.params.username, function(profile) {

    switch (req.params.section) {
      case 'recetas':
        /* falls through */
      default:
        getPublicRecipes(profile._id, function(recipes) {
          locals.subsection = 'recipes';
          locals.recipes = recipes || [];
          view.render('chef');
        });
    }

  });

};
