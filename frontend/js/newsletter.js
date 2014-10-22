$(document).ready(function() {

  $(document).on('click', 'a#unsubscribe', function() {
    // console.log(this);
    var url = $(this).attr('data-url');

    console.log('DATA URL', url);

    var jQXhr = $.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json',
      success: function(data) {

        $('#newsletter-subscribe').show('slow');

        if (data.success) {
          $('a#unsubscribe').hide('slow');
        }
        else {
          $('#newsletter-subscribe .explain').html(data.errorMessage);
        }
      }
    });
  });
});
