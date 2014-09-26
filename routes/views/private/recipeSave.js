var async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  Contest = keystone.list('Contest'),
  clean = require('../../../utils/cleanText.js'),
  formResponse = require('../../../utils/formResponse.js'),
  service = require('../../../services');

var recipeData = function(req, orig) {
  // Clean data
  var data = {};
  var prop, props = ['title', 'description', 'procedure', 'ingredients', 'portions', 'time', 'difficulty', 'contest.id'];
  var file, files = ['header_upload'];

  // Something in the request body?
  var something = false;
  var i, l = props.length;
  for (i = 0; i < l; i++) {
    prop = props[i];
    if (req.body[prop]) {
      something = true;
      break;
    }
  }

  if (req.files) {
    var j, m = files.length;
    for (j = 0; j < m; j++) {
      if (files[j]) {
        file = files[j];
        if (req.files[file]) {
          something = true;
          break;
        }
      }
    }
  }

  // Empty body
  if (!something) {
    data = null;
  }

  // Parse body
  else {

    data.title = clean(req.body.title, ['plaintext', 'oneline', ['maxlength', 40], 'escape']);
    data.description = clean(req.body.description, ['oneline', ['maxlength', 400], 'escape']);
    data.procedure = clean(req.body.procedure, [
      ['maxlinelength', 400],
      ['maxlines', 20], 'escape', 'textarea', 'paragraphs'
    ]);
    data.ingredients = clean(req.body.ingredients, [
      ['maxlinelength', 40],
      ['maxlines', 50], 'escape', 'textarea', 'paragraphs'
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
    data.author = req.user.id;
    data['contest.id'] = req.body['contest.id'];

    // Get missing data from original if present
    if (orig) {
      for (i = 0; i < l; i++) {
        prop = props[i];
        if (!data[prop]) {
          data[prop] = orig[prop];
        }
      }
    }
  }
  return data;
};

var recipeEdit = function(req, res) {
  var recipeSlug = req.params.recipe,
    back = '..';

  var options = {
    slug: recipeSlug,
    states: ['published', 'draft', 'review'],
    fromContest: true
  };

  if (!req.user.isAdmin) {
    options.user = req.user;
  }

  // Get
  service.recipe.recipe.get(options, function(err, result) {
    if (err) {
      console.error('recipeEdit:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (result) {

      var recipe = result.recipe;

      // Data
      var data = recipeData(req, recipe);

      if (data === null) {
        return formResponse(req, res, back, 'Missing data', false);
      }

      // If not admin, rejects if admited in a contest
      if (!req.user.isAdmin && recipe.contest && recipe.contest.id && recipe.state === 'published') {
        return formResponse(req, res, back, 'Error: You cannot edit a recipe already admited in a contest', false);
      }

      // Save
      recipe._document.getUpdateHandler(req).process(data, {
        fields: 'title,description,ingredients,procedure,portions,time,difficulty,header'
      }, function(err) {
        if (err) {
          console.error('recipeEdit:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, back, false, 'Recipe saved');
        }
      });
    }
    else {
      return formResponse(req, res, back, 'Error: You don\'t have rights to access that page', false);
    }
  });
};

var recipeNew = function(req, res) {

  var back = '..';

  if (req.method === 'POST') {
    var recipe = new Recipe.model();
    var data = recipeData(req);

    if (data === null) {
      return formResponse(req, res, back, 'Missing data', false);
    }


    var addRecipe = function() {
      recipe.getUpdateHandler(req).process(data, {
          fields: 'title,description,ingredients,procedure,portions,time,difficulty,author,header,contest.id'
        },
        function(err) {
          if (err) {
            console.error('recipeNew:', err);
            return formResponse(req, res, back, 'Error: Unknown error', false);
          }
          else {
            return formResponse(req, res, recipe.url, false, 'Recipe saved');
          }
        });
    };

    if (data['contest.id']) {
      Contest.model.findOne({
        _id: data['contest.id']
      }).exec(function(err, contest) {
        if (err) {
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        if (contest.state !== 'submission') {
          return formResponse(req, res, back, 'Error: Invalid contest state', false);
        }
        addRecipe();
      });
    }
    else {
      addRecipe();
    }
  }
  else {
    return formResponse(req, res, back, false, false);
  }
};

exports = module.exports = {
  edit: recipeEdit,
  create: recipeNew
};
