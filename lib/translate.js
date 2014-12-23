/**
 * Created by jfengjiang on 2014/12/22.
 */

var lodash = require('lodash');
var through = require('through2');

function translate(content, opts){

    return content
        .replace(/<%@/g, opts.opentag)
        .replace(/%>/g, opts.closeTag)
        .replace(/SetVar\((\w*)\s*,\s*([^)]+)\)/g, ' var $1 = "$2";')
        .replace(/([\(]?)GetVar\(\s*(\w+)\s*\)/g, function(matcher, $1, $2){
            if($1){
                return '(' + $2;
            }else{
                return '= ' + $2;
            }
        })
        .replace(/<%\s*(else\s+)?if\s*\(\s*([\w\(\)]+)\s*=\s*([^)]*)\)\s*%>/g, function(matcher, $1, $2, $3){
            if($3){
                return matcher.replace('=', ' == ').replace($3, '"' + $3 + '"').replace(opts.closeTag, '{' + opts.closeTag);
            }else{
                return matcher.replace('=', '').replace($2, '!' + $2).replace(opts.closeTag, '{' + opts.closeTag);
            }
        })
        .replace(/<%\s*else([^%]*)%>/g, function(matcher, $1){
            if($1){
                return matcher.replace(opts.opentag, opts.opentag + '}');
            }else{
                return matcher.replace(opts.opentag, opts.opentag + '}').replace(opts.closeTag, '{' + opts.closeTag);
            }
        })
        .replace(/<%\s*endif\s*%>/g, opts.opentag + '}' + opts.closeTag);
}

module.exports = function(){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var opts = lodash.extend({opentag: '<%', closeTag: '%>'}, {});
        file.contents = new Buffer(translate(file.contents.toString(), opts));

        this.push(file);
        return callback();
    });
};