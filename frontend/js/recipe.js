(function() {
  //---------- GENERIC FUNCTIONS
  var _generic = {};

  //---------- FILTERS
  var filter = {
    onlyNumbers: function(str) {
      return str.replace(/[^0-9]/, '');
    },
    newLines: function(str) {
      return str.replace(/[\r\n]/, ' ');
    },
    onNewLineKey: function(ev) {
      if (ev.which === 13) {
        console.log('INTRO');
        ev.preventDefault();
        if (this.callbacks.onNewLineKey) {
          this.onNewLineKey.call(this, ev);
        }
      }
    },
    onNewLineChange: function(ev) {
      console.log('CHANGE');
      var text = $(ev.target).text();
      $(ev.target).text(text.replace(/[\n\r]+/g, ' '));
      if (this.callbacks.onNewLineChange) {
        this.onNewLineChange.call(this, ev);
      }
    }
  };


  //========== ELEMENTS
  //---------- GENERIC
  // Creates or selects a generic element
  var _newElement = function(selector, value) {
    var elem = {
      // Self
      $self: null,
      selector: selector,
      $selfEditable: null,
      selectorEditable: '.set-editable',
      // Init
      init: function() {
        this.$self = selector ? $(selector) : null;
        if (this.$self) {
          this.$selfEditable = this.selectorEditable ? $(this.selectorEditable) : null;
        }
      },
      // Default options
      options: {
        isHtml: false
      },
      // Callbacks for events filtered
      callbacks: {},
      // Attributes
      originalValue: null,
      tpl: null,
      // Binds
      getValue: function() {
        if (this.options.isHtml) {
          return this.$self.html();
        }
        else {
          return this.$self.text();
        }
      },
      setValue: function(value) {
        this.$self.html(value);
      },
      saveValue: function(value) {
        this.originalValue = value;
        this.restore();
      },
      save: function(putFocus) {
        this.originalValue = this.getValue();
      },
      restore: function() {
        this.setValue(this.originalValue);
      },
      edit: function(putFocus) {
        this.save();
        if (putFocus) {
          this.$self.focus();
        }
      },
      setSelfEditable: function(selector) {
        if (selector) {
          this.selectorEditable = selector;
        }
        this.$selfEditable = this.$self.find(this.selectorEditable);
      },
      focus: function() {
        if (!this.$selfEditable) {
          this.setSelfEditable();
        }
        this.$selfEditable.focus();
      },
      cancel: this.restore,
      // Filters
      filtered: false,
      filter: function(state) {
        this.filtered = (state === true);
        if (this.filtered) {
          var opFilters = this.options.filters;
          // apply or remove filters
          this.$selfEditable[opFilters.newLines ? 'on' : 'off']('keypress.filterNewLines', filter.onNewLineKey.bind(this));
          this.$selfEditable[opFilters.newLines ? 'on' : 'off']('change.filterNewLines', filter.onNewLineChange.bind(this));
        }
      }
    };

    elem.init();

    if (value) {
      elem.saveValue(value);
    }

    return elem;
  };

  // Creates a new element list
  var _newElemList = function(selector, constructor) {
    var elemList = {
      elements: [],
      addElement: function(element) {
        this.elements.push(element);
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
      remove: function(index) {
        this.removeElement(index);
      },
      export: function() {
        var values = [];
        var elems = this.$self.children();
        elems.each(function(idx, elem) {
          values.push($(elem).text().trim());
        });
        console.log(values);
        return values;
      }
    };
    return _.extend(_newElement(selector), elemList);
  };

  //---------- Specific
  // Creates or selects an one line input element
  var newInputElement = function(selector) {
    var elem = {
      options: {
        isHtml: false,
        onlyNumbers: false,
        newLines: false
      }
    };
    return _.extend(_newElement(selector), elem);
  };

  // Creates or selects a select element
  var newSelectElement = function(selector) {
    var elem = {
      options: {
        isHtml: true
      }
    };
    return _.extend(_newElement(selector), elem);
  };

  // Creates or selects a text element
  var newTextElement = function(selector) {
    var elem = {
      export: function() {
        return this.$self.contents().map(function() {
          return $(this).text().trim();
        }).get();
      },
      options: {
        newLines: true
      }
    };
    return _.extend(_newElement(selector), elem);
  };

  // Creates or selects an ingredients list
  var newIngredientList = function(selector) {
    var elem = {
      options: {
        isHtml: true
      },
      remove: function(index) {
        this.removeElement(index);
        this.$self.find('.ingredient:nth-child(' + index + ')').hide('300', function() {
          $(this).remove();
        });
      },
      count: function() {
        return this.$self.find('.ingredient').length;
      },
      focusOn: function(index) {
        this.$self.find('.ingredient:nth-child(' + index + ') .set-editable').focus();
      },
      isClearLastItem: function() {
        return this.$self.find('.ingredient:last-child .set-editable').text().length > 0 ? true : this.$self.find('.ingredient:last-child .set-editable');
      }
    };

    return _.extend(_newElemList(selector, newIngredient), elem);
  };

  // Creates a new ingredient
  var newIngredient = function(value) {
    var tpl = '<div class="ingredient column">' +
      '<div class="icon-chef-cesta checks hide-editable"></div>' +
      '<div class="editable-container">' +
      '<div class="set-editable one-line" contenteditable="true" placeholder="Añadir ingrediente" data-length="40"></div>' +
      '</div>' +
      '<div>' +
      '<div class="remove-ingredient"><i class="icon-chef-cross"></i></div>' +
      '</div>' +
      '</div>';

    var elem = {
      options: {
        filters: {
          newLines: true
        }
      },
      callbacks: {
        onNewLineKey: function(ev) {
          var index = $(ev.target).closest('.ingredient').index() + 1;
          if (index < ingredients.count()) {
            ingredients.focusOn(index + 1);
          }
          else {
            if (ingredients.isClearLastItem() === true) {
              ingredients.add();
            }
          }
        }
      }
    };

    elem = _.extend(_newElement(tpl, value), elem);
    elem.filter(true);
    return elem;
  };

  //----------- TITLE
  var title = newInputElement('#recipe-title');
  var difficulty = newSelectElement('#recipe-difficulty');
  var time = newInputElement('#recipe-time .set-editable');
  var portions = newInputElement('#recipe-portions .set-editable');
  var description = newTextElement('#recipe-description .set-editable');
  var ingredients = newIngredientList('#ingredients .column.grid');

  //----------- SAVERS
  var saveArrayList = function(arr) {
    var str = arr.join("\n");
    return str;
  };

  var saveArrayText = function(arr) {
    console.log(typeof arr, arr);
    return arr.join('\n');
  };

  //----------- EDITOR MODE
  var editorMode = {
    // Events' functions
    events: {
      // Actives the edit mode
      onButtonEditClick: function(ev) {
        title.save(true);
        difficulty.save();
        time.save();
        portions.save();
        description.save();
        ingredients.save();

        // First coppy original value in data attribute for each false form component
        var $procedure = $('#recipe-procedure .set-editable');

        if (!$procedure.data('origvalue')) {
          $procedure.data('origvalue', $procedure.text());
        }

        // Change to editable mode
        $('body').addClass('mode-editable');
        $('.set-editable:not(.dropdown)').attr('contenteditable', true);
        window.activateDropdown();

      },
      onButtonCancelClick: function(ev) {
        title.restore();
        difficulty.restore();
        time.restore();
        portions.restore();
        description.restore();
        ingredients.restore();

        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);

        var $procedure = $('#recipe-procedure .set-editable');
        $procedure.text($procedure.data('origvalue'));
      },
      onButtonDeleteClick: function(ev) {
        $('#recipe-remove-form').submit();
      },
      onButtonUpdateClick: function(ev) {
        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);

        $('#hidden-title').attr('value', title.getValue());
        $('#hidden-difficulty').attr('value', $('#recipe-difficulty .itemSelected .item').attr('data-value'));
        $('#hidden-time').attr('value', time.getValue());
        $('#hidden-portions').attr('value', portions.getValue());
        $('#hidden-description').attr('value', saveArrayText(description.export()));
        $('#hidden-ingredients').attr('value', saveArrayList(ingredients.export()));
        $('#recipe-edit-form').submit();
      },
      onButtonAddIngredientClick: function(ev) {
        var lastIndex = ingredients.isClearLastItem();
        if (lastIndex === true) {
          var elem = ingredients.add();
        }
        else {
          lastIndex.focus();
        }
      },
      onButtonRemoveIngredientClick: function(ev) {
        var element = $(this).closest('.ingredient').index() + 1;
        ingredients.remove(element);
      },
      onKeypressIngredient: function(ev) {
        var index = $(this).closest('.ingredient').index() + 1;
        if (ev.which === 13) {
          ev.preventDefault();

          if (index < ingredients.count()) {
            ingredients.focusOn(index + 1);
          }
          else {
            if (ingredients.isClearLastItem() === true) {
              var elem = ingredients.add();
            }
          }
        }
      }
    },
    // Binds the global events
    bind: function() {
      $('#edit.button-manage').on('click', editorMode.events.onButtonEditClick);
      $('#cancel.button-manage').on('click', editorMode.events.onButtonCancelClick);
      $('#delete.button-manage').on('click', editorMode.events.onButtonDeleteClick);
      $('#update.button-manage').on('click', editorMode.events.onButtonUpdateClick);
      $(document).on('click', '#ingredients .ingredients-manage .button', editorMode.events.onButtonAddIngredientClick);
      $(document).on('click', '#ingredients .ingredient .remove-ingredient', editorMode.events.onButtonRemoveIngredientClick);
      $(document).on('keypress', '#ingredients .ingredient .set-editable', editorMode.events.onKeypressIngredient);
    },
    init: function() {
      title.init();
      difficulty.init();
      time.init();
      portions.init();
      description.init();
    }
  };

  //----------- DOCUMENT READY
  $(document).ready(function() {

    editorMode.init();
    editorMode.bind();


    $('#recipe-header-select').on('change', function(e) {
      setPreview(e.target, $('.promoted'));
    });

    $('.time .set-editable').on('keyup', function(e) {
      // if ($(this).html() > 120) {
      //   $(this).html('120');
      //   e.preventDefault();
      // }
    });

    $('.portions .set-editable').on('keyup', function(e) {
      // if ($(this).html() > 24) {
      //   $(this).html(24);
      //   e.preventDefault();
      // }
    });

    $('.favourite .button').on('click', function() {
      $(this).toggleClass('activated');
    });

    $('.checks:not(.all)').on('click', function() {
      $(this).toggleClass('activated');
    });

    $('.checks.all').on('click', function() {
      $('#ingredients .checks.activated').removeClass('activated');
      if (!$(this).hasClass('activated')) {
        console.log('Tiene');

        $('#ingredients .checks.activated').removeClass('activated');
        $('#ingredients .checks').toggleClass('activated');
        // $(this).toggleClass('activated');
      }
      else {
        console.log('NO tiene');
      }
    });

    var setPreview = function(input, $target) {
      if (input.files.length === 0) {
        if ($target.data('origsrc')) {
          $target.css('background-image', $target.data('origsrc'));
        }
      }
      else {
        if (!$target.data('origsrc')) {
          $target.data('origsrc', $target.css('background-image'));
        }
        var reader = new FileReader();
        reader.onload = function(event) {
          $target.css('background-image', 'url(' + event.target.result + ')');
        };
        reader.readAsDataURL(input.files[0]);
      }
    };

    var clearFile = function(input) {
      try {
        input.value = null;
      }
      catch (ex) {}
      if (input.value) {
        input.parentNode.replaceChild(input.cloneNode(true), input);
      }
    };

  });
})();
