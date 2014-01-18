var _ = require('lodash')

module.exports = function(schema, options) {
  options = _.extend(
    { createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      skipToTrackUpdates: false,
      fieldsToTrack: []
    },
    options || {}
  )

  options.fieldsToTrack = _([])
    .chain()
    .concat(options.fieldsToTrack)
    .reject(function(field) {
      return _(['__updates', options.createdAt, options.updatedAt]).contains(field)
    })
    .valueOf()

  schema.add((function(fields) {
    fields[options.createdAt] = {type: Date, default: function() {return new Date()}}
    fields[options.updatedAt] = {type: Date, default: function() {return new Date()}}
    if (options.fieldsToTrack.length > 0) {
      fields['__updates'] = {type: Array}
    }
    return fields
  })({}))

  schema.pre('save', function(next) {
    var doc = this, now = new Date()

    if (!options.skipToTrackUpdates) {
      doc.set(options.updatedAt, now)

      if (doc.isModified()) {
        options.fieldsToTrack.forEach(function(field) {
          if (doc.isNew || doc.isModified(field)) {
            doc.get('__updates').push({
              field: field,
              changedTo: doc[field],
              at: now
            })
          }
        })
      }
    }
    next();
  });
}
