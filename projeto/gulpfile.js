// Módulos (Requires)
var gulp = require('gulp');
var gutil = require('gulp-util');
var p = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
// //// Utilitários
var path = require('path');
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');

// Ambientes
var dev = p.environments.development;
var prd = p.environments.production;

// Constantes
var PASTA_DEV = 'dev/'
var PASTA_DEST = 'res/'

// Variáveis públicas
var banner = ""
var caminhos = {}
var pkg;
var worker;

// Configurações do Package (projeto)
pkg = require('./package.json')

/*
 * Configurações
 */

//TODO: Kraken API Key/Switch

// Seta os caminhos padrão
caminhos = {
 "css": {
 "origem": path.join(PASTA_DEV, 'app/**/*.scss'),
 "destino": path.join(PASTA_DEST, 'app/')
 },

 "js": {
 "origem": path.join(PASTA_DEV, 'app/**/*.js'),
 "destino": path.join(PASTA_DEST, 'app/')
 },

 "img": {
 "origem": path.join(PASTA_DEV, 'img/**/*'),
 "destino": path.join(PASTA_DEST, 'img/')
 },

 "libs": {
 "origem": path.join(PASTA_DEV, 'lib/**/*.!(md|txt|html|json)'),
 "destino": path.join(PASTA_DEST, 'lib/')
 }
}

// Banner (meta)
banner = ['', ''
].join('\n');

/*
 * CSS
 */

//TODO: Output (console)

gulp.task('css', function(event) {
	return gulp.src(caminhos.css.origem)
		.pipe(p.plumber())
		// Pré-processamento
		.pipe(p.sass())
		.on('error', p.sass.logError)
		.pipe(prd(p.shorthand()))
		.pipe(p.pleeease({"minifier": prd(), "autoprefixer": {browsers: ['last 2 versions', 'ie 9', '> 1%']}}))
		.pipe(prd(p.csso()))
		// Cabeçalho
		.pipe(p.header(banner, pkg))
		// Minificar e otimizar
		.pipe(p.rename({extname: ".min.css"}))
		.pipe(prd(p.size()))
		.pipe(gulp.dest(caminhos.css.destino))
		.pipe(browserSync.stream());
		//.pipe(dev(p.livereload()))
});

/*
 * Scripts (JS)
 */

//TODO: Output (Console)

gulp.task('js', function(event) {
	return gulp.src(caminhos.js.origem)
		.pipe(p.plumber())
		// JSHint
		.pipe(dev(p.jshint({"asi":true})))
		.pipe(dev(p.jshint.reporter('default')))
		// Concatena arquivos
		.pipe(p.concat('script.js'))
		// Minificador
		.pipe(prd(p.uglify()))
		// Header
		.pipe(p.header(banner, pkg))
		// Saída
		.pipe(gulp.dest(caminhos.js.destino))
		// Atualizar Navegador
                .pipe(browserSync.stream())
		.pipe(dev(p.livereload()));
})

/*
 * Scripts (JS)
 */

//TODO: Output (Console)

gulp.task('libjs', function(event) {
	return gulp.src('./res/lib/js/*.js')

		.pipe(p.concat('libs.js'))
		// Saída
		.pipe(gulp.dest(caminhos.js.destino))
		// Atualizar Navegador
		.pipe(dev(p.livereload()));
})

/*
 * Imagens
 */

gulp.task('img', function(a,b,c) {
	return gulp.src(caminhos.img.origem)
		.pipe(p.plumber())
		// Minifica
		.pipe(p.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true, verbose: true, use: [pngquant()] }))
		// Saída
		.pipe(gulp.dest(caminhos.img.destino))
		// Atualizar Navegador
		.pipe(dev(p.livereload()));
})

/*
 * Incrementa versão
 */
gulp.task('ver', function(){
	// Incrementa versão
	gulp.src('./package.json')
    .pipe(p.bump({type: 'minor'}))
    .pipe(gulp.dest('./'))
});

/*
 * Libs (JS)
 */

//TODO: Output (Console)

gulp.task('libs', function(event) {
	return gulp.src(caminhos.libs.origem)
		// Saída
		.pipe(gulp.dest(caminhos.libs.destino))
})

/**
 ** Watch
 **/
gulp.task('watch', function() {
	// Iniciar LiveReload
	p.livereload.listen();

	// Watches
	gulp.watch(caminhos.css.origem, ['css']);
	gulp.watch(caminhos.js.origem, ['js']);
	gulp.watch(caminhos.js.origem, ['libjs']);
	gulp.watch(caminhos.libs.origem, ['libs']);

	gulp.watch(['*']).on('change', browserSync.reload);
	// Imagens
	var imgs = gulp.watch(caminhos.img.origem);
	imgs.on('change', function(event){
		// type: deleted, changed, added, path: filename
		switch(event.type) {
			case "added":
			case "changed":
				gutil.log('Minificando ' + event.path);
				gulp.src(event.path)
					.pipe(p.plumber())
					// Minifica
					.pipe(p.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true, verbose: true, use: [pngquant()] }))
					// Saída
					.pipe(gulp.dest(caminhos.img.destino))
					// Atualizar Navegador
					.pipe(dev(p.livereload()));
				break;

			case "deleted":
				console.log("del.sync");
				break;
		}
	});

});

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ["./"],

	  }
    });
});



// Define a tarefa padrão
gulp.task('default', ['watch','libjs','browser-sync']);
