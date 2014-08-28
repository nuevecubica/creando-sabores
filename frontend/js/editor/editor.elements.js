window.chef.editor = (function(editor) {

  //---------- FILTERS
  var filter = {
    //----- Values
    // Removes non-numbers from the string
    onlyNumbers: function(str) {
      return str.replace(/[^0-9]/, '');
    },
    // Removes \n and \r from the string
    avoidNewLines: function(str) {
      return str.replace(/[\r\n]+/g, ' ');
    },
    // Removes extra spaces
    collapseSpaces: function(str) {
      console.log('collapseSpaces');
      return String(str).replace(/([\s\t ]|&nbsp;|&#x0A;)+/g, ' ').replace(/[\s]+/g, ' ');
    },
    // Keep new lines
    keepMultiline: function(str) {
      console.log('keepMultiline');
      return '<p>' + String(str).replace(/[\n\r]+/g, "\n").split("\n").join('</p><p>') + '</p>';
    },
    limitLength: function(str, limit) {
      return str.length >= limit;
    },
    //----- Events
    // Detects a non-number keypress
    onOnlyNumbersKey: function(ev) {
      var charCode = (ev.which) ? ev.which : ev.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        ev.preventDefault();
      }
    },
    // Detects an input change and removes extra spaces
    onCollapseSpacesChange: function(ev) {
      var method = this.options.isHtml ? 'html' : 'text';
      console.log('method', method, this);
      var text = $(ev.target)[method]();
      $(ev.target)[method](filter.collapseSpaces(text));
      if (this.callbacks.onCollapseSpacesChange) {
        this.callbacks.onCollapseSpacesChange.call(this, ev);
      }
    },
    // Detects an input change and keeps new lines with paragraphs
    onKeepMultilineChange: function(ev) {
      var text = $(ev.target).text();
      $(ev.target).html(filter.keepMultiline(text));
      if (this.callbacks.onKeepMultilineChange) {
        this.callbacks.onKeepMultilineChange.call(this, ev);
      }
    },
    // Detects an input change and removes \n and \r
    onOnlyNumbersChange: function(ev) {
      var method = this.options.isHtml ? 'html' : 'text';
      var text = $(ev.target)[method]();
      $(ev.target)[method](filter.onlyNumbers(text));
      if (this.callbacks.onOnlyNumbersChange) {
        this.callbacks.onOnlyNumbersChange.call(this, ev);
      }
    },
    // Detects an intro keypress
    onAvoidNewLineKey: function(ev) {
      var charCode = (ev.which) ? ev.which : ev.keyCode;
      if (charCode === 13) {
        console.log('INTRO');
        ev.preventDefault();
        if (this.callbacks.onAvoidNewLineKey) {
          this.callbacks.onAvoidNewLineKey.call(this, ev);
        }
      }
    },
    // Detects an input change and removes \n and \r
    onAvoidNewLineChange: function(ev) {
      var text = $(ev.target).text();
      $(ev.target).text(filter.avoidNewLines(text));
      if (this.callbacks.onAvoidNewLineChange) {
        this.callbacks.onAvoidNewLineChange.call(this, ev);
      }
    },

    onLimitLengthKey: function(ev) {
      // if (this.options.showLimit && this.options.limit && filter.limitLength(ev.target().text, this.options.limit)) {
      if (filter.limitLength($(ev.target).text(), this.options.filters.limitLength)) {
        ev.preventDefault();
      }
      else {
        if (this.options.limit) {
          if (this.options.showLimit) {}
        }
      }
    }
  };

  //========== ELEMENTS
  //---------- GENERIC
  // Creates or selects a generic element
  var _newElement = function(selector, options, value) {
    // console.log('_newElememt', arguments);
    var elem = {
      // Self
      type: 'default',
      $self: null,
      selector: selector,
      $selfEditable: null,
      selectorEditable: '.set-editable',
      parent: null,
      // Init the jQuery selector
      init: function() {
        if ('object' === typeof this.selector && this.selector.jquery) {
          this.setSelf(this.selector);
          this.selector = this.$self.selector;
        }
        else {
          var $self = this.selector ? jQuery(this.selector) : null;
          if ($self && $self.length > 0) {
            this.setSelf($self);
          }
        }
        this.bindFilters();
      },
      // Sets the $self jQuery element
      setSelf: function($self) {
        this.$self = $self;
        if (this.selectorEditable) {
          if (this.$self.hasClass(this.selectorEditable.slice(1))) {
            // Is it editable by itself?
            this.$selfEditable = this.$self;
          }
          else {
            // Or is a children editable?
            this.$selfEditable = jQuery(this.selectorEditable, this.$self);
          }
          if (this.$selfEditable.length === 0) {
            console.warn('this.$selfEditable empty for ', this.$self);
          }
        }
      },
      // Default options
      options: {
        // Return getters as text
        isHtml: false,
        filters: {
          avoidNewLines: false,
          collapseSpaces: true,
          keepMultiline: false
        }
      },
      // Callbacks for events filtered
      callbacks: {},
      // Attributes
      originalValue: null,
      tpl: null,
      // Gets the actual value
      getValue: function() {
        if (this.options.isHtml) {
          return this._filter(String(this.$self.html()));
        }
        else {
          return this._filter(String(this.$self.text()));
        }
      },
      // Sets the actual value
      setValue: function(value) {
        this.$self.html(value);
      },
      // Saves a value as original and restores it
      saveValue: function(value) {
        this.originalValue = value;
        this.restore();
      },
      // Save the actual value as the original value
      recovery: function() {
        this.originalValue = this.getValue();
      },
      // Restores the original value as the actual value
      restore: function() {
        this.setValue(this.originalValue);
      },
      // Saves the value and puts focus on it
      edit: function(putFocus) {
        this.save();
        if (putFocus) {
          this.$self.focus();
        }
      },
      // Sets a new selector for the editable element
      setSelfEditable: function(selector) {
        if (selector) {
          this.selectorEditable = selector;
        }
        if (this.$self) {
          this.$selfEditable = this.$self.find(this.selectorEditable);
        }
        else {
          console.error("setSelfEditable: $self not defined");
        }
      },
      // Sets focus on it
      focus: function() {
        if (!this.$selfEditable) {
          this.setSelfEditable();
        }
        if (this.$selfEditable) {
          this.$selfEditable.focus();
        }
        else {
          console.error("focus: $selfEditable not defined");
        }
      },
      // See .restore
      cancel: this.restore,
      // Filters the actual value
      _filter: function(value, overrideOptions) {
        var opFilters = overrideOptions ? overrideOptions : this.options.filters;
        // console.log('_filter', opFilters);
        // apply filters
        if (opFilters) {
          if (opFilters.avoidNewLines) {
            value = filter.avoidNewLines(value);
          }
        }
        return value;
      },
      // Binds the filters to events
      bindFilters: function(overrideFilters) {
        var opFilters = overrideFilters ? overrideFilters : this.options.filters;


        var edit = this.$selfEditable;
        //- console.log(opFilters);
        //- console.log(edit);

        //- new line
        edit[opFilters.avoidNewLines ? 'on' : 'off']('keypress.filterAvoidNewLines', filter.onAvoidNewLineKey.bind(this));
        edit[opFilters.avoidNewLines ? 'on' : 'off']('change.filterAvoidNewLines', filter.onAvoidNewLineChange.bind(this));
        //- only numbers
        edit[opFilters.onlyNumbers ? 'on' : 'off']('keypress.filterOnlyNumbers', filter.onOnlyNumbersKey.bind(this));
        edit[opFilters.onlyNumbers ? 'on' : 'off']('change.filterOnlyNumbers', filter.onOnlyNumbersChange.bind(this));
        //- collapse spaces
        edit[opFilters.collapseSpaces ? 'on' : 'off']('change.filterCollapseSpaces', filter.onCollapseSpacesChange.bind(this));
        edit[opFilters.keepMultiline ? 'on' : 'off']('change.filterKeepMultiline', filter.onKeepMultilineChange.bind(this));
        //- limit length
        edit[opFilters.limitLength ? 'on' : 'off']('keypress.filterLimitLength', filter.onLimitLengthKey.bind(this));
      },
      // Unbinds all the filters
      unbindFilters: function() {
        return this.bindFilters({});
      }
    };

    // Load default options
    elem.options = _.merge(options, elem.options, _.defaults);

    // Run init
    elem.init.call(elem);

    // Initial value
    if (value) {
      elem.saveValue.call(elem, value);
    }

    return elem;
  };

  // Creates a new element list
  var _newElemList = function(selector, constructor, options) {
    // console.log('_newElemList', arguments);
    var elemList = {
      elements: [],
      type: 'list',
      addElement: function(element) {
        this.elements.push(element);
      },
      addElements: function(elementArray) {
        var that = this;
        _.each(elementArray, function(element) {
          that.addElement(element);
        });
      },
      removeElement: function(index, amount) {
        if (!index) {
          this.elements.pop();
        }
        else {
          this.elements = this.elements.splice(index, amount || 1);
        }
      },
      add: function(value) {
        var elem = constructor(value);
        this.addElement(elem);
        this.$self.append(elem.$self);
        elem.focus();
        return elem;
      },
      // Set focus on the position (index)
      next: function(current) {
        var currentIndex = this.elements.indexOf(current);

        if (currentIndex < this.length) {
          if (currentIndex > 0) {
            var next = currentIndex + 1;
            this.elements[next].focus();
          }
        }
      },
      isClearLastItem: function() {
        return (this.elements[this.elements.length - 1].getValue().length <= 0);
      },
      length: function() {
        return this.elements.length;
      },
      remove: function(index) {
        this.removeElement(index);
      },
      export: function() {
        var values = [];
        var elems = this.$self.children();
        elems.each(function(idx, elem) {
          values.push($(elem).text().trim());
        });
        return values;
      }
    };
    return _.extend(this.newElement('default')(selector, options), elemList);
  };

  //---------- Specific
  // Creates or selects an one line input element
  var newInputElement = function(selector, options) {
    // console.log('newInputElement', arguments);
    var optionsDefault = {
      isHtml: false,
      showLimit: false,
      filters: {
        avoidNewLines: true
      }
    };
    return _.extend(this.newElement('default')(
      selector, _.merge(options || {}, optionsDefault, _.defaults)
    ), {
      type: 'input'
    });
  };

  // Creates or selects an one line input element
  var newInputNumberElement = function(selector, options) {
    // console.log('newInputElement', arguments);
    var optionsDefault = {
      isHtml: false,
      showLimit: false,
      filters: {
        avoidNewLines: true,
        onlyNumbers: true
      }
    };
    return _.extend(this.newElement('default')(
      selector, _.merge(options || {}, optionsDefault, _.defaults)
    ), {
      type: 'number'
    });
  };

  // Creates or selects a select element
  var newSelectElement = function(selector, options) {
    var optionsDefault = {
      isHtml: true
    };
    return _.extend(this.newElement('default')(
      selector, _.merge(options || {}, optionsDefault, _.defaults)
    ), {
      type: 'select'
    });
  };

  // Creates or selects a text element
  var newTextElement = function(selector, options) {
    var elem = {
      type: 'text',
      export: function() {
        return this.$self.contents().map(function() {
          return $(this).text().trim();
        }).get();
      }
    };
    var optionsDefault = {
      isHtml: false,
      filters: {
        avoidNewLines: false,
        keepMultiline: true
      }
    };
    return _.extend(this.newElement('default')(
      selector, _.merge(options || {}, optionsDefault, _.defaults)
    ), elem);
  };

  var elementTypes = {
    'default': _newElement,
    list: _newElemList,
    input: newInputElement,
    number: newInputNumberElement,
    select: newSelectElement,
    text: newTextElement
  };

  return _.extend(editor, {
    elementTypes: _.extend(editor.elementTypes || {}, elementTypes)
  });
})(window.chef.editor || {});
