var _ = require('underscore'),
  keystone = require('keystone'),
  Menu = keystone.list('Menu'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

var menuEdit = function(req, res) {
  var menuSlug = req.params.menu,
    back = '..';

  var options = {
    slug: menuSlug,
    states: ['draft', 'published']
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  // Get
  service.menu.get(options, function(err, result) {
    if (err) {
      console.error('menuEdit:', err);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (result) {

      var menu = result.menu._document;

      var options = {
        req: req,
        fields: 'title,description,plates,media.header'
      };

      service.menu.save(menu, options, function(err) {
        if (err) {
          console.error('menuEdit:', err);
          return formResponse(req, res, back, (err || 'Error: Unknown error'), false);
        }
        else {
          return formResponse(req, res, back, false, 'Menu saved');
        }
      });
    }
    else {
      return formResponse(req, res, back, 'Error: You don\'t have rights to access that page', false);
    }
  });
};

var menuNew = function(req, res) {

  var back = '..';

  if (req.method === 'POST') {
    var menu = new Menu.model();

    var options = {
      user: req.user,
      body: req.body,
      fields: 'title,description,plates,author,media.header'
    };

    // Save
    service.menu.save(menu, options, function(err) {
      if (err) {
        console.error('menuNew:', err);
        return formResponse(req, res, back, (err || 'Error: Unknown error'), false);
      }
      else {
        if (req.user.disabledHelpers.indexOf('menu') === -1) {
          req.user.disabledHelpers.push('menu');
          req.user.save(function(err) {
            if (err) {
              return formResponse(req, res, back, 'Error: Unknown error', false);
            }
            else {
              return formResponse(req, res, menu.url, false, 'Menu saved');
            }
          });
        }
        else {
          return formResponse(req, res, menu.url, false, 'Menu saved');
        }
      }
    });
  }
  else {
    return formResponse(req, res, back, false, false);
  }
};

exports = module.exports = {
  edit: menuEdit,
  create: menuNew
};
