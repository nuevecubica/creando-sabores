$(window).load(function() {
	$('body').removeClass('preload');
	$('.error-here').transition('bounce');
});

$(document).ready(function() {
	$('.demo.menu .item').tab();
	$('#menu').on('click', function(){
		$('#menu-box').addClass('open').removeClass('close');
	});
	$('#menu-close').on('click', function(){
		$('#menu-box').removeClass('open').addClass('close');
	});
});
