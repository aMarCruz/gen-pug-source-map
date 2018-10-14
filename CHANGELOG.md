# Changes for gen-pug-source-map

### [1.0.0] - 2018-10-14

### Changed
- Using ES6
- The minimum required version of node.js is 6.0

### Removed
- Remove the second parameter (the source code) from the main function.

### Updated
- Update test and devDependencies

## [0.1.2] - 2016-11-06

- The returned object contains a raw source map in its `map` property, instead the JSON string of previous versions.
- Now, the generator raises an exception if the input does not contains debug information.
- First attempt to support the entry point of the template, information not provided by the pug compiler.

## [0.1.0] - 2016-10-32

Complete rewrite, many fixes, almost ready for production

- The new property `basedir` allows to define the root directory of the source files.
- Source file names are relative to `basedir` or the current directory if `basedir` is not given.
- Fix: reading source files multiple times, now source is extracted from the compiled code.
- Fix: sometimes the line number is shifted by one.
- Better code cleanup, removal of empty lines.
- Basic but complete test.

## [0.1.0] - 2016-10-32

Initial release
