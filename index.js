/**
 * Created by jfengjiang on 2014/12/5.
 */

var watch = require('gulp-watch');
var less = require('gulp-less');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

var uglify = require('./lib/uglify');
var server = require('./lib/server');
var inline = require('./lib/inline');
var optimization = require('./lib/optimization');
var resolve = require('./lib/resolve');
var live = require('./lib/live');
var compile = require('./lib/compile');
var sprite = require('./lib/sprite');
var translate = require('./lib/translate');



var mm = {
    /**
     * gulp-watch
     */
    watch: watch,
    /**
     * gulp-less
     */
    less: less,
    /**
     * gulp-rename
     */
    rename: rename,
    /**
     * gulp-replace
     */
    replace: replace,
    /**
     * uglify
     */
    uglify: uglify,
    /**
     * server with socket
     */
    server: server,
    /**
     * inline
     */
    inline: inline,
    /**
     * optimization
     */
    optimization: optimization,
    /**
     * resolve
     */
    resolve: resolve,
    /**
     * live
     */
    live: live,
    /**
     * compile
     */
    compile: compile,
    /**
     * sprite
     */
    sprite: sprite,
    /**
     * translate
     */
    translate: translate
};


module.exports = mm;