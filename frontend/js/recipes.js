/* global makePaginable */
$(window).load(function() {

  makePaginable('/api/v1/recipes', 'recipes', 'recipe', '#recipes .list');

});
