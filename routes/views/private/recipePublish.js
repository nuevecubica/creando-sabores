var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

var recipePublish = function(req, res) {
  var recipeSlug = req.params.recipe,
    back = '..',
    actions = ['draft', 'publish'],
    states = ['draft', 'published', 'review'],
    descriptions = ['unpublished', 'published', 'waiting for review'],
    data = {},
    fields = [];

  var options = {
    slug: recipeSlug,
    states: ['published', 'draft', 'review'],
    fromContest: true
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  // Data
  if (actions.indexOf(req.params.state) === -1) {
    logger.error('recipePublish: Error for unknown action %s', req.params.state);
    return formResponse(req, res, back, 'Error: Unknown error', false);
  }
  else {
    fields.push('state');
    data.state = states[actions.indexOf(req.params.state)];
  }

  // Get
  service.recipe.recipe.get(options, function(err, result) {
    if (err) {
      logger.error('recipePublish:', err, options);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (result) {
      var recipe = result.recipe;

      // If is in a contest, update state to 'review'
      if (recipe.contest && recipe.contest.id && data.state === 'published') {
        data.state = 'review';
      }

      // Publish
      recipe._document.getUpdateHandler(req).process(data, {
        fields: fields
      }, function(err) {
        if (err) {
          logger.error('recipePublish:', err);
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
