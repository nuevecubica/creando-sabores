

// Function to generate an username.
// First character of name, last name and random number between 0 and 4 last digits of user id.
exports.createUsername = function(name, lastname, id) {
	var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
	to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
	mapping = {};

	for(var i = 0, j = from.length; i < j; i++ ) {
		mapping[ from.charAt( i ) ] = to.charAt( i );
	}

	var str = name[0] + lastname + Math.floor((Math.random() * parseInt(id.substr(id.length - 4, id.length))) + 1);

	var ret = [];
	for(var x = 0, y = str.length; x < y; x++) {
		var c = str.charAt(x);
		if(mapping.hasOwnProperty( str.charAt(x))) {
			ret.push(mapping[c]);
		 } else {
			ret.push(c);
		}
	}

	return ret.join('').toLowerCase();
};