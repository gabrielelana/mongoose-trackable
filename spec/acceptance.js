var chai = require('chai').use(require('chai-datetime')),
    expect = chai.expect,
    mongoose = require('mongoose'),
    trackable = require('./../'),
    _ = require('lodash')

describe('mongoose-trackable', function() {
  before(function(done) {
    mongoose.connect('mongodb://localhost/mongoose-trackable-test', function(err) {
      if (err) {
        console.error('MongoDB: ' + err.message)
        console.error('MongoDB is running? Is it accessible by this application?')
        return done(err)
      }
      mongoose.connection.db.dropDatabase(done)
    })
  })

  describe('plugged into a mongoose.Schema', function() {
    before(function() {
      this.modelWithTrackablePlugin = function(name, options, schema) {
        return mongoose.model(name, new mongoose.Schema(schema || {}).plugin(trackable, options))
      }
    })

    it('should add createdAt and updatedAt fields', function(done) {
      this.modelWithTrackablePlugin('Trackable')
        .create({}, function(err, doc) {
          expect(doc).to.have.property('createdAt')
          expect(doc).to.have.property('updatedAt')
          done()
        })
    })

    it('should update updatedAt on save', function(done) {
      this.modelWithTrackablePlugin('TrackableWillTrackUpdates')
        .create({}, function(err, doc) {
          var firstTimeUpdatedAt = doc.updatedAt
          process.nextTick(function() {
            doc.save(function(err, doc) {
              expect(doc.updatedAt).to.be.gt(firstTimeUpdatedAt)
              done()
            })
          })
        })
    })

    it('could inject createdAt value', function(done) {
      var forceToBeCreatedAt = new Date(100)
      this.modelWithTrackablePlugin('TrackableWithCreatedAtOverrided')
        .create({createdAt: forceToBeCreatedAt}, function(err, doc) {
          expect(doc.createdAt).to.be.equalTime(forceToBeCreatedAt)
          done()
        })
    })

    it('could inject createdAt value', function(done) {
      var forceToBeUpdatedAt = new Date(200)
      this.modelWithTrackablePlugin('TrackableWithUpdatedAtOverrided', {skipToTrackUpdates: true})
        .create({updatedAt: forceToBeUpdatedAt}, function(err, doc) {
          expect(doc.updatedAt).to.be.equalTime(forceToBeUpdatedAt)
          done()
        })
    })

    it('could customize createdAt field name with createdAt option', function(done) {
      this.modelWithTrackablePlugin(
          'TrackableWithCustomCreatedAtField',
          {createdAt: 'created_at'}
        )
        .create({}, function(err, doc) {
          expect(doc).to.have.property('created_at')
          expect(doc).to.not.have.property('createdAt')
          done()
        })
    })

    it('could customize updatedAt field name with updatedAt option', function(done) {
      this.modelWithTrackablePlugin(
          'TrackableWithCustomUpdatedAtField',
          {updatedAt: 'updated_at'}
        )
        .create({}, function(err, doc) {
          expect(doc).to.have.property('updated_at')
          expect(doc).to.not.have.property('updatedAt')
          done()
        })
    })

    it('could track changes of a field', function(done) {
      this.modelWithTrackablePlugin('TrackableWithTrackedField', {fieldsToTrack: 'status'}, {status: 'string'})
        .create({status: 'started'}, function(err, doc) {
          expect(doc).to.have.property('status', 'started')
          expect(doc).to.have.property('__updates')
          expect(_.pluck(doc.__updates, 'changedTo')).to.be.eql(['started'])

          doc.set('status', 'closed')
          doc.save(function(err, doc) {
            expect(_.pluck(doc.__updates, 'changedTo')).to.be.eql(['started', 'closed'])
            done()
          })
        })
    })

    it('could track changes of multiple fields', function(done) {
      this.modelWithTrackablePlugin(
        'TrackableWithTrackedFields',
        {fieldsToTrack: ['status', 'location']},
        {status: 'string', location: 'string'}
      ).create({status: 'shipped', location: 'Chicago'}, function(err, doc) {
          expect(doc).to.have.property('status', 'shipped')
          expect(doc).to.have.property('location', 'Chicago')

          var changesToStatusField = _.chain(doc.__updates).filter(function(u) {return u.field === 'status'}).pluck('changedTo').valueOf()
          var changesToLocationField = _.chain(doc.__updates).filter(function(u) {return u.field === 'location'}).pluck('changedTo').valueOf()

          expect(changesToStatusField).to.eql(['shipped'])
          expect(changesToLocationField).to.eql(['Chicago'])
          done()
        })
    })

    it('doesn\'t track fields that are not to track', function(done) {
      this.modelWithTrackablePlugin('TrackableWithNotTrackedField', {}, {status: 'string'})
        .create({status: 'started'}, function(err, doc) {
          expect(doc).to.have.property('status')
          expect(doc).to.not.have.property('__updates')
          done()
        })
    })
  })
})
