var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../../utils/formResponse.js');

var recipePublish = function(req, res) {
  var userId = req.user._id,
    recipeSlug = req.params.recipe,
    back = '..',
    states = ['draft', 'publish'],
    descriptions = ['unpublished', 'published'],
    data = {};

  var query = {
    slug: recipeSlug,
  };

  if (!req.user.isAdmin) {
    query.author = userId;
  }

  // Data
  data.state = states.indexOf(req.params.state);

  if (data.state < 0) {
    console.error('recipePublish: Error for unknown state %s', req.params.state);
    return formResponse(req, res, back, 'Error: Unknown error', false);
  }

  // Get
  var q = Recipe.model.findOne(query).exec(function(err, recipe) {
    if (err) {
      console.error('recipePublish:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (recipe) {

      // Publish
      recipe.getUpdateHandler(req).process(data, {
        fields: 'state'
      }, function(err) {
        if (err) {
          console.error('recipePublish:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, back, false, 'Recipe ' + descriptions[data.state]);
        }
      });
    }
    else {
      return formResponse(req, res, back, 'You don\'t have rights to access that page', false);
    }
  });
};

exports = module.exports = recipePublish;
