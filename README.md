# What
Is a mongoose plugin that automatically keeps track of when the document has been created, updated and optionally when some fields have been modified

[![Build Status](https://travis-ci.org/gabrielelana/mongoose-trackable.png?branch=master)](https://travis-ci.org/gabrielelana/mongoose-trackable)

# Install
`npm install mongoose-trackable`

# Usage
```javascript
// see examples/track_model.js

var OrderSchema = new mongoose.Schema({products: Array}).plugin(trackable)

var Order = mongoose.model('Order', OrderSchema)

Order.create({products: ['apple']}, function(err, order) {
  // order now has createdAt and updatedAt fields

  order.products.push('cucumber')
  order.save(function(err, order) {
    // updatedAt has been updated with the last save
  })
})
```
Order is a trackable model, by default a trackable model will track the creation time in the `createdAt` field and last update time in the `updatedAt` field

Moreover you can keep track of all the changes of a certain field using the option `fieldsToTrack`
```javascript
// see examples/track_field.js

var OrderSchema = new mongoose.Schema({products: Array, status: String})
  .plugin(trackable, {fieldsToTrack: ['status']})

var Order = mongoose.model('Order', OrderSchema)

Order.create({status: 'placed', products: ['apple', 'cucumber']}, function(err, order) {
  // order now has __updates field that contains something like
  // [
  //    {"field":"status","changedTo":"placed","at":"2014-01-18T13:51:04.780Z"}
  // ]

  order.status = 'shipped'
  order.save(function(err, order) {
    // now __updates contains also the last status update
    // [
    //    {"field":"status","changedTo":"placed","at":"2014-01-18T13:51:04.780Z"},
    //    {"field":"status","changedTo":"shipped","at":"2014-01-18T13:51:04.808Z"}
    // ]
  })
})
```

For more options and more use cases see `spec/acceptance.js`

# TODO
* more and better documentation
* `skiptToTrackDocumentUpdates` vs `skipToTrackFieldsUpdates`
