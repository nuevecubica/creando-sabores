var keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  service = require('../../../services');

/**
  Prevents people from accessing protected pages
 */
exports.requireRecipeOwnerRights = function(req, res, next) {
  var recipeSlug = req.params.recipe;
  var back = '/receta/' + recipeSlug;

  service.recipe.recipe.get({
    slug: recipeSlug,
    user: req.user
  }, function(err, result) {
    if (err) {
      req.flash('error', res.__('Error: Unknown error'));
      res.redirect(back);
    }
    else if (result) {
      next();
    }
    else {
      req.flash('error', res.__('Error: You don\'t have rights to access this page'));
      res.redirect(back);
    }
  });
};
