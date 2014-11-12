/* global likeClick */
/* global ratingClick */
/* global makePaginable, getTemplate */
(function() {

  //---------- DOCUMENT READY
  $(document).ready(function() {

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
    };

    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);

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

    var doSearch = function(e) {
      e.preventDefault();
      var $results = $('#results'),
        query = $('#search-query').val(),
        idx = 'recipes',
        args = {
          q: query,
          idx: idx,
          page: 1,
          perPage: 5
        },
        url = '/api/v1/search?' + $.param(args);

      if (!query.length) {
        $results.removeClass('loading loaded no-results');
        $('#results .list').html('');
        return;
      }

      $results.removeClass('loaded no-results').addClass('loading');

      var jQXhr = $.getJSON(url).done(function(data) {
        if (!data.results || !data.results.results.length) {
          $results.removeClass('loading loaded').addClass('no-results');
          $('#results .list').html('');
          return;
        }
        var items = data.results.results;
        getTemplate('menu-recipe', items, function(tpl, items) {
          var html = '';
          for (var i = 0, l = items.length; i < l; i++) {
            html += tpl(items[i]);
          }
          $('#results .list').html(html);
          $results.removeClass('loading no-results').addClass('loaded');

          var extraargs = {
            q: query,
            idx: idx
          };
          makePaginable('/api/v1/search', 'results', 'menu-recipe', '#results .list', extraargs);
        });
      });
    };

    $('#search-button').on('click', doSearch);

    var menuRecipesUpdate = function() {
      var slugs = [];
      $('#menu-recipes-current .list > .position').each(function(i) {
        $('span.count', this).text(i + 1);
        slugs.push($(this).data('slug'));
      });
      $('#hidden-plates').val(slugs);
    };

    var appendRecipe = function(e) {
      var $recipe = $(this).clone();
      $('#menu-recipes-current .list').append($recipe);
      menuRecipesUpdate();
    };

    var removeRecipe = function(e) {
      $(this).closest('.position').remove();
      menuRecipesUpdate();
    };

    $(document).on('click', '#menu-recipe-add .list > .position', appendRecipe);
    $(document).on('click', '.menu-plate-remove', removeRecipe);


  });
})();
