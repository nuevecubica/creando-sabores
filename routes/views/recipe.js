var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  config = require(__base + 'configs/editor'),
  entities = require("entities");

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var type = locals.type = (req.params.type === 'videoreceta' ? 'videorecipe' : 'recipe');
  locals.data = {};

  locals.categories = {};

  locals.collection = 'recipe';

  // Init locals
  if (req.params.recipe) {
    locals.section = type;
    locals.isNew = false;
  }
  else {
    locals.section = 'new-recipe';
    locals.isNew = true;
    locals.own = true;
  }

  if (req.query.autoplay) {
    locals.autoplay = true;
  }

  locals.editable = true;
  locals.manageable = true;
  locals.config = config;

  locals.filters = {
    recipe: req.params.recipe || null,
    contest: req.params.contest || null
  };

  var options = {
    slug: locals.filters.recipe,
    user: req.user,
    states: ['published', 'draft', 'review'],
    fromContest: true
  };

  var toTitleCase = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // load recipe
  view.on('init', function(next) {

    async.series([
      // Get categories
      function(callback) {
        service.config.categories.get(function(err, results) {
          locals.categories.plates = results.categories.categories_plates;
          locals.categories.food = results.categories.categories_food;
          callback(err);
        });
      },
    ], function(err) {
      if (!err) {
        if (!locals.isNew) {
          service.recipe[type].get(options, function(err, result) {
            if (!err && result) {
              locals.data = result;
              locals.own = result.own;
              var title = toTitleCase(result.recipe.title);
              locals.title = title + ' - ' + (type === 'recipe' ? res.__('Recipe') : res.__('Videorecipe'));
              var descr = result.recipe.description;
              // Description is an HTML field. Remove HTML tags and whitespace,
              // then urldecode entities to get a plain text version of it.
              descr = descr.replace(/(<([^>]+)>)/ig, "").replace(/(\r\n|\n|\r)/gm, " ");
              descr = entities.decodeHTML(descr);

              locals.opengraph = {
                title: res.__('Recipe of') + ' ' + title,
                description: descr,
                image: result.recipe.thumb.grid_large,
                url: locals.site.url + result.recipe.url
              };

              service.recipeList.related({
                recipeId: result.recipe._id
              }, function(err, results) {
                locals.related = results;
                next(err);
              });
            }
            else {
              return res.notfound(res.__('Not found'));
            }
          });
        }
        else {
          service.recipe.get.new({
            contest: locals.filters.contest
          }, function(err, result) {
            if (!err && result) {
              locals.data = result;
              next(null);
            }
            else {
              return res.notfound(res.__('Not found'));
            }
          });
        }
      }
      else {
        next(err);
      }

    });

  });

  // Render the view
  view.render(type);
};
