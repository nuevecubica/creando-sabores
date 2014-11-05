var async = require('async'),
  keystone = require('keystone'),
  formResponse = require(__base + 'utils/formResponse.js'),
  service = require(__base + 'services');

var menuPublish = function(req, res) {
  var menuSlug = req.params.menu,
    back = '..',
    actions = ['draft', 'publish'],
    states = ['draft', 'published'],
    descriptions = ['unpublished', 'published'],
    data = {},
    fields = [];

  var options = {
    slug: menuSlug,
    states: ['published', 'draft'],
    fromContest: true
  };

  options.user = req.user;

  if (!req.user.isAdmin) {
    options.authorId = req.user._id;
  }

  // Data
  if (actions.indexOf(req.params.state) === -1) {
    console.error('menuPublish: Error for unknown action %s', req.params.state);
    return formResponse(req, res, back, 'Error: Unknown error', false);
  }
  else {
    fields.push('state');
    data.state = states[actions.indexOf(req.params.state)];
  }

  // Get
  service.menu.get(options, function(err, result) {
    if (err) {
      console.error('menuPublish:', err, options);
      return formResponse(req, res, back, 'Error: Unknown error', false);
    }
    else if (result) {
      var menu = result.menu;

      // Publish
      menu._document.getUpdateHandler(req).process(data, {
        fields: fields
      }, function(err) {
        if (err) {
          console.error('menuPublish:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          return formResponse(req, res, back, false, 'Menu ' + descriptions[states.indexOf(data.state)]);
        }
      });
    }
    else {
      return formResponse(req, res, back, 'Error: You don\'t have rights to access that page', false);
    }
  });
};

exports = module.exports = menuPublish;
