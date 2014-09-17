(function() {

  var addTypes = function() {

    // ========== Ingredients
    // ---------- Creates a new ingredient
    window.chef.editor.addType('ingredient', function(parent, optionsIngredient, value) {
      var tpl = '<div class="ingredient column">' +
        '<div class="icon-chef-cesta checks hide-editable"></div>' +
        '<div class="editable-container">' +
        '<div class="set-editable one-line" contenteditable="true" placeholder="Añadir ingrediente" data-length="40"></div>' +
        '</div>' +
        '<div>' +
        '<div class="ingredient-remove"><i class="icon-chef-cross"></i></div>' +
        '</div>' +
        '</div>';

      var options = {
        showLimit: true,
        filters: {
          avoidNewLines: true,
          limitLength: 40
        }
      };

      var elem = {
        type: 'ingredient',
        parent: parent,
        callbacks: {
          onAvoidNewLineKey: function(ev) {
            // console.log('onAvoidNewLineKey custom callback');
            var parent = this.parent;
            if (parent) {
              if (parent.isLastElement.call(parent, this)) {
                if (!parent.isClearLastElement.call(parent)) {
                  if (!parent.options.filters.limitLength || parent.length < parent.options.filters.limitLength) {
                    parent.add.call(parent, null);
                  }
                }
              }
              else {
                parent.next.call(parent, this);
              }

            }
            else {
              console.warn('No parent found in', this);
            }
          }
        }
      };

      if (value && "object" === typeof value) {
        tpl = value;
        value = null;
      }

      options = _.merge(optionsIngredient || {}, options, _.defaults);

      elem = _.extend(this.newElement('default')(tpl, options, value), elem);
      // console.log('ingredient', elem);
      return elem;
    });

    // --------- Creates or selects an ingredients list
    window.chef.editor.addType('ingredientList', function(selector) {
      var options = {
        isHtml: true,
        filters: {
          limitElements: 50
        }
      };
      var elem = {
        type: 'ingredientList',
        remove: function(index) {
          this.removeElement(index);
          this.$self.find('.ingredient:nth-child(' + (index + 1) + ')').hide('300', function() {
            $(this).remove();
          });
        },
        parseElements: function() {
          // Add list ingredients
          var ingredients = this.$self.find('.ingredient');
          var ingredientsArray = [];

          var list = this;
          _.each(ingredients, function(element) {
            ingredientsArray.push(window.chef.editor.newElement('ingredient')(list, {}, element));
          });

          this.elements = ingredientsArray;
        }
      };

      var list = _.extend(this.newElement('list')(selector, this.newElement('ingredient'), options), elem);
      // console.log('ingredients', list);

      list.parseElements();

      return list;
    });

    // ========== Procedures
    // ---------- Creates a new step
    window.chef.editor.addType('step', function(parent, optionsStep, value) {
      var tpl = '<div class="step">' +
        '<div class="icon-chef-tick checks hide-editable"></div>' +
        '<div class="ui header index">' +
        '<span class="index-label"></span>' +
        '<div class="step-remove show-editable">Eliminar paso</div>' +
        '</div>' +
        '<div class="ui content set-editable" contenteditable="true" placeholder="Añadir nuevo paso" spellcheck="false">' +
        '</div>' +
        '</div>';

      var options = {
        showLimit: true,
        filters: {
          avoidNewLines: true,
          limitLength: 400
        }
      };
      var elem = {
        type: 'step',
        parent: parent,
        index: null,
        callbacks: {
          onAvoidNewLineKey: function(ev) {
            // console.log('onAvoidNewLineKey custom callback');
            var parent = this.parent;
            if (parent) {
              if (parent.isLastElement.call(parent, this)) {
                if (!parent.isClearLastElement.call(parent)) {
                  if (!parent.options.filters.limitLength || parent.length < parent.options.filters.limitLength) {
                    parent.add.call(parent, '');
                  }
                }
              }
              else {
                parent.next.call(parent, this);
              }

            }
            else {
              console.warn('No parent found in', this);
            }
          }
        }
      };

      if ("object" === typeof value) {
        tpl = value;
        value = null;
      }

      options = _.merge(optionsStep, options, _.defaults);

      elem = _.extend(this.newElement('default')(tpl, options, value), elem);

      return elem;
    });

    // ---------- Creates or selects an step list
    window.chef.editor.addType('procedureList', function(selector) {
      var options = {
        isHtml: true,
        filters: {
          limitElements: 5
        }
      };
      var elem = {
        type: 'procedureList',
        remove: function(index) {
          this.removeElement(index);
          this.$self.find('.step:nth-child(' + (index + 1) + ')').hide('300', function() {
            $(this).remove();
          });
        },
        parseElements: function() {
          // Add list ingredients
          var steps = this.$self.find('.step');
          var stepsArray = [];

          var list = this;
          _.each(steps, function(element) {
            stepsArray.push(window.chef.editor.newElement('step')(list, {}, element));
          });

          this.elements = stepsArray;
        }
      };

      var list = _.extend(this.newElement('list')(selector, this.newElement('step'), options), elem);
      // console.log('steps', list);

      list.parseElements();

      return list;
    });
  };

  //---------- DOCUMENT READY
  $(document).ready(function() {

    addTypes();
    window.chef.editor.bindEditables();
    window.chef.editor.init();

    //----------- SAVERS
    var saveArrayList = function(arr) {
      console.log(arr);
      var str = arr.join("\n");
      return str;
    };

    var saveArrayText = function(arr) {
      console.log(arr);
      return arr.join('\n');
    };

    //----------- TITLE
    var title = window.chef.editor.newElement('input')('#recipe-title', {
      filters: {
        limitLength: 60
      }
    });
    var difficulty = window.chef.editor.newElement('select')('#recipe-difficulty');

    var time = window.chef.editor.newElement('number')('#recipe-time .set-editable', {
      filters: {
        limitLength: 3
      }
    });
    var portions = window.chef.editor.newElement('number')('#recipe-portions .set-editable', {
      filters: {
        limitLength: 2
      }
    });
    var description = window.chef.editor.newElement('text')('#recipe-description .set-editable', {
      filters: {
        avoidNewLines: true,
        keepMultiline: false,
        limitLength: 400
      }
    });
    var ingredients = window.chef.editor.newElement('ingredientList')('#ingredients .column.grid');

    var procedure = window.chef.editor.newElement('procedureList')('#steps');

    window.chef.setEditableModeOn = function() {
      title.backup();
      difficulty.backup();
      time.backup();
      portions.backup();
      description.backup();
      ingredients.backup();
      procedure.backup();

      // Change to editable mode
      $('body').addClass('mode-editable');
      $('.set-editable:not(.dropdown)').attr('contenteditable', true);
      window.activateDropdown();

      title.focus();
    };

    // Events' functions
    var events = {
      // Actives the edit mode
      onButtonEditClick: function(ev) {
        window.chef.setEditableModeOn();
      },
      onButtonCancelClick: function(ev) {
        title.restore();
        difficulty.restore();
        time.restore();
        portions.restore();
        description.restore();
        ingredients.restore();
        procedure.restore();

        var file = $('#recipe-header-select').get(0);
        clearFile(file);
        setPreview(file, $('.promoted'));

        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);
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
        $('#hidden-description').attr('value', description.getValue());
        $('#hidden-ingredients').attr('value', saveArrayList(ingredients.getValue()));
        $('#hidden-procedure').attr('value', saveArrayList(procedure.getValue()));
        $('#recipe-edit-form').submit();
      },
      onButtonAddIngredientClick: function(ev) {
        if (!ingredients.isClearLastElement()) {
          var elem = ingredients.add();
        }
        else {
          ingredients.focusOn();
        }
      },
      onButtonRemoveIngredientClick: function(ev) {
        var index = $(this).closest('.ingredient').index();
        ingredients.remove(index);
      },
      onKeypressIngredient: function(ev) {
        var index = $(this).closest('.ingredient').index();
        if (ev.which === 13) {
          ev.preventDefault();

          if (index < ingredients.count()) {
            ingredients.focusOn(index + 1);
          }
          else {
            if (ingredients.isClearLastItem() === true) {
              var elem = ingredients.add('');
            }
          }
        }
      },
      onButtonAddProcedureClick: function(ev) {
        if (!procedure.isClearLastElement()) {
          var elem = procedure.add();
        }
        else {
          procedure.focusOn();
        }
      },
      onButtonRemoveProcedureClick: function(ev) {
        var index = $(this).closest('.step').index();
        procedure.remove(index);

      }
    };

    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#delete.button-manage').on('click', events.onButtonDeleteClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);
    $(document).on('click', '.ingredient-add', events.onButtonAddIngredientClick);
    $(document).on('click', '#ingredients .ingredient .ingredient-remove', events.onButtonRemoveIngredientClick);
    $(document).on('click', '.step-add', events.onButtonAddProcedureClick);
    $(document).on('click', '#steps .step .step-remove', events.onButtonRemoveProcedureClick);
    // $(document).on('click', '#steps .step .button', events.onButtonRemoveIngredientClick);
    // $(document).on('keypress', '#ingredients .ingredient .set-editable', events.onKeypressIngredient);

    $('#recipe-header-select').on('change', function(e) {
      setPreview(e.target, $('.promoted'));
    });

    $('.favourite .button').on('click', function() {
      $(this).toggleClass('activated');
    });

    $('.checks:not(.all)').on('click', function() {
      $(this).toggleClass('activated');
    });

    $('.checks.all').on('click', function() {
      if ($(this).hasClass('activated')) {
        $('#ingredients .checks').removeClass('activated');
      }
      else {
        $('#ingredients .checks').addClass('activated');
      }
    });

    var setPreview = function(input, $target) {
      var $warning = $('#image-size-warning');
      if (input.files.length === 0) {
        if ($target.data('origsrc')) {
          $target.css('background-image', $target.data('origsrc'));
          $warning.css('display', $target.data('origdisplay'));
        }
      }
      else {
        if (!$target.data('origsrc')) {
          $target.data('origsrc', $target.css('background-image'));
          $target.data('origdisplay', $warning.css('display'));
        }
        var url = URL.createObjectURL(input.files[0]);
        $target.css('background-image', 'url(' + url + ')');
        // Min size detection
        var image = new Image();
        image.onload = function(evt) {
          if (evt.target.width < 1280 || evt.target.height < 800) {
            $warning.css('display', 'block');
          }
          else {
            $warning.css('display', 'none');
          }
        };
        image.src = url;
      }
    };

    var clearFile = function(input) {
      if (input) {
        try {
          input.value = null;
        }
        catch (ex) {}
        if (input.value) {
          input.parentNode.replaceChild(input.cloneNode(true), input);
        }
      }
    };

  });
})();
