/**
 * Created by jfengjiang on 2014/12/5.
 */

var http = require('http');
var express = require('express');
var socket = require('socket.io');
var gutil = require('gulp-util');

/**
 * _sockets
 * @type {Array}
 */
var _sockets = [];

/**
 * start server
 * @param {Object} options default: {port: 8080}
 */
function start(options){
    options = options || {};

    if(!options.port){
        options.port = 8080;
    }

    if(!options.root){
        options.root = __dirname;
    }

    var app = express();
    var server = http.Server(app);
    var io = socket(server);

    server.listen(options.port, function(){
        var url = 'http://127.0.0.1' + options.port == 80 ? '' : ':' + options.port;
        console.log('[' + gutil.colors.green('server') + '] start on %s', url);
    });

    // static root directory
    app.use(express.static(options.root));
    // start server

    // listen with socket
    io.on('connection', function(socket){
        _sockets.push(socket);

        socket.on('disconnect', function(){
            var index = _sockets.indexOf(socket);
            if(index != -1){
                _sockets.splice(index, 1);
            }
        });
    });
}

/**
 * emit socket event
 * @param event
 * @param data
 */
function emit(event, data){
    _sockets.forEach(function(socket){
        if(socket) socket.emit(event, data);
    });
}

module.exports = start;
module.exports.start = start;
module.exports.emit = emit;