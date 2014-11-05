var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Menu = keystone.list('Menu'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getMenus = function(options, callback) {

  options = _.defaults(options || {}, {
    sort: '-publishedDate',
    states: ['published']
  });

  if (options.all) {
    options.states.push('draft');
    options.states.push('banned');
  }

  var query = queryMaker(Menu, options);
  var next = callback || function() { /* dummy */ };

  query.exec(next);
};

/*
  Set exportable object
 */
var _service = {
  get: getMenus
};

exports = module.exports = _service;
