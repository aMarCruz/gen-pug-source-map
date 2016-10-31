'use strict'

var SourceMapGenerator = require('source-map').SourceMapGenerator
var fs = require('fs')

module.exports = function genSourceMap (filename, source, compiled, options) {
  var opts = options || {}

  var generator = new SourceMapGenerator({
    file: filename + '.js'
  })
  var reLineAndPath = /;pug_debug_line = ([0-9]+);pug_debug_filename = "([^"]*)";/
  var compiledLines = compiled.split('\n')

  compiledLines.forEach(function (line, lineno) {
    var linesMatched = {}
    linesMatched[filename] = {}

    var match = line.match(reLineAndPath)
    if (!match) return

    var originalLine = ~~match[1]
    var fname = match[2] ? match[2].replace(/\\u002F/g, '/') : filename
    var generatedLine

    if (originalLine > 0) {

      if (!linesMatched[fname]) {
        // new include file - add to sourcemap
        linesMatched[fname] = {}

        if (!opts.excludeContent) {
          try {
            var srcContent = fs.readFileSync(fname, 'utf8')
            generator.setSourceContent(fname, srcContent)
          } catch (e) {/**/}
        }
      }

      // already matched?
      if (!linesMatched[fname][originalLine] &&
          !/^;pug_debug/.test(compiledLines[lineno + 1])) {
        generatedLine = lineno + 3 // 1-based and allow for PREFIX extra line
      }

      if (generatedLine) {
        linesMatched[fname][originalLine] = true
        generator.addMapping({
          generated: {
            line: generatedLine,
            column: 0
          },
          source: fname,
          original: {
            line: originalLine,
            column: 0
          }
        })
      }
    }

    //remove pug debug lines from within generated code
    if (!opts.keepDebugLines) {
      var len = match[0].length
      compiledLines[lineno] = line.length === len ? ''
                            : line.slice(0, match.index) + line.slice(match.index + len)
    }
  })

  // Remove pug debug lines at beginning and end of compiled version
  // could be in a number of first few lines depending on source content
  if (!opts.keepDebugLines) {
    var found = false
    var line = 0

    while (!found && line < compiledLines.length) {
      var lnDebug = compiledLines[line]
      if (/^function pug_rethrow/.test(lnDebug)) {
        found = true
        var re = /var\spug_debug_filename.*/
        compiledLines[line] = lnDebug.replace(re, '')
      }
      line++
    }
    if (found) {
      var ln = compiledLines.length
      compiledLines[ln - 1] = compiledLines[ln - 1].replace(/\} catch \(err\)[^}]*};/, '')
    }

    compiled = compiledLines.join('\n')
  }

  if (!opts.excludeContent) {
    generator.setSourceContent(filename, source)
  }

  return { data: compiled, map: generator.toString() }
}
