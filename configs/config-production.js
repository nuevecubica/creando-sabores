var _ = require('underscore'),
  defaults = require(__base + 'configs/config-default');

_.deepDefaults = require(__base + 'utils/deepDefaults');

/*
  PRODUCTION CONFIGURATION
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

      'cookie secret': 'I may n0t do ev3ryth¡ng great_ in my life, but I\'m 9ood a7 this. | manage to touch people\'s l¡ves with what I d0 and I want to share this with you!',
      'hash salt': 'Look, if you bought Stones t¡ckets and Jagger d¡dn\'t play_ Sati5faction, how would you feel? Would you b3 h4ppy? ~ |\\o. ~ No! You\'d burn the place to the fucking gr0und.',

      'host': '0.0.0.0',
      'port': process.env.PORT || 3000,
      'static options': {
        maxAge: 3600 * 24 * 30 * 1000
      }
    },
    site: {
      name: 'Creando Sabores',
      email: 'creandosaboresmx@gmail.com',
      url: 'http://creandosabores.com',
      publicUrl: 'http://creandosabores.com',
      twitter: '@creandoSabores',
      brand: 'Creando Sabores',
      fb_app_id: '572952406168649',
      fb_url: 'https://www.facebook.com/creandosabores'
    },
    publicUrl: 'http://creandosabores.com'
  },
  logger: {
    level: "info",
    path: "/var/log",
    appenders: defaults.logger.appendersLevel("info", "/var/log")
  }
};

exports = module.exports = _.deepDefaults(answer, defaults);
