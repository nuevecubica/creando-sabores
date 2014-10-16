var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  virtual = require('./virtuals'),
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality'),
  modelCleaner = require(__base + 'utils/modelCleaner');

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

  // Needed for Mongoosastic
  slug: {
    type: Types.Text,
    es_type: "string",
    hidden: true
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
  },
  chef: {
    type: Types.Relationship,
    ref: 'User',
    filters: {
      'isChef': true
    },
    index: true
  }
}, 'Status', {
  state: {
    type: Types.Select,
    options: ['review', 'published', 'removed', 'closed'],
    default: 'review'
  },

  createdDate: {
    type: Types.Date,
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


Question.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

//#------------------ VIRTUAL
Question.schema.virtual('url').get(virtual.question.url);


//#------------------ PRESAVE
Question.schema.pre('save', function(done) {

  if (!this.createdDate) {
    this.createdDate = new Date();
  }

  // if (this.isModified('answer') && !this.chef) {
  //   this.chef = this._req_user;
  // }

  if ((!this.answer || !this.chef) && (this.state === 'published' || this.state === 'closed')) {
    this.state = 'review';
    this.publishedDate = null;
  }

  if (this.isModified('state') && this.state === 'published') {
    this.publishedDate = new Date();
  }

  if (this.isModified('state') && this.state === 'closed' && !this.publishedDate) {
    this.publishedDate = new Date();
  }


  done();
});

/**
 * Registration
 */
Question.defaultColumns = 'title, author, state';
Question.register();
