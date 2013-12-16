var expect = require('chai').expect,
    mongoose = require('mongoose'),
    trackable = require('./../')

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
      this.Trackable = mongoose.model('Trackable', (function(Trackable) {
        Trackable.add({anyField: String})
        Trackable.plugin(trackable)
        return Trackable
      })(new mongoose.Schema()))
    })

    it('should add createdAt and updatedAt fields', function(done) {
      this.Trackable.create({anyField: 'any value'}, function(err, doc) {
        expect(doc).to.have.property('createdAt')
        expect(doc).to.have.property('updatedAt')
        done()
      })
    })
  })
})
