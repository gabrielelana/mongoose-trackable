# What
Is a mongoose plugin that automatically keeps track of when the document has been created, updated and optionally when some fields has been changed

# TODO
* some fields should be declared trackable to obtain something like
  ```
  updates: [
    {
      field: "status",
      changedTo: "ready",
      at: ISODate("2013-12-15T16:33:25.056Z")
    }
  ]
  ```
