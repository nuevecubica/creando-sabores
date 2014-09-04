/* global makePaginable */
$(window).load(function() {

  makePaginable('/api/v1/recipes', 'recipe', '#recipes .list');

});
