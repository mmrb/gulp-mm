/**
 * Created by jfengjiang on 12/15/14.
 * fork from https://github.com/aslansky/gulp-sprite
 */

var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');
var Image = require('node-images');
var lodash = require('lodash');

var Error = require('./error');

module.exports = function (opt) {
    var regex = /url\((["'])([^"']+)\?__sprite\1\)/g;
    opt = lodash.extend({margin: 5, preprocessor: 'less', imagePath: '', prefix: '', orientation: 'vertical'}, opt);

    /**
     * parse TO SPRITE image path
     * @param {String} content - css file
     * @param {String} context - context
     * @returns {Array}
     */
    function grepImages(content, context){
        var result = [];
        var matcher;

        while(matcher = regex.exec(content)){
            var filename = path.join(context, matcher[2]);
            var index = lodash.indexOf(result, filename);
            if(index < 0){
                result.push(filename);
            }
        }

        return result;
    }

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        var sprites = [];
        var ctxWidth = 0;
        var ctxHeight = 0;
        // match all url("img_to_sprite.jpg?__sprite")
        var images = grepImages(file.contents.toString(), path.dirname(file.path));

        lodash(images).forEach(function(image){
            var abs = path.join(path.dirname(file.path), image);
            //TODO if file not exist
            var img = Image(abs);

            sprites.push({
                'img': img,
                'x': opt.orientation === 'vertical' ? opt.margin : ctxWidth + opt.margin,
                'y': opt.orientation === 'vertical' ? ctxHeight + opt.margin: opt.margin
            });

            if (opt.orientation === 'vertical') {
                ctxHeight = ctxHeight + img.height() + 2 * opt.margin;
                if (img.width() + 2 * opt.margin > ctxWidth) {
                    ctxWidth = img.width() + 2 * opt.margin;
                }
            }
            else {
                ctxWidth = ctxWidth + img.width() + 2 * opt.margin;
                if (img.height() + 2 * opt.margin > ctxHeight) {
                    ctxHeight = img.height() + 2 * opt.margin;
                }
            }
        });

        var canvas = Image(ctxWidth, ctxHeight);
        lodash(sprites).forEach(function(sprite){
            canvas.draw(sprite.img, sprite.x, sprite.y);
        });
        sprites = [];

        var sprite = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: path.join(path.dirname(file.path), path.basename(file.path, '.css') + '_z.png'),
            contents: canvas.encode('png')
        });

        this.push(sprite);
        this.push(file);
        return callback();
    });
};