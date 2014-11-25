/* global likeClick, ratingClick, makePaginable, getTemplate, flashMessage, canvasResizeAvailable, ajaxSubmit, setHeaderPreview, clearFile */
(function() {

  //---------- DOCUMENT READY
  $(document).ready(function() {

    window.chef.editor.bindEditables();
    window.chef.editor.init();
    var platesBackup;

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
      // Tutorial start
      if (window.chef.user.disabledHelpers.indexOf('menu') === -1) {
        window.chef.tutorial.start();
      }

      title.backup();
      description.backup();
      platesBackup = $('#menu-recipes-current .list').html();
      disableSearch();

      menuRecipesUpdate();

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
        window.chef.tutorial.stop();
        disableSearch();

        title.restore();
        description.restore();
        $('#menu-recipes-current .list').html(platesBackup);

        var file = $('#recipe-header-select').get(0);
        clearFile(file);
        setHeaderPreview(file);

        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);
      },
      onButtonDraftClick: function(ev) {
        $('#menu-draft-form').submit();
      },
      onButtonPublishClick: function(ev) {
        $('#menu-publish-form').submit();
      },
      onButtonDeleteClick: function(ev) {
        if (confirm('¿Está seguro de que desea ELIMINAR este menú?')) {
          $('#menu-remove-form').submit();
        }
      },
      onButtonUpdateClick: function(ev) {
        $('body').removeClass('mode-editable');
        $('.set-editable').attr('contenteditable', false);

        $('#hidden-title').attr('value', title.getValue());
        $('#hidden-description').attr('value', description.getValue());

        if (canvasResizeAvailable()) {
          ajaxSubmit(document.getElementById('menu-edit-form'));
        }
        else {
          $('#menu-edit-form').submit();
        }
      },
    };

    $('#draft.button-manage').on('click', events.onButtonDraftClick);
    $('#publish.button-manage').on('click', events.onButtonPublishClick);
    $('#delete.button-manage').on('click', events.onButtonDeleteClick);
    $('#edit.button-manage').on('click', events.onButtonEditClick);
    $('#cancel.button-manage').on('click', events.onButtonCancelClick);
    $('#update.button-manage').on('click', events.onButtonUpdateClick);

    $('#menu-header-select').on('change', function(e) {
      setHeaderPreview(e.target);
    });

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

    var enableSearch = function() {
      $('#search-area').show();
      $('#add-recipe-button').hide();
    };

    var disableSearch = function() {
      $('#search-area').hide();
      $('#add-recipe-button').show();
      $('#search-query').val('');
      if (window.chef.clearPaginable) {
        window.chef.clearPaginable();
      }
      $('#results .list').html('');
    };

    $('#add-recipe-button > .button').on('click', enableSearch);

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
      disableSearch();
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
