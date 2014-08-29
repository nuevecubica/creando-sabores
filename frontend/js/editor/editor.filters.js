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
      // console.log('avoidNewLines', str);
      return str.replace(/[\r\n]+/g, ' ');
    },
    // Removes extra spaces
    collapseSpaces: function(str) {
      // console.log('collapseSpaces', str);
      return String(str).replace(/([\s\t ]|&nbsp;|&#x0A;)+/g, ' ').replace(/[\s]+/g, ' ').trim();
    },
    // Keep new lines
    keepMultiline: function(str) {
      // console.log('keepMultiline', str);
      return '<p>' + String(str).replace(/[\n\r]+/g, "\n").split("\n").join('</p><p>') + '</p>';
    },
    limitLength: function(str, limit) {
      return str.substr(0, limit);
    },
    //----- Events
    // Caller that reads options and returns event functions
    on: function(ops) {
      return {
        keypress: function(ev) {
          //- limit length
          if (ops.limitLength) {
            filter.onLimitLengthKey.call(this, ev);
          }
          //- avoid new lines
          if (ops.avoidNewLines) {
            filter.onAvoidNewLineKey.call(this, ev);
          }
          //- only numbers
          if (ops.onlyNumbers) {
            filter.onOnlyNumbersKey.call(this, ev);
          }
        },
        change: function(ev) {
          if (ops.avoidNewLines) {
            filter.onAvoidNewLineChange.call(this, ev);
          }
          if (ops.onlyNumbers) {
            filter.onOnlyNumbersChange.call(this, ev);
          }
          //- collapse spaces
          if (ops.collapseSpaces) {
            filter.onCollapseSpacesChange.call(this, ev);
          }
          if (ops.keepMultiline) {
            filter.onKeepMultilineChange.call(this, ev);
          }
        }
      };
    },
    // Detects a non-number keypress
    onOnlyNumbersKey: function(ev) {
      var charCode = (ev.which) ? ev.which : ev.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        ev.preventDefault();
        if (this.callbacks.onOnlyNumbersKey) {
          this.callbacks.onOnlyNumbersKey.call(this, ev);
        }
      }
    },
    // Detects an input change and removes extra spaces
    onCollapseSpacesChange: function(ev) {
      var method = this.options.isHtml ? 'html' : 'text';
      // console.log('method', method, this);
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
    // Limits the field length
    onLimitLengthKey: function(ev) {
      var text = $(ev.target).text();
      if (text.length >= this.options.filters.limitLength) {
        ev.preventDefault();
      }
    }
  };

  return _.extend(editor, {
    filters: _.extend(editor.filters || {}, filter)
  });
})(window.chef.editor || {});
