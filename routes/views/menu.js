var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  config = require(__base + 'configs/editor');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.categories = {};

  locals.collection = 'menu';

  // Init locals
  if (req.params.menu) {
    locals.section = 'menu';
    locals.isNew = false;
  }
  else {
    locals.section = 'new-menu';
    locals.isNew = true;
    locals.own = true;
  }

  locals.editable = true;
  locals.manageable = true;
  locals.config = config;

  locals.filters = {
    menu: req.params.menu || null
  };

  var options = {
    slug: locals.filters.menu,
    user: req.user,
    states: ['published', 'draft']
  };

  var toTitleCase = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // load recipe
  view.on('init', function(next) {

    if (!locals.isNew) {
      service.menu.get.withRecipes(options, function(err, result) {
        if (!err && result) {

          locals.data = result;
          locals.own = result.own;
          locals.title = toTitleCase(result.menu.title) + ' - Menú';

          service.menuList.related({
            menuId: result.menu._id
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
      service.menu.get.new({
        predefinedPlate: req.params.plate
      }, function(err, result) {
        locals.data = result;
        next(err);
      });
    }

  });

  // Render the view
  view.render('menu');
};
