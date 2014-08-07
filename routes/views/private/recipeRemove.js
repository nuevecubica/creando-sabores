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

  if (req.method === 'POST') {
    var q = Recipe.model.findOne({
      state: 1,
      slug: recipeSlug,
      author: userId
    });
    q.exec(function(err, recipe) {
      if (err) {
        return formResponse(res, req, backError, 'Error: Unknown error', false);
      }
      else if (recipe) {
        //remove
        return formResponse(res, req, backDone, 'Recipe removed');
      }
    });
  }
  else {
    return formResponse(res, req, backError, 'Error: Unknown error', false);
  }
};
