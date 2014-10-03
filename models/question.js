var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality');

/**
 * Questions
 * =====
 */
var Question = new keystone.List('Question', {
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

//#------------------ SCHEMA

Question.add({
  title: {
    type: Types.Text,
    initial: true,
    required: true,
    index: true,
    note: 'Should be less than 12 chars to be promoted'
  },

  author: {
    type: Types.Relationship,
    ref: 'User',
    initial: true,
    required: true,
    index: true
  },

  schemaVersion: {
    type: Types.Number,
    noedit: true,
    default: process.env.QUESTIONS_SCHEMA_VERSION
  }
}, 'Answer', {
  answer: {
    type: Types.Html,
    wysiwyg: true,
    trim: true
  }
}, 'Status', {
  state: {
    type: Types.Select,
    options: ['review', 'published', 'removed', 'closed'],
    default: 'review'
  },

  publishedDate: {
    type: Types.Date,
    dependsOn: {
      state: 'published'
    }
  }
});

// Schema for comments
var CommentsSchema = new keystone.mongoose.Schema({
  comment: String,
  user: Number,
  state: String,
  publishedDate: Date
});

Question.schema.add({
  comments: {
    type: [CommentsSchema]
  }
});

//#------------------ PRESAVE
Question.schema.pre('save', function(done) {

  if (!this.answer && this.state === 'published') {
    this.state = 'review';
    this.publishedDate = null;
  }

  if (this.isModified('state') && this.state === 'published') {
    this.publishedDate = new Date();
  }

  done();
});

/**
 * Registration
 */
Question.defaultColumns = 'title, author, state';
Question.register();
