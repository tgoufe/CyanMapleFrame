let webpack = require('webpack')
    , path = require('path')
    , compiler = require('vue-template-compiler')
	, HtmlWebpackPlugin = require('html-webpack-plugin')
    ;

module.exports = {
    devtool: '#source-map',
    //插件项
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({name:'base'}),//提取公共文件
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }) //压缩JS
        , new HtmlWebpackPlugin({
		    filename: 'debounce.html'
            ,  minify: {    //压缩HTML文件
			    removeComments: true        //移除HTML中的注释
			    , collapseWhitespace: true  //删除空白符与换行符
		    }
		    , chunks: ['base', 'debounce']
		    , inject: 'body'
	    })
        , new HtmlWebpackPlugin({
		    filename: 'throttle.html'
		    ,  minify: {    //压缩HTML文件
			    removeComments: true        //移除HTML中的注释
			    , collapseWhitespace: true  //删除空白符与换行符
		    }
		    , chunks: ['base', 'throttle']
		    , inject: 'body'
	    })
        , new HtmlWebpackPlugin({
		    filename: 'listener.html'
		    ,  minify: {    //压缩HTML文件
			    removeComments: true        //移除HTML中的注释
			    , collapseWhitespace: true  //删除空白符与换行符
		    }
		    , chunks: ['base', 'listener']
		    , inject: 'body'
	    })
    ],
    //页面入口文件配置
    entry: {
        maple: [path.resolve(__dirname, './src/maple/index.js')]
        , base: [path.resolve(__dirname, './src/maple/base.js')]
        , 'debounce': [path.resolve(__dirname, './demo/src/javascript/debounce.js')]
        , 'throttle': [path.resolve(__dirname, './demo/src/javascript/throttle.js')]
        , 'listener': [path.resolve(__dirname, './demo/src/javascript/listener.js')]
    },
    //入口文件输出配置
    output: {
        path: path.resolve(__dirname, './demo/dist/'),
        filename: '[name].js'
    },
    module: {
        //加载器配置
        rules: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.js$/,
            loader: 'babel-loader'
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
                    js: 'babel-loader',
                    css: 'vue-style-loader!css-loader',
                    scss: 'style-loader!css-loader!sass-loader',
                    sass: 'style-loader!css-loader!sass-loader?indentedSyntax'
                }
            }
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    externals:{
        Vue:'Vue'
    },
    resolve: {
        modules: ["node_modules", __dirname]
    }
};