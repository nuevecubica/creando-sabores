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

  // ========== Save events
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
    $('#hidden-username').attr('value', $('#user-name input').val());
    $('#hidden-email').attr('value', $('#email input').val());
    $('#hidden-old-password').attr('value', $('#old-pass').val());
    $('#hidden-new-password').attr('value', $('#new-pass').val());
    $('#hidden-isPrivate').attr('value', $('#private input').is(':checked'));

    $('#profile-change-form').submit();
  });

  // ---------- Cancel button: Restore profile fields (name, bio, photos)
  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    var $name = $('#profile-name');
    var $about = $('#profile-about');
    var $header = $('#profile-header-select');
    var $img = $('#profile-img-select');
    $name.html($name.data('origvalue'));
    $about.html($about.data('origvalue'));
    clearImages($header.get(0));
    $header.trigger('change');
    clearImages($img.get(0));
    $img.trigger('change');
  });

  // ---------- Change header image: Save data account form (email, password...)
  $('#profile-header-select').on('change', function(e) {
    setImagesPreview(e.target, $('#profile-header'));
  });

  // ---------- Change profile image: Save data account form (email, password...)
  $('#profile-img-select').on('change', function(e) {
    setImagesPreview(e.target, $('#profile-img'));
  });

  // ---------- Header and profile images preview
  var setImagesPreview = function(input, $target) {
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

  var clearImages = function(input) {
    try {
      input.value = null;
    }
    catch (ex) {}
    if (input.value) {
      input.parentNode.replaceChild(input.cloneNode(true), input);
    }
  };

  // ---------- Show div change password
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

  // ========== Delete events
  //---------- Show popup delete account
  $('#delete-first').on('click', function(e) {
    $('#delete-confirm').toggleClass('visible');
    e.preventDefault();
  });

  //---------- Delete account
  $('#delete-confirm').on('click', function(e) {
    $('#profile-remove-form').submit();
  });


});
