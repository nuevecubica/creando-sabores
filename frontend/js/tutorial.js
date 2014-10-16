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

  var startTutorial = function() {
    $('.tutorial-bubble').each(function(i, bubble) {
      var $bubble = $(bubble);
      var $step = $bubble.parent();
      $bubble.removeClass('hidden');
      $step.data('tutorial-done', []);
    });
  };

  return _.extend(tutorial, {
    completionCriteria: _.extend(tutorial.criteria || {}, criteria),
    start: startTutorial
  });
})(window.chef.tutorial || {});


$(document).ready(function() {
  // Create the bubbles
  $('[data-tutorial-message]').each(function(i, step) {
    var $step = $(step);
    var $bubble = $('<div class="tutorial-bubble hidden">');
    var $close = $('<i class="icon-chef-cross">');
    $close.on('click', function() {
      $bubble.css('display', 'none');
    });
    $bubble.append($close);
    $bubble.append('<span>' + $step.data('tutorial-message'));
    $step.prepend($bubble);

    // Create completion callbacks
    var newCriteria = function(i, total) {
      return function() {
        var done = $step.data('tutorial-done');
        if (done.indexOf(i) !== -1) {
          return; // Ignore duplicated completions
        }
        done.push(i);
        $step.data('tutorial-done', done);
        if (done.length === total) {
          $bubble.addClass('hidden');
        }
      };
    };

    // Find out the completion criteria(s)
    var $reqs = $('[data-tutorial-complete]', $step);
    $step.data('tutorial-done', []);
    $reqs.each(function(i, req) {
      var callback = newCriteria(i, $reqs.length);
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
