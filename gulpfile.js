const gulp = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const connect = require('gulp-connect');
const pug = require('gulp-pug');
const pugInheritance = require('gulp-pug-inheritance');
const stylus = require('gulp-stylus');
const nib = require('nib');
const rupture = require('rupture');
const changed = require('gulp-changed');
const filter = require('gulp-filter');
const deploy = require('gulp-gh-pages');

gulp.task('clean', (cb) => {
  del.sync(['./dist/']);
  cb();
});

gulp.task('serve', (cb) => {
  connect.server({
    root: './dist',
    livereload: true,
    host: '0.0.0.0',
    port: 1337,
  });
  cb();
});

gulp.task('layout', () =>
  gulp
    .src(['./src/*.pug'])
    .pipe(changed('./dist', { extension: '.html' }))
    .pipe(plumber())
    .pipe(pugInheritance({ basedir: 'src', skip: 'node_modules' }))
    .pipe(filter((file) => !/\/_/.test(file.path) && !/^_/.test(file.relative)))
    .pipe(pug())
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload()),
);

gulp.task('style', () =>
  gulp
    .src(['./src/css/*.styl'])
    .pipe(changed('./dist/css', { extension: '.css' }))
    .pipe(plumber())
    .pipe(
      stylus({
        compress: true,
        use: [nib(), rupture()],
      }),
    )
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload()),
);

gulp.task('imgs', () =>
  gulp
    .src(['./src/img/**/*'])
    .pipe(changed('./dist/img'))
    .pipe(plumber())
    .pipe(gulp.dest('./dist/img'))
    .pipe(connect.reload()),
);

gulp.task('cname', () => gulp.src(['./CNAME']).pipe(gulp.dest('./dist')));

gulp.task('watch', (cb) => {
  gulp.watch('./src/*.pug', gulp.series('layout'));
  gulp.watch('./src/css/*.styl', gulp.series('style'));
  gulp.watch('./src/img/**/*', gulp.series('imgs'));
  gulp.watch('./CNAME', gulp.series('cname'));
  cb();
});

gulp.task('deploy', () => gulp.src('./dist/**/*').pipe(deploy()));

gulp.task(
  'default',
  gulp.series('clean', 'layout', 'style', 'imgs', 'cname', 'watch', 'serve'),
);
gulp.task('build', gulp.series('clean', 'layout', 'style', 'imgs', 'cname'));
gulp.task('gh', gulp.series('deploy'));
