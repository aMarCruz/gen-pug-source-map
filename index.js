'use strict'

var SourceMapGenerator = require('source-map').SourceMapGenerator
var path = require('path')

/*
  Pug give us the sources in `var pug_debug_sources = { ... };\n`
*/
function extractSources (compiledLines) {
  var debugSrc = 'var pug_debug_sources = {'
  var sources  = {}

  for (var ix = 0; ix < compiledLines.length; ix++) {
    var line = compiledLines[ix]
    if (line.slice(-2) !== '};') continue

    var pos = line.indexOf(debugSrc)
    if (~pos) {
      pos += debugSrc.length
      try {
        sources = JSON.parse(line.slice(pos - 1, -1))
        compiledLines[ix] = line.slice(0, pos) + '};'
      } catch (_) {
        sources = {}
      }
      break
    }
  }

  return sources
}

/*
  Adds the given filename to sourcesContent, as relative to basedir
*/
function addSourceContent (generator, basedir, fname, debugSources) {
  var source = debugSources[fname]

  generator.setSourceContent(path.relative(basedir, fname), source)
}

/*
  Generates the pair code / sourcemap
*/
function genSourceMap (filename, source, compiled, options) {

  if (arguments.length < 3) {
    compiled = source
  } else if (arguments.length < 4 && compiled && typeof compiled == 'object') {
    options  = compiled
    compiled = source
  }

  var opts = options || {}
  var basedir = opts.root
  basedir  = basedir ? path.resolve(path.normalize(basedir)) : process.cwd()
  filename = path.normalize(filename)

  var generator = new SourceMapGenerator({
    file: path.relative(basedir, filename) + '.js' //,
    //sourceRoot: basedir
  })
  var reLineAndPath = /;pug_debug_line = ([0-9]+);pug_debug_filename = "([^"]*)";/
  var compiledLines = compiled.split('\n')
  var debugSources  = extractSources(compiledLines)
  var filesMatched  = {}
  var lineCount = 0
  var lastLine = -1

  compiledLines.forEach(function (line, lineno) {
    lineCount++

    var match = line.match(reLineAndPath)
    if (!match) return

    var originalLine = ~~match[1]
    if (originalLine <= 0) return

    var fname = match[2] && match[2].replace(/\\u002F/g, '/') || filename

    // remove pug debug line from generated code, adjust line counter
    if (!opts.keepDebugLines) {
      var len = match[0].length

      compiledLines[lineno] = line.length === len ? ''
                            : line.slice(0, match.index) + line.slice(match.index + len)
      if (!compiledLines[lineno].trim()) {
        compiledLines[lineno] = '\0'
        lineCount--
      }
    }

    if (!filesMatched[fname]) {
      // new include file - add to sourcemap
      filesMatched[fname] = {}

      if (!opts.excludeContent) {
        addSourceContent(generator, basedir, fname, debugSources)
      }
    }

    // already matched?
    if (!/^;pug_debug/.test(compiledLines[lineno + 1])) {
      var generatedLine = lineCount + 1

      lastLine = lineno + 1
      if (compiledLines[lineno].slice(0, 2) === '//' &&
          compiledLines[lastLine] === ';(function(){') {
        generatedLine++
        lastLine++
      }

      //filesMatched[fname][originalLine] = true
      generator.addMapping({
        generated: {
          line: generatedLine,
          column: 0
        },
        source: path.relative(basedir, fname),
        original: {
          line: originalLine,
          column: 0
        }
      })
    }
  })

  // use the resulting non-empty lines to recreate the code
  if (!opts.keepDebugLines) {

    // split the last row having the root catch clause
    if (~lastLine) {
      var line = compiledLines[lastLine]
      var pos = line.lastIndexOf(';}.call(this,') + 1
      if (pos && line.lastIndexOf('rethrow(err,') > pos) {
        compiledLines[lastLine] = line.slice(0, pos) + '\n' + line.slice(pos)
      }
    }

    compiled = compiledLines.filter((line) => line !== '\0').join('\n')
  }

  return { data: compiled, map: generator.toString() }
}

module.exports = genSourceMap
