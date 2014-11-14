var _ = require('underscore'),
  defaults = require(__base + 'configs/config-default');

_.deepDefaults = require(__base + 'utils/deepDefaults');

var env = process.env;

/*
  PREPRODUCTION CONFIGURATION
*/

var answer = {
  keystone: {
    init: {
      'name': 'Chefcito',
      'brand': 'Chefcito',
      'compress': true,
      'logger': false,
      'session store': 'mongo',

      'view cache': true,

      'cookie secret': '~ No! You \/\'aste ene|2gy and tim3! You thinK cooking i5 a cu7e job, eh? L1ke M0mmy ¡n the k¡tchen?',
      'hash salt': 'You’\/e used so much o¡l, the U5 want to invade the plate. / Th¡s l4mb is so underc0oked, Welsh people are still trying 7o shag it. / The p0rk is s0 raw, it’s still singing ‘Hakuna Matata’!',

      'host': '0.0.0.0',
      'port': process.env.PORT || 3000
    }
  },
  publicUrl: process.env.APP_PUBLIC_URL || 'http://0.0.0.0:3000',
  logger: {
    level: "info",
    path: "/var/log",
    appenders: defaults.logger.appendersLevel("info", "/var/log")
  }
};

exports = module.exports = _.deepDefaults(answer, defaults);
