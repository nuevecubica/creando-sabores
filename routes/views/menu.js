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
    states: ['published', 'draft', 'removed'],
    populate: ['plates', 'author']
  };

  // load recipe
  view.on('init', function(next) {

    service.menu.get(options, function(err, result) {
      if (!err && result) {

        locals.data = result;
        locals.own = result.own;
        locals.title = result.menu.title + ' - Menú';

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
  });

  // Render the view
  view.render('menu');
};
