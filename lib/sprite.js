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
    var regex = /background(?:-image)?:[\s\w]*url\((["']?)([^"';]+)\?__sprite\1\)[^;]*;?/g;
    opt = lodash.extend({margin: 5, preprocessor: 'less', imagePath: '', prefix: '', orientation: 'vertical'}, opt);

    return through.obj(function(file, encoding, callback){

        if (file.isNull()) {
            return callback(null, file);
        }

        if(file.isStream()){
            return callback(Error('Streaming is not supported'));
        }

        if(regex.test(file.contents.toString())){
            // store image fragment {img: new Buffer(), x: 0, y: 0}
            var sprites = [];
            // output sprite image width
            var ctxWidth = 0;
            // output sprite image height
            var ctxHeight = 0;
            // output sprite image filename
            var filename = path.join(path.dirname(file.path), path.basename(file.path, '.css') + '_z.png');

            var content = file.contents.toString();
            content = content.replace(regex, function(matcher, $1, $2){
                var abs = path.join(path.dirname(file.path), $2);
                var sprite;

                if(!fs.existsSync(abs)){
                    return matcher;
                }

                // if image fragment exist
                var index = lodash.findIndex(sprites, {abs: abs});
                if(index !== -1){
                    sprite = sprites[index];
                }else{
                    //TODO if file not exist
                    var img = Image(abs);
                    sprite = {
                        'abs': abs,
                        'img': img,
                        'x': opt.orientation === 'vertical' ? opt.margin : ctxWidth + opt.margin,
                        'y': opt.orientation === 'vertical' ? ctxHeight + opt.margin: opt.margin
                    };
                    sprites.push(sprite);

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
                }

                return 'background: transparent url("' + path.basename(filename) + '") no-repeat ' + -sprite.x + 'px ' + -sprite.y + 'px;';
            });
            file.contents = new Buffer(content);

            var canvas = Image(ctxWidth, ctxHeight);
            lodash(sprites).forEach(function(sprite){
                canvas.draw(sprite.img, sprite.x, sprite.y);
            });

            this.push(new gutil.File({
                cwd: file.cwd,
                base: file.base,
                path: filename,
                contents: canvas.encode('png')
            }));
        }

        this.push(file);
        return callback();
    });
};