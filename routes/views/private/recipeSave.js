var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  clean = require('../../../utils/cleanText.js'),
  formResponse = require('../../../utils/formResponse.js');

var recipeEdit = function(req, res, next) {

  var back = '..',
    userId = req.user._id,
    recipeSlug = req.params.recipe;

  if (req.method === 'POST') {

    var q = Recipe.model.findOne({
      state: 1,
      slug: recipeSlug,
      author: userId
    });

    var data = {};

    if ("string" === typeof req.body.title && req.body.title) {
      data.title = clean(req.body.title, ['plaintext', 'oneline', ['maxlength', 20], 'escape']);
    }

    if ("string" === typeof req.body.description && req.body.description) {
      data.description = clean(req.body.description, ['escape', 'textarea', 'paragraphs']);
    }

    q.exec(function(err, recipe) {
      if (err) {
        return formResponse(res, req, back, 'Error: Unknown error', false);
      }
      else if (recipe) {
        // Save
        recipe.getUpdateHandler(req).process(data, {
          fields: 'title,description,ingredients,procedure,publishDate,portions,time,difficulty'
        }, function(err) {
          if (err) {
            return formResponse(res, req, back, 'Error: Unknown error', false);
          }
          else {
            return formResponse(res, req, back, false, 'Recipe saved');
          }
        });
      }
      else {
        return formResponse(res, req, back, 'You don\'t have rights to access that page', false);
      }
    });
  }
  else {
    console.log(req);
    return formResponse(res, req, back, false, false);
  }
};

var recipeNew = function() {};

exports = module.exports = {
  edit: recipeEdit,
  create: recipeNew
};
