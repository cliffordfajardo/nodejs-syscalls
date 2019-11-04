let num = 1
let string = "hi"

let array = [1, 2, 3]
array.push(4)
array
// => [ 1, 2, 3, 4 ]

// delete array[2]
// => [ 1, 2, null, 4 ]

array.splice(2, 1)
array
// => [ 1, 2, 4 ]

array.slice(0).forEach(function(object) {
  array.splice(array.indexOf(object), 1)
})
array
// => []

let object = { key: 'value' }
object['key']
// => value
object.key
// => value

object.f = function() { return this.key }
object.f()
// => value

function MyObject(x) {
  this.x = x
}

let o = new MyObject(1)
o.x
// => 1

MyObject.prototype.y = 2
o.y
// => 2

let module = require('./module')
module.f()
// => from module

