class productionLogPlugin {
  logLine = [];

  doLog (module) {
    if (!module._source) return
    let val = module._source.source()
    ,  newVal = val
    ,  filename = module.rawRequest
    ,  maxLength = 0

    // Literal文字或数字
    // Identifier变量
    // TemplateLiteral模版
    // ArrayExpression数组
    // ObjectExpression对象
    // ArrowFunctionExpression箭头函数

    newVal = newVal.replace(/console\.log\(.+\)/g, (a,b,c) => {
      let obj = this.logLine.shift()
      ,   argsCode = ''
      ,   argsArray = []
      ,   maxLength = 0

      obj.args.forEach(arg => {
        const varCode = val.slice(arg.start, arg.end)

        if(varCode.length > maxLength) maxLength = varCode.length
        argsArray.push(varCode)
      })


      argsArray.forEach(varCode => {
        let strVar = varCode

        // if(strVar.length < maxLength) strVar = strVar.padEnd(maxLength, ' ')
        if(strVar.length < maxLength) strVar = this.padEnd(strVar, maxLength)

        argsCode += `, 'color: gray', '${ this.toString(strVar) } => ', ${ varCode }`
      })
      return `console.log('%c${ filename }@${ obj.line }\\n${ '%c%s%o\\n'.repeat(obj.args.length) }', 'color:green'${ argsCode })`
    })

    return newVal
  }

  padEnd (str, num){
    return (str + Array(num).join(' ')).slice(0, num)
  }

  toString (val){
    return val.replace(/(\"|\'|\`)/g, '\\$1')
  }

  pushLog (item){
    if((item.type === 'ExpressionStatement'
      && item.expression
      && item.expression.type === 'CallExpression'
      && item.expression.callee
      && item.expression.callee.object
      && item.expression.callee.object.name === 'console'
      && item.expression.callee.property.name === 'log')
    ){
      this.logLine.push({
        line: item.loc.start.line,
        args: item.expression.arguments.map(obj => ({
          start: obj.start,
          end: obj.end,
        })),
      })
    }else if (
      item.expression
        && item.expression.right
        && item.expression.right.body
        && item.expression.right.body.type === 'BlockStatement'
        && item.expression.right.body.body
    ){
      item.expression.right.body.body.forEach(item => this.pushLog(item))
    }else if (
      item.type === 'FunctionDeclaration'
      && item.body
      && item.body.type === 'BlockStatement'
      && item.body.body
    ){
      item.body.body.forEach(item => this.pushLog(item))
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('productionLogPlugin', (compilation, {normalModuleFactory}) => {
      normalModuleFactory
        .hooks
        .parser
        .for('javascript/auto')
        .tap('productionLogPlugin', (parser) => {
          parser
            .hooks
            .program
            .tap('productionLogPlugin', (ast, comments) => {
              this.logLine = []

              ast.body.forEach(item => this.pushLog(item))
            })

        })

      // modlue解析完毕钩子
      compilation.hooks.succeedModule.tap('productionLogPlugin', module => {
        // 修改模块的代码
        module._source._value = this.doLog(module)        
      })
    })
  }
}

module.exports = productionLogPlugin