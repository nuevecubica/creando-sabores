$(document).ready(function() {

  $('#edit.button-manage').on('click', function() {
    // First coppy original value in data attribute for each false form component
    var $title = $('#recipe-title');
    var $difficulty = $('#recipe-difficulty .itemSelected');
    var $time = $('#recipe-time .set-editable');
    var $portions = $('#recipe-portions .set-editable');
    var $description = $('#recipe-description .set-editable');
    var $ingredients = $('#recipe-ingredients .set-editable');
    var $procedure = $('#recipe-procedure .set-editable');

    // Save original values for restore if user cancel edit
    if (!$title.data('origvalue')) {
      $title.data('origvalue', $title.text());
    }

    if (!$difficulty.data('origvalue')) {
      $difficulty.data('origvalue', $difficulty.html());
    }

    if (!$time.data('origvalue')) {
      $time.data('origvalue', $time.text());
    }

    if (!$portions.data('origvalue')) {
      $portions.data('origvalue', $portions.text());
    }

    if (!$description.data('origvalue')) {
      $description.data('origvalue', $description.text());
    }

    if (!$ingredients.data('origvalue')) {
      $ingredients.data('origvalue', $ingredients.text());
    }

    if (!$procedure.data('origvalue')) {
      $procedure.data('origvalue', $procedure.text());
    }

    // Change to editable mode
    $('body').addClass('mode-editable');
    $('.set-editable:not(.dropdown)').attr('contenteditable', true);

    $title.focus();
  });

  $('#update.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    // Can't do .text() directly to preserve newlines
    var description = $('#recipe-description .set-editable').contents().map(function() {
      return $(this).text();
    }).get().join('\n');

    $('#hidden-title').attr('value', $('#recipe-title.set-editable').text());
    $('#hidden-difficulty').attr('value', $('#recipe-difficulty .itemSelected .item').attr('data-value'));
    $('#hidden-time').attr('value', $('#recipe-time .set-editable').text());
    $('#hidden-portions').attr('value', $('#recipe-portions .set-editable').text());
    $('#hidden-description').attr('value', description);
    // Commented waiting for ingredients and procedure task
    // $('#hidden-ingredients').attr('value', ingredients);
    // $('#hidden-procedure').attr('value', procedure);
    $('#recipe-edit-form').submit();
  });

  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    var $title = $('#recipe-title');
    var $difficulty = $('#recipe-difficulty .itemSelected');
    var $time = $('#recipe-time .set-editable');
    var $portions = $('#recipe-portions .set-editable');
    var $description = $('#recipe-description .set-editable');
    var $ingredients = $('#recipe-ingredients .set-editable');
    var $procedure = $('#recipe-procedure .set-editable');

    $title.text($title.data('origvalue'));
    $difficulty.html($difficulty.data('origvalue'));
    $time.text($time.data('origvalue'));
    $portions.text($portions.data('origvalue'));
    $description.text($description.data('origvalue'));
    $ingredients.text($ingredients.data('origvalue'));
    $procedure.text($procedure.data('origvalue'));

  });

  $('#delete.button-manage').on('click', function() {
    $('#recipe-remove-form').submit();
  });

  $('.time .set-editable').on('keyup', function(e) {
    if ($(this).html() > 120) {
      $(this).html('120');
      e.preventDefault();
    }
  });

  $('.portions .set-editable').on('keyup', function(e) {
    if ($(this).html() > 24) {
      $(this).html(24);
      e.preventDefault();
    }
  });

  $('.favourite .button').on('click', function() {
    $(this).toggleClass('activated');
  });

  $('.checks.all').on('click', function() {
    console.log('click');
    $('#ingredients .checks').toggleClass('activated');
    $(this).toggleClass('activated');
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
