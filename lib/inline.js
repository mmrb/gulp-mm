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
    var inline = /__inline\((["'])([^"']+)\1\);?|<link[^>]+href=(["'])([^>"'\?]+)\?__inline\1[^>]+>|<script[^>]+src=(["'])([^>"'\?]+)\?__inline\1[^>]+><\/script>|<img[^>]+src=(["'])([^>"'\?]+)\?__inline\1[^>]+\/>/gi;

    content = content.replace(inline, function(match, $1, $2, $3, $4, $5, $6, $7, $8, offset, source){

        var filename = '';

        if($2){ // __inline("");
            filename = $2;
        }
        else if($4){ // link
            filename = $4;
        }
        else if($6){
            filename = $6;
        }else if($8){
            filename = $8;
        }

        var abs = path.join(path.dirname(context), filename);
        var buffer = fs.readFileSync(abs);

        var context_ext = path.extname(context);
        var extname = path.extname(abs);
        var binary = ['.jpg', '.png', '.gif'];

        if(binary.indexOf(extname) < 0){
            buffer = parse(buffer.toString('utf-8'), abs);
        }

        if(context_ext === '.html'){
            switch(extname){
                case '.css':
                    // add style tag
                    buffer = new cleanCSS().minify(buffer);
                    buffer = '<style>\n' + buffer + '\n</style>';
                    break;
                case '.js':
                    var ast = uglify.parse(buffer);
                    ast.figure_out_scope();
                    ast.compute_char_frequency();
                    ast.mangle_names();
                    buffer = ast.print_to_string();
                    buffer = '<script>\n' + buffer + '\n</script>\n';
                    break;
                case '.less':
                    buffer = match;
                    break;
                case '.png':
                case '.jpg':
                case '.gif':
                    buffer = 'data:image/png;base64,' + buffer.toString('base64');
                    break;
                case '.html':
                default:
                    break;
            }
        }

        return buffer;
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