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
    label: res.__('Menus'),
    key: 'menus',
    href: '/menus'
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
    key: 'acerca-de-nosotros',
    href: '/about'
  }, {
    label: res.__('Contact'),
    key: 'contacto',
    href: '/contacto'
  }];

  locals.user = req.user;
  locals.version = pkg.version + (pkg.versionName ? ('-' + pkg.versionName) : '');
  locals.ksversion = keystone.version;
  locals.env = process.env;
  locals.mode = keystone.app.settings.env || 'development';
  locals.isTest = keystone.testMode;
  locals.form = req.body;
  locals.errors = {
    fields: {
      name: false,
      email: false,
      password: false
    }
  };

  locals.site = keystone.get('site');

  locals.fullUrl = locals.site.url || 'http://creandosabores.com';

  if (req.path) {
    locals.fullUrl = locals.fullUrl + req.path;
  }
  else {
    locals.fullUrl = locals.fullUrl + '/';
  }

  /* Opengraph defaults */
  locals.opengraph = {
    title: res.__('Chefcito title'),
    description: res.__('Chefcito description'),
    url: locals.site.url,
    image: locals.site.url + '/public/images/default_share.jpg'
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
