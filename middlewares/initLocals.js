var keystone = require('keystone'),
  i18n = require('i18n'),
  pkg = require(__dirname + '/../package.json');

/**
	Initialises the standard view locals
*/
exports.initLocals = function(req, res, next) {
  var locals = res.locals;
  locals.navLinks = [{
    label: 'Recetas',
    key: 'recetas',
    href: '/recetas'
  }, {
    label: res.__('Videorecipes'),
    key: 'videorecetas',
    href: '/videorecetas'
  }, {
    label: res.__('Menus'),
    key: 'menus',
    href: '/'
  }, {
    label: res.__('Tips'),
    key: 'tips',
    href: '/tips'
  }, {
    label: res.__('Questions and Answers'),
    key: 'preguntas-y-respuestas',
    href: '/preguntas'
  }, {
    label: res.__('Contests'),
    key: 'concursos',
    href: '/concursos'
  }, {
    label: res.__('About the chef'),
    key: 'acerca-del-chef',
    href: '/biografia'
  }, {
    label: res.__('Contact'),
    key: 'contacto',
    href: '/contacto'
  }];

  locals.user = req.user;
  locals.version = pkg.version + (pkg.versionName ? ('-' + pkg.versionName) : '');
  locals.ksversion = keystone.version;
  locals.env = process.env;
  locals.isTest = keystone.testMode;

  locals.site = {
    name: keystone.name,
    brand: keystone.brand
  };

  /*
    Data to send to the client in each page
  */
  locals.chef = {
    isUserLoggedIn: !!req.user
  };

  if (req.user) {
    locals.chef.user = {
      username: req.user.username,
      name: req.user.name,
      disabledHelpers: req.user.disabledHelpers
    };
    if (req.user.isAdmin) {
      locals.chef.user.isAdmin = true;
    }
    if (!req.user.isConfirmed) {
      locals.chef.user.isUnconfirmed = true;
    }
  }

  next();
};
