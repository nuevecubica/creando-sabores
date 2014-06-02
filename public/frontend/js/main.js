$(document).ready(function() {
	$('.demo.menu .item').tab();
	$('#menu').on('click', function(){
		$('#menu-box').toggleClass('open');
	});
	$('#menu').on('mousein', function(){
		$('#menu-box').addClass('open');
	});
});
