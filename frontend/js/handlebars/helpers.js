/* global Handlebars */

Handlebars.registerHelper('formatTime', function(time) {
  return (time < 60) ? time + ' min' : (time / 60).toFixed(2) + ' h';
});

Handlebars.registerHelper('formatOfficial', function(isOfficial) {
  if (isOfficial) {
    return new Handlebars.SafeString('<div class="official"><img src="/images/ribbon.png"></div>');
  }
});

Handlebars.registerHelper('formatIcons', function(number, icon) {
  var ret = '';

  number = Math.floor(number) || 0;

  for (var i = 0; i < 5; i++) {
    if (number === 0) {
      ret = ret + '<i class="icon-chef-' + icon + ' icon off"></i>';
    }
    else {
      ret = ret + '<i class="icon-chef-' + icon + ' icon on"></i>';
      number = number - 1;
    }
  }

  return new Handlebars.SafeString(ret);
});

/*
Handlebars "join" block helper that supports arrays of objects or strings.
If "delimiter" is not speficified, then it defaults to " ".  You can use "start",
and "end" to do a "slice" of the array.
*/
Handlebars.registerHelper('join', function(items, block) {
  var delimiter = block.hash.delimiter || " ",
    start = block.hash.start || 0,
    len = items ? items.length : 0,
    end = block.hash.end || len,
    out = "";

  if (end > len) {
    end = len;
  }

  if ('function' === typeof block) {
    for (var i = start; i < end; i++) {
      if (i > start) {
        out += delimiter;
      }
      if ('string' === typeof items[i]) {
        out += items[i];
      }
      else {
        out += block(items[i]);
      }
    }
    return out;
  }
  else {
    return [].concat(items).slice(start, end).join(delimiter);
  }
});
