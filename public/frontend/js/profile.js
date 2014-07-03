
$(document).ready(function() {
	$('.set-editable').on('focus').toggleClass('focus');

	$('#edit.button-manage').on('click', function() {
		$('body').toggleClass('mode-editable');
		$('.set-editable').attr('contenteditable', true);
		console.log('------')
	})
});