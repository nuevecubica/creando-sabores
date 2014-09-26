/* global makePaginable */
$(window).load(function() {

  var section = window.location.pathname.split('/')[1];
  var type = section === 'videorecetas' ? 'videorecipes' : 'recipes';

  makePaginable('/api/v1/' + type, 'recipes', 'recipe', '#recipes .list');

});
