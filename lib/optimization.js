/**
 * Created by jfengjiang on 2014/12/10.
 */
var through = require('through2');

module.exports = function(){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var regex = /(?:<link[^>]+href=(["'])[^>]+)(\.\w+)(?:\1[^>]+)>/g;
        var map = {'.less': '.css'};
        var content = file.contents.toString();
        content = content.replace(regex, function(matcher, $1, $2, offset, source){
            var to = map[$2];
            if(to){
                matcher = matcher.replace($2, to);
            }

            return matcher;
        });

        file.contents = new Buffer(content);

        this.push(file);
        return callback();
    });
};