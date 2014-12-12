/**
 * Created by jfengjiang on 2014/12/5.
 */

var path = require('path');
var through = require('through2');
var uglify = require('uglify-js');
var cleanCSS = require('clean-css');


module.exports = function(){
    return through.obj(function(file, encoding, callback){
        switch(path.extname(file.path)){
            case '.js':
                var ast = uglify.parse(file.contents.toString());
                ast.figure_out_scope();
                ast.compute_char_frequency();
                ast.mangle_names();
                file.contents = new Buffer(ast.print_to_string());
                break;
            case '.css':
                file.contents = new Buffer(new cleanCSS().minify(file.contents.toString()));
                break;
        }

        this.push(file);
        return callback();
    });
};