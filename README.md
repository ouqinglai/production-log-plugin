# production-log-plugin
console.log in production by webpack4

##example
###input
```index.js

const asd = require('./test.js')
var ccc = {a:1}
var ddd = 777
asd()
var sdf = () => {}
console.log('start',ccc, `rrr${ ddd }`, [5, ccc, `5"yy"`], 9, {a:1}, f=>f, sdf)
```
```test.js

module.exports = function (){
  console.log(222)
  function wer (){
    console.log(["666"], "yui")
  }
  setTimeout(wer, 1000)
}
module.exports.asd = 1
```

###output
![image](files/Users/jzhang/Desktop/Isolated.png)