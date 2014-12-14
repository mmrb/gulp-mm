/**
 * Created by jfengjiang on 12/14/14.
 */

var path = require('path');
var through = require('through2');
var template = require('art-template');

module.exports = function(data){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        if(path.extname(file.path) === '.html'){
            data = data || {};
            file.contents = new Buffer(template.render(file.contents.toString(), data));
        }
        this.push(file);
        return callback();
    });
};