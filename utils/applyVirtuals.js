var applyVirtuals = function(item, virtuals) {
  Object.keys(virtuals).forEach(function(virtual) {
    if (virtuals[virtual]) {
      item[virtual] = virtuals[virtual].call(item);
    }
  });
  return item;
};

var _apply = function(virtuals) {
  return function() {
    return applyVirtuals(this, virtuals);
  };
};

applyVirtuals._apply = _apply;

exports = module.exports = applyVirtuals;
