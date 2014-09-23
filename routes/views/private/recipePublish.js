var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../../utils/formResponse.js');

var recipePublish = function(req, res) {
  var userId = req.user._id,
    recipeSlug = req.params.recipe,
    back = '..',
    states = ['draft', 'published', 'review', 'removed', 'banned'],
    descriptions = ['unpublished', 'published', 'in review'],
    data = {},
    fields = [];

  var query = {
    slug: recipeSlug,
  };

  if (!req.user.isAdmin) {
    query.author = userId;
  }

  // Data
  fields.push('state');
  data.state = req.params.state;
  if (states.indexOf(data.state) < 0) {
    console.error('recipePublish: Error for unknown state %s', data.state);
    return formResponse(req, res, back, 'Error: Unknown error', false);
  }

  // Get
  var q = Recipe.model.findOne(query).exec(function(err, recipe) {
    if (err) {
      console.error('recipePublish:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (recipe) {

      // Update a contest recipe
      if (recipe.contest && recipe.contest.id) {
        if (data.state !== 'draft') {
          data.state = 'review';
        }
      }

      // Publish
      recipe.getUpdateHandler(req).process(data, {
        fields: fields
      }, function(err) {
        if (err) {
          console.error('recipePublish:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, back, false, 'Recipe ' + descriptions[states.indexOf(data.state)]);
        }
      });
    }
    else {
      return formResponse(req, res, back, 'Error: You don\'t have rights to access that page', false);
    }
  });
};

exports = module.exports = recipePublish;
