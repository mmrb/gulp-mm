/**
 * Created by jfengjiang on 12/14/14.
 */

var fs = require('fs');
var path = require('path');
var through = require('through2');

module.exports = function(){

    var socket_io = fs.readFileSync(__dirname + '/socket.io.js', 'utf-8');
    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var html = '<script>\n' +
                    socket_io +
                    '\n' +
                    'var socket = io("/");\n' +
                    'socket.on("change", function(data){\n' +
                        'window.location.reload();\n' +
                    '});\n' +
                    '</script>\n' +
                    '</body>';

        if(path.extname(file.path) === '.html'){
            file.contents = new Buffer(file.contents.toString().replace(/<\/body>/gi, html))
        }
        this.push(file);
        return callback();
    });
};