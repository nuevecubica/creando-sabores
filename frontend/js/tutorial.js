window.chef.tutorial = (function(tutorial) {

  var criteria = {

    fileSelected: function(element, callback) {
      // Completes when the user clicks the <input> file field
      $(element).on('change', callback);
    },

    editableTypedText: function(element, callback) {
      // Completes when either:
      // - the user types something
      // - the control loses focus with text on it
      var $element = $(element);
      var evtHandler = function() {
        if ($element.text().length) {
          callback();
        }
      };
      $element
        .on('focusout', evtHandler)
        .on('keyup', evtHandler);
    },

    editableSelectUsed: function(element, callback) {
      // Completes when a select is clicked, and a value (or none) is choosed
      var $element = $(element);
      $('.options', $element).on('click', callback);
      $element.on('focusout', callback); // Could do better than this...
    }

  };

  return _.extend(tutorial, {
    completionCriteria: _.extend(tutorial.criteria || {}, criteria)
  });
})(window.chef.tutorial || {});


$(document).ready(function() {

  var field = 'data-tutorial-message';
  $('[' + field + ']').each(function(i, step) {
    // Create the bubble
    var $step = $(step);
    var $bubble = $('<div class="tutorial-bubble">');
    var $close = $('<i class="icon-chef-cross">');
    $close.on('click', function() {
      $bubble.css('display', 'none');
    });
    $bubble.append($close);
    $bubble.append('<span>' + $step.data('tutorial-message'));
    $step.prepend($bubble);

    // Create completion callbacks
    var newCriteria = function() {
      var met = false;
      return function() {
        if (met) {
          return; // Ignore duplicated completions
        }
        met = true;
        var curr = $step.data('tutorial-pending') - 1;
        console.log('Criteria completed for step. Only', curr, 'to go!');
        $step.data('tutorial-pending', curr);
        if (!curr) {
          $bubble.css('display', 'none');
        }
      };
    };

    // Find out the completion criteria(s)
    var $reqs = $('[data-tutorial-complete]', $step);
    $step.data('tutorial-pending', $reqs.length);
    $reqs.each(function(i, req) {
      var callback = newCriteria();
      var criteria = $(req).data('tutorial-complete');
      if (!window.chef.tutorial.completionCriteria[criteria]) {
        console.log('Tutorial: Unknown completion criteria:', criteria);
        callback();
      }
      else {
        window.chef.tutorial.completionCriteria[criteria](req, callback);
      }
    });
  });

});
