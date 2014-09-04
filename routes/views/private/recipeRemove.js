var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  clean = require('../../../utils/cleanText.js'),
  formResponse = require('../../../utils/formResponse.js');

exports = module.exports = function(req, res, next) {

  var backDone = '/',
    backError = '..',
    userId = req.user._id,
    recipeSlug = req.params.recipe;

  var query = {
    slug: recipeSlug,
  };

  if (!req.user.isAdmin) {
    query.author = userId;
  }

  if (req.method === 'POST') {
    // Get
    var q = Recipe.model.findOne(query);
    q.exec(function(err, recipe) {
      if (err) {
        return formResponse(req, res, backError, 'Error: Unknown error', false);
      }
      else if (recipe) {

        if (recipe.isJuryWinner || recipe.isCommunityWinner) {
          return formResponse(req, res, backError, 'Error: You cannot delete a winner recipe', false);
        }

        // Remove
        recipe.remove(function(err) {
          if (err) {
            return formResponse(req, res, backError, 'Error: Unknown error', false);
          }
          return formResponse(req, res, backDone, 'Recipe removed');
        });
      }
    });
  }
  else {
    return formResponse(req, res, backError, 'Error: Unknown error', false);
  }
};
