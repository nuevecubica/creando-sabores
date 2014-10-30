var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Tip = keystone.list('Tip'),
  service = require('./index');

var getTip = function(options, callback) {
  service.tipList.get(options, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getTip
};

exports = module.exports = _service;
