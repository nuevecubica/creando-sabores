
$(document).ready(function() {
	$('.set-editable').on('focus').addClass('focus');

	$('#edit.button-manage').on('click', function() {
		$('body').toggleClass('mode-editable');
	})
});