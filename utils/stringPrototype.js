String.prototype.capitalize = function(lower) {
  return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) {
    return a.toUpperCase();
  });
};

String.prototype.ucfirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
