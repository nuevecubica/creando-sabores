var validators = {
  plaintext: function(str) {
    return !(/(<([^>]+)>)/ig.test(str));
  },

  oneline: function(str) {
    return !(/[\n\r]/ig.test(str));
  },

  maxlength: function(str, len) {
    return (str.length > len);
  },

  minlength: function(str, len) {
    return (str.length < len);
  },

  username: function(str) {
    return !(/(^[a-z0-9_\-])/gi.test(str));
  },

  email: function(str) {
    return (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i.test(str));
  }
};

module.exports = exports = function(str, tasks) {
  if ("string" !== typeof str) {
    return false;
  }

  for (var i = 0, l = tasks.length; i < l; i++) {
    var task = tasks[i],
      opts = [str];

    // Get options
    if ('object' === typeof task) {
      opts = opts.concat(task.slice(1));
      task = task[0];
    }

    // Call validation tasks
    if (validators.hasOwnProperty(task)) {
      if (!validators[task].apply(null, opts)) {
        return false;
      }
    }
  }
  return true;
};
