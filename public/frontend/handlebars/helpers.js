/* global Handlebars */

Handlebars.registerHelper('formatTime', function(time) {
	return (time < 60) ? time + ' min' : (time / 60).toFixed(2) + ' h';
});

Handlebars.registerHelper('formatOfficial', function(isOfficial) {
	if(isOfficial) {
		return new Handlebars.SafeString('<div class="official"><img src="/frontend/images/ribbon.png"></div>');
	}
});

Handlebars.registerHelper('formatIcons', function(number, icon) {
	var ret = '';

	var number = Math.floor(number) || 0;

	for(var i = 0; i < 5; i++) {
		if (number === 0) {
			ret = ret + '<i class="icon-chef-' + icon + ' icon off"></i>';
		} else {
			ret = ret + '<i class="icon-chef-' + icon + ' icon on"></i>';
			number = number - 1;
		}
	}

	return new Handlebars.SafeString(ret);
});