var _ = require('underscore'),
  defaults = require(__base + 'configs/config-default');

_.deepDefaults = require(__base + 'utils/deepDefaults');

/*
  PREPRODUCTION CONFIGURATION
*/

var answer = {
  keystone: {
    init: {
      'name': 'Chefcito',
      'brand': 'Chefcito',

      'view cache': true,

      'cookie secret': '~ No! You \/\'aste ene|2gy and tim3! You thinK cooking i5 a cu7e job, eh? L1ke M0mmy ¡n the k¡tchen?',

      'host': '0.0.0.0',
      'port': process.env.PORT || 3000
    }
  },
  site: {
    name: 'Chefcito',
    email: 'chefcito@glue.gl',
    url: process.env.APP_PUBLIC_URL || 'http://0.0.0.0:3000'
  },
  publicUrl: process.env.APP_PUBLIC_URL || 'http://0.0.0.0:3000'
};

exports = module.exports = _.deepDefaults(answer, defaults);
