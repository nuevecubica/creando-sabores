$(document).ready(function() {
	$('.demo.menu .item').tab();
	$('#menu').on('click', function(){
		$('#menu-box').toggleClass('open');
	});
	$('#menu-close').on('click', function(){
		$('#menu-box').removeClass('open');
	});
});
