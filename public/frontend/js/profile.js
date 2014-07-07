$(document).ready(function() {
  $('.set-editable').on('focus', function() {
    console.log('FOCUS');
    $(this).toggleClass('focus');
  }).on('focusout', function() {
    $(this).toggleClass('focus');
  }).on('keydown', function(e) {

    // If not return or arrow keys
    if (e.which !== 8 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
      // Limit name text size
      if ($(this).data('length') && $(this).text().length > $(this).data('length')) {
        e.preventDefault();
      }
    }
  }).on('paste', function(e) {
    e.preventDefault();
  }).on('drop', function(e) {
    e.preventDefault();
  });

  $('.set-editable.one-line').on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
    }
  }).on('paste', function(e) {
    e.preventDefault();
  });

  $('#edit.button-manage').on('click', function() {
    $('body').addClass('mode-editable');
    $('.set-editable').attr('contenteditable', true);
  });

  $('#update.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    // Can't do .text() directly to preserve newlines
    var about = $('#profile-about').contents().map(function() {
      return $(this).text();
    }).get().join('\n');

    // FormData not available in IE9, so we have to post a form
    var $form = $($.parseHTML('<form></form>'))
      .hide()
      .attr({
        action: '/perfil/save',
        method: 'POST',
        enctype: 'multipart/form-data'
      })
      .append($($.parseHTML('<input type="hidden">'))
        .attr({
          name: 'user.name',
          value: $('#profile-name').text()
        })
      )
      .append($($.parseHTML('<input type="hidden">'))
        .attr({
          name: 'user.about',
          value: about
        })
      )
      .append($('#profile-img-select'))
      .append($('#profile-header-select'))
      .submit();
  });

  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);
  });

  $('#profile-header-select').on('change', function(e) {
    setPreview(e.target, $('#profile-header'));
  });

  $('#profile-img-select').on('change', function(e) {
    setPreview(e.target, $('#profile-img'));
  });

  var setPreview = function(input, $target) {
    if (input.files.length === 0) {
      if ($target.data('origsrc')) {
        $target.css('background-image', $target.data('origsrc'));
      }
    }
    else {
      if (!$target.data('origsrc')) {
        $target.data('origsrc', $target.css('background-image'));
      }
      var reader = new FileReader();
      reader.onload = function(event) {
        $target.css('background-image', 'url(' + event.target.result + ')');
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

});
