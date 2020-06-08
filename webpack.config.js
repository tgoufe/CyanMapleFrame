let path = require('path')
	;

module.exports = {
	mode: 'production'
	, devtool: 'cheap-module-source-map'
	// webpack 4.0 插件项被 optimization 替代
	, optimization: {
		minimize: true
	}
	//页面入口文件配置
	, entry: {
		index: [path.resolve(__dirname, 'src/index.js')]
		, 'worker/serviceWork': [path.resolve(__dirname, 'src/worker/serviceWorker.js')]
		, 'worker/webWork': [path.resolve(__dirname, 'src/worker/webWorker.js')]
	}
	//入口文件输出配置
	, output: {
		path: path.resolve(__dirname, 'dist/')
		, filename: '[name].js'
		, libraryTarget: 'umd'
	}
	, module: {
		//加载器配置
		rules: [{
			test: /\.css$/
			, loader: 'style-loader!css-loader!sass-loader'
		}, {
			test: /\.js$/
			, loader: 'babel-loader'
		}, {
			test: /\.scss$/
			, loader: 'style-loader!css-loader!sass-loader?sourceMap'
		}, {
			test: /\.(png|jpg)$/
			, loader: 'url-loader?limit=8192'
		}, {
			test: /\.vue$/
			, loader: 'vue-loader'
			, options: {
				loaders: {
					js: 'babel-loader'
					, css: 'css-loader'
					, scss: 'style-loader!css-loader!sass-loader'
					, sass: 'style-loader!css-loader!sass-loader?indentedSyntax'
				}
			}
		}, {
			test: /\.json$/
			, loader: 'json-loader'
		}]
	}
	, externals:{
		Vue: 'Vue'
	}
	, resolve: {
		modules: ["node_modules", __dirname]
	}
};