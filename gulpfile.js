const del = require('del')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const BrowserSync = require('browser-sync')
const webpack = require('webpack-stream')

// ----------------------------------------------------------
// vars
// ----------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV
const __PROD__ = NODE_ENV === 'production'
const __DEV__ = !__PROD__

const paths = {
    src: './src',
    public: './public',
}

const bs = BrowserSync.create()

// ----------------------------------------------------------
// TaskFunctions
// ----------------------------------------------------------
function runWebpack(options = {}) {
    const compiler = require('webpack')
    const files = ['index.ts', 'index.scss', 'vendor/rxjs-import.ts'].map(x => `${paths.src}/${x}`)
    return gulp.src(files)
        .pipe(plumber())
        .pipe(webpack(options, compiler))
        .pipe(gulp.dest(paths.public))
}


function clean() {
    return del([
        `${paths.public}/**/*.bundle.*`,
        `${paths.public}/index.html`,
    ])
}

// ----------------------------------------------------------
// Tasks
// ----------------------------------------------------------
gulp.task('bs:init', done => bs.init(require('./bs-config'), done))
gulp.task('webpack', () => runWebpack({ config: require('./webpack.config') }))
gulp.task('webpack:watch', () => runWebpack({ config: require('./webpack.config'), watch: true }).pipe(bs.stream()))
gulp.task('build', gulp.series(clean, 'webpack'))
gulp.task('start', gulp.series(clean, gulp.parallel('bs:init', 'webpack:watch')))
gulp.task('clean', clean)

