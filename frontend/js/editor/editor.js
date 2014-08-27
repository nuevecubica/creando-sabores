window.chef.editor = (function(editor) {
  //---------- GENERIC FUNCTIONS
  var _generic = {};

  //----------- EDITOR MODE
  var editorMode = {
    init: function() {

      // Edited
      var editable = $('.set-editable');

      var checkLength = function(editable, e) {
        if (editable.text().trim().length >= editable.data('length')) {
          e.preventDefault();
        }
      };

      editable.on('focus', function() {
        $(this).addClass('focus');
      }).on('focusout', function() {
        $(this).removeClass('focus');
      });

      $('.set-editable.one-line').on('keypress', function(e) {
        if (e.which === 13) {
          console.warn('.one-line class is deprecated');
          e.preventDefault();
        }
      }).on('paste', function(e) {
        console.warn('.one-line class is deprecated');
        e.preventDefault();
      });

      $('.set-editable[data-length]').on('keypress', function(e) {
        if (e.which !== 8 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
          // Limit name text size
          checkLength($(this), e);
        }
      }).on('paste', function(e) {
        // var paste = e.originalEvent.clipboardData.getData('Text');
      }).on('drop', function(e) {
        e.preventDefault();
      });

      $('.set-editable.no-paste').on('paste', function(e) {
        e.preventDefault();
      }).on('drop', function(e) {
        e.preventDefault();
      });

      $('.set-editable.for-numbers').on('keypress', function(e) {
        console.warn('.for-numbers class is deprecated');
        var charCode = (e.which) ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          e.preventDefault();
        }
      });

      // Placeholder
      var $placeholder = $('.set-editable[placeholder]');

      var clearPlaceHolder = function() {
        if ($(this).text().length === 0) {
          $(this).empty();
        }
      };

      $placeholder.on('keyup', clearPlaceHolder);
      $placeholder.on('click', clearPlaceHolder);
      $placeholder.on('change', clearPlaceHolder);
      $placeholder.bind('input', clearPlaceHolder);
    },

    elementTypes: {},

    // Adds a new constructor to the elements type
    addType: function(type, constructor) {
      this.elementTypes[type] = constructor;
    },

    newElement: function(type) {
      if (!this.elementTypes[type]) {
        console.warn('editor: newElement, Unknown type %s', type);
        type = 'default';
      }
      return this.elementTypes[type].bind(this) || null;
    },

    // generic bind for all the editable content
    bindEditables: function() {
      $(document).on('focus', '[contenteditable]', {}, function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
      }).on('blur paste drop', '[contenteditable]', {}, function(ev) {
        //- BUG right now it moves the cursor to the beginning
        //- of the input if value is changed, so avoid keyup and input
        var $this = $(this);
        /*
          'paste' and 'drop' events are triggered BEFORE the content, so
          we need to defer for the next loop, that's why there's a timeout
          of 0 here
        */
        setTimeout(function() {
          if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
          }
        }, 0);
      });
    }
  };

  return _.defaults(editor, editorMode);
})(window.chef.editor || {});
