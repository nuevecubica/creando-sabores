var keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../../utils/formResponse.js');


exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var getPrivateRecipes = function(userId, cb) {
    var back = '..';

    // Get
    var q = Recipe
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('author', userId)
      .sort('-editDate')
      .exec(function(err, recipes) {
        if (err) {
          console.error('profileMyRecipes:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          cb(recipes.results);
        }
      });
  };

  var getShoppingRecipes = function(user, cb) {
    var page = req.query.page || 1,
      perPage = 5,
      recipeIds = req.user.shopping.slice((page - 1) * perPage, perPage);

    Recipe.model.find({
      '_id': {
        $in: recipeIds
      }
    })
      .exec(function(err, recipes) {
        if (err) {
          console.error('Error: recipes loading failed', err);
          return res.notfound(res.__('Not found'));
        }
        else {
          cb(recipes);
        }
      });
  };

  var signinPage = '/acceso';

  if (!req.user) {
    return res.redirect(signinPage);
  }

  locals.section = 'privateProfile';
  locals.editable = true;
  locals.manageable = false;
  locals.own = true;

  switch (req.params.section) {
    case 'recetas':
      getPrivateRecipes(req.user._id, function(recipes) {
        locals.subsection = 'recipes';
        locals.recipes = recipes || [];
        view.render('private/profile');
      });
      break;
    case 'compra':
      getShoppingRecipes(req.user, function(recipes) {
        locals.subsection = 'shopping';
        locals.recipes = recipes || [];
        view.render('private/profile');
      });
      break;
    default:
      locals.subsection = 'profile';
      // Render the view
      view.render('private/profile');
  }

};
