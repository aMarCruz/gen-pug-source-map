/* eslint-disable */

const genSourceMap = require('../')
const assert = require('assert')

const output =
  'function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;' +
  'try {var pug_debug_sources = {"app\u002Fmodules\u002Forders\u002Fviews\u002Finc\u002Fdetail-comments.pug":"undefined"};\n' +
  ';pug_debug_line = 1;pug_debug_filename = "app\u002Fmodules\u002Forders\u002Fviews\u002Finc\u002Fdetail-comments.pug";\n' +
  'pug_html = pug_html + "\u003Cundefined\u003E\u003C\u002Fundefined\u003E";} catch (err) ' +
  '{pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;};'

const result = genSourceMap('app/modules/orders/views/inc/detail-comments.pug', output, '')

assert(typeof result.data == 'string')
assert(typeof result.map  == 'string')
