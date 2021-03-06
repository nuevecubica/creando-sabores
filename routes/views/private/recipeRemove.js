var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

exports = module.exports = function(req, res, next) {

  var backDone = '/',
    backError = '..',
    recipeSlug = req.params.recipe;

  var options = {
    slug: recipeSlug,
    states: ['published', 'draft', 'review'],
    fromContest: true
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  if (req.method === 'POST') {
    // Get
    service.recipe.recipe.get(options, function(err, result) {
      if (err) {
        return formResponse(req, res, backError, 'Error: Unknown error', false);
      }
      else if (result) {
        var recipe = result.recipe._document;

        if (recipe.isJuryWinner || recipe.isCommunityWinner) {
          return formResponse(req, res, backError, 'Error: You cannot delete a winner recipe', false);
        }

        recipe.state = 'removed';
        recipe.save(function(err) {
          if (err) {
            return formResponse(req, res, backError, 'Error: Unknown error', false);
          }
          return formResponse(req, res, backDone, false, 'Recipe removed');
        });
      }
    });
  }
  else {
    return formResponse(req, res, backError, 'Error: Unknown error', false);
  }
};
