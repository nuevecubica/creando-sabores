$(document).ready(function() {
  $('.set-editable').on('focus', function() {
    console.log('FOCUS');
    $(this).toggleClass('focus');
  }).on('focusout', function() {
    $(this).toggleClass('focus');
  }).on('keydown', function(e) {

    // If not return or arrow keys
    if (e.which != 8 && e.which != 37 && e.which != 38 && e.which != 39 && e.which != 40) {
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
    if (e.which == 13) {
      e.preventDefault();
    }
  }).on('paste', function(e) {
    e.preventDefault();
  });

  $('#edit.button-manage').on('click', function() {
    $('body').addClass('mode-editable');
    $('.set-editable').attr('contenteditable', true);
  })

  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);
  })
  
  $('#profile-header-select').on('change', function(e) {
    var $target = $('#profile-header');
    if (e.target.files.length == 0) {
      if ($target.attr('origsrc')) {
        $target.css('background-image', $target.attr('origsrc'));
      }
    } else {
      if (!$target.attr('origsrc')) {
        $target.attr('origsrc', $target.css('background-image'));
      }
      var reader = new FileReader();
      reader.onload = function(event) {
        $('#profile-header').css('background-image', 'url(' + event.target.result + ')'); 
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  })
  
  $('#profile-img-select').on('change', function(e) {
    var $target = $('#profile-img');
    if (e.target.files.length == 0) {
      if ($target.attr('origsrc')) {
        $target.attr('src', $target.attr('origsrc'));
      }
    } else {
      if (!$target.attr('origsrc')) {
        $target.attr('origsrc', $target.attr('src'));
      }
      var reader = new FileReader();
      reader.onload = function(event) {
        $('#profile-img').attr('src', event.target.result); 
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  })
  
});

