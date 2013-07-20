var serializeArray = exports.serializeArray = function() {
  return this.find('select,input,textarea,keygen')
  .filter(function() {
    var type = this.attr('type');
    return this.attr('name') && !this.is(':disabled') &&
      !/^(?:submit|button|image|reset|file)$/i.test(type) &&
      ( this.attr('checked') || !/^(?:checkbox|radio)$/i.test(type));
  }).map(function() {
    return {
      name: this.attr('name'),
      value: this.val() || ''
    };
  });
};
