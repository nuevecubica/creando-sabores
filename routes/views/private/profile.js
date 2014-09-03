var keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../../utils/formResponse.js');


exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var getPrivateRecipes = function(userId, cb) {
    var back = '..',
      query = {
        author: userId
      };

    // Get
    var q = Recipe.model.find(query).exec(function(err, recipes) {
      if (err) {
        console.error('profileMyRecipes:', err);
        return formResponse(req, res, back, 'Error: Unknown error', false);
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
    default:
      locals.subsection = 'profile';
      // Render the view
      view.render('private/profile');
  }

};
