var keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var getPrivateRecipes = function(user, cb) {
    var back = '..';

    // Get
    service.recipeList.recipe.get({
      page: req.query.page || 1,
      perPage: 5,
      user: user,
      authorId: user._id,
      sort: '-editDate',
      all: true,
      fromContests: true
    }, function(err, recipes) {
      if (err) {
        logger.error('profileMyRecipes:', err);
        return formResponse(req, res, back, 'Error: Unknown error', false);
      }
      else {
        cb(recipes.results);
      }
    });
  };

  var getShoppingRecipes = function(user, cb) {
    service.user.shopping.get({
      page: req.query.page || 1,
      perPage: 5,
      user: user,
      authorId: user._id
    }, function(err, result) {
      if (!err && result) {
        cb(result.results);
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  };

  var getFavouriteRecipes = function(user, cb) {
    service.user.favourites.get({
      page: req.query.page || 1,
      perPage: 5,
      user: user,
      authorId: user._id
    }, function(err, result) {
      if (!err && result) {
        cb(result.results);
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  };

  var getFavouriteTips = function(user, cb) {
    service.user.tips.get.favourites({
      page: req.query.page || 1,
      perPage: 5,
      user: user,
      authorId: user._id
    }, function(err, result) {
      if (!err && result) {
        cb(result.results);
      }
      else {
        return res.notfound(res.__('Not found'));
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
      getPrivateRecipes(req.user, function(recipes) {
        locals.subsection = 'recipes';
        locals.recipes = recipes || [];
        view.render('private/profile');
      });
      break;
    case 'favoritas':
      getFavouriteRecipes(req.user, function(recipes) {
        locals.subsection = 'favourites';
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
    case 'tips':
      getFavouriteTips(req.user, function(tips) {
        locals.subsection = 'tips';
        locals.tips = tips || [];
        view.render('private/profile');
      });
      break;
    default:
      locals.subsection = 'profile';
      // Render the view
      view.render('private/profile');
  }

};
