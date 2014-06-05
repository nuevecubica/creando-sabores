var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types;

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
		index: true
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

	editDate: { type: Types.Date },

	isBanned: {
		type: Types.Boolean,
		label: 'Ban',
		note: 'This recipe contains something evil'
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

	description: { type: Types.Html, wysiwyg: true, height: 100 },
	time: { type: Types.Number, note: 'In minutes' },
	portions: { type: Types.Number },
	ingredients: { type: Types.Html, wysiwyg: true, height: 50 },
	procedure: { type: Types.Html, wysiwyg: true, height: 200 }
});

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(function() {
	return !this.isBanned;
})

/**
 * Registration
 * ============
 */
Recipe.defaultColumns = 'title, author, isBanned';
Recipe.register();