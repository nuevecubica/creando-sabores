var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality');

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
    trim: true
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
      noedit: true
    },
    google: {
      type: Types.Text,
      label: 'Google',
      noedit: true
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
    note: 'Can access Keystone.'
  },
  isConfirmed: {
    type: Boolean,
    label: 'Confirmed',
    note: 'Has confirmed email address. Can publish.'
  },
  isChef: {
    type: Boolean,
    label: 'Chef',
    note: 'An official chef. Admin role.'
  },
  isBanned: {
    type: Boolean,
    label: 'Banned',
    note: 'Cannot login.'
  },
  isDeactivated: {
    type: Boolean,
    label: 'Deactivated',
    note: 'Cannot login.'
  },
  isPrivate: {
    type: Boolean,
    label: 'Private',
    note: 'Profile is visible only for himself.'
  }
}, 'Social', {
  social: {
    facebook: {
      isConfigured: {
        type: Boolean,
        label: 'Facebook',
        note: 'Faceebok is configured',
        noedit: true
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
        noedit: true
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
    type: Types.Relationship,
    ref: 'Recipe',
    many: true
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
    }),
    'avatar_large': this._.avatars.local.src({
      transformation: 'user_avatar_large'
    }),
    'avatar_medium': this._.avatars.local.src({
      transformation: 'user_avatar_medium'
    }),
    'avatar_small': this._.avatars.local.src({
      transformation: 'user_avatar_small'
    }),
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

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin, isChef, isConfirmed, isBanned';
User.register();
