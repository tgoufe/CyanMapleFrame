let path = require('path')
	, HtmlWebpackPlugin = require('html-webpack-plugin')
	;

module.exports = {
	mode: 'production'
	, devtool: 'cheap-module-source-map'
	// webpack 4.0 插件项被 optimization 替代
	, optimization: {
		minimize: true
		, splitChunks: {
			name: 'base'
		}
	}
	// 插件项
	, plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html'
			, template: path.resolve(__dirname, 'demo/src/tpl/index.html')
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'index']
			, inject: 'body'
		})

		, new HtmlWebpackPlugin({
			filename: 'debounce.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'debounce']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'throttle.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'throttle']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'listener.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'listener']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'model.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'model']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'router.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'router']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'error.html'
			, template: path.resolve(__dirname, 'demo/src/tpl/error.html')
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'error']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'eventSource.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'eventSource']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'socket.html'
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'socket']
			, inject: 'body'
		})
		, new HtmlWebpackPlugin({
			filename: 'intersectionObserver.html'
			, template: path.resolve(__dirname, 'demo/src/tpl/intersectionObserver.html')
			, minify: {    // 压缩 HTML 文件
				removeComments: true        // 移除 HTML 中的注释
				, collapseWhitespace: true  // 删除空白符与换行符
			}
			, chunks: ['base', 'intersectionObserver']
			, inject: 'body'
		})
	]
	// 页面入口文件配置
	, entry: {
		base: ['@babel/polyfill', 'maple']

		, index: [path.resolve(__dirname, 'demo/src/javascript/index.js')]

		, debounce: [path.resolve(__dirname, 'demo/src/javascript/debounce.js')]
		, throttle: [path.resolve(__dirname, 'demo/src/javascript/throttle.js')]
		, listener: [path.resolve(__dirname, 'demo/src/javascript/listener.js')]
		, model:    [path.resolve(__dirname, 'demo/src/javascript/model.js')]
		, router:   [path.resolve(__dirname, 'demo/src/javascript/router.js')]
		, error:    [path.resolve(__dirname, 'demo/src/javascript/error.js')]
		, eventSource:    [path.resolve(__dirname, 'demo/src/javascript/eventSource.js')]
		, socket:    [path.resolve(__dirname, 'demo/src/javascript/socket.js')]
		, intersectionObserver: [path.resolve(__dirname, 'demo/src/javascript/intersectionObserver.js')]
	}
	// 入口文件输出配置
	, output: {
		path: path.resolve(__dirname, 'demo/dist/')
		, filename: '[name].js'
	}
	, module: {
		// 加载器配置
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
		Vue:'Vue'
	}
	, resolve: {
		modules: ["node_modules", __dirname]
		, alias: {
			vue$: 'vue/dist/vue.common.js'
			, maple: 'src/index.js'
			, mapleRouter: 'src/vue-plugin/router.js'
		}
	}
};