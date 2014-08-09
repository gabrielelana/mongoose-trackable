var chai = require('chai').use(require('chai-datetime')),
    expect = chai.expect,
    mongoose = require('mongoose'),
    trackable = require('./../'),
    _ = require('lodash')

describe('Model with mongoose-trackable plugin', function() {
  before(function(done) {
    // TODO: get rid of this duplication, with mocha-mongoose?
    mongoose.connect('mongodb://localhost/mongoose-trackable-test', function(err) {
      if (err) {
        console.error('MongoDB: ' + err.message)
        console.error('MongoDB is running? Is it accessible by this application?')
        return done(err)
      }
      // TODO: dropDatabase is quicker than dropping all the collections?
      mongoose.connection.db.dropDatabase(done)
    })
  })

  after(function(done) {
    mongoose.connection.close(done)
  })

  before(function() {
    var schemaWithTrackingField = new mongoose.Schema({aField: 'string'})
      .plugin(trackable, {fieldsToTrack: ['aField']})

    this.Model = mongoose.model('ModelWithTrackingField', schemaWithTrackingField)
  })

  describe('Document created at time X', function() {
    before(function(done) {
      var self = this

      self.timeX = new Date(42424242)
      self.Model.schema.stopTheFlowOfTimeAt(self.timeX)
      self.Model.create({}, function(err, doc) {
        self.doc = doc
        done(err)
      })
    })

    it('should be createdBetween and updatedBetween X - 10 and X + 10', function(done) {
      this.Model
        .createdBetween(this.timeX.getTime() - 10, this.timeX.getTime() + 10)
        .updatedBetween(this.timeX.getTime() - 10, this.timeX.getTime() + 10)
        .exec(function(err, result) {
          // TODO: need better expectations but chai-mongoose doesn't exists...
          expect(result).to.have.length(1)
          done()
        })
    })

    it('should be createdBetween X - 10 and X + 10', function(done) {
      this.Model.createdBetween(this.timeX.getTime() - 10, this.timeX.getTime() + 10, function(err, result) {
        // TODO: need better expectations but chai-mongoose doesn't exists...
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should be createdBetween X and X + 10, includes lower bound', function(done) {
      this.Model.createdBetween(this.timeX.getTime(), this.timeX.getTime() + 10, function(err, result) {
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should be createdBetween X - 10 and X, includes upper bound', function(done) {
      this.Model.createdBetween(this.timeX.getTime() - 10, this.timeX.getTime(), function(err, result) {
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should not be createdBetween X - 10 and X - 1, includes upper bound', function(done) {
      this.Model.createdBetween(this.timeX.getTime() - 10, this.timeX.getTime() - 1, function(err, result) {
        expect(result).to.have.length(0)
        done()
      })
    })

    it('should not be createdBetween X + 1 and X + 10, includes upper bound', function(done) {
      this.Model.createdBetween(this.timeX.getTime() + 1, this.timeX.getTime() + 10, function(err, result) {
        expect(result).to.have.length(0)
        done()
      })
    })

    it('should be updatedBetween X - 10 and X + 10', function(done) {
      this.Model.updatedBetween(this.timeX.getTime() - 10, this.timeX.getTime() + 10, function(err, result) {
        // TODO: need better expectations but chai-mongoose doesn't exists...
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should be updatedBetween X and X + 10, includes lower bound', function(done) {
      this.Model.updatedBetween(this.timeX.getTime(), this.timeX.getTime() + 10, function(err, result) {
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should be updatedBetween X - 10 and X, includes upper bound', function(done) {
      this.Model.updatedBetween(this.timeX.getTime() - 10, this.timeX.getTime(), function(err, result) {
        expect(result).to.have.length(1)
        done()
      })
    })

    it('should not be updatedBetween X - 10 and X - 1, includes upper bound', function(done) {
      this.Model.updatedBetween(this.timeX.getTime() - 10, this.timeX.getTime() - 1, function(err, result) {
        expect(result).to.have.length(0)
        done()
      })
    })

    it('should not be updatedBetween X + 1 and X + 10, includes upper bound', function(done) {
      this.Model.updatedBetween(this.timeX.getTime() + 1, this.timeX.getTime() + 10, function(err, result) {
        expect(result).to.have.length(0)
        done()
      })
    })
  })
})
