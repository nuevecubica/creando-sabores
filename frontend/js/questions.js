$(document).ready(function() {

  /* global makePaginable, getTemplate, showAuthModal */
  makePaginable('/api/v1/questions', 'questions', 'question', '#questions .list');

  $('#send-button').on('click', function(e) {
    e.preventDefault();
    if (!window.chef.isUserLoggedIn) {
      showAuthModal();
      return;
    }
    var url = '/api/v1/question/add',
      args = {
        title: $('#send-query input').val()
      };
    var jQXhr = $.post(url, args, function(data) {
      if (data.success !== true) {
        console.log('No se pudo enviar la pregunta:', data);
      }
      else {
        getTemplate('question', data.question, function(tpl, item) {
          var html = tpl(item);
          console.log('html:', html);
          $(html).css('display', 'none').prependTo($('#questions .list')).slideDown('slow');
          $('#send-query input').val('');
        });
      }
    }, 'json');
  });

  var addAdminActionListener = function(e) {
    e.preventDefault();
    var $this = $(this),
      $entry = $this.closest('.query'),
      newState;

    if ($this.hasClass('delete-qa')) {
      newState = 'removed';
    }
    else {
      var original = $entry.data('state');
      if (original !== 'removed') {
        newState = $entry.data('state');
      }
      else {
        newState = 'review';
      }
    }

    var url = '/api/v1/question/' + $entry.data('slug') + '/' + newState;

    var jQXhr = $.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json',
      success: function(data) {
        if (data.success !== true) {
          console.log('Error cambiando estado:', data);
        }
        else {
          $entry.removeClass('state-removed state-review');
          $entry.addClass('state-' + newState);
        }
      },
      error: function(xhr, status, data) {
        console.log('Error cambiando estado:', status, data);
      }
    });
  };

  $(document).on('click', '.delete-qa, .undelete-qa', addAdminActionListener);

});
