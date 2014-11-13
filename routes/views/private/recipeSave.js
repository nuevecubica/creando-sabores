var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  Recipe = keystone.list('Recipe'),
  Contest = keystone.list('Contest'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services'),
  config = require(__base + 'configs/editor');

var _logger = require(__base + 'utils/logger');

var recipeData = function(req, orig) {
  // Clean data
  var data = {};
  var prop, props = ['title', 'description', 'procedure', 'ingredients', 'categories', 'portions', 'time', 'difficulty', 'contest.id'];
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

    data.title = clean(req.body.title, ['plaintext', 'oneline', ['maxlength', config.recipe.title.length], 'escape']);
    data.description = clean(req.body.description, ['oneline', ['maxlength', config.recipe.description.length], 'escape']);
    data.procedure = clean(req.body.procedure, [
      ['maxlinelength', config.recipe.procedure.length],
      ['maxlines', config.recipe.procedure.elements], 'escape', 'textarea', 'paragraphs'
    ]);
    data.ingredients = clean(req.body.ingredients, [
      ['maxlinelength', config.recipe.ingredient.length],
      ['maxlines', config.recipe.ingredient.elements], 'escape', 'textarea', 'paragraphs'
    ]);
    data.portions = clean(req.body.portions, ['integer', ['max', config.recipe.portions.max],
      ['min', 1]
    ]);
    data.time = clean(req.body.time, ['integer', ['max', config.recipe.time.max],
      ['min', 1]
    ]);
    data.difficulty = clean(req.body.difficulty, ['integer', ['max', 5],
      ['min', 1]
    ]);
    data.categories = (req.body.categories) ? req.body.categories.split(',') : [];
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

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  var request = _logger.getRequest(req);

  // Get
  service.recipe.recipe.get(options, function(err, result) {
    if (err) {
      logger.error('recipeEdit error: %j', err, request);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (result) {

      var recipe = result.recipe._document;

      // Data
      var data = recipeData(req, recipe);

      if (data === null) {
        return formResponse(req, res, back, 'Missing data', false);
      }

      // If not admin, rejects if admited in a contest
      if (!req.user.isAdmin && recipe.contest && recipe.contest.id && recipe.state === 'published') {
        logger.info('recipeEdit admited: %j', err, request);
        return formResponse(req, res, back, 'Error: You cannot edit a recipe already admited in a contest', false);
      }

      // Save
      recipe.getUpdateHandler(req).process(data, {
        fields: 'title,description,ingredients,procedure,portions,time,difficulty,header'
      }, function(err) {
        if (err) {
          logger.error('recipeEdit.updateHandler: %j', err, request);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {

          if (data.categories) {
            recipe.categories = data.categories;
            recipe.save(function(err, recipeSaved) {

              if (err) {
                logger.error('recipeEdit.save: %j', err, request);
                return formResponse(req, res, back, 'Error: Unknown error', false);
              }
              else {
                return formResponse(req, res, back, false, 'Recipe saved');
              }
            });
          }
        }
      });
    }
    else {
      logger.info('recipeEdit.rights', request);
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

    var request = _logger.getRequest(req);

    var addRecipe = function() {

      // Save
      recipe.getUpdateHandler(req).process(data, {
          fields: 'title,description,ingredients,procedure,portions,time,difficulty,author,header,contest.id'
        },
        function(err) {
          if (err) {
            logger.error('recipeNew.addRecipe error: %j', err, request);
            return formResponse(req, res, back, 'Error: Unknown error', false);
          }
          else {
            if (data.categories) {
              recipe.categories = data.categories;
              recipe.save(function(err, recipeSaved) {

                if (err) {
                  logger.error('recipeNew.addRecipe.categories error: %j', err, request);
                  return formResponse(req, res, back, 'Error: Unknown error', false);
                }
                else {
                  if (req.user.disabledHelpers.indexOf('recipe') === -1) {
                    req.user.disabledHelpers.push('recipe');
                    req.user.save(function(err) {
                      if (err) {
                        logger.error('recipeNew.addRecipe.categories.user error: %j', err, request);
                        return formResponse(req, res, back, 'Error: Unknown error', false);
                      }
                      else {
                        return formResponse(req, res, recipeSaved.url, false, 'Recipe saved');
                      }
                    });
                  }
                  else {
                    return formResponse(req, res, recipeSaved.url, false, 'Recipe saved');
                  }
                }
              });
            }
          }
        });
    };

    if (data['contest.id']) {
      Contest.model.findOne({
        _id: data['contest.id']
      }).exec(function(err, contest) {

        if (err) {
          logger.warn('recipeNew.contest error: %j', err, request);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        if (contest.state !== 'submission') {
          return formResponse(req, res, back, 'Error: Invalid contest state', false);
        }

        // Added contest id manually because id is a nested field of contest and an assignation like object[field.nestedfield] does not work
        recipe.contest.id = data['contest.id'];

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
