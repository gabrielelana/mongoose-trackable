var mongoose = require('mongoose'),
    trackable = require('./../')

mongoose.connect('mongodb://localhost/mongoose-trackable-test')

var OrderSchema = new mongoose.Schema({products: Array}).plugin(trackable)

var Order = mongoose.model('Order', OrderSchema)

Order.create({products: ['apple']}, function(err, order) {
  // order now has createdAt and updatedAt fields
  console.log(order.createdAt)
  console.log(order.updatedAt)

  order.products.push('cucumber')

  setTimeout(function() {
    order.save(function(err, order) {
      // updatedAt has been updated with the last save
      console.log(order.createdAt)
      console.log(order.updatedAt)
      console.log(order.createdAt < order.updatedAt ? 'updateAt is after createdAt' : 'if you see this... something bad happend')

      mongoose.connection.db.dropDatabase(function() {
        mongoose.disconnect()
      })
    })
  }, 1000)
})
