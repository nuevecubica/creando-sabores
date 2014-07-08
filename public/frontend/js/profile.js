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
    var $name = $('#profile-name');
    var $about = $('#profile-about');
    if (!$name.data('origvalue')) {
      $name.data('origvalue', $name.html());
    }
    if (!$about.data('origvalue')) {
      $about.data('origvalue', $about.html());
    }
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
          name: 'name',
          value: $('#profile-name').text()
        })
      )
      .append($($.parseHTML('<input type="hidden">'))
        .attr({
          name: 'about',
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
    var $name = $('#profile-name');
    var $about = $('#profile-about');
    var $header = $('#profile-header-select');
    var $img = $('#profile-img-select');
    $name.html($name.data('origvalue'));
    $about.html($about.data('origvalue'));
    clearFile($header.get(0));
    $header.trigger('change');
    clearFile($img.get(0));
    $img.trigger('change');
  });

  $('#profile-header-select').on('change', function(e) {
    setPreview(e.target, $('#profile-header'));
  });

  $('#profile-img-select').on('change', function(e) {
    setPreview(e.target, $('#profile-img'));
  });

  $('#delete-first').on('click', function() {
    $('#delete-confirm').toggleClass('visible');
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

  var clearFile = function(input) {
    try {
      input.value = null;
    }
    catch (ex) {}
    if (input.value) {
      input.parentNode.replaceChild(input.cloneNode(true), input);
    }
  };

});
