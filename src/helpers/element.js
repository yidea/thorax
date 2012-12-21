var elementPlaceholderAttributeName = 'data-element-tmp';

Handlebars.registerHelper('element', function(element, options) {
  var cid = _.uniqueId('element'),
      declaringView = getOptionsData(options).view,
      htmlAttributes = Thorax.Util.htmlAttributesFromOptions(options.hash);
  htmlAttributes[elementPlaceholderAttributeName] = cid;
  declaringView._elementsByCid || (declaringView._elementsByCid = {});
  declaringView._elementsByCid[cid] = element;
  return new Handlebars.SafeString(Thorax.Util.tag(htmlAttributes));
});

// IE will lose a reference to the elements if view.el.innerHTML = '';
// If they are removed one by one the references are not lost
Thorax.View.on('before:append', function() {
  if (this._renderCount > 0) {
    _.each(this._elementsByCid, function(element, cid) {
      $(element).remove();
    });
  }
});

Thorax.View.on('append', function(scope, callback) {
  (scope || this.$el).find('[' + elementPlaceholderAttributeName + ']').forEach(function(el) {
    var $el = $(el),
        cid = $el.attr(elementPlaceholderAttributeName),
        element = this._elementsByCid[cid];
    // A callback function may be specified as the value
    if (_.isFunction(element)) {
      element = element.call(this);
    }
    $el.replaceWith(element);
    callback && callback(element);
  }, this);
});
