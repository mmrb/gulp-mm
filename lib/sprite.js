/**
 * Created by jfengjiang on 12/15/14. 
 * fork from https://github.com/aslansky/gulp-sprite
 */

var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');
var Images = require('node-images');
var lodash = require('lodash');

var Error = require('./error');

module.exports = function (opt) {
    opt = lodash.extend({margin: 5, preprocessor: 'less', imagePath: '', prefix: '', orientation: 'vertical'}, opt);
    var firstFile;
    var sprites = [];
    var ctxWidth = 0;
    var ctxHeight = 0;

    /**
     * parse TO SPRITE image path
     * @param {String} content - css file
     * @returns {RegExp}
     */
    function grepImages(content){
        var regex = /url\((["'])([^"']+)\?__sprite\1\)/g;
        var result = [];
        var matcher;

        while(matcher = regex.exec(content)){
            result.push(matcher[2]);
        }

        return regex;
    }

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        // match all url("img_to_sprite.jpg?__sprite")
        var images = grepImages(file.contents.toString());

        //
        lodash(images).forEach(function(image){
            var abs = path.join(path.dirname(file.path), image);
            //TODO if file not exist
            var src = fs.readFileSync(abs);
            var img = new Image();
            img.src = src;

            sprites.push({
                'img': img,
                'x': opt.orientation === 'vertical' ? opt.margin : ctxWidth + opt.margin,
                'y': opt.orientation === 'vertical' ? ctxHeight + opt.margin: opt.margin
            });

            if (opt.orientation === 'vertical') {
                ctxHeight = ctxHeight + img.height + 2 * opt.margin;
                if (img.width + 2 * opt.margin > ctxWidth) {
                    ctxWidth = img.width + 2 * opt.margin;
                }
            }
            else {
                ctxWidth = ctxWidth + img.width + 2 * opt.margin;
                if (img.height + 2 * opt.margin > ctxHeight) {
                    ctxHeight = img.height + 2 * opt.margin;
                }
            }
        });

        var canvas = Images(ctxWidth, ctxHeight);
        lodash(sprites).forEach(function(sprite){
            canvas.draw(sprite.img, sprite.x, sprite.y);
        });

        var sprite = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: path.join(path.dirname(file.path), path.basename(file.path), '_z.png'),
            contents: canvas.encode('png')
        });

        this.push(sprite);
        this.push(file);
        return callback();
    });
};