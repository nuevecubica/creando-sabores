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

  var likeClick = function() {
    var $this = $(this);
    var $rating = $this.closest('.rating');
    var slug = $rating.data('slug');
    var action = $rating.hasClass('liked') ? 'unlike' : 'like';
    if ($rating.data('lock')) {
      return;
    }
    $rating.data('lock', true);
    var url = '/api/v1/recipe/' + slug + '/' + action;
    var jQXhr = $.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json',
      success: function(data) {
        if (!data.success) {
          var msg = 'Something went wrong!';
          if (data.details) {
            msg += ' Reason: ' + data.details;
          }
          console.log(msg);
          $rating.data('lock', null);
          return;
        }
        var $counter = $rating.find('.like-counter');
        $counter.html(data.likes);
        $rating.toggleClass('liked', action === 'like');
        $rating.data('lock', null);
      }
    });
  };

  $('.like-button').click(likeClick);
  $(document).bind('ajaxSuccess', function() {
    $('.like-button').click(likeClick);
  });
});
