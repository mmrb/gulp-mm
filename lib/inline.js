/**
 * Created by jfengjiang on 2014/12/5.
 */


var path = require('path');
var fs = require('fs');
var through = require('through2');
var Sync = require('sync');
var less = require('less');
var uglify = require('uglify-js');
var cleanCSS = require('clean-css');

var Error = require('./error');

/**
 * parse inline
 * @param content content of this file
 * @param context full file name of this
 * @returns {String}
 */
function parse(content, context){
    //
    var inline = /__inline\((["'])([^"']+)\1\);?|<link[^>]+href=(["'])([^>"'\?]+)\?__inline\1[^>]+|<script[^>]+src=(["'])([^>"'\?]+)\?__inline\1[^>]+>/gi;

    content = content.replace(inline, function(match, $1, $2, $3, $4, $5, $6, offset, source){

        var filename = '';

        if($2){ // __inline("");
            filename = $2;
        }
        else if($4){ // link
            filename = $4;
        }
        else if($6){
            filename = $6;
        }

        var abs = path.join(path.dirname(context), filename);
        var str = fs.readFileSync(abs, 'utf-8');

        str = parse(str, abs);
        var context_ext = path.extname(context);
        var extname = path.extname(abs);

        if(context_ext === '.html'){
            switch(extname){
                case '.css':
                    // add style tag
                    str = new cleanCSS().minify(str);
                    str = '<style>\n' + str + '\n</style>';
                    break;
                case '.js':
                    var ast = uglify.parse(str);
                    ast.figure_out_scope();
                    ast.compute_char_frequency();
                    ast.mangle_names();
                    str = ast.print_to_string();
                    str = '<script>\n' + str + '\n</script>\n';
                    break;
                case '.less':
                    str = match;
                    break;
                case '.html':
                default:
                    break;
            }
        }

        return str;
    });

    return content;
}


//// exporting the plugin
module.exports = function(){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var output = parse(file.contents.toString(), file.path, this);
        file.contents = new Buffer(output);
        this.push(file);
        return callback();
    });
};