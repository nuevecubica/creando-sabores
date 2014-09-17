/* global makePaginable */
$(document).ready(function() {

  var contest = window.location.pathname.split('/')[2];
  var order = window.location.pathname.split('/')[4];
  if (order === 'reciente') {
    order = 'recent';
  }
  makePaginable('/api/v1/contest/' + contest + '/recipes', 'recipes', 'contest-recipe', '#recipes .list', {
    'order': order
  });

  $('.like-button').click(function() {
    var $this = $(this);
    var slug = $this.closest('.column').find('a').first().prop('href').split('/')[4];
    var action = $this.data('action') ? $this.data('action') : 'like';
    if (action !== 'like' && action !== 'unlike') {
      return;
    }
    var url = '/api/v1/recipe/' + slug + '/' + action;
    $this.data('action', 'none');
    console.log(action);
    var jQXhr = $.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json',
      success: function(data) {
        var $counter = $this.siblings('.like-counter');
        $counter.html(data.likes);
        $this.data('action', action === 'like' ? 'unlike' : 'like');
      }
    });
  });

});
