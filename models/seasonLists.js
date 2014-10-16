var _ = require('underscore'),
  config = require(__base + 'config.js'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  modelCleaner = require(__base + 'utils/modelCleaner');

/**
 * SeasonLists
 * ======
 */

var SeasonList = new keystone.List('SeasonList', {
  map: {
    name: 'title'
  },
  autokey: {
    path: 'slug',
    from: 'title',
    unique: true,
    fixed: true
  }
});

SeasonList.add({
    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true,
      note: 'Should be less than 12 chars to be promoted',
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
      height: 100,
      hidden: true,
      default: ''
    },

    priority: {
      type: Types.Number,
      default: 0
    },

    // Needed for Mongoosastic
    slug: {
      type: Types.Text,
      hidden: true
    }
  },

  'State', {
    state: {
      type: Types.Select,
      options: ['draft', 'published', 'removed'],
      default: 'draft'
    },

    publishedDate: {
      type: Types.Datetime,
      dependsOn: {
        state: 'published'
      },
      default: Date.now
    },

    editDate: {
      type: Types.Datetime,
      dependsOn: {
        state: 'published'
      },
      default: Date.now
    }
  },

  'Recipes', {
    recipes: {
      type: Types.Relationship,
      ref: 'Recipe',
      many: true
    }
  });

/**
 * Registration
 * ============
 */
SeasonList.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

SeasonList.defaultColumns = 'title, state, priority, publishedDate';
SeasonList.register();
