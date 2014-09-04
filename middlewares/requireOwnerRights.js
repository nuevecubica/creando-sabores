var keystone = require('keystone'),
  Recipe = keystone.list('Recipe');

/**
  Prevents people from accessing protected pages
 */
exports.requireRecipeOwnerRights = function(req, res, next) {
  var recipeSlug = req.params.recipe;
  var userId = req.user._id;
  var back = '/receta/' + recipeSlug;

  console.log(req.user);

  var q = Recipe.model.findOne({
    state: 1,
    slug: recipeSlug,
    author: userId
  });

  q.exec(function(err, result) {
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
