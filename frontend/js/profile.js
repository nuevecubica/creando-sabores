$(document).ready(function() {

  // =============================
  // ========== Buttons events
  // =============================

  // ---------- Edit button: Activate mode-editor
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

  // ========== Save buttons
  // ---------- Update button: Save data user form (name, bio, photo)
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

  // ---------- Save button: Save data account form (email, password...)
  $('#save').on('click', function(e) {
    $('#hidden-username').attr('value', $('#user-name').text());
    $('#hidden-email').attr('value', $('#email').text());
    $('#hidden-old-password').attr('value', $('#old-pass').text());
    $('#hidden-new-password').attr('value', $('#new-pass').text());
    $('#hidden-isPrivate').attr('value', $('#private input').val());

    $('#profile-change-form').submit();
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

  $('#delete-confirm').on('click', function(e) {
    $('#profile-remove-form').submit();
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
