var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  modelCleaner = require(__base + 'utils/modelCleaner'),
  crypto = require('crypto'),
  imageQuality = require(__base + 'utils/imageQuality'),
  virtual = require('./virtuals'),
  service = {
    email: require(__base + 'services/email')
  };

/**
 * Users
 * =====
 */
var User = new keystone.List('User');



//#------------------ SCHEMA

User.add({
  email: {
    type: Types.Email,
    initial: true,
    required: false,
    index: true,
    unique: true,
    trim: true
  },
  username: {
    type: Types.Text,
    initial: true,
    required: true,
    index: true,
    unique: true,
    trim: true
  },
  password: {
    type: Types.Password,
    initial: true,
    required: false
  },
  schemaVersion: {
    type: Types.Number,
    noedit: true,
    default: process.env.USERS_SCHEMA_VERSION
  }
}, 'Personal', {
  name: {
    type: Types.Text,
    required: true,
    trim: true
  },
  about: {
    type: Types.Html,
    wysiwyg: true,
    trim: true,
    default: ''
  }
}, 'Avatars', {
  avatars: {
    local: {
      type: Types.CloudinaryImage,
      label: 'Local'
    },
    facebook: {
      type: Types.Text,
      label: 'Facebook',
      noedit: true,
      default: ''
    },
    google: {
      type: Types.Text,
      label: 'Google',
      noedit: true,
      default: ''
    }
  }
}, 'Media', {
  media: {
    avatar: {
      origin: {
        type: Types.Select,
        options: [{
          value: 'none',
          label: 'None'
        }, {
          value: 'local',
          label: 'Local'
        }, {
          value: 'facebook',
          label: 'Facebook'
        }, {
          value: 'google',
          label: 'Google'
        }],
        default: 'none'
      },
      url: {
        type: Types.Text,
        noedit: true
      }
    },
    header: {
      type: Types.CloudinaryImage,
      note: 'Minimum resolution: 1280 x 800'
    }
  }
}, 'Permissions', {
  isAdmin: {
    type: Boolean,
    label: 'Superadmin',
    note: 'Can access Keystone.',
    default: false
  },
  isConfirmed: {
    type: Boolean,
    label: 'Confirmed',
    note: 'Has confirmed email address. Can publish.',
    default: false
  },
  isChef: {
    type: Boolean,
    label: 'Chef',
    note: 'An official chef. Admin role.',
    default: false
  },
  isBanned: {
    type: Boolean,
    label: 'Banned',
    note: 'Login disallowed.',
    default: false
  },
  isDeactivated: {
    type: Boolean,
    label: 'Deactivated',
    note: 'Login disallowed.',
    default: false
  },
  isPrivate: {
    type: Boolean,
    label: 'Private',
    note: 'Profile is visible only for the owner.',
    default: false
  }
}, 'Social', {
  social: {
    facebook: {
      isConfigured: {
        type: Boolean,
        label: 'Facebook',
        note: 'Faceebok is configured',
        noedit: true,
        default: false
      },
      profileId: {
        type: Types.Text,
        label: 'Id',
        noedit: true,
        dependsOn: this.isConfigured,
        index: true
      },
      accessToken: {
        type: Types.Text,
        label: 'Access token',
        noedit: true,
        dependsOn: this.isConfigured
      }
    },
    google: {
      isConfigured: {
        type: Boolean,
        label: 'Google',
        note: 'Google is configured',
        noedit: true,
        default: false
      },
      profileId: {
        type: Types.Text,
        label: 'Id',
        noedit: true,
        dependsOn: this.isConfigured,
        index: true
      },
      accessToken: {
        type: Types.Text,
        label: 'Access token',
        noedit: true,
        dependsOn: this.isConfigured
      }
    }
  }
}, 'Lists', {
  favourites: {
    recipes: {
      type: Types.Relationship,
      ref: 'Recipe',
      many: true
    },
    tips: {
      type: Types.Relationship,
      ref: 'Tip',
      many: true
    }
  },
  likes: {
    type: Types.Relationship,
    ref: 'Recipe',
    many: true
  },
  shopping: {
    type: Types.Relationship,
    ref: 'Recipe',
    many: true
  }
}, 'Flags', {
  disabledNotifications: {
    type: Types.TextArray,
    default: []
  },
  disabledHelpers: {
    type: Types.TextArray,
    default: []
  },
  receiveNewsletter: {
    type: Types.Boolean,
    index: true,
    default: false
  }
}, 'Reset Password', {
  resetPasswordToken: {
    label: 'Token',
    type: Types.Text,
    noedit: true,
    index: true,
    default: ''
  },
  resetPasswordDatetime: {
    label: 'Date',
    type: Types.Datetime,
    noedit: true,
    default: 0
  }
}, 'Verify Email', {
  verifyEmailToken: {
    label: 'Token',
    type: Types.Text,
    noedit: true,
    index: true,
    default: ''
  }
});

