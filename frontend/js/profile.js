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
      if ($(this).data('length') && $(this).text().length >= $(this).data('length')) {
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
    $('#hidden-name').attr('value', $('#profile-name').text());
    $('#hidden-about').attr('value', about);
    $('#profile-form').submit();

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

  $('.password .button').on('click', function(e) {
    var $passrow = $('#pass-row');
    if ($passrow.data('toggle')) {
      $passrow
        .slideUp()
        .data('toggle', false);
    }
    else {
      $passrow
        .slideDown()
        .data('toggle', true);
    }
    e.preventDefault();
  });

  $('#delete-first').on('click', function(e) {
    $('#delete-confirm').toggleClass('visible');
    e.preventDefault();
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
