$(window).load(function() {
  $('.ui.checkbox').checkbox();

  $('#show-password').change(function(event){
		if ($(this).is(':checked')) {
			$('#signup-password').attr('type', 'text');
		} else {
			$('#signup-password').attr('type', 'password');
		}
	});
});