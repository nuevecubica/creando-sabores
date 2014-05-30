$(document).ready(function() {
	$('.demo.menu .item').tab();
	$('#menu').on('click', function(){
		$('#menu-box').toggle();
	});
	$('#menu').on('mousein', function(){
		$('#menu-box').toggle(true);
	});
});
