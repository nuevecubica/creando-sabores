(function() {

  var addTypes = function() {
    // Creates a new ingredient
    window.chef.editor.addType('ingredient', function(value) {
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
        filters: {
          newLines: true
        }
      };
      var elem = {
        type: 'ingredient',
        callbacks: {
          onNewLineKey: function(ev) {
            console.log('onNewLineKey custom callback');
            var ingredients = ingredients || null;
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

      elem = _.extend(this.newElement('default')(tpl, options, value), elem);
      // console.log('ingredient', elem);
      return elem;
    });

    // Creates or selects an ingredients list
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

      var list = _.extend(this.newElement('list')(selector, this.newElement('ingredient'), options), elem);
      // console.log('ingredients', list);
      return list;
    });
  };

  //----------- DOCUMENT READY
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
    var title = window.chef.editor.newElement('input')('#recipe-title');
    var difficulty = window.chef.editor.newElement('select')('#recipe-difficulty');
    var time = window.chef.editor.newElement('input')('#recipe-time .set-editable');
    var portions = window.chef.editor.newElement('input')('#recipe-portions .set-editable');
    var description = window.chef.editor.newElement('text')('#recipe-description .set-editable');
    var ingredients = window.chef.editor.newElement('ingredientList')('#ingredients .column.grid');

    // Events' functions
    var events = {
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
    };

    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#delete.button-manage').on('click', events.onButtonDeleteClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);
    $(document).on('click', '#ingredients .ingredients-manage .button', events.onButtonAddIngredientClick);
    $(document).on('click', '#ingredients .ingredient .remove-ingredient', events.onButtonRemoveIngredientClick);
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
