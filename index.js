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
    fields[options.createdAt] = {type: Date, default: function() {return schema.trackAt()}}
    fields[options.updatedAt] = {type: Date, default: function() {return schema.trackAt()}}
    if (options.fieldsToTrack.length > 0) {
      fields['__updates'] = {type: Array}
    }
    return fields
  })({}))

  schema.pre('save', function(next) {
    var doc = this, now = schema.trackAt()

    if (!options.skipToTrackUpdates) {
      doc.set(options.updatedAt, now)

      if (doc.isModified()) {
        options.fieldsToTrack.forEach(function(field) {
          if ((doc.isNew && doc.get(field)) || doc.isModified(field)) {
            doc.get('__updates').push({
              field: field,
              changedTo: doc.get(field),
              at: now
            })
          }
        })
      }
    }
    next()
  })

  schema.stopTheFlowOfTimeAt = function(now) {
    schema['__at'] = now || new Date()
  }

  schema.restoreTheFlowOfTime = function() {
    delete schema['__at']
  }

  schema.theFlowOfTimeHasStopped = function() {
    return this['__at'] && this['__at'] instanceof Date
  }

  schema.trackAt = function() {
    if (this.theFlowOfTimeHasStopped()) {
      return this['__at']
    }
    return new Date()
  }

  ;['created', 'updated'].forEach(function(event) {
    schema.statics[event + 'Between'] = function(fromTimestamp, toTimestamp, callback) {
      var query =
        this.where(options[event + 'At'])
          .gte(new Date(fromTimestamp))
          .lte(new Date(toTimestamp))

      if (callback) {
        return query.exec(callback)
      }

      _(['created', 'updated']).without(event).forEach(function(event) {
        query[event + 'Between'] = function(fromTimestamp, toTimestamp, callback) {
          return query.where(options[event + 'At'])
              .gte(new Date(fromTimestamp))
              .lte(new Date(toTimestamp))
        }
      })

      return query
    }
  })
}
