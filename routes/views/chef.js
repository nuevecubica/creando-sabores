var keystone = require('keystone'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  formResponse = require(__base + 'utils/formResponse.js'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.section = 'publicProfile';

  var getPublicRecipes = function(user, cb) {
    service.recipeList.recipe.get({
      page: req.query.page || 1,
      perPage: 5,
      user: req.user,
      authorId: user._id,
      sort: '-editDate',
      fromContests: true
    }, function(err, recipes) {
      if (err) {
        logger.error('getPublicRecipes failed: %s', err, req);
        return formResponse(req, res, '..', 'Error: Unknown error', false);
      }
      else {
        cb(recipes.results);
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
        logger.error('getFavouriteRecipes failed: %s', err);
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
        logger.error('getFavouriteTips failed: %s', err);
        return res.notfound(res.__('Not found'));
      }
    });
  };

  var getPublicMenus = function(user, cb) {
    service.menuList.get({
      page: req.query.page || 1,
      perPage: 5,
      user: user,
      authorId: user._id
    }, function(err, result) {
      if (!err && result) {
        cb(result.results);
      }
      else {
        logger.error('getPublicMenus failed: %s', err);
        return res.notfound(res.__('Not found'));
      }
    });
  };

  service.user.get.byUsername({
    username: req.params.username
  }, function(err, resultUser) {
    if (!err && resultUser) {
      locals.profile = resultUser;
      locals.title = resultUser.name;
      switch (req.params.section) {
        case 'favoritas':
          locals.title += ' - ' + res.__('Favorites');
          getFavouriteRecipes(resultUser, function(recipes) {
            locals.subsection = 'favourites';
            locals.recipes = recipes || [];
            view.render('chef');
          });
          break;
        case 'tips':
          locals.title += ' - ' + res.__('Tips');
          getFavouriteTips(resultUser, function(tips) {
            locals.subsection = 'tips';
            locals.tips = tips || [];
            view.render('chef');
          });
          break;
        case 'menus':
          locals.title += ' - ' + res.__('Menus');
          getPublicMenus(resultUser, function(menus) {
            locals.subsection = 'menus';
            locals.menus = menus || [];
            view.render('chef');
          });
          break;
        case 'recetas':
          /* falls through */
        default:
          locals.title += ' - ' + res.__('Recipes');
          getPublicRecipes(resultUser, function(recipes) {
            locals.subsection = 'recipes';
            locals.recipes = recipes || [];
            view.render('chef');
          });
          break;
      }
    }
    else {
      return res.notfound(res.__('Not found'));
    }
  });

};
