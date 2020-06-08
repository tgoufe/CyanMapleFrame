let path = require('path')
	, HtmlWebpackPlugin = require('html-webpack-plugin')

	, VueLoaderPlugin = require('vue-loader/lib/plugin')
	;

const CONFIG = require('./demo/src/config.json')
	;

module.exports = {
	mode: 'production'
	, devtool: 'cheap-module-source-map'
	// webpack 4.0 插件项被 optimization 替代
	, optimization: {
		minimize: true
		, splitChunks: {
			name: 'base'
			, chunks: 'initial'
			, minChunks: 2
		}
	}
	// 插件项
	, plugins: [
		...CONFIG.pages.map((page)=>{
			let opts = {
					filename: `${page.entry}.html`
					, minify: {    // 压缩 HTML 文件
						removeComments: true        // 移除 HTML 中的注释
						, collapseWhitespace: true  // 删除空白符与换行符
					}
					, chunks: ['base', page.entry]
					, inject: 'body'
				}
				;

			if( page.template ){
				opts.template = path.resolve(__dirname, `demo/src/tpl/${page.entry}.html`);
			}

			return new HtmlWebpackPlugin( opts );
		})

		, new VueLoaderPlugin()
	]
	// 页面入口文件配置
	, entry: CONFIG.pages.reduce((rs, page)=>{
		rs[page.entry] = [path.resolve(__dirname, `demo/src/javascript/${page.entry}.js`)];

		return rs;
	}, {
		base: ['@babel/polyfill', 'maple']
	})
	, output: {
		path: path.resolve(__dirname, 'demo/dist/')
		, filename: '[name].js'
		, chunkFilename: 'async/[name].js'
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
					, css: 'css-loader'
					, scss: 'style-loader!css-loader!sass-loader'
					, sass: 'style-loader!css-loader!sass-loader?indentedSyntax'
				}
			}
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