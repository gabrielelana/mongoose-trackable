var _ = require('lodash')

module.exports = function(schema, options) {
  options = _.extend(
    { createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      skipToTrackUpdates: false
    },
    options || {}
  )

  schema.add((function(fields) {
    fields[options.createdAt] = {type: Date, default: function() {return new Date()}}
    fields[options.updatedAt] = {type: Date, default: function() {return new Date()}}
    return fields
  })({}))

  schema.pre('save', function (next) {
    if (!options.skipToTrackUpdates) {
      this[options.updatedAt] = new Date();
    }
    next();
  });
}
