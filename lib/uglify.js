/**
 * Created by jfengjiang on 2014/12/5.
 */

var path = require('path');
var through = require('through2');
var uglify = require('uglify-js');
var jsp = uglify.parser;
var pro = uglify.uglify;
var cleanCSS = require('clean-css');


module.exports = function(){
    return through.obj(function(file, encoding, callback){
        switch(path.extname(file.path)){
            case '.js':
                var ast = jsp.parse(file.contents.toString()); // parse code and get the initial AST
                ast = pro.ast_mangle(ast); // get a new AST with mangled names
                ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
                file.contents = new Buffer(pro.gen_code(ast)); // compressed code here
                break;
            case '.css':
                file.contents = new Buffer(new cleanCSS().minify(file.contents.toString()));
                break;
        }

        this.push(file);
        return callback();
    });
};