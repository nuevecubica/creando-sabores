/* global makePaginable, likeClick */
$(document).ready(function() {

  var contest = window.location.pathname.split('/')[2];
  var order = window.location.pathname.split('/')[4];
  if (order === 'reciente') {
    order = 'recent';
  }
  makePaginable('/api/v1/contest/' + contest + '/recipes', 'recipes', 'contest-recipe', '#recipes .list', {
    'order': order
  });

  $('.like-button').click(likeClick);
  $(document).bind('ajaxSuccess', function() {
    $('.like-button').click(likeClick);
  });
});
