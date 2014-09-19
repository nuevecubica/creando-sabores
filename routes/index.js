var _ = require('underscore'),
  keystone = require('keystone'),
  i18n = require("i18n"),
  middleware = require('../middlewares'),
  csrf = require('csurf'),
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
  authentication: importRoutes('./authentication'),
  templates: importRoutes('./templates')
};

// Setup Route Bindings
exports = module.exports = function(app) {

  // CSRF Protection
  if (keystone.options().security.csrf) {
    app.all(/^\/(?!api)/, csrf(), function(req, res, next) {
      res.locals.csrftoken = req.csrfToken();
      next();
    });
  }

  // Security, nobody banned or deactivated
  app.all('/(perfil|receta)*', middleware.antiBadUsers);

  // Static
  app.get('/terminos', routes.views.terms);

  // Profile: Private
  app.get('/perfil/:section(recetas|compra)?', middleware.requireUser, routes.views['private'].profile);
  app.post('/perfil/save', middleware.requireUser, routes.views['private'].profileSave);
  app.post('/perfil/change', middleware.requireUser, routes.views['private'].profileChange);
  app.post('/perfil/remove', middleware.requireUser, routes.views['private'].profileRemove);

  // Profile: Public
  app.get('/chef/:username/:section(recetas)?', routes.views.chef);

  // Home
  app.get('/', routes.views.index);

  // Recipes
  // -- Public
  app.get('/recetas', routes.views.recipes);
  app.get('/receta/:recipe', routes.views.recipe);
  // -- Private
  // ---- New
  app.get('/nueva-receta', middleware.requireUser, routes.views.recipe);
  app.post('/nueva-receta/save', middleware.requireUser, routes.views['private'].recipeSave.create);
  app.get('/nueva-receta/:contest', middleware.requireUser, routes.views.recipe);
  // ---- Edit
  app.post('/receta/:recipe/save', middleware.requireUser, routes.views['private'].recipeSave.edit);
  app.post('/receta/:recipe/remove', middleware.requireUser, routes.views['private'].recipeRemove);
  app.get('/receta/:recipe/:state(draft|publish)', middleware.requireUser, routes.views['private'].recipePublish);

  // Contests
  // -- Public
  app.get('/concursos', routes.views.contests);
  app.get('/concurso/:contest', routes.views.contest);
  app.get('/concurso/:contest/participantes/:section(top|reciente)', routes.views.participants);

  // Login, Register
  app.all('/:mode(registro|acceso)', routes.views.signup);
  app.get('/salir', routes.views.signout);
  // Authentication
  app.get('/authentication/facebook', routes.authentication.facebook);
  app.get('/authentication/google', routes.authentication.google);
  //app.get('/cocinero/:user', routes.views.profile);

  // API
  app.all('/api/v1*', keystone.initAPI);
  //-- Login
  app.post('/api/v1/login', routes.api.v1.login);
  //-- Me (secured)
  app.get('/api/v1/me', middleware.requireUserApi, routes.api.v1.me.me);
  app.get('/api/v1/me/logout', middleware.requireUserApi, routes.api.v1.me.logout);
  app.put('/api/v1/me/save', middleware.requireUserApi, routes.api.v1.me.save);
  app.get('/api/v1/me/recipes', middleware.requireUserApi, routes.api.v1.me.recipes);
  app.get('/api/v1/me/shopping/list', middleware.requireUserApi, routes.api.v1.me.shoppingList);
  app.get('/api/v1/me/shopping/:action(add|remove)/:recipe', middleware.requireUserApi, routes.api.v1.me.shopping);
  // app.put('/api/v1/me/update', middleware.requireUserApi, routes.api.v1.me.update);
  //-- Users
  app.get('/api/v1/user/:username/check', routes.api.v1.user.checkUsername);
  app.get('/api/v1/user/:username/recipes', routes.api.v1.user.recipes);
  //-- Recipes
  app.get('/api/v1/recipes', routes.api.v1.recipes);
  app.put('/api/v1/recipe/:recipe/:action(like|unlike)', middleware.requireUserApi, routes.api.v1.recipeAction);
  //-- Contests
  app.get('/api/v1/contestsPast', routes.api.v1.contestsPast);
  app.get('/api/v1/contest/:contest/recipes', routes.api.v1.contest.recipes);
  //-- Admin
  app.get('/api/v1/admin/generate/recipes', middleware.requireAdminApi, routes.api.v1.admin.generateRecipes);
  app.get('/api/v1/admin/generate/test', middleware.requireAdminApi, routes.api.v1.admin.generateTest.middleware);

  // Hbs
  app.get('/templates/hbs/:template.hbs', routes.templates.hbs);

};
