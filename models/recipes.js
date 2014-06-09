var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types,
	async = require('async');

/**
 * Recipe
 * ======
 */

var Recipe = new keystone.List('Recipe');

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
		hide: true
	},

	rating: {
		type: Types.Number,
		noedit: true,
		watch: true,
		value: function() {
			var average = 0;

			if(this.review.length <= 0) return 0.00

			for(var rev = 0; rev < this.review.length; rev++) {
				average += this.review[rev].rating;
			}

			return (average / this.review.length).toFixed(2);
		}
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
			{ value: 1, label: 'Bajo' },
			{ value: 2, label: 'Medio Bajo' },
			{ value: 3, label: 'Medio' },
			{ value: 4, label: 'Medio Alto' },
			{ value: 5, label: 'Alto' }
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
Recipe.schema.path('time').set(changeNatural(value));

Recipe.schema.path('portions').set(changeNatural(value));

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

// Auxiliar functions
var changeNatural = function (value){
	return (value < 0) ? value * (-1) : value;
}

/**
 * Registration
 * ============
 */
Recipe.defaultColumns = 'title, author, publishedDate, rate, isBanned';
Recipe.register();