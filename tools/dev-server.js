var path = require('path')
	, express = require('express')
	, webpack = require('webpack')
	, webpackConfig = require('../webpack.config.js')
	, PORT = process.env.PORT || 8080

	, app = express()
	, compiler = webpack( webpackConfig )
	, devMiddleware = require('webpack-dev-middleware')(compiler, {
		publicPath: '/'
		, stats: {
			colors: true
			, chunks: false
		}
	})
	, hotMiddleware = require('webpack-hot-middleware')(compiler)
	;

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

module.exports = app.listen(PORT, function(e){
	if( e ){
		console.log(e);
		return;
	}
	console.log('监听 http://localhost:' + PORT + '\n');
});