$(window).load(function() {
	$('.ui.checkbox').checkbox();

	$('#show-password').change(function(event){
	if ($(this).is(':checked')) {
		$('#signup-password').attr('type', 'text');
	} else {
		$('#signup-password').attr('type', 'password');
	}
	});

	$('#signup form').submit(function(e) {

		console.log('submit');

		var name = checkUsername($('#signup-name').val());
		var email = checkEmail($('#signup-email').val());
		var password = checkPassword($('#signup-password').val());

		if(!name || !email || !password) {
			if(!name) { $('#name').addClass('error-here').transition('bounce'); }
			if(!email) { $('#email').addClass('error-here').transition('bounce'); }
			if(!password) { $('#password').addClass('error-here').transition('bounce'); }

			e.preventDefault();
		}
	});

	$('#login form').submit(function(e) {

		var email = checkEmail($('#login-email').val());
		var password = checkPassword($('#login-password').val());

		if(!email || !password) {
			if(!email) { $('#email').addClass('error-here').transition('bounce'); }
			if(!password) { $('#password').addClass('error-here').transition('bounce'); }

			e.preventDefault();
		}
	});

	var checkUsername = function(username) {
		var re = /^[A-Za-z0-9_]{6,20}$/;
    	return re.test(username);
	}

	var checkEmail = function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	}

	var checkPassword = function(password) {
		var re = /^[A-Za-z0-9!@#$%^&*()_]{8,20}$/;
    	return re.test(password);
	}
});