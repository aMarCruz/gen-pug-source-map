[![Windows build][w-build-image]][w-build-url]
[![Build status][build-image]][build-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]

# gen-pug-source-map

Source map v3 generation for [Pug](https://pugjs.org) v2.x (aka Jade).

Designed as a node.js helper for [Brunch](http://brunch.io/) and [Rollup](http://rollupjs.org/) plugins in my current projects, I hope it will be useful to you.


**IMPORTANT:**

v0.1.1 is a complete rewrite, please see [What's New](#whats-new)


## Install

```bash
npm install gen-pug-source-map --save
```

## Syntax

```js
genPugSourceMap( compiledFileName [, source], compiled [, options] ) -> { data, map }
```

Mustly, `compiledFileName` will be the name of the root .pug template (the generator adds `.js` to this) and `options` will contain `basedir` with the same value that you pass to the compiler.

From v0.1.1 `source` is deprecated, as the sources are readed from the compiled code.


## Usage

Compile the .pug with `compileDebug:true` and pass the filename, generated code, and options to the source map generator.

It returns a plain JavaScript object with `{data, map}`, where `data` is the generated code and `map` is a JSON string representation of the source map.

By default, the generator uses file names relative to the current directory, removes the inlined templates and lines with debugging information, and inserts the templates in the source map (useful for remote debugging), but you can change this behavior with this options:

* `basedir` - Allows to define the root directory of the source files for using relative names.
* `keepDebugLines` - Keep the lines with debugging information from the generated code.
* `excludeContent` - Does not include the original source(s) in the source map.

If `basedir` is missing or empty, defaults to the current directory.

Inlined templates and debugging information are used by the pug runtime to display errors, something useful in development mode. For production, better use the defaults as the size of the generated code is about 4x with this info.

## Example

```js
const genPugSourceMap = require('gen-pug-source-map')
const pug = require('pug')

function compile (filename, source, options) {
  options.filename = filename
  options.compileDebug = true             // REQUIRED!
  options.inlineRuntimeFunctions = false  // recommended, use global `pug` runtime

  const output = pug.compileClient(source, options)
  const result = genPugSourceMap(filename, output.body, { basedir: options.basedir })

  return result   // {data, map}
}
```

**Note:**

The signature of v0.1.0 `(filename, source, compiled [, options])` is supported, but the `source` parameter is deprecated and will be removed in v0.2.x

## What's New

The new property `basedir` allows to define the root directory of the source files, for insertion as relative names in the property `sources` of the source map. It defaults to the current directory.

Now the source templates are extracted from the compiled code, you don't need to pass this parameter.

See the [CHANGELOG](https://github.com/aMarCruz/gen-pug-source-map/blob/master/CHANGELOG.md) for more changes.

[npm-image]:      https://img.shields.io/npm/v/gen-pug-source-map.svg
[npm-url]:        https://www.npmjs.com/package/gen-pug-source-map
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/gen-pug-source-map/blob/master/LICENSE

[build-image]:    https://img.shields.io/travis/aMarCruz/gen-pug-source-map.svg
[build-url]:      https://travis-ci.org/aMarCruz/gen-pug-source-map
[w-build-image]:  https://ci.appveyor.com/api/projects/status/9tvs61pk0qpi09rr/branch/master?svg=true
[w-build-url]:    https://ci.appveyor.com/project/aMarCruz/rollup-plugin-jscc/branch/master
