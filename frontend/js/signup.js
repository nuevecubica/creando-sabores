$(window).on('load', function() {
  var chef = window.chef;

  $('.ui.checkbox').checkbox();

  $('#show-password').change(function(event) {
    if ($(this).is(':checked')) {
      $('#signup-password').attr('type', 'text');
    }
    else {
      $('#signup-password').attr('type', 'password');
    }
  });

  $('#signup form').submit(function(e) {

    console.log('submit');

    var name = checkUsername($('#signup-name').val());
    var email = checkEmail($('#signup-email').val());
    var password = checkPassword($('#signup-password').val());
    var terms = $('#signup-terms').is(':checked');

    console.log(terms);

    // if(!name || !email || !password) {
    if (!email || !password) {
      if (!name) {
        $('#name').children('.error-message').text(chef.errorMessage('Username format')).end().addClass('error-here').transition('bounce');
      }
      else {
        $('#name').removeClass('error-here');
      }

      if (!email) {
        $('#email').children('.error-message').text(chef.errorMessage('Email format')).end().addClass('error-here').transition('bounce');
      }
      else {
        $('#email').removeClass('error-here');
      }

      if (!password) {
        $('#password').children('.error-message').text(chef.errorMessage('Password format')).end().addClass('error-here').transition('bounce');
      }
      else {
        $('#password').removeClass('error-here');
      }

      //if(!terms) { $('#terms').addClass('error-here').transition('bounce'); } else { $('#terms').removeClass('error-here'); };

      e.preventDefault();
    }
  });

  $('#login form').submit(function(e) {

    var email = checkEmail($('#login-email').val());
    var password = checkPassword($('#login-password').val());

    if (!email || !password) {
      if (!email) {
        $('#email').children('.error-message').text(chef.errorMessage('Email format')).end().addClass('error-here').transition('bounce');
      }
      else {
        $('#email').removeClass('error-here');
      }

      if (!password) {
        $('#password').children('.error-message').text(chef.errorMessage('Password format')).end().addClass('error-here').transition('bounce');
      }
      else {
        $('#password').removeClass('error-here');
      }

      e.preventDefault();
    }
  });

  var checkUsername = function(username) {
    var re = /^[A-Za-z0-9_]{6,20}$/;
    return re.test(username);
  };

  var checkEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  var checkPassword = function(password) {
    var re = /^[A-Za-z0-9!@#$%^&*()_]{8,20}$/;
    return re.test(password);
  };
});
