/**
 * Created by jjf001 on 12/27/14.
 */

var lodash = require('lodash');
var through = require('through2');

/**
 * parse section
 * @param content
 * @param opts
 * @returns {string}
 */
function parseSection(content, opts){
    return content.replace(/<%#include\(#(\w+)\)%>/g, opts.opentag + 'block $1' + opts.closeTag + opts.opentag + 'endblock' + opts.closeTag)
        .replace(/<%#([\w]+)%>([\s\S]*)(<%#\/\1%>)/g, opts.opentag + 'block $1' + opts.closeTag + '$2' + opts.opentag + 'endblock' + opts.closeTag);
}

/**
 * parse include
 * @param content
 * @param opts
 * @returns {parseInclude}
 */
function parseInclude(content, opts){
    return content.replace(/<%#include\(([\w\.\/]+)\)%>/g, opts.opentag + 'extends "$1"' + opts.closeTag);
}

module.exports = function(){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var opts = lodash.extend({opentag: '{% ', closeTag: ' %}'}, {});
        var content = file.contents.toString();

        content = parseSection(content, opts);
        content = parseInclude(content, opts);
        file.contents = new Buffer(content);

        this.push(file);
        return callback();
    });
};