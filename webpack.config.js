let webpack = require('webpack')
	, path = require('path')
	;

module.exports = {
	devtool: 'cheap-module-source-map'
	//插件项
	, plugins: [
		// new webpack.optimize.CommonsChunkPlugin({name:'base'}),//提取公共文件
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
			, sourceMap: true
		})
		, new webpack.optimize.CommonsChunkPlugin({
			name: 'index'
		})
	]
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
					, css: 'vue-style-loader!css-loader'
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