# Changes for gen-pug-source-map

### 2016-10-32 v0.1.0

Complete rewrite, many fixes, almost ready for production

- The new property `basedir` allows to define the root directory of the source files.
- Source file names are relative to `basedir` or the current directory if `basedir` is not given.
- Fix: reading source files multiple times, now source is extracted from the compiled code.
- Fix: sometimes the line number is shifted by one.
- Better code cleanup, removal of empty lines.

### 2016-10-32 v0.1.0

Initial release
