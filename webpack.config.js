<<<<<<< HEAD
var webpack = require('webpack');
var path = require('path');
var compiler = require('vue-template-compiler')
module.exports = {
    //插件项
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({name:'base'})//提取公共文件
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }) //压缩JS
    ],
    //页面入口文件配置
    entry: {
        maple: [__dirname + '/source/maple/index.js']
    },
    //入口文件输出配置
    output: {
        path: './',
        filename: './javascript/[name].js'
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }, {
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader?sourceMap'
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    js: 'babel-loader?{"presets":["es2015"],"plugins": ["transform-object-rest-spread"]}',
                    css: 'vue-style-loader!css-loader'
                }
            }
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    resolve: {
        modules: [__dirname]
    }
};
=======
var path = require('path')
	, webpack = require('webpack')
	, HtmlWebpackPlugin = require('html-webpack-plugin')

	, PROJECT_ROOT = path.resolve(__dirname, './') +'/'
	, webpackConfig = {
		//入口文件，用于打包的文集爱你
		entry: {
			maple: PROJECT_ROOT +'src/js/index.js'
			, vendors: ['vue', 'lodash', 'hammer','swiper']
			//, index: PROJECT_ROOT +'examples/hot-load-test.js'
		},
		output: {
			path: PROJECT_ROOT +'dist',
			//文件输入的目录
			filename: '[name].js'
			//filename: '[name]-[hash:8].js'
			, chunkFilename: 'vendors.js'
			, publicPath: '/'
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				minimize: true
			})

			// 将入口文件的数组打包成 vendors.js
			, new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')

			//, new HtmlWebpackPlugin({
			//   filename: 'examples/hot-load-test.html',
			//   template: PROJECT_ROOT +'examples/hot-load-test.html',
			//   chunks:['vendors', 'maple', 'index'],
			//   inject: 'body'
			//})
		],
		resolve: {
			//用于缺省的文件名后缀
			extensions: ['', '.js'],
			root: [PROJECT_ROOT +'src', PROJECT_ROOT +'node_modules'],

			//别名
			alias: {
				'src': PROJECT_ROOT +'src',
				'hammer': PROJECT_ROOT +'src/js/external/lib/hammer/1.0.10/hammer.min',
				'lodash': PROJECT_ROOT +'src/js/external/lib/lodash/4.11.1/lodash',
				'_': PROJECT_ROOT +'src/js/external/lib/lodash/4.11.1/lodash',
				'vue': PROJECT_ROOT +'src/js/external/lib/vue/1.0.17/vue.min',
				'swiper': PROJECT_ROOT +'src/js/external/plugin/swiper/3.3.1/swiper.min'
			}
		},
		//加载cdn,尽量保证不使用jquery
		externals: {
			//'jquery': 'jQuery',
			//'_':'_'
		},
		//加载器
		module: {
			loaders: [
				{ test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! to chain loade   rs
				{ test: /\.css$/, loader: 'style-loader!css-loader' },
				{ test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
				, {
					test: /\.html$/
					, loader: 'vue-html'
				}
			]
			, preLoader: [{    // jshint-loader
				test: /\.jsx?$/
				,include: './src/js/'
				,loader: 'jshint-loader'
			}]
		}
	}
    ;

module.exports = webpackConfig;
>>>>>>> origin/master