// Schema for ranking
var Rating = new keystone.mongoose.Schema({
  item: String,
  rating: Number
});

User.schema.add({
  votes: {
    recipes: {
      type: [Rating]
    },
    tips: {
      type: [Rating]
    }
  }
});

//#------------------ VALUES AND VALIDATION

// user.name defaults to user.username
User.fields.name.default = User.fields.username;
// user.name should has something
User.schema.path('name').validate(function(value, done) {
  if (!value) {
    return done(true);
  }
  value = value.trim();
  if (value.length === 0) {
    return done(true);
  }
  var re = /^[a-zA-Z0-9]+$/;
  if (re.test(value) === null) {
    return done('Invalid username, only letters and numbers are allowed.');
  }
  return done();
});

// user.username
User.schema.path('username').validate(function(value, done) {
  if (!value) {
    return done('Invalid empty username.');
  }
  var re = /^[a-zA-Z0-9]+$/;
  if (re.test(value) === null) {
    return done('Invalid username, only letters and numbers are allowed.');
  }
  value = value.trim();
  if (value.length === 0) {
    return done('Invalid empty username.');
  }
  return done();
});

//#------------------ VIRTUALS

User.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Virtuals
User.schema.virtual('thumb').get(virtual.user.thumb);
User.schema.virtual('canAccessKeystone').get(virtual.user.canAccessKeystone);
User.schema.virtual('canPublish').get(virtual.user.canPublish);
User.schema.virtual('canAdmin').get(virtual.user.canAdmin);
User.schema.virtual('canLogin').get(virtual.user.canLogin);
User.schema.virtual('url').get(virtual.user.url);
User.schema.virtual('phrase').get(virtual.user.phrase);

//#------------------ PRESAVE

User.schema.pre('save', function(done) {
  if (this.media.avatar.origin !== 'none') {
    if (this.media.avatar.origin === 'local') {
      this.media.avatar.url = this.avatars[this.media.avatar.origin].url;
    }
    else {
      this.media.avatar.url = this.avatars[this.media.avatar.origin];
    }

    // If url not set, revert to none
    if (!this.avatars[this.media.avatar.origin]) {
      this.media.avatar.origin = 'none';
      this.media.avatar.url = null;
    }
  }

  done();
});

//#------------------ METHODS

User.schema.methods.verifyEmail = function(callback) {

  var user = this;
  user.verifyEmailToken = keystone.utils.randomString([16, 24]);
  user.save(function(err) {

    if (err) {
      callback(err);
    }
    service.email.send('welcome-register', {
      user: user,
      userVars: {
        link: keystone.get('site').url + '/confirma-email/' + user.verifyEmailToken
      }
    }, callback);
  });
};

User.schema.methods.resetPassword = function(callback) {

  var user = this;
  user.resetPasswordToken = keystone.utils.randomString([16, 24]);
  user.resetPasswordDatetime = Date.now();
  user.save(function(err) {

    if (err) {
      callback(err);
    }

    service.email.send('forgotten-password', {
      user: user,
      userVars: {
        link: keystone.get('site').url + '/nueva-contrasena/' + user.resetPasswordToken
      }
    }, callback);
  });
};

User.schema.methods.getNewsletterUnsubscribeUrl = function() {
  return '/newsletter/' + this.email + '/' + this.getNewsletterToken() + '/unsubscribe';
};

User.schema.methods.getNewsletterToken = function() {
  return crypto.createHash('sha1').update(this.phrase).digest('hex');
};

User.schema.methods.getNewsletterSubscribeUrl = function() {
  return '/newsletter/' + this.email + '/' + this.getNewsletterToken() + '/subscribe';
};

User.schema.methods.checkToken = function(token) {
  return (crypto.createHash('sha1').update(this.phrase).digest('hex') === token);
};

User.schema.methods.verifyNewsletter = function(callback) {
  var user = this;
  service.email.send('verify-newsletter', {
    user: user,
    userVars: {
      link: user.getNewsletterSubscribeUrl()
    }
  }, callback);
};

User.schema.methods.userBanned = function(callback) {
  var user = this;
  service.email.send('user-banned-removed', {
    user: user
  }, callback);
};

//#------------------ REGISTRATION

User.defaultColumns = 'name, email, isAdmin, isChef, isConfirmed, isBanned';
User.register();
