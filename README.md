wechat web rebuild team dev tool
================

**installation**

```
npm install -g gulp

npm install --save-dev gulp gulp-mm

```

**usage**

create `gulpfile.js`

```

var gulp = require('gulp');
var mm = require('gulp-mm');

gulp.task('build', function(){
    mm.watch('');
});

```