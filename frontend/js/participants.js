/* global makePaginable */
$(document).ready(function() {

  var contest = window.location.pathname.split('/')[2];
  var order = window.location.pathname.split('/')[4];
  if (order === 'reciente') {
    order = 'recent';
  }
  makePaginable('/api/v1/contest/' + contest + '/recipes', 'contest-recipe', '#recipes .list', {
    'order': order
  });

});
