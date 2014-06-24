var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Users
 * =====
 */
var User = new keystone.List('User');

User.add({
  email: {
    type: Types.Email,
    initial: true,
    required: false,
    index: true,
    unique: true
  },
  username: {
    type: Types.Text,
    initial: true,
    required: true,
    index: true,
    unique: true
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
    type: Types.Text
  },
  about: {
    type: Types.Textarea
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
      url: {
        type: Types.Text,
        label: 'URL',
        noedit: true
      },
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
      }
    },
    header: {
      type: Types.CloudinaryImage
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

User.schema.pre('save', function(next) {
  if (this.media.avatar.origin !== 'none') {
    if (this.media.avatar.origin === 'local') {
      this.media.avatar.url = this.avatars[this.media.avatar.origin].url;
    }
    else {
      this.media.avatar.url = this.avatars[this.media.avatar.origin];
    }
  }

  next();
});

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin, isChef, isConfirmed, isBanned';
User.register();
