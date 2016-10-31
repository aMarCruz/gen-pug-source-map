[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# gen-pug-source-map

Source map generation for [Pug](https://pugjs.org) v2.x (aka Jade).

Designed as helper for plugins of Brunch and Rollup in my current projects, I hope it will be useful for you.

## Install

```bash
npm install gen-pug-source-map --save
```

## Usage

Compile the .pug with `compileDebug:true` and pass the filename, original source, generated code, and options to the source map generator.

It returns a plain JavaScript object with `{data, map}`, where `data` is the generated code and `map` is a JSON representation of the source map (as string).

By default, the generator removes lines with debugging information (used by the pug runtime to display errors), and copy the source template(s) in the source map (useful for remote debugging), but you can ovewrite this with options:

* `keepDebugLines` - Keep the lines with debugging information from the generated code.
* `excludeContent` - Does not include the original source(s) in the source map.

## Example

```js
const genSourceMap = require('gen-pug-source-map')
const pug = require('pug')

function compile (filename, source, options) {
  options.filename = filename
  options.compileDebug = true     // important!

  const output = pug.compileClient(source, options)
  const result = genSourceMap(filename, output.body, source)

  return result   // {data, map}
}
```

[npm-image]:      https://img.shields.io/npm/v/gen-pug-source-map.svg
[npm-url]:        https://www.npmjs.com/package/gen-pug-source-map
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/gen-pug-source-map/blob/master/LICENSE
