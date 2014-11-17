// For testing purposes
var __base = __base || './'; // jshint ignore:line

var _ = require('underscore'),
  defaults = require(__base + 'configs/config-default');

_.deepDefaults = require(__base + 'utils/deepDefaults');

// CASPER
var env = null;
if ('undefined' === typeof process) {
  env = require('system').env;
}
else {
  env = process.env;
}

/*
  DEVELOPMENT CONFIGURATION
*/

var answer = {
  keystone: {
    init: {
      'name': 'Chefcito',
      'brand': 'Chefcito',

      'view cache': false,

      'cookie secret': '~ No! You \/\'aste ene|2gy and tim3! You thinK cooking i5 a cu7e job, eh? L1ke M0mmy ¡n the k¡tchen?',
      'hash salt': '% The beef ¡s so undercooked 7hat ¡t is 5tartin9 to eat the salad! This s0up \'s dry!',

      'host': '0.0.0.0',
      'port': env.PORT || 3000
    },
    publicUrl: env.APP_PUBLIC_URL || 'http://0.0.0.0:3000'
  },
  server: {
    maxCPUs: 1
  }
};

exports = module.exports = _.deepDefaults(answer, defaults);
