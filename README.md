wechat web rebuild team dev tool
==

###installation

```shell
npm install -g gulp
npm install --save-dev gulp gulp-mm
```

###usage

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

###api

**inline**

you can import other file in your `html`, or `javascript` file with `inline` plugin, for example:

```html

<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>sprite</title>
    <!-- output: <style>content of style.less(after compile to css) </style> -->
    <link rel="stylesheet" href="./style.less?__inline"/>
</head>
<body>
    <!-- output: <img src="base64 of hello.png" -->
    <img src="hello.png?__inline"/>

    <!-- output: content of fragment -->
    <link rel="html" href="./fragment.html?__inline"/>
</body>
</html>

```

```javascript



```
