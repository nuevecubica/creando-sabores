var _ = require('underscore'),
	keystone = require('keystone'),
	middleware = require('./middleware'),
	importRoutes = keystone.importer(__dirname);

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
	// Views
	app.get  ('/', routes.views.index);
	app.get  ('/recetas', routes.views.recipes);
	app.get  ('/receta/:recipe', routes.views.recipe);
	app.all  ('/:mode(registro|acceso)', routes.views.signup);
	app.get  ('/salir', routes.views.signout);

	// Authentication
	app.get  ('/authentication/facebook', routes.authentication.facebook);
	app.get  ('/authentication/google'	, routes.authentication.google);

	// API
	app.all  ('/api/v1*', keystone.initAPI);
	//-- Me
	app.get  ('/api/v1/me'				, routes.api.v1.me.me);
	app.post ('/api/v1/me/login'	, routes.api.v1.me.login);
	app.get  ('/api/v1/me/logout'	, routes.api.v1.me.logout);
	//-- Users
	app.get  ('/api/v1/user/:username/check', routes.api.v1.user.checkUsername);
	//-- Recipes
	app.get('/recetas', routes.views.recipes);
};
