var cleaners = {
  plaintext: function(str) {
    return str.replace(/[ \t]+/g, " ").replace(/(<([^>]+)>)/ig, "");
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
  }
};

module.exports = exports = function(str, tasks) {
  if ("string" !== typeof str) {
    return false;
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
