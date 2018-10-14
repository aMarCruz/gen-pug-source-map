# gen-pug-source-map

[![Windows build][w-build-image]][w-build-url]
[![Build status][build-image]][build-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]

Source map v3 generation for [Pug](https://pugjs.org) v2.x (aka Jade).

Designed as a node.js helper for [Brunch](http://brunch.io/) and [Rollup](http://rollupjs.org/) plugins in my current projects, I hope it will be useful to you.


## Install

```bash
npm install gen-pug-source-map --save
```

## Syntax

```js
genPugSourceMap( compiledFileName, compiledTemplate [, options] ) -> { data, map }
```

Mustly, `compiledFileName` will be the name of the root .pug template (the generator adds `.js` to this) and `options` will contain `basedir` with the same value that you pass to the compiler.


## Usage

Compile the .pug with `compileDebug:true` and pass the filename, generated code, and options to the source map generator.

It returns a plain JavaScript object with `{data, map}` properties, where `data` is the generated code and `map` is an object containing a raw source map.

By default, the generator uses file names relative to the current directory, removes the inlined templates and lines with debugging information, and inserts the templates in the source map (useful for remote debugging), but you can change this behavior with this options:

* `basedir` - Define the root directory of the source files with relative names.
* `keepDebugLines` - Keep the lines with debugging information in the generated code.
* `excludeContent` - Does not include the original source(s) in the resulting source map.

If `basedir` is missing or empty, it defaults to the current directory.

Inlined templates and debugging information are used by the pug runtime to display errors, something useful in development mode. For production, better use the default `keepDebugLines:false` as the size of the generated code is about 4x with debugging info.

## Example

```js
const genPugSourceMap = require('gen-pug-source-map')
const pug = require('pug')

function compile (filename, source, options) {
  options.filename = filename             // REQUIRED
  options.compileDebug = true             // REQUIRED
  options.inlineRuntimeFunctions = false  // recommended, use the global `pug` runtime

  const output = pug.compileClient(source, options)
  const result = genPugSourceMap(filename, output.body, { basedir: options.basedir })

  return result   // {data, map}
}
```

**Note:**

The signature of v0.1.0 `(filename, source, compiled [, options])` is supported, but the `source` parameter is deprecated and will be removed in v0.2.x


## Known Issues

The generated map does not allow to set breakpoint on `insert` directives nor in the first line of inserted files.


## What's New

See changes in the [CHANGELOG](https://github.com/aMarCruz/gen-pug-source-map/blob/master/CHANGELOG.md).

[npm-image]:      https://img.shields.io/npm/v/gen-pug-source-map.svg
[npm-url]:        https://www.npmjs.com/package/gen-pug-source-map
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/gen-pug-source-map/blob/master/LICENSE

[build-image]:    https://img.shields.io/travis/aMarCruz/gen-pug-source-map.svg
[build-url]:      https://travis-ci.org/aMarCruz/gen-pug-source-map
[w-build-image]:  https://ci.appveyor.com/api/projects/status/2x4765y5780hdti6/branch/master?svg=true
[w-build-url]:    https://ci.appveyor.com/project/aMarCruz/gen-pug-source-map/branch/master
