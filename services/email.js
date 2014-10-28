var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  config = require(__base + 'config');

var site = keystone.get('site') || config.keystone['site'];

var defaults = function() {
  return {
    userId: null, // To do
    user: null,
    to: null,
    subject: null,
    title: null,
    body: null,
    from: {
      name: 'Do not reply',
      email: 'noreply@byglue.me'
    },
    locals: keystone.get('email locals') || {},
    globalMergeVars: {
      site: site,
      private_profile: site.url + '/perfil',
      current_year: 2014,
      links: {
        home: site.url + '/',
        login: site.url + '/login',
        recipes: site.url + '/recetas',
        videorecipes: site.url + '/videorecetas',
        contests: site.url + '/concursos',
        tips: site.url + '/tips'
      }
    },
    content: {},
    mandrillTemplate: true // To do
  };
};

var userToMandrill = function(user) {
  return {
    name: user.name,
    email: user.email,
    vars: {
      profile: user.url || site.url,
      private_profile: site.url + "/perfil",
      avatar: user.thumb ? user.thumb.avatar_small : "",
      site: site,
      current_year: 2014,
      links: {
        home: site.url + '/',
        login: site.url + '/login',
        recipes: site.url + '/recetas',
        videorecipes: site.url + '/videorecetas',
        contests: site.url + '/concursos',
        tips: site.url + '/tips'
      }
    }
  };
};

/**
 * Sends an email
 * @param  {String}   id       Email identifier
 * @param  {Oject}    options  {to, subject, user, from, locals}
 * @param  {Function} callback err
 */
var send = function(id, options, callback) {
  options = options || {};

  _.defaults(options, defaults());

  if (!options.to) {
    if (options.user) {
      options.to = userToMandrill(options.user);
    }
    else {
      return callback('No recipient');
    }
  }

  options = _.omit(_.extend(options, options.locals), ['locals', 'templateId']);

  var init = {
    templateName: id
  };

  if (options.mandrillTemplate) {
    init.templateMandrillName = id;
  }

  var em = new keystone.Email(init);
  em.send(options, function(err, result) {
    callback(err, result, options);
  });
};

var render = function(id, options, callback) {
  _.defaults(options, defaults());

  if (!options.to) {
    if (options.user) {
      options.to = userToMandrill(options.user);
    }
    else {
      return callback('No recipient');
    }
  }

  options = _.omit(_.extend(options, options.locals), ['locals', 'templateId']);

  var init = {
    templateName: id
  };

  if (options.mandrillTemplate) {
    init.templateMandrillName = id;
  }

  var em = new keystone.Email(init);
  em.renderMandrill(options, function(err, result) {
    callback(err, result, options);
  });
};

/*
  Set exportable object
 */
var _service = {
  send: send,
  render: render
};

exports = module.exports = _service;
