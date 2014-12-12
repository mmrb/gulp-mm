/**
 * Created by jfengjiang on 2014/12/10.
 */
var through = require('through2');
var path = require('path');

module.exports = function(fn){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var regex = /(?:<(link|script)[^>]+(href|src)=(["']))([^>]+\.\w+)(?:\3[^>]*)>/g;
        var content = file.contents.toString();
        content = content.replace(regex, function(matcher, $1, $2, $3, $4){

            var replacement = fn({
                dirname: path.dirname(file.relative),
                basename: path.basename($4),
                extname: path.extname($4)
            });
            return matcher.replace($4, replacement).replace('\\', '/');
        });

        file.contents = new Buffer(content);
        this.push(file);
        return callback();
    });
};