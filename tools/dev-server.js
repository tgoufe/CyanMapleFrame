var path = require('path')
	, express = require('express')
	, webpack = require('webpack')
	, webpackConfig = require('../webpack.config.js')
	, PORT = process.env.PORT || 9002

	, PROJECT_ROOT = path.resolve(__dirname, '../') +'/'

	, app = express()
	, compiler
	, HtmlWebpackPlugin = require('html-webpack-plugin')
	, devMiddleware
	, hotMiddleware
	;

webpackConfig.entry['hot-load-test'] = PROJECT_ROOT +'examples/hot-load-test.js';
Object.keys(webpackConfig.entry).forEach(function(name){
	webpackConfig.entry[name] = [PROJECT_ROOT +'tools/dev-client.js'].concat(webpackConfig.entry[name])
});

webpackConfig.plugins.push(
	// https://github.com/glenjamin/webpack-hot-middleware#installation--usage
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoErrorsPlugin()
	,
	// https://github.com/ampedandwired/html-webpack-plugin
	new HtmlWebpackPlugin({
		filename: 'examples/hot-load-test.html',
		template: PROJECT_ROOT +'examples/hot-load-test.html',
		chunks:['vendors', 'maple', 'hot-load-test'],
		inject: 'body'
	})
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