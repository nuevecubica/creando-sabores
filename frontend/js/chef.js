/* global makePaginable */
$(window).load(function() {

  var profile = window.location.pathname.split('/')[2];
  makePaginable('/api/v1/user/' + profile + '/recipes', 'recipes', 'recipe', '#recipes .list');

});
