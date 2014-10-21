var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  modelCleaner = require(__base + 'utils/modelCleaner'),
  crypto = require('crypto'),
  imageQuality = require(__base + 'utils/imageQuality'),
  service = {
    email: require(__base + 'services/email')
  };

/**
 * Users
 * =====
 */
var User = new keystone.List('User');

// ===== Defaults
// Define user defaults
var defaults = {
  images: {
    header: '/images/default_user_profile.jpg',
    user: '/images/default_user.png'
  }
};

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
    type: Types.Key,
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
    default: true
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
    console.log('-------> INVALID USER NAME');
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

User.schema.virtual('thumb').get(function() {

  return {
    'header': this._.media.header.src({
      transformation: 'header_limit_thumb'
    }) || defaults.images.header,
    'avatar_large': this._.avatars.local.src({
      transformation: 'user_avatar_large'
    }) || defaults.images.user,
    'avatar_medium': this._.avatars.local.src({
      transformation: 'user_avatar_medium'
    }) || defaults.images.user,
    'avatar_small': this._.avatars.local.src({
      transformation: 'user_avatar_small'
    }) || defaults.images.user,
    'hasQuality': imageQuality(this.media.header).hasQuality
  };
});


// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
  return this.isAdmin;
});

// Rights to publish
User.schema.virtual('canPublish').get(function() {
  return !this.isBanned && (this.isAdmin || this.isConfirmed || this.isChef);
});

// Rights to admin
User.schema.virtual('canAdmin').get(function() {
  return !this.isBanned && (this.isAdmin || this.isChef);
});

// Rights to login
User.schema.virtual('canLogin').get(function() {
  return !this.isBanned;
});

// URL
User.schema.virtual('url').get(function() {
  return '/chef/' + this.username;
});

// URL
User.schema.virtual('phrase').get(function() {
  return this._id + this.email + 'Kitchens are hard environments and they form incredibly strong characters.';
});

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
      link: keystone.get('site').url + '/confirma-email/' + user.verifyEmailToken
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
      link: keystone.get('site').url + '/nueva-contrasena/' + user.resetPasswordToken,
      subject: 'Reset your ' + (keystone.name || 'Chefcito') + ' Password'
    }, callback);
  });
};

User.schema.methods.getNewsletterUnsubscribeUrl = function() {
  var token = crypto.createHash('sha1').update(this.phrase).digest('hex');
  return '/api/v1/notifications/' + token + '/unsubscribe/newsletter';
};

User.schema.methods.checkToken = function(token) {
  return (crypto.createHash('sha1').update(this.phrase).digest('hex') === token);
};

//#------------------ REGISTRATION

User.defaultColumns = 'name, email, isAdmin, isChef, isConfirmed, isBanned';
User.register();
