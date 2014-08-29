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
        '<div class="remove-ingredient"><i class="icon-chef-cross"></i></div>' +
        '</div>' +
        '</div>';

      var options = {
        showLimit: true,
        filters: {
          avoidNewLines: true
        }
      };

      var elem = {
        type: 'ingredient',
        parent: parent,
        callbacks: {
          onAvoidNewLineKey: function(ev) {
            console.log('onAvoidNewLineKey custom callback');

            if (this.parent) {
              if (this.parent.isLastElement.call(this.parent, this)) {
                if (!this.parent.isClearLastElement.call(this.parent)) {
                  this.parent.add.call(this.parent, null);
                }
              }
              else {
                this.parent.next.call(this.parent, this);
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
        isHtml: true
      };
      var elem = {
        type: 'ingredientList',
        remove: function(index) {
          this.removeElement(index);
          this.$self.find('.ingredient:nth-child(' + index + ')').hide('300', function() {
            $(this).remove();
          });
        }
      };

      var list = _.extend(this.newElement('list')(selector, this.newElement('ingredient'), options), elem);
      // console.log('ingredients', list);

      // Add list ingredients
      var ingredients = list.$self.find('.ingredient');
      var ingredientsArray = [];

      var that = this;
      _.each(ingredients, function(element) {
        ingredientsArray.push(that.newElement('ingredient')(list, {
          filters: {
            limitLength: 30
          }
        }, element));
      });

      list.addElements(ingredientsArray);

      return list;
    });

    // ========== Procedures
    // ---------- Creates a new step
    window.chef.editor.addType('step', function(parent, optionsStep, value) {
      var tpl = '<div class="step">' +
        '<div class="icon-chef-tick checks"></div>' +
        '<div class="ui header index"></div>' +
        '<div class="ui content set-editable" contenteditable="true" placeholder="Añadir nuevo paso" spellcheck="false">' +
        '</div>' +
        '</div>';

      var options = {
        showLimit: true,
        filters: {
          avoidNewLines: true
        }
      };
      var elem = {
        type: 'step',
        parent: parent,
        selectorIndex: '.index',
        index: index,
        callbacks: {
          onAvoidNewLineKey: function(ev) {
            console.log('onAvoidNewLineKey custom callback');

            if (this.parent) {
              if (this.parent.isLastElement.call(this.parent, this)) {
                if (!this.parent.isClearLastElement.call(this.parent)) {
                  this.parent.add.call(this.parent, '');
                }
              }
              else {
                this.parent.next.call(this.parent, this);
              }
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
      console.log('step', elem);
      return elem;
    });

    // ---------- Creates or selects an step list
    window.chef.editor.addType('procedureList', function(selector) {
      var options = {
        isHtml: true
      };
      var elem = {
        type: 'procedureList',
        remove: function(index) {
          this.removeElement(index);
          this.$self.find('.step:nth-child(' + index + ')').hide('300', function() {
            $(this).remove();
          });
        }
      };

      var list = _.extend(this.newElement('list')(selector, this.newElement('step'), options), elem);
      // console.log('steps', list);

      // Add list steps
      var steps = list.$self.find('.step');
      var stepsArray = [];

      var that = this;
      _.each(steps, function(element) {
        stepsArray.push(that.newElement('step')(list, {
          filters: {
            limitLength: 300,
          }
        },
        element));
      });

      list.addElements(stepsArray);

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
      var str = arr.join("\n");
      return str;
    };

    var saveArrayText = function(arr) {
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
      showLimit: true,
      filters: {
        limitLength: 400
      }
    });
    var ingredients = window.chef.editor.newElement('ingredientList')('#ingredients .column.grid');

    var procedure = window.chef.editor.newElement('procedureList')('#steps');

    // Events' functions
    var events = {
      // Actives the edit mode
      onButtonEditClick: function(ev) {
        title.recover(true);
        difficulty.recover();
        time.recover();
        portions.recover();
        description.recover();
        ingredients.recover();
        procedure.recover();

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
        procedure.restore();

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
        var lastIndex = ingredients.isClearLastElement();
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
              var elem = ingredients.add('');
            }
          }
        }
      },
      onButtonAddProcedureClick: function(ev) {
        var lastIndex = procedure.isClearLastElement();
        console.log('CLEAR LAST INDEX: ' + lastIndex);
        if (lastIndex === true) {
          var elem = procedure.add(procedure, procedure.length, '');
        }
        else {
          procedure.focusOn(procedure.length - 1);
        }
      },
      onButtonRemoveProcedureClick: function(ev) {
        var lastIndex = procedure.isClearLastElement();
        if (lastIndex === true) {
          var elem = procedure.add('');
        }
        else {
          procedure.focusOn(procedure.length - 1);
        }
      }
    };

    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#delete.button-manage').on('click', events.onButtonDeleteClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);
    $(document).on('click', '#ingredients .ingredients-manage .button', events.onButtonAddIngredientClick);
    $(document).on('click', '#ingredients .ingredient .remove-ingredient', events.onButtonRemoveIngredientClick);
    $(document).on('click', '#steps .steps-manage .button', events.onButtonAddProcedureClick);
    $(document).on('click', '#steps .steps .remove-step', events.onButtonRemoveProcedureClick);
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
      $('#ingredients .checks.activated').removeClass('activated');
      if (!$(this).hasClass('activated')) {
        console.log('Tiene');

        $('#ingredients .checks.activated').removeClass('activated');
        $('#ingredients .checks').toggleClass('activated');
        // $(this).toggleClass('activated');
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
