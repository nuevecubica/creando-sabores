var _ = require('underscore'),
	querystring = require('querystring'),
	keystone = require('keystone');


/**
	Initialises the standard view locals
*/
exports.initLocals = function(req, res, next) {
	var locals = res.locals;
	locals.navLinks = [
		{ label: 'Recetas', key: 'recetas', href: '/recetas' },
		{ label: 'Videorecetas', key: 'videorecetas', href: '/' },
		{ label: 'Menús', key: 'menus', href: '/' },
		{ label: 'Tips', key: 'tips', href: '/' },
		{ label: 'Preguntas y respuestas', key: 'preguntas-y-respuestas', href: '/' },
		{ label: 'Concursos', key: 'concursos', href: '/' },
		{ label: 'Acerca del chef', key: 'acerca-del-chef', href: '/' },
		{ label: 'Contacto', key: 'contacto', href: '/' }
	];

	locals.navLinksPrivate = [
		{ label: 'Mi perfil', key: 'perfil', href: '/' },
		{ label: 'Lista del super', key: 'lista-del-super', href: '/' },
		{ label: 'Mis recetas', key: 'mis-recetas', href: '/' },
		{ label: 'Mis menús', key: 'mis-menus', href: '/' },
		{ label: 'Mis tips', key: 'mis-tips', href: '/' }
	];

	locals.user = req.user;
	next();
};

/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function(req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function(req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};
