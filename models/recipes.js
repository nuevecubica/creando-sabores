var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Recipe
 * =====
 */

var Recipe = new keystone.List('Recipe');