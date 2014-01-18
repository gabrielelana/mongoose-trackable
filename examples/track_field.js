var mongoose = require('mongoose'),
    trackable = require('./../')

mongoose.connect('mongodb://localhost/mongoose-trackable-test')

var OrderSchema = new mongoose.Schema({products: Array, status: String})
  .plugin(trackable, {fieldsToTrack: ['status']})

var Order = mongoose.model('Order', OrderSchema)

Order.create({status: 'placed', products: ['apple', 'cucumber']}, function(err, order) {
  console.log(JSON.stringify(order.__updates))
  // will print something like
  // [
  //    {"field":"status","changedTo":"placed","at":"2014-01-18T13:51:04.780Z"}
  // ]

  order.status = 'shipped'
  order.save(function(err, order) {
    console.log(JSON.stringify(order.__updates))
    // will print something like
    // [
    //    {"field":"status","changedTo":"placed","at":"2014-01-18T13:51:04.780Z"},
    //    {"field":"status","changedTo":"shipped","at":"2014-01-18T13:51:04.808Z"}
    // ]
    
    mongoose.connection.db.dropDatabase(function() {
      mongoose.disconnect()
    })
  })
})
