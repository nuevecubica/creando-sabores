var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'recipe';
  locals.editable = true;
  locals.manageable = true;

  locals.filters = {
    recipe: req.params.recipe
  };
  locals.data = {};

  locals.defaults = {
    rating: 0,
    time: 30,
    portions: 2,
    difficulty: 1,
    description: '',
    procedure: ''
  };

  // load recipe
  view.on('init', function(next) {

    var q = Recipe.model.findOne({
      slug: locals.filters.recipe
    }).populate('author');

    q.exec(function(err, result) {
      if (!err && result) {

        result = _.defaults(result, locals.defaults);

        // Am I the owner?
        if (req.user) {
          locals.own = (req.user.id.toString() === result.author.id.toString());
        }
        else {
          locals.own = false;
        }

        // Drafts only for the owner
        if (result.state === 0 && !locals.own) {
          return res.notfound(res.__('Not found'));
        }

        locals.data.recipe = result;
        locals.title = result.title + ' - ' + res.__('Recipe');
      }
      else {
        return res.notfound(res.__('Not found'));
      }
      next(err);
    });
  });

  // Render the view
  view.render('recipe');
};
