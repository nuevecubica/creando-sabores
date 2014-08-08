var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  clean = require('../../../utils/cleanText.js'),
  formResponse = require('../../../utils/formResponse.js');

var recipeData = function(req) {
  // Clean data
  var data = {};

  data.title = clean(req.body.title, ['plaintext', 'oneline', ['maxlength', 20], 'escape']);
  data.description = clean(req.body.description, ['oneline', ['maxlength', 200], 'escape']);
  data.procedure = clean(req.body.description, [
    ['maxlength', 500], 'escape', 'textarea', 'paragraphs'
  ]);
  data.ingredients = clean(req.body.ingredients, [
    ['maxlength', 200], 'escape', 'textarea', 'paragraphs'
  ]);
  data.portions = clean(req.body.portions, ['integer', ['max', 20],
    ['min', 1]
  ]);
  data.time = clean(req.body.time, ['integer', ['max', 121],
    ['min', 1]
  ]);
  data.difficulty = clean(req.body.difficulty, ['integer', ['max', 5],
    ['min', 1]
  ]);

  return data;
};

var recipeEdit = function(req, res, back) {
  var userId = req.user._id,
    recipeSlug = req.params.recipe;

  // Get
  var q = Recipe.model.findOne({
    state: 1,
    slug: recipeSlug,
    author: userId
  }).exec(function(err, recipe) {
    if (err) {
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (recipe) {

      // Data
      var data = recipeData(req);

      // Save
      recipe.getUpdateHandler(req).process(data, {
        fields: 'title,description,ingredients,procedure,publishDate,portions,time,difficulty'
      }, function(err) {
        if (err) {
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, back, false, 'Recipe saved');
        }
      });
    }
    else {
      return formResponse(req, res, back, 'You don\'t have rights to access that page', false);
    }
  });
};

var recipeNew = function(req, res) {

  var back = '..';

  if (req.method === 'POST') {
    var recipe = new Recipe.model();
    var data = recipeData(req);
    recipe.getUpdateHandler(req).process(data, {
        fields: 'title,description,ingredients,procedure,publishDate,portions,time,difficulty'
      },
      function(err) {
        if (err) {
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, '/receta/' + recipe.slug, false, 'Recipe saved');
        }
      });
  }
  else {
    console.log(req);
    return formResponse(req, res, back, false, false);
  }
};

exports = module.exports = {
  edit: recipeEdit,
  create: recipeNew
};
