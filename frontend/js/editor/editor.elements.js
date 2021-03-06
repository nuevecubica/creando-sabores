window.chef.editor = (function(editor) {

  //========== ELEMENTS
  //---------- GENERIC
  // Creates or selects a generic element
  var _newElement = function(selector, options, value) {
    var elem = {
      // Self
      type: 'default',
      $self: null,
      selector: selector,
      $selfEditable: null,
      selectorEditable: '.set-editable',
      parent: null,
      selectorIndex: '.index-label',
      index: null,
      // Init the jQuery selector
      init: function() {
        if (this.selector) {
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
        }
        else {
          console.warn('Missing selector for', this);
        }
      },
      // Sets the $self jQuery element
      setSelf: function($self) {
        this.$self = $self;
        if (this.selectorEditable) {
          if (this.$self.hasClass(this.selectorEditable.slice(1))) {
            // Is it editable by itself?
            // console.log('Is it editable by itself?');
            this.$selfEditable = this.$self;
          }
          else {
            // console.log('Or is a children editable?');
            this.$selfEditable = jQuery(this.selectorEditable, this.$self);
          }
          if (this.$selfEditable.length === 0) {
            console.warn('this.$selfEditable empty for ', this.$self);
          }
        }
        else {
          this.$selfEditable = null;
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
        var $self = this.$selfEditable ? this.$selfEditable : this.$self;
        if (this.options.isHtml) {
          return this._filter(String($self.html() || ''));
        }
        else {
          return this._filter(String($self.text() || ''));
        }
      },
      // Sets the actual value
      setValue: function(value) {
        var $self = this.$selfEditable ? this.$selfEditable : this.$self;
        if (this.options.isHtml) {
          $self.html(value);
        }
        else {
          return $self.text(value);
        }
      },
      // Saves a value as original and restores it
      saveValue: function(value) {
        this.originalValue = value;
        this.restore();
      },
      getIndex: function() {
        return (this.index) ? this.index : false;
      },
      setIndex: function(index) {
        this.index = index || 1;
        this.$self.find(this.selectorIndex).text('Paso: ' + this.index);
      },
      // Save the actual value as the original value
      backup: function() {
        this.originalValue = this.getValue();
      },
      // Restores the original value as the actual value
      restore: function() {
        this.setValue(this.originalValue);
      },
      // Saves the value and puts focus on it
      edit: function(putFocus) {
        this.backup();
        if (putFocus) {
          this.focus();
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
        // apply filters
        if (opFilters) {
          if (opFilters.avoidNewLines) {
            value = editor.filters.avoidNewLines(value);
          }
          if (opFilters.collapseSpaces) {
            value = editor.filters.collapseSpaces(value);
          }
          if (opFilters.onlyNumbers) {
            value = editor.filters.onlyNumbers(value);
          }
          if (opFilters.limitLength) {
            value = editor.filters.limitLength(value);
          }
          if (opFilters.limitElements) {
            value = editor.filters.limitElements(value, opFilters.limitElements);
          }
        }
        return value;
      },
      // Binds the filters to events
      bindFilters: function(overrideFilters) {
        // console.log(this);
        var opFilters = overrideFilters ? overrideFilters : this.options.filters;
        var edit = this.$selfEditable;
        if (!edit) {
          return;
        }
        edit.on('keypress.filters', editor.filters.on.call(this, opFilters).keypress.bind(this));
        edit.on('change.filters', editor.filters.on.call(this, opFilters).change.bind(this));
      },
      // Unbinds all the filters
      unbindFilters: function() {
        return this.bindFilters({});
      }
    };

    // Load default options
    elem.options = _.merge(options || {}, elem.options, _.defaults);

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
      originalElements: [],
      type: 'list',
      // selectorEditable: null,
      getValue: function() {
        var array = [];

        this.elements.map(function(element, index) {
          array[index] = element.getValue();
        });

        return array;
      },
      updateIndex: function() {
        _.each(this.elements, function(element, index) {
          element.setIndex(index);
        });
      },
      backup: function() {
        this.originalValue = this.$self.html();
      },
      restore: function() {
        this.$self.html(this.originalValue);
        this.parseElements();
      },
      bindFilters: function(overrideFilters) {
        _.each(this.elements, function(elem) {
          elem.bindFilters.call(elem, overrideFilters);
        });
      },
      addElement: function(element) {
        this.elements.push(element);
      },
      addElements: function(elementArray) {
        var that = this;
        _.each(elementArray, function(element) {
          that.addElement(element);
        });
        this.backup();
      },
      removeElement: function(index, amount) {
        if (index >= 0) {
          this.elements.splice(index, amount || 1);
        }
        else {
          this.elements.pop();
        }
      },
      add: function(value) {
        var elem = constructor(this, {}, value);
        elem.setIndex(this.elements.length + 1);

        this.addElement(elem);
        this.$self.append(elem.$self);
        elem.focus();
        return elem;
      },
      remove: function(index) {
        this.removeElement(index);
      },
      length: function() {
        return this.elements.length;
      },
      // Set focus on the position (index)
      next: function(current) {
        var currentIndex = this.elements.indexOf(current);
        if (currentIndex >= 0) {
          this.elements[currentIndex + 1].focus();
        }
      },
      focusOn: function(index) {
        if (!index) {
          _.last(this.elements).focus();
        }
        else if (this.elements[index]) {
          this.elements[index].focus();
        }
        else {
          console.warn('Cannot focus on element', index);
        }
      },
      isClearLastElement: function() {
        var elem = _.last(this.elements);

        if (elem) {
          return !elem.getValue.call(elem);
        }
        else {
          return false;
        }
      },
      isLastElement: function(current) {
        var elem = _.last(this.elements);
        return (elem === current);
      },
      parseElements: function() {
        var ingredients = this.$self.children();
        var elementsArray = [];

        var that = this;
        _.each(ingredients, function(element) {
          elementsArray.push(editor.newElement('default')(that, {}, element));
        });

        this.elements = elementsArray;
      }
    };

    var optionsDefault = {
      isHtml: true,
      filters: {
        collapseSpaces: false
      }
    };
    options = _.merge(options || {}, optionsDefault, _.defaults);
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

    var elem = {
      type: 'select',
      getValue: function() {
        if (this.options.isHtml) {
          return this._filter(String(this.$self.html() || ''));
        }
        else {
          return this._filter(String(this.$self.text() || ''));
        }
      },
      // Sets the actual value
      setValue: function(value) {
        this.$self.html(value);
      }
    };

    var optionsDefault = {
      isHtml: true,
      filters: {
        collapseSpaces: false
      }
    };
    return _.extend(this.newElement('default')(
      selector, _.merge(options || {}, optionsDefault, _.defaults)
    ), elem);
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

  var newCheckboxElement = function(selector, options) {
    var elem = {
      type: 'checkbox',
      getValue: function() {
        return this._filter(String(this.$self.html() || '').toLowerCase());
      }
    };

    var optionsDefault = {
      filters: {}
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
    text: newTextElement,
    checkbox: newCheckboxElement
  };

  return _.extend(editor, {
    elementTypes: _.extend(editor.elementTypes || {}, elementTypes)
  });
})(window.chef.editor || {});
