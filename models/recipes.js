var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types,
	async = require('async');

/**
 * Recipe
 * ======
 */

var Recipe = new keystone.List('Recipe', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Recipe.add({
	title: {
		type: Types.Text,
		initial: true,
		required: true,
		index: true
	},

	author: {
		type: Types.Relationship,
		ref: 'User',
		required: true,
		initial: true,
		index: true
	},

	official: {
		type: Types.Boolean,
		hidden: true
	},

	rating: {
		type: Types.Number,
		noedit: true,
		watch: true,
		value: function() {
			var average = 0;

			if(this.review.length <= 0) { return 0.00; }

			for(var rev = 0; rev < this.review.length; rev++) {
				average += this.review[rev].rating;
			}

			return (average / this.review.length).toFixed(2);
		}
	},

	schemaVersion: {
		type: Types.Number,
		noedit: true,
		default: process.env.RECIPES_SCHEMA_VERSION
	}
},

'Media',
{
	header: { type: Types.CloudinaryImage }
},

'Status',
{
	state: {
		type: Types.Select,
		numeric: true,
		options: [
			{ value: 0, label: 'draft' },
			{ value: 1, label: 'published' }
		],
		default: 0
	},

	publishedDate: {
		type: Types.Date,
		dependsOn: {
			state: 1
		}
	},

	editDate: {
		type: Types.Date,
		dependsOn: {
			state: 1
		}
	},

	isBanned: {
		type: Types.Boolean,
		label: 'Ban',
		note: 'This recipe contains something evil',
		dependsOn: {
			state: 1
		},
		default: false
	}
},

'Procedure',
{
	difficulty: {
		type: Types.Select,
		numeric: true,
		options: [
			{ value: 1, label: 'Muy Bajo' },
			{ value: 2, label: 'Bajo' },
			{ value: 3, label: 'Medio' },
			{ value: 4, label: 'Alto' },
			{ value: 5, label: 'Muy Alto' }
		],
		default: 0
	},

	time: {
		type: Types.Number,
		note: 'In minutes',
		required: true,
		initial: false,
		default: 0
	},

	portions: {
		type: Types.Number,
		required: true,
		initial: false,
		default: 0
	},

	description: { type: Types.Html, wysiwyg: true, height: 100 },
	ingredients: { type: Types.Html, wysiwyg: true, height: 50 },
	procedure: { type: Types.Html, wysiwyg: true, height: 200 }
});

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(function() {
	return !this.isBanned;
});

// Check if time and portions values
Recipe.schema.path('time').set(function(value) {
	return (value < 0) ? value * (-1) : value;
});

Recipe.schema.path('portions').set(function(value){
	return (value < 0) ? value * (-1) : value;
});

// Check params before save
Recipe.schema.pre('save', function(next) {

	var me = this;

	async.parallel({
		// Check if user isChef, for official recipe.
		official: function(callback) {
			keystone.list('User').model.findById(me.author).exec(function(err, user) {
				callback(null, (user.isChef) ? user.isChef : false);
			});
		}

		// Adds some check and test here
	},
	function(err, results) {
		me.official = results.official;
		next();
	});

});

// Schema for ranking
var Rating = new keystone.mongoose.Schema({
	user: String,
	rating: Number
});

Recipe.schema.add({
	review: [ Rating ]
});

/**
 * Registration
 * ============
 */
Recipe.defaultColumns = 'title, author, publishedDate, official, isBanned';
Recipe.register();