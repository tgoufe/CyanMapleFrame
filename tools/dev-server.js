'use strict';

var path = require('path')
	, fs = require('fs')
	, express = require('express')
	, webpack = require('webpack')
	, webpackConfig = require('../webpack.config.js')
	, CONFIG = require('../config.js')
	, PORT = CONFIG.PORT

	, PROJECT_ROOT = path.resolve(__dirname, '../') +'/'

	, app = express()
	, compiler
	, HtmlWebpackPlugin = require('html-webpack-plugin')
	, devMiddleware
	, hotMiddleware
	, DEV_DIR = [   // 项目开发目录
		'examples'
		, 'test'
	]
	, i, j
	, handle = function(readPath){
		var stat
			;

		if( fs.existsSync(readPath) ){
			stat = fs.statSync( readPath );
			//console.log(stat)
			if( stat.isFile() ){
				console.log(readPath, ' 读取 file');

				handleFile( readPath );
			}
			else if( stat.isDirectory() ){
				console.log(readPath, ' 读取 dir');

				handleDir( readPath );
			}
			else{
				console.log(readPath, '未知错误');
			}
		}
		else{
			console.log(readPath, '文件或目录不存在');
		}
	}
	, handleFile = function(filePath){
		var ext = path.extname( filePath )
			, name
			;

		if( ext === '.js' ){
			// js 文件，在 entry 中添加
			name = path.basename(filePath.replace(PROJECT_ROOT, ''), '.js');
			webpackConfig.entry[name] = filePath;
		}
		else if( ext === '.html' ){
			// html 文件，在 plugins 中插入
			name = path.basename(filePath, '.html');
			webpackConfig.plugins.push(new HtmlWebpackPlugin({
				filename: filePath.replace(PROJECT_ROOT, ''),    // todo ?
				template: filePath,
				chunks: [name, 'maple', 'vendors'], // 注入的 js 执行文件与该 html 文件同名
				inject: 'body'
			}));
		}
		else{
			// 不需要处理的文件类型
		}
	}
	, handleDir = function(dirPath){
		var files = fs.readdirSync( dirPath )
			, i, j
			;

		for( i = 0, j = files.length; i < j; i++){
			handle( dirPath +'/'+ files[i] );
		}
	}
	;

for(i = 0, j = DEV_DIR.length; i < j; i++){
	handle( PROJECT_ROOT + DEV_DIR[i] );
}
//webpackConfig.entry['hot-load-test'] = PROJECT_ROOT +'examples/hot-load-test.js';
Object.keys(webpackConfig.entry).forEach(function(name){
	webpackConfig.entry[name] = [PROJECT_ROOT +'tools/dev-client.js'].concat(webpackConfig.entry[name])
});

webpackConfig.plugins.push(
	// https://github.com/glenjamin/webpack-hot-middleware#installation--usage
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoErrorsPlugin()
	//,
	//// https://github.com/ampedandwired/html-webpack-plugin
	//new HtmlWebpackPlugin({
	//	filename: 'examples/hot-load-test.html',
	//	template: PROJECT_ROOT +'examples/hot-load-test.html',
	//	chunks:['vendors', 'maple', 'hot-load-test'],
	//	inject: 'body'
	//})
);

compiler  = webpack( webpackConfig );

devMiddleware = require('webpack-dev-middleware')(compiler, {
	publicPath: webpackConfig.output.publicPath
	, stats: {
		colors: true
		, chunks: false
	}
});
hotMiddleware = require('webpack-hot-middleware')(compiler);

compiler.plugin('compilation', function(compilation){
	compilation.plugin('html-webpack-plugin-after-emit', function(data, callback){
		hotMiddleware.publish({
			action: 'reload'
		});
		callback();
	});
});

// 处理 浏览器回退 和 HTML5 history 接口
app.use( require('connect-history-api-fallback')() );

// express 输出 webpack 打包文件
app.use( devMiddleware );

// 热部署功能
app.use( hotMiddleware );

//app.use('/examples', express.static(PROJECT_ROOT +'examples'));
app.use('/dist', express.static(PROJECT_ROOT +'dist'));
app.use('/src', express.static(PROJECT_ROOT +'src'));
//app.get('/', function(req, res){  console.log(123123)
//	res.send('test');
//	res.end();
//});

module.exports = app.listen(PORT, function(e){
	if( e ){
		console.log(e);
		return;
	}
	console.log('监听 http://localhost:' + PORT + '\n');
});