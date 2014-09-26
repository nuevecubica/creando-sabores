var keystone = require('keystone'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../utils/formResponse.js'),
  async = require('async'),
  service = require('../../services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.section = 'publicProfile';

  view.on('init', function(next) {
    service.user.get.byUsername({
      username: req.params.username
    }, function(err, resultUser) {
      if (!err && resultUser) {
        locals.profile = resultUser;
        service.user.recipeList.get({
          user: resultUser
        }, function(err, resultRecipeList) {
          if (!err && resultRecipeList) {
            locals.subsection = 'recipes';
            locals.recipes = resultRecipeList.results;
          }
          else {
            return res.notfound(res.__('Not found'));
          }
          next(err);
        });
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  });

  view.render('chef');
};
