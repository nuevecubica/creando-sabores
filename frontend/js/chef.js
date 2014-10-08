$(window).load(function() {


  // ========== Subsections
  var parts = window.location.pathname.split('/');
  var profile = parts[2];
  var section = parts[3];

  /* global makePaginable */
  if (section === 'recetas') {
    makePaginable('/api/v1/user/' + profile + '/recipes', 'recipes', 'recipe', '#recipes .list');
  }
  else if (section === 'favoritas') {
    makePaginable('/api/v1/user/' + profile + '/favourites', 'recipes', 'recipe', '#recipes .list');
  }

});
