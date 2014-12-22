/**
 * Created by jfengjiang on 2014/12/22.
 */

var path = require('path');
var through = require('through2');

function translate(content){

    // replace <%@SetVar(var,val)%>
    content = content.replace(/<%@SetVar\((\w+),[\s]*([\w\u4e00-\u9fa5]+)\)%>/gi, function(matcher, $1, $2, offset, source){
        return '<% var {{variable}} = "{{value}}";%>'.replace('{{variable}}', $1).replace('{{value}}', $2);
    });

    // replace <%@GetVar(page_title)%>
    content = content.replace(/<%@GetVar\((\w+)\)%>/, function(matcher, $1, offset, source){
        return '<%= {{variable}} %>'.replace('{{variable}}', $1);
    });


}

module.exports = function(){

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }



        this.push(file);
        return callback();
    });
};