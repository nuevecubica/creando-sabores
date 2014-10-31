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

      'view cache': true,

      'cookie secret': 'I may n0t do ev3ryth¡ng great_ in my life, but I\'m 9ood a7 this. | manage to touch people\'s l¡ves with what I d0 and I want to share this with you!',
      'hash salt': 'Look, if you bought Stones t¡ckets and Jagger d¡dn\'t play_ Sati5faction, how would you feel? Would you b3 h4ppy? ~ |\\o. ~ No! You\'d burn the place to the fucking gr0und.',

      'host': '0.0.0.0',
      'port': process.env.PORT || 3000
    }
  },
  site: {
    name: 'Creando Sabores',
    email: 'contacto@creandosabores.com',
    url: 'http://creandosabores.com'
  },
  publicUrl: 'http://creandosabores.com'
};

exports = module.exports = _.deepDefaults(answer, defaults);
