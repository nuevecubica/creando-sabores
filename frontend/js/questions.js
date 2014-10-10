$(document).ready(function() {

  /* global makePaginable, getTemplate */
  makePaginable('/api/v1/questions', 'questions', 'question', '#questions .list');

  $('#send-button').on('click', function(e) {
    e.preventDefault();
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

});
