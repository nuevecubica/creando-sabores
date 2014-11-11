/* global likeClick */
/* global ratingClick */
(function() {

  var addTypes = function() {

    /*
    // ========== Plates
    // ---------- Creates a new plate
    window.chef.editor.addType('plate', function(parent, optionsPlate, value) {
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
          limitLength: window.chef.editor.config.recipe.ingredient.length
        }
      };

      var elem = {
        type: 'plate',
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

      options = _.merge(optionsPlate || {}, options, _.defaults);

      elem = _.extend(this.newElement('default')(tpl, options, value), elem);
      // console.log('ingredient', elem);
      return elem;
    });

    // --------- Creates or selects an ingredients list
    window.chef.editor.addType('plateList', function(selector) {
      var options = {
        isHtml: true,
        filters: {
          limitElements: window.chef.editor.config.recipe.ingredient.elements
        }
      };
      var elem = {
        type: 'plateList',
        remove: function(index) {
          this.removeElement(index);
          this.$self.find('.plate:nth-child(' + (index + 1) + ')').hide('300', function() {
            $(this).remove();
          });
        },
        parseElements: function() {
          // Add list ingredients
          var ingredients = this.$self.find('.plate');
          var ingredientsArray = [];

          var list = this;
          _.each(ingredients, function(element) {
            ingredientsArray.push(window.chef.editor.newElement('plate')(list, {}, element));
          });

          this.elements = ingredientsArray;
        }
      };

      var list = _.extend(this.newElement('list')(selector, this.newElement('plate'), options), elem);
      // console.log('ingredients', list);

      list.parseElements();

      return list;
    });
    */

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
    var title = window.chef.editor.newElement('input')('#menu-title', {
      filters: {
        limitLength: window.chef.editor.config.menu.title.length
      }
    });
    var description = window.chef.editor.newElement('text')('#menu-description .set-editable', {
      filters: {
        avoidNewLines: true,
        keepMultiline: false,
        limitLength: window.chef.editor.config.menu.description.length
      }
    });

    //var plates = window.chef.editor.newElement('plateList')('#plate-editor #plates.categories');

    window.chef.setEditableModeOn = function() {
      title.backup();
      description.backup();
      //plates.backup();

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
        description.restore();
        //plates.restore();

        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);
      },
      onButtonUpdateClick: function(ev) {
        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);

        $('#hidden-title').attr('value', title.getValue());
        $('#hidden-description').attr('value', description.getValue());
        $('#menu-edit-form').submit();
      },
      /*
      onButtonAddPlateClick: function(ev) {
        if (!plates.isClearLastElement()) {
          var elem = plates.add();
        }
        else {
          plates.focusOn();
        }
      },
      onButtonRemovePlateClick: function(ev) {
        var index = $(this).closest('.plate').index();
        plates.remove(index);
      },
      onKeypressPlate: function(ev) {
        var index = $(this).closest('.plate').index();
        if (ev.which === 13) {
          ev.preventDefault();

          if (index < plates.count()) {
            plates.focusOn(index + 1);
          }
          else {
            if (plates.isClearLastItem() === true) {
              var elem = plates.add('');
            }
          }
        }
      },
      */
    };

    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);
    //$(document).on('click', '.plate-add', events.onButtonAddPlateClick);
    //$(document).on('click', '#plates .plate .plate-remove', events.onButtonRemovePlateClick);

    $('#menu-header-select').on('change', function(e) {
      setPreview(e.target, $('.promoted'));
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
