let webpack = require('webpack')
    , path = require('path')
    , HtmlWebpackPlugin = require('html-webpack-plugin')
    , compiler = require('vue-template-compiler')
    //demo页面地址
    , demoPgaeList=[
        'headComponent.js'
    ]
    //文件入口
    , entry={
        maple: [path.resolve(__dirname, './src/maple/index.js')]
		, base: [path.resolve(__dirname, './src/maple/base.js')]
		// , 'debounce': [path.resolve(__dirname, './demo/src/javascript/debounce.js')]
		// , 'throttle': [path.resolve(__dirname, './demo/src/javascript/throttle.js')]
		// , 'listener': [path.resolve(__dirname, './demo/src/javascript/listener.js')]
    }
    //插件
    , plugins=[
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     sourceMap: true
        // }) //压缩JS
    ]
    ;
//压缩页面HTML文件并且插入对应JS文件
demoPgaeList.forEach(function(i) {
    var path = i.replace(/\.js$/, '');
    entry[path] = './demo/javascript/'+i;
    plugins.push(new HtmlWebpackPlugin({
        minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: true //删除空白符与换行符
        },
        template: './demo/html/'+path+'.html',
        chunks: ['maple', path],
        filename: './demo/html/'+path+'.html'
    }))
});
module.exports = {
    devtool: '#source-map',
	//插件项
    plugins: plugins.concat([
	// new webpack.optimize.CommonsChunkPlugin({name:'base'}),//提取公共文件
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		sourceMap: true
	// }) //压缩JS
	// , new HtmlWebpackPlugin({
	// 	filename: 'debounce.html'
	// 	,  minify: {    //压缩HTML文件
	// 		removeComments: true        //移除HTML中的注释
	// 		, collapseWhitespace: true  //删除空白符与换行符
	// 	}
	// 	, chunks: ['base', 'debounce']
	// 	, inject: 'body'
	// })
	// , new HtmlWebpackPlugin({
	// 	filename: 'throttle.html'
	// 	,  minify: {    //压缩HTML文件
	// 		removeComments: true        //移除HTML中的注释
	// 		, collapseWhitespace: true  //删除空白符与换行符
	// 	}
	// 	, chunks: ['base', 'throttle']
	// 	, inject: 'body'
	// })
	// , new HtmlWebpackPlugin({
	// 	filename: 'listener.html'
	// 	,  minify: {    //压缩HTML文件
	// 		removeComments: true        //移除HTML中的注释
	// 		, collapseWhitespace: true  //删除空白符与换行符
	// 	}
	// 	, chunks: ['base', 'listener']
	// 	, inject: 'body'
	})
]),
    //页面入口文件配置
    entry,
    //入口文件输出配置
    output: {
        path: path.resolve(__dirname, './dist/'),
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
    },
    devServer:{
        disableHostCheck:true
    }
};