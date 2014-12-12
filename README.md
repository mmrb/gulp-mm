wechat web rebuild team dev tool
==

**installation**

```shell
npm install -g gulp
npm install --save-dev gulp gulp-mm
```

**usage**

create `gulpfile.js`

```javascript
var gulp = require('gulp');
var mm = require('gulp-mm');

gulp.task('build', function(){
    mm.watch('./src/**/*.less')
      .pipe(mm.less())
      .pipe(gulp.dest('./preview'))
      .pipe(mm.uglify())
      .pipe(gulp.dest('./dist'));
      
    mm.watch('./src/**/*.html')
      .pipe(mm.inline())
      .pipe(mm.optimization())
      .pipe(gulp.dest('./preview'))
      .pipe(mm.resolve())
      .pipe('./dist');
});

gulp.task('server', function(){
    mm.server.start({root: __dirname + '/preview'});
});

gulp.task('default', ['build', 'server']);
```
