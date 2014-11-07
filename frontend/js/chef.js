$(window).load(function() {


  // ========== Subsections
  var parts = window.location.pathname.split('/');
  var profile = parts[2];
  var section = parts[3];

  /* global makePaginable */
  if (section === 'recetas' || !section) {
    makePaginable('/api/v1/user/' + profile + '/recipes', 'recipes', 'recipe', '#recipes .list');
  }
  else if (section === 'favoritas') {
    makePaginable('/api/v1/user/' + profile + '/favourites', 'recipes', 'recipe', '#recipes .list');
  }
  else if (section === 'tips') {
    makePaginable('/api/v1/user/' + profile + '/tips', 'tips', 'tip', '#tips .list');
  }
  else if (section === 'menus') {
    makePaginable('/api/v1/user/' + profile + '/menus', 'menus', 'menu', '#menus .list');
  }

});
