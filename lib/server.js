/**
 * Created by jfengjiang on 2014/12/5.
 */

var fs = require('fs');
var path = require('path');
var lodash = require('lodash');
var http = require('http');
var express = require('express');
var socket = require('socket.io');

var parseurl = require('parseurl');

var nunjucks = require('nunjucks');

/**
 * _sockets
 * @type {Array}
 */
var _sockets = [];

function handler(root){
    return function(req, res, next){
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next()
        }

        var filename = parseurl(req).pathname;
        if(filename === '/'){
            filename = '/index.html';
        }

        var abs = path.join(root, filename);
        if(!fs.existsSync(abs)){
            return next();
        }

        if(path.extname(abs) !== '.html'){
            return fs.createReadStream(abs).pipe(res);
        }

        var content = fs.readFileSync(abs, 'utf-8');
        var output = nunjucks.render(content, {});

        return res.send(output);
    }
}

/**
 * start server
 * @param {Object} options default: {port: 8080}
 */
function start(options){
    var opts = lodash.extend({port: 8080, root: __dirname}, options);

    var app = express();
    var server = http.Server(app);
    var io = socket(server);

    server.listen(opts.port, function(){
        var url = 'http://127.0.0.1' + (opts.port == 80 ? '' : ':' + opts.port);
        console.log('[' + gutil.colors.green('server') + '] start on %s', url);
    });

    // handler root directory
    app.use(handler(opts.root));
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