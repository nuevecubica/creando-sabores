var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  Menu = keystone.list('Menu'),
  Contest = keystone.list('Contest'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services'),
  config = require(__base + 'configs/editor');



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
        fields: 'title,description,plates,media.header'
      };

      service.menu.save(menu, options, function(err) {
        if (err) {
          console.error('menuEdit:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
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
    var data = menuData(req);

    if (data === null) {
      return formResponse(req, res, back, 'Missing data', false);
    }

    var addMenu = function() {

      // Save
      menu.getUpdateHandler(req).process(data, {
          fields: 'title,description,plates,author,media.header'
        },
        function(err) {
          if (err) {
            console.error('menuNew:', err);
            return formResponse(req, res, back, 'Error: Unknown error', false);
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
    };

    addMenu();
  }
  else {
    return formResponse(req, res, back, false, false);
  }
};

exports = module.exports = {
  edit: menuEdit,
  create: menuNew
};
