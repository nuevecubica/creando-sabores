var cleaners = {
  plaintext: function(str) {
    return str.replace(/[ \t]+/g, " "); //.replace(/(<([^>]+)>)/ig, "");
  },

  escape: function(str) {
    return str.replace(/[&]/, "&amp;").replace(/[<]/g, "&lt;").replace(/[>]/g, "&gt;");
  },

  oneline: function(str) {
    return str.replace(/[\n\r]/ig, '');
  },

  textarea: function(str) {
    return str.replace(/[\r]+/g, "\n").replace(/[\n]+/g, "\n");
  },

  paragraphs: function(str) {
    return "<p>" + str.split("\n").join("</p><p>") + "</p>";
  },

  maxlength: function(str, len) {
    return str.substr(0, len);
  },

  maxlinelength: function(str, len) {
    var ps = str.split("\n");
    ps.map(function(elem, index) {
      ps[index] = elem.substr(0, len);
    });
    return ps.join("\n");
  },

  maxlines: function(str, len) {
    return str.split("\n").slice(0, len).join("\n");
  },

  username: function(str) {
    return str.replace(/([^a-z0-9_\-])/gi, '');
  },

  integer: function(str) {
    var num = parseInt(str);
    return (isNaN(num) ? "0" : num.toString());
  },

  min: function(str, min) {
    var num = parseInt(str);
    if (num < min) {
      return min.toString();
    }
    return str;
  },

  max: function(str, max) {
    var num = parseInt(str);
    if (num > max) {
      return max.toString();
    }
    return str;
  },

  ucfirst: function(str, force) {
    return str.capitalize(force);
  },

  lowercase: function(str) {
    return str.toLowerCase();
  },

  uppercase: function(str) {
    return str.toUpperCase();
  }
};

module.exports = exports = function(str, tasks) {
  if ("string" !== typeof str) {
    return null;
  }

  var strClean = String(str);
  for (var i = 0, l = tasks.length; i < l; i++) {
    var task = tasks[i],
      opts = [strClean];

    // Get options
    if ('object' === typeof task) {
      opts = opts.concat(task.slice(1));
      task = task[0];
    }

    // Call clean task
    if (cleaners.hasOwnProperty(task)) {
      strClean = cleaners[task].apply(null, opts);
    }
  }
  return strClean;
};
