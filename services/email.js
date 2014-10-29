var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  config = require(__base + 'config');

var site = keystone.get('site') || config.keystone['site'];

var defaults = function() {
  return {
    userId: null, // To do
    user: null,
    users: [],
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
  var _user = {
    name: user.name,
    email: user.email,
    vars: {
      profile: user.url || site.url,
      private_profile: site.url + "/perfil",
      avatar: user.thumb ? user.thumb.avatar_small : ""
    }
  };

  // merge_vars via user object
  if (user.vars) {
    _user.vars = _.extend(_user.vars, user.vars);
  }

  return _user;
};

/**
 * Parse options before the delivery
 * @param  {Object} options
 * @return {Object}
 */
var _parseOptions = function(options) {
  options = options || {};

  _.defaults(options, defaults());

  options.to = options.to || [];

  if (!keystone.utils.isArray(options.to)) {
    options.to = [options.to];
  }

  if (options.user) {
    options.users.push(options.user);
    options.users = _.uniq(options.users, false, function(user) {
      return user.username;
    });
  }

  if (options.users && keystone.utils.isArray(options.users)) {

    options.users.forEach(function(_user) {
      _user = userToMandrill(_user);

      // userVars via options
      if (options.userVars) {
        _user.vars = _.extend(_user.vars, options.userVars);
      }

      options.to.push(_user);
    });
  }

  options = _.omit(_.extend(options, options.locals), ['locals']);

  return options;
};

/**
 * Sends an email
 * @param  {String}   id       Email identifier
 * @param  {Oject}    options  {to, subject, user, from, locals}
 * @param  {Function} callback err
 */
var send = function(id, options, callback) {

  if (!id) {
    return callback('No template');
  }

  options = _parseOptions(options);

  if (!options.to) {
    return callback('No recipient');
  }

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

  if (!id) {
    return callback('No template');
  }

  options = _parseOptions(options);

  if (!options.to) {
    return callback('No recipient');
  }

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
