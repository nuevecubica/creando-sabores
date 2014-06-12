$(window).load(function() {
	$('body').removeClass('preload');
	$('.error-here:visible').transition('bounce');
});

$(document).ready(function() {
	$('.demo.menu .item').tab();
	$('#menu').on('click', function(){
		$('#menu-box').addClass('open').removeClass('close');
	});
	$('#menu-close').on('click', function(){
		$('#menu-box').removeClass('open').addClass('close');
	});
	$('.messages-close').on('click', function(){
		$('#messages').transition('fade down');
	});
});
