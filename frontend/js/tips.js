/* global ratingClick, makePaginable */

$(document).ready(function() {

  $('.favourite .button').on('click', function(e) {
    if (!window.chef.isUserLoggedIn) {
      window.location.href = '/acceso';
      return;
    }
    var $this = $(this);
    var slug = $this.data('slug');
    var action = $this.hasClass('activated') ? 'remove' : 'add';
    var url = '/api/v1/me/tips/favourites/' + action + '/' + slug;
    var jQXhr = $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      success: function(data) {
        if (!data.success) {
          var msg = 'Something went wrong!';
          console.log(msg);
          return;
        }
        $this.toggleClass('activated', action === 'add');
      }
    });
    e.preventDefault();
  });

  $('.ui.rating').rating();
  $('.rating:not(.disabled) .icon-chef-star').click(function(e) {
    e.preventDefault();
    ratingClick('tip', this);
  });

  makePaginable('/api/v1/tips', 'tips', 'tip', '#tips .list');

});
