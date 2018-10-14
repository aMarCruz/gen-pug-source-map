'use strict'

const SourceMapGenerator = require('source-map').SourceMapGenerator
const path = require('path')

const relative = (basedir, fname) => path.relative(basedir, fname).replace(/\\/g, '/')

/**
 * Extract the source templates from the given lines.
 */
const extractSources = (compiledLines) => {
  // Pug give us the sources in `var pug_debug_sources = { ... };\n`
  const debugSrc = 'var pug_debug_sources = {'
  let sources = false

  for (let ix = 0; ix < compiledLines.length; ix++) {
    const line = compiledLines[ix]
    if (line.slice(-2) !== '};') {
      continue
    }

    let pos = line.indexOf(debugSrc)
    if (~pos) {
      pos += debugSrc.length
      try {
        sources = JSON.parse(line.slice(pos - 1, -1))
        compiledLines[ix] = line.slice(0, pos) + '};'
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err + ' (extractSources)')
        sources = false
      }
      break
    }
  }

  return sources
}

/**
 * Adds the given filename to sourcesContent, as relative to basedir
 */
const addSourceContent = (generator, basedir, fname, debugSources) => {
  const source = debugSources[fname]
  generator.setSourceContent(relative(basedir, fname), source || null)
}

/**
 * Generates the pair code / sourcemap
 */
function genPugSourceMap (filename, compiled, options) {
  options = options || {}

  const basedir = options.root ? path.resolve(path.normalize(options.root)) : process.cwd()
  filename = path.resolve(basedir, path.normalize(filename))

  const reLineAndPath = /;pug_debug_line = ([0-9]+);pug_debug_filename = "([^"]*)";/
  const reEntryPoint  = /^function [$\w]+\(locals\)\{var pug_html\s*=/
  const compiledLines = compiled.split('\n')
  const debugSources  = extractSources(compiledLines)
  const matchedFiles  = {}
  let lineCount = 0
  let lastLine = -1

  if (!debugSources) {
    throw new Error('Cannot get the source code. Please compile with compileDebug:true.')
  }

  const mapGenerator = new SourceMapGenerator({
    file: relative(basedir, filename) + '.js',
  })

  // allow breakpoints in 1st line, better support is in To Do
  if (reEntryPoint.test(compiledLines[0])) {
    mapGenerator.addMapping({
      generated: { line: 1, column: 0 },
      original: { line: 1, column: 0 },
      source: relative(basedir, filename),
    })
  }

  compiledLines.forEach((line, lineno) => {
    lineCount++

    const match = line.match(reLineAndPath)
    if (!match) {
      return
    }

    const originalLine = ~~match[1]
    if (originalLine <= 0) {
      return
    }

    // avoid normalize the path here to match the name in debugSources
    const fname = match[2] && match[2].replace(/\\u002F/g, '/').replace(/\\\\/g, '\\') || filename

    let matchedLines = matchedFiles[fname]
    if (!matchedLines) {
      // new included file - add source content
      matchedFiles[fname] = matchedLines = []

      if (!options.excludeContent) {
        addSourceContent(mapGenerator, basedir, fname, debugSources)
      }
    }

    // remove pug debug line from generated code, adjust line counter
    if (!options.keepDebugLines) {
      const len = match[0].length

      compiledLines[lineno] = line.length === len
        ? '' : line.slice(0, match.index) + line.slice(match.index + len)
      if (!compiledLines[lineno].trim()) {
        compiledLines[lineno] = '\0'
        lineCount--
      }
    }

    // have a recognized generated line?
    if (!/^;pug_debug/.test(compiledLines[lineno + 1])) {
      let generatedLine = lineCount + 1

      lastLine = lineno + 1
      if (compiledLines[lastLine].slice(0, 2) === '//' &&
          compiledLines[lastLine + 1] === ';(function(){') {
        generatedLine++
        lastLine++
      }

      // adds the new mapping if line is not matched yet
      if (matchedLines.indexOf(originalLine) < 0) {
        matchedLines.push(originalLine)
        mapGenerator.addMapping({
          generated: {
            line: generatedLine,
            column: 0,
          },
          original: {
            line: originalLine,
            column: 0,
          },
          source: relative(basedir, fname),
        })
      }
    }
  })

  // use the resulting non-empty lines to recreate the code
  if (!options.keepDebugLines) {

    // split the last row having the root catch clause
    if (~lastLine) {
      const line = compiledLines[lastLine]
      const pos = line.lastIndexOf(';}.call(this,') + 1
      if (pos && line.lastIndexOf('rethrow(err,') > pos) {
        compiledLines[lastLine] = line.slice(0, pos) + '\n' + line.slice(pos)
      }
    }

    compiled = compiledLines.filter((line) => line !== '\0').join('\n')
  }

  return { data: compiled, map: mapGenerator.toJSON() }
}

module.exports = genPugSourceMap
