$(window).load(function() {
  $('.ui.checkbox').checkbox();

  $('#show_password').change(function(event){
		if ($(this).is(':checked')) {
			$('#signup_password').attr('type', 'text');
		} else {
			$('#signup_password').attr('type', 'password');
		}
	});
});