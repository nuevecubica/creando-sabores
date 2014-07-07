var _ = require('underscore'),
  keystone = require('keystone'),
  i18n = require("i18n"),
  middleware = require('../middlewares'),
  importRoutes = keystone.importer(__dirname);

// i18n support
keystone.pre('routes', i18n.init);

// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Handle 404 errors
keystone.set('404', function(req, res, next) {
  res.notfound();
});

// Handle other errors
keystone.set('500', function(err, req, res, next) {
  var title, message;
  if (err instanceof Error) {
    message = err.message;
    err = err.stack;
  }
  res.err(err, title, message);
});

// Import Route Controllers
var routes = {
  views: importRoutes('./views'),
  api: importRoutes('./api'),
  authentication: importRoutes('./authentication')
};

// Setup Route Bindings
exports = module.exports = function(app) {
  // Static
  app.get('/terminos', routes.views.terms);

  // Public
  app.get('/', routes.views.index);
  app.all('/:mode(registro|acceso)', routes.views.signup);
  app.get('/recetas', routes.views.recipes);
  app.get('/receta/:recipe', routes.views.recipe);
  app.get('/salir', routes.views.signout);
  //app.get('/cocinero/:user', routes.views.profile);

  // Private
  app.get('/perfil', middleware.requireUser, routes.views.private.profile);
  app.post('/perfil/save', middleware.requireUser, routes.views.private.profileSave);

  // Authentication
  app.get('/authentication/facebook', routes.authentication.facebook);
  app.get('/authentication/google', routes.authentication.google);

  // API
  app.all('/api/v1*', keystone.initAPI);
  //-- Login
  app.post('/api/v1/login', routes.api.v1.login);
  //-- Me (secured)
  app.get('/api/v1/me', middleware.requireUserApi, routes.api.v1.me.me);
  app.get('/api/v1/me/logout', middleware.requireUserApi, routes.api.v1.me.logout);
  app.put('/api/v1/me/save', middleware.requireUserApi, routes.api.v1.me.save);
  // app.put('/api/v1/me/update', middleware.requireUserApi, routes.api.v1.me.update);
  //-- Users
  app.get('/api/v1/user/:username/check', routes.api.v1.user.checkUsername);
  //-- Recipes
};
