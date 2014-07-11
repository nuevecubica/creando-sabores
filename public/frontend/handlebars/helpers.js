Handlebars.registerHelper('formatTime', function(time) {
	return (time < 60) ? time + ' min' : (time / 60).toFixed(2) + ' h';
});

Handlebars.registerHelper("formatOfficial", function(official) {
	var ret = '';

	if(official) {
		ret = '<div class="official"><img src="/frontend/images/ribbon.png"></div>';
	}

	return ret;
});

Handlebars.registerHelper('addIcons', function(number) {
	var ret = '';

	var number = Math.floor(number) || 0;

	for(var i = 0; i < 5; i++) {
		if (number === 0) {
			ret = ret + '<i class="icon-chef-tenedor icon off"></i>';
		} else {
			ret = ret + '<i class="icon-chef-tenedor icon on"></i>';
			number = number - 1;
		}
	}

	return ret;
});